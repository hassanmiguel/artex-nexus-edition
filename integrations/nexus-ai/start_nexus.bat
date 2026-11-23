@echo off
setlocal
title NEXUS AI Gateway
cd /d "%~dp0"

rem NEXUS has no built-in authentication: keep it on loopback. ARTEX reaches it
rem through its own JWT-protected /api/nexus/* proxy. Do not use 0.0.0.0 here.
set "NEXUS_HOST=127.0.0.1"
set "NEXUS_PORT=8000"

echo Checking port %NEXUS_PORT%...
netstat -ano | findstr ":%NEXUS_PORT% " | findstr "LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo Port %NEXUS_PORT% is already in use; NEXUS may already be running.
  echo Stop the existing instance yourself rather than force-killing a process.
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.10+ from https://python.org
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating Python environment...
  python -m venv .venv
)
call .venv\Scripts\activate.bat

echo Installing / checking dependencies...
python -m pip install --upgrade pip >nul
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Dependency installation failed. Check your connection and try again.
  pause
  exit /b 1
)

where ollama >nul 2>nul
if not errorlevel 1 (
  python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:11434/api/tags', timeout=1)" >nul 2>nul
  if errorlevel 1 (
    echo Ollama is installed but not running; start it separately for local models.
  ) else (
    echo Ollama is running.
  )
)

set "RELOAD_ARG="
if /i "%NEXUS_RELOAD%"=="1" set "RELOAD_ARG=--reload"

echo Starting NEXUS AI at http://%NEXUS_HOST%:%NEXUS_PORT%
echo Keep this window open; ARTEX proxies it through /api/nexus/*.
start "" "http://%NEXUS_HOST%:%NEXUS_PORT%/"
python run_nexus.py --host %NEXUS_HOST% --port %NEXUS_PORT% %RELOAD_ARG%
pause
