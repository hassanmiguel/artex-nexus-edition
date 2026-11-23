@echo off
setlocal enabledelayedexpansion
title ARTEX + NEXUS AI
cd /d "%~dp0"

rem Convenience launcher: bring up the bundled NEXUS gateway, wait for its health
rem endpoint, then start ARTEX with the proxy env vars already set. NEXUS stays on
rem 127.0.0.1; the browser only ever talks to ARTEX on :8787.
set "ARTEX_NEXUS_URL=http://127.0.0.1:8000"
set "ARTEX_NEXUS_TOKEN=%ARTEX_NEXUS_TOKEN%"
set "ARTEX_ALL_SKILLS_VISIBLE=1"

netstat -ano | findstr ":8000 " | findstr "LISTENING" >nul 2>nul
if errorlevel 1 (
  echo Starting NEXUS AI in a separate window...
  start "NEXUS AI" "%~dp0integrations\nexus-ai\start_nexus.bat"
) else (
  echo NEXUS AI is already listening on port 8000.
)

echo Waiting for NEXUS health at %ARTEX_NEXUS_URL%/health ...
set /a tries=0
:wait_nexus
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8000/health' -TimeoutSec 1 | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto nexus_ready
set /a tries+=1
if !tries! GEQ 60 (
  echo NEXUS did not become healthy in time. Check the NEXUS window.
  echo ARTEX will still start; /system/nexus will show it as offline.
  goto nexus_ready
)
ping -n 2 127.0.0.1 >nul 2>&1
goto wait_nexus

:nexus_ready
echo Starting ARTEX. Open http://127.0.0.1:8787/system/nexus to check the link.
call "%~dp0start.bat" %*
