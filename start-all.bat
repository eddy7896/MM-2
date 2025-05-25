@echo off

REM Install dependencies in frontend
cd /d %~dp0frontend
call npm install

REM Install dependencies in backend
cd /d %~dp0backend
call npm install

REM Wait for user confirmation
pause

REM Start frontend in new terminal
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"
REM Start backend in new terminal
start "Backend" cmd /k "cd /d %~dp0backend && npm start"
