@echo off
setlocal enabledelayedexpansion

cls
echo.
echo === Stopping Piso WiFi Docker Environment ===
echo.

echo Stopping containers...
docker-compose down

if errorlevel 1 (
    echo Error stopping containers
    pause
    exit /b 1
)

echo.
echo ✅ All containers stopped
echo.
echo To restart: run-docker.bat
echo.
pause
