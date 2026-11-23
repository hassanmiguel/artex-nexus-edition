@echo off
setlocal enabledelayedexpansion
title ARTEX + NEXUS AI
cd /d "%~dp0"

rem Convenience launcher: build and run THIS checkout through Docker Compose,
rem with NEXUS as the profile-gated compose service. ARTEX is opened directly at
rem /system/nexus, where the NEXUS interface lives inside an iframe.
rem
rem IMPORTANT: inside Docker, 127.0.0.1 is the container itself. Server-side calls
rem must use the compose hostname; only the browser iframe uses host loopback.
set "ARTEX_NEXUS_URL=http://nexus:8000"
set "ARTEX_NEXUS_UI_URL=http://127.0.0.1:8000"
set "ARTEX_NEXUS_TOKEN=%ARTEX_NEXUS_TOKEN%"
set "ARTEX_ALL_SKILLS_VISIBLE=1"

docker version >nul 2>&1
if errorlevel 1 (
  echo [artex] Docker is not running. Start Docker Desktop and try again.
  exit /b 1
)

rem A standalone NEXUS left over from an earlier run can still own host port 8000.
rem Stop ONLY that Python process - never an unrelated service on the port.
powershell -NoProfile -Command "$ErrorActionPreference='SilentlyContinue'; Get-NetTCPConnection -LocalPort 8000 -State Listen | ForEach-Object { $p=Get-CimInstance Win32_Process -Filter ('ProcessId='+$_.OwningProcess); if($p -and $p.CommandLine -like '*run_nexus.py*'){ Stop-Process -Id $p.ProcessId -Force } }" >nul 2>&1

docker image inspect artex:local >nul 2>&1
if errorlevel 1 (
  echo [artex] First run: building ARTEX from this checkout. This can take a while...
  docker compose build artex
  if errorlevel 1 (
    echo [artex] Build failed. See the output above.
    exit /b 1
  )
)

echo [artex] Starting postgres, ARTEX and the embedded NEXUS gateway...
docker compose --profile nexus up -d
if errorlevel 1 (
  echo [artex] docker compose up failed. See the output above.
  exit /b 1
)

echo [artex] Waiting for ARTEX at http://127.0.0.1:8787 ...
set /a tries=0
:wait_artex
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8787/api/health' -TimeoutSec 2; if($r.StatusCode -eq 200){ exit 0 } } catch {}; exit 1" >nul 2>nul
if not errorlevel 1 goto artex_ready
set /a tries+=1
if !tries! GEQ 90 (
  echo [artex] ARTEX did not become healthy in time. Check: docker compose logs artex
  exit /b 1
)
ping -n 2 127.0.0.1 >nul 2>&1
goto wait_artex

:artex_ready
echo [artex] Opening the embedded NEXUS section in your browser...
start "" "http://127.0.0.1:8787/system/nexus"
echo [artex] Running. Stop with: docker compose --profile nexus down
exit /b 0
