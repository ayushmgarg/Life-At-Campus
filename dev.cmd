@echo off
rem Dev server with hot reload on http://localhost:5173
setlocal
cd /d "%~dp0"
if not exist node_modules call npm install || exit /b 1
start "" http://localhost:5173/
call npm run dev
