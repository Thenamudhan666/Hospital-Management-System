@echo off
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Successfully requested start for both servers.
