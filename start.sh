#!/bin/bash

# Medical AI Analyzer - Complete Automated Startup Script
# This script handles EVERYTHING - just run it!

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Cleanup function for Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║              Shutting Down All Services...                    ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${YELLOW}🔧 Stopping Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${YELLOW}🎨 Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Clean up all related processes
    pkill -f "uvicorn.*medical" 2>/dev/null || true
    pkill -f "next.*medical" 2>/dev/null || true
    
    # Free ports
    for port in 3000 3001 3002 3003 3333 8000; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    
    echo ""
    echo -e "${GREEN}✅ All services stopped successfully!${NC}"
    echo ""
    exit 0
}

# Register cleanup
trap cleanup SIGINT SIGTERM

# ASCII Art Header
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        __  __          _ _           _                        ║
║       |  \/  | ___  __| (_) ___ __ _| |                       ║
║       | |\/| |/ _ \/ _` | |/ __/ _` | |                       ║
║       | |  | |  __/ (_| | | (_| (_| | |                       ║
║       |_|  |_|\___|\__,_|_|\___\__,_|_|                       ║
║                                                               ║
║           AI-Powered Medical Test Analyzer                    ║
║              Automated Startup System                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}           STEP 1: Cleanup & Preparation${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Kill all existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -9 -f "uvicorn.*medical" 2>/dev/null || true
pkill -9 -f "next.*medical" 2>/dev/null || true
pkill -9 -f "node.*next" 2>/dev/null || true

# Free all ports
echo -e "${YELLOW}🔓 Freeing ports 3000-3333 and 8000...${NC}"
for port in 3000 3001 3002 3003 3333 8000; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

sleep 2
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}           STEP 2: Backend Preparation${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check Backend
echo -e "${YELLOW}🔧 Preparing backend...${NC}"
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo -e "${RED}✗ Virtual environment not found!${NC}"
    echo -e "${YELLOW}  Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate

# Check and install backend dependencies
echo -e "${YELLOW}📦 Checking backend dependencies...${NC}"
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}  Installing backend dependencies...${NC}"
    pip install -q -r requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    # Verify critical dependencies
    MISSING_DEPS=0
    for module in "fastapi" "uvicorn" "sqlalchemy" "jose" "openai" "PyPDF2"; do
        if ! python3 -c "import $module" 2>/dev/null; then
            MISSING_DEPS=1
            break
        fi
    done
    
    if [ $MISSING_DEPS -eq 1 ]; then
        echo -e "${YELLOW}  Some dependencies missing, installing...${NC}"
        pip install -q -r requirements.txt
        echo -e "${GREEN}✓ Dependencies updated${NC}"
    else
        echo -e "${GREEN}✓ Dependencies already installed${NC}"
    fi
fi

# Check database connection
echo -e "${YELLOW}📊 Checking database connection...${NC}"
# Use python (from venv) instead of python3
if python -c "from app.db.session import engine; from sqlalchemy import text; conn = engine.connect(); conn.execute(text('SELECT 1')); conn.close(); print('DB OK')" 2>/dev/null | grep -q "DB OK"; then
    echo -e "${GREEN}✓ Database connected${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection test failed, but continuing...${NC}"
    echo -e "${YELLOW}  The application will create tables on startup if needed${NC}"
fi

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✓ Backend ready${NC}"
echo ""

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}           STEP 3: Frontend Preparation${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}🎨 Preparing frontend...${NC}"
cd "$FRONTEND_DIR"

# Check and install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  Installing frontend dependencies...${NC}"
    npm install --quiet
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Clean Next.js cache and build artifacts
echo -e "${YELLOW}🧹 Cleaning Next.js cache and build artifacts...${NC}"
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✓ Frontend ready${NC}"
echo ""

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}           STEP 4: Starting Services${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Start Backend
echo -e "${CYAN}[1/2] 🔧 Starting Backend API Server...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "      ${GREEN}├─ Started (PID: $BACKEND_PID)${NC}"
echo -e "      ${BLUE}├─ URL: http://localhost:8000${NC}"
echo -e "      ${BLUE}└─ Docs: http://localhost:8000/docs${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}      ⏳ Waiting for backend to initialize...${NC}"
BACKEND_READY=0
for i in {1..20}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "      ${GREEN}✓ Backend is healthy and ready!${NC}"
        BACKEND_READY=1
        break
    fi
    sleep 1
done

if [ $BACKEND_READY -eq 0 ]; then
    echo -e "      ${RED}✗ Backend failed to start!${NC}"
    echo -e "      ${YELLOW}Check logs at: $BACKEND_DIR/logs/backend.log${NC}"
    cleanup
fi

echo ""

# Start Frontend
echo -e "${CYAN}[2/2] 🎨 Starting Frontend Web Server...${NC}"
cd "$FRONTEND_DIR"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "      ${GREEN}├─ Started (PID: $FRONTEND_PID)${NC}"
echo -e "      ${BLUE}└─ URL: http://localhost:3333${NC}"

# Wait for frontend to be ready
echo -e "${YELLOW}      ⏳ Waiting for frontend to compile...${NC}"
FRONTEND_READY=0
for i in {1..30}; do
    if curl -s -I http://localhost:3333 > /dev/null 2>&1; then
        echo -e "      ${GREEN}✓ Frontend is ready!${NC}"
        FRONTEND_READY=1
        break
    fi
    sleep 1
done

if [ $FRONTEND_READY -eq 0 ]; then
    echo -e "      ${YELLOW}⚠️  Frontend still compiling...${NC}"
    echo -e "      ${YELLOW}It may take an additional 30 seconds to be fully ready.${NC}"
    echo -e "      ${YELLOW}Check logs at: $FRONTEND_DIR/logs/frontend.log${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║              🚀 All Systems Operational! 🚀                   ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}┌───────────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│  📱 Frontend:    ${GREEN}http://localhost:3333/dashboard${CYAN}             │${NC}"
echo -e "${CYAN}│  🔧 Backend API: ${GREEN}http://localhost:8000${CYAN}                       │${NC}"
echo -e "${CYAN}│  📚 API Docs:    ${GREEN}http://localhost:8000/docs${CYAN}                  │${NC}"
echo -e "${CYAN}└───────────────────────────────────────────────────────────────┘${NC}"
echo ""
echo -e "${YELLOW}📋 Process Information:${NC}"
echo -e "   Backend PID:  ${MAGENTA}$BACKEND_PID${NC}"
echo -e "   Frontend PID: ${MAGENTA}$FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}📝 Log Files:${NC}"
echo -e "   Backend:  ${CYAN}$BACKEND_DIR/logs/backend.log${NC}"
echo -e "   Frontend: ${CYAN}$FRONTEND_DIR/logs/frontend.log${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✨ Application is ready! Open your browser now! ✨${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
echo -e "${BLUE}📌 Quick Tips:${NC}"
echo -e "   • Dashboard: ${CYAN}http://localhost:3333/dashboard${NC}"
echo -e "   • Upload new report by clicking 'Upload New Report' button"
echo -e "   • View API documentation at ${CYAN}http://localhost:8000/docs${NC}"
    echo ""
echo -e "${RED}⚠️  Press Ctrl+C to stop all services${NC}"
    echo ""
    
# Wait for interrupt
wait
