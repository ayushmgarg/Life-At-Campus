@echo off
rem Opens the simulator. Tries the single file first, falls back to a local server.
setlocal
set PORT=8099

if exist "%~dp0CampusLifeSimulator.html" (
  start "" "%~dp0CampusLifeSimulator.html"
  exit /b 0
)

if not exist "%~dp0dist\index.html" (
  echo Not built yet. Run build.cmd first.
  pause
  exit /b 1
)

start "" http://localhost:%PORT%/
python -m http.server %PORT% --directory "%~dp0dist"
