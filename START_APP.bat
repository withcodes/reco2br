@echo off
setlocal
TITLE GSTSync CA Edition

echo.
echo  ============================================
echo       GSTSync CA Edition - v2.0
echo       GST Reconciliation for CA Firms
echo  ============================================
echo.

:: ── Check Node.js ─────────────────────────────
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js not found.
    echo  [ERROR] Download from https://nodejs.org/ and install, then retry.
    pause
    exit /b 1
)
FOR /F "tokens=*" %%i IN ('node --version') DO SET NODE_VER=%%i
echo  [OK] Node.js %NODE_VER% found

:: ── Backend dependencies ───────────────────────
echo  [INFO] Setting up backend...
cd backend
IF NOT EXIST "node_modules\" (
    echo  [INFO] Installing backend dependencies...
    call npm install
    IF %ERRORLEVEL% NEQ 0 ( echo  [ERROR] Backend npm install failed & pause & exit /b 1 )
)

:: ── Frontend dependencies ──────────────────────
echo  [INFO] Setting up frontend...
cd ..\frontend
IF NOT EXIST "node_modules\" (
    echo  [INFO] Installing frontend dependencies...
    call npm install
    IF %ERRORLEVEL% NEQ 0 ( echo  [ERROR] Frontend npm install failed & pause & exit /b 1 )
)

:: ── Build frontend for production ─────────────
IF NOT EXIST "dist\" (
    echo  [INFO] Building frontend...
    call npm run build
    IF %ERRORLEVEL% NEQ 0 ( echo  [ERROR] Frontend build failed & pause & exit /b 1 )
)
cd ..

:: ── Start backend server ───────────────────────
echo.
echo  [INFO] Starting GSTSync server...
echo  [INFO] App will open at: http://localhost:3001
echo  [INFO] Press Ctrl+C to stop the server
echo.
cd backend
start "" http://localhost:3001
call npm start

endlocal
