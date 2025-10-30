#!/bin/bash

# Medical AI Analyzer - Startup Script
# Starts both backend and frontend services

set -e

echo "🏥 Medical AI Analyzer - Starting Services..."
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Kill existing processes on ports
echo -e "${YELLOW}Checking for existing processes...${NC}"
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Killing existing backend process on port 5000${NC}"
    kill -9 $(lsof -t -i:5000) 2>/dev/null || true
fi

if lsof -Pi :3333 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Killing existing frontend process on port 3333${NC}"
    kill -9 $(lsof -t -i:3333) 2>/dev/null || true
fi

sleep 1
echo ""

# Start Backend
echo -e "${BLUE}🚀 Starting Backend (FastAPI)...${NC}"
cd "$PROJECT_ROOT/backend"

# Check if virtual environment exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "${RED}✗ Virtual environment not found. Please create it first.${NC}"
    exit 1
fi

# Start backend in background
nohup python3 -m uvicorn app.main:app --reload --port 5000 > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started on port 5000 (PID: $BACKEND_PID)${NC}"
echo ""

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:5000/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready!${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Start Frontend
echo -e "${BLUE}🚀 Starting Frontend (Next.js)...${NC}"
cd "$PROJECT_ROOT/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
nohup npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started on port 3333 (PID: $FRONTEND_PID)${NC}"
echo ""

# Wait for frontend to be ready
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:3333 >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is ready!${NC}"
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# Summary
echo "=============================================="
echo -e "${GREEN}✓ Medical AI Analyzer is running!${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:5000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3333"
echo -e "${BLUE}API Docs:${NC} http://localhost:5000/docs"
echo ""
echo -e "${YELLOW}Process IDs:${NC}"
echo -e "  Backend PID:  $BACKEND_PID"
echo -e "  Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  backend/logs/backend.log"
echo -e "  Frontend: frontend/logs/frontend.log"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"
echo -e "  or run: ./stop.sh"
echo ""
echo -e "${GREEN}🎉 Ready to use!${NC}"
echo "=============================================="

