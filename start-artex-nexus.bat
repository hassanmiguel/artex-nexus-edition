@echo off
setlocal enabledelayedexpansion
title ARTEX + NEXUS AI
cd /d "%~dp0"

rem Convenience launcher: bring up the bundled NEXUS gateway headlessly, then start
rem ARTEX and open its NEXUS AI section. NEXUS has NO standalone browser window;
rem its UI is embedded inside ARTEX at /system/nexus. NEXUS stays on 127.0.0.1.
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
echo Starting ARTEX. Your browser will open the embedded NEXUS section.
rem Open ARTEX (not NEXUS) once the API is up. /api/health needs no JWT.
start "" /min powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 40;$i++){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:8787/api/health' -TimeoutSec 1; if($r.StatusCode -eq 200){ Start-Process 'http://127.0.0.1:8787/system/nexus'; break } } catch {}; Start-Sleep -Seconds 1 }"
call "%~dp0start.bat" %*
