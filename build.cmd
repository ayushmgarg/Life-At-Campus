@echo off
rem Installs dependencies, builds dist/ and CampusLifeSimulator.html, then removes node_modules.
setlocal
cd /d "%~dp0"
call npm install || exit /b 1
call npm run build || exit /b 1
rmdir /s /q node_modules
echo.
echo Done. Open CampusLifeSimulator.html or run play.cmd
