# syntax=docker/dockerfile:1.7

ARG PYTHON_VERSION=3.12
ARG NODE_VERSION=20
ARG APP_VERSION=1.0.0
ARG BUILD_DATE=unknown
ARG VCS_REF=local

#############################
# Backend dependency builder #
#############################
FROM python:${PYTHON_VERSION}-slim-bookworm AS backend-deps

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/opt/venv/bin:${PATH}"

WORKDIR /build/backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt

RUN python -m venv /opt/venv \
    && pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir reportlab "qrcode[pil]" email-validator

########################
# Backend runtime image #
########################
FROM python:${PYTHON_VERSION}-slim-bookworm AS backend-prod

ARG APP_VERSION
ARG BUILD_DATE
ARG VCS_REF

LABEL org.opencontainers.image.title="Medical AI Analyzer Backend" \
      org.opencontainers.image.description="FastAPI backend for Medical AI Analyzer" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/your-org/medical-ai-analyzer"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PATH="/opt/venv/bin:${PATH}" \
    API_HOST=0.0.0.0 \
    API_PORT=5000 \
    WORKERS=1

WORKDIR /app

RUN groupadd --system --gid 10001 appgroup \
    && useradd --system --uid 10001 --gid appgroup --home /nonexistent --shell /usr/sbin/nologin appuser

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        poppler-utils \
        tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-deps /opt/venv /opt/venv
COPY --chown=appuser:appgroup backend /app

RUN mkdir -p /app/uploads /app/logs \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD python -c "import urllib.request,sys; urllib.request.urlopen('http://127.0.0.1:5000/health', timeout=4); sys.exit(0)" || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host ${API_HOST} --port ${API_PORT} --workers ${WORKERS}"]

##############################
# Backend development target #
##############################
FROM backend-prod AS backend-dev

ENV WORKERS=1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"]

##############################
# Frontend dependency builder #
##############################
FROM node:${NODE_VERSION}-slim AS frontend-build

ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --include=dev

COPY frontend ./

RUN npm run build \
    && npm prune --omit=dev

#########################
# Frontend runtime image #
#########################
FROM node:${NODE_VERSION}-slim AS frontend-prod

ARG APP_VERSION
ARG BUILD_DATE
ARG VCS_REF

LABEL org.opencontainers.image.title="Medical AI Analyzer Frontend" \
      org.opencontainers.image.description="Next.js frontend for Medical AI Analyzer" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/your-org/medical-ai-analyzer"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3333

WORKDIR /app

RUN groupadd --system --gid 10001 appgroup \
    && useradd --system --uid 10001 --gid appgroup --home /nonexistent --shell /usr/sbin/nologin appuser

COPY --from=frontend-build --chown=appuser:appgroup /build/frontend/package.json ./package.json
COPY --from=frontend-build --chown=appuser:appgroup /build/frontend/next.config.js ./next.config.js
COPY --from=frontend-build --chown=appuser:appgroup /build/frontend/public ./public
COPY --from=frontend-build --chown=appuser:appgroup /build/frontend/.next ./.next
COPY --from=frontend-build --chown=appuser:appgroup /build/frontend/node_modules ./node_modules

USER appuser

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:3333', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "run", "start"]

###############################
# Frontend development target #
###############################
FROM node:${NODE_VERSION}-slim AS frontend-dev

ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3333

WORKDIR /app

COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY frontend ./

RUN chown -R node:node /app

USER node

EXPOSE 3333

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3333"]
