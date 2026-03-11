#!/usr/bin/env bash
set -Eeuo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-360}"
SLEEP_SECONDS="${SLEEP_SECONDS:-3}"
RESET_STACK="${RESET_STACK:-1}"
SERVICES=(db redis backend frontend)

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo -e "${RED}[FAIL]${NC} docker compose not found. Install Docker Compose v2 plugin or docker-compose."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo -e "${RED}[FAIL]${NC} docker is not installed or not in PATH."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo -e "${RED}[FAIL]${NC} curl is required for endpoint checks."
  exit 1
fi

log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_ok()   { echo -e "${GREEN}[PASS]${NC} $*"; }
log_fail() { echo -e "${RED}[FAIL]${NC} $*"; }

print_debug_state() {
  set +e
  "${COMPOSE[@]}" ps
  "${COMPOSE[@]}" logs --tail=80 db redis backend frontend
  set -e
}

on_error() {
  local line="$1"
  log_fail "Verification failed near line ${line}."
  print_debug_state
}
trap 'on_error $LINENO' ERR

wait_for_healthy() {
  local service="$1"
  local waited=0
  local cid status

  cid="$("${COMPOSE[@]}" ps -q "$service")"
  if [[ -z "$cid" ]]; then
    log_fail "No container ID found for service: $service"
    return 1
  fi

  while (( waited < TIMEOUT_SECONDS )); do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || true)"
    case "$status" in
      healthy)
        log_ok "$service is healthy"
        return 0
        ;;
      running|starting|"")
        printf '.'
        sleep "$SLEEP_SECONDS"
        waited=$(( waited + SLEEP_SECONDS ))
        ;;
      unhealthy|exited|dead)
        echo
        log_fail "$service entered status: $status"
        return 1
        ;;
      *)
        printf '.'
        sleep "$SLEEP_SECONDS"
        waited=$(( waited + SLEEP_SECONDS ))
        ;;
    esac
  done

  echo
  log_fail "Timeout waiting for $service to become healthy (${TIMEOUT_SECONDS}s)"
  return 1
}

log_info "Building and starting stack: ${SERVICES[*]}"
if [[ "$RESET_STACK" == "1" ]]; then
  log_warn "RESET_STACK=1 -> removing existing stack, orphans, and named volumes for deterministic verification."
  "${COMPOSE[@]}" down -v --remove-orphans || true
else
  log_info "RESET_STACK=0 -> preserving existing volumes."
  "${COMPOSE[@]}" down --remove-orphans || true
fi

"${COMPOSE[@]}" up -d --build "${SERVICES[@]}"

for service in "${SERVICES[@]}"; do
  log_info "Waiting for health: $service"
  wait_for_healthy "$service"
done

log_info "Checking host-reachable endpoints"
curl -fsS http://localhost:5000/health >/dev/null
curl -fsS -I http://localhost:3333 >/dev/null
log_ok "Host endpoint checks succeeded"

log_info "Checking frontend -> backend communication across compose network"
"${COMPOSE[@]}" exec -T frontend node -e "require('http').get('http://backend:5000/health', r => { if (r.statusCode === 200) { process.exit(0); } process.exit(1); }).on('error', () => process.exit(1));"
log_ok "Frontend container can reach backend service DNS"

log_info "Checking backend -> redis communication"
"${COMPOSE[@]}" exec -T backend python -c 'import socket,sys; s=socket.create_connection(("redis",6379),3); s.sendall(b"*1\r\n$4\r\nPING\r\n"); d=s.recv(64); s.close(); sys.exit(0 if b"PONG" in d else 1)'
log_ok "Backend container can reach redis service DNS"

log_info "Checking backend -> db communication"
"${COMPOSE[@]}" exec -T backend python -c "import os,sys; from sqlalchemy import create_engine,text; e=create_engine(os.environ['DATABASE_URL']); c=e.connect(); v=c.execute(text('SELECT 1')).scalar(); c.close(); sys.exit(0 if v==1 else 1)"
log_ok "Backend container can query database"

log_info "Checking backend write permissions for mounted paths"
"${COMPOSE[@]}" exec -T backend sh -lc 'touch /app/uploads/.verify_write && touch /app/logs/.verify_write && rm -f /app/uploads/.verify_write /app/logs/.verify_write'
log_ok "Backend write permissions for /app/uploads and /app/logs are valid"

echo
log_ok "PASS: All layers are responsive and healthy."
echo -e "${GREEN}Stack verification complete.${NC}"
