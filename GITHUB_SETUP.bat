@echo off
setlocal
echo.
echo   KnightOwl GST -- GitHub Push Setup
echo   ====================================
echo.

WHERE git >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Git not installed.
    echo   [ERROR] Download from https://git-scm.com/ and install, then retry.
    pause
    exit /b 1
)

set /p GH_USER="  Enter your GitHub username: "
set /p REPO_NAME="  Enter repo name (e.g. knightowl-gst): "

echo.
echo   [INFO] Initialising git repository...
git init
git add .
git commit -m "feat: initial commit - KnightOwl GST v2.0 CA Edition"

echo.
echo   ============================================
echo   NOW DO THIS IN YOUR BROWSER:
echo   ============================================
echo   1. Go to https://github.com/new
echo   2. Repository name: %REPO_NAME%
echo   3. Set Private or Public as you prefer
echo   4. Do NOT tick README / .gitignore / license
echo   5. Click "Create repository"
echo   ============================================
echo.
pause

echo   [INFO] Pushing to GitHub...
git remote add origin https://github.com/%GH_USER%/%REPO_NAME%.git
git branch -M main
git push -u origin main

echo.
echo   Done! Code is live at:
echo   https://github.com/%GH_USER%/%REPO_NAME%
echo.
echo   Next: read DEPLOY.md to go live on Railway + Vercel
pause
endlocal
