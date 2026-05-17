@echo off
cd /d E:\PythonProject\guozijian

echo === Guozijian Tunnel ===

echo Checking dev server...
curl -s -o nul http://localhost:3000
if errorlevel 1 (
    echo Starting dev server...
    start "Dev" cmd /c "cd /d E:\PythonProject\guozijian && npm run dev"
    timeout /t 6 >nul
)

echo Starting tunnel...
echo Copy the trycloudflare URL when it appears.
echo.

where cloudflared >nul 2>&1
if not errorlevel 1 (
    cloudflared tunnel --url http://localhost:3000
    goto end
)

if exist "C:\Program Files\cloudflared\cloudflared.exe" (
    "C:\Program Files\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000
    goto end
)

echo Using localtunnel...
call npx localtunnel --port 3000

:end
pause
