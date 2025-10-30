#!/bin/bash

# Medical AI Analyzer - Stop Script
# Stops both backend and frontend services

echo "🛑 Stopping Medical AI Analyzer..."
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Kill backend (port 5000)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Stopping backend (port 5000)...${NC}"
    kill -9 $(lsof -t -i:5000) 2>/dev/null
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo -e "${YELLOW}Backend not running${NC}"
fi

# Kill frontend (port 3333)
if lsof -Pi :3333 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}Stopping frontend (port 3333)...${NC}"
    kill -9 $(lsof -t -i:3333) 2>/dev/null
    echo -e "${GREEN}✓ Frontend stopped${NC}"
else
    echo -e "${YELLOW}Frontend not running${NC}"
fi

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
echo "===================================="

