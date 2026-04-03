@echo off
echo Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b %errorlevel%
)
cd ..

echo Starting Unified Server...
cd backend
node index.js
pause
