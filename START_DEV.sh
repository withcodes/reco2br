#!/bin/bash
echo ""
echo "  ============================================"
echo "       GSTSync CA Edition - v2.0"
echo "       GST Reconciliation for CA Firms"
echo "  ============================================"
echo ""

# Check node
if ! command -v node &> /dev/null; then
  echo "  [ERROR] Node.js not found. Install from https://nodejs.org/"
  exit 1
fi

echo "  [OK] Node.js $(node --version) found"

# Backend deps
if [ ! -d "backend/node_modules" ]; then
  echo "  [INFO] Installing backend dependencies..."
  (cd backend && npm install)
fi

# Frontend deps
if [ ! -d "frontend/node_modules" ]; then
  echo "  [INFO] Installing frontend dependencies..."
  (cd frontend && npm install)
fi

echo "  [INFO] Starting GSTSync..."
echo "  [INFO] Backend  → http://localhost:3001"
echo "  [INFO] Frontend → http://localhost:5173"
echo "  [INFO] Press Ctrl+C to stop"
echo ""

# Run both concurrently
(cd backend  && npm run dev) &
(cd frontend && npm run dev) &

wait
