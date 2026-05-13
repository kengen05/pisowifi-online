@echo off
setlocal enabledelayedexpansion

cls
echo.
echo === Piso WiFi Docker Hub Push ===
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo Error: Docker daemon is not running
    pause
    exit /b 1
)

REM Get Docker Hub token
if "!DOCKER_TOKEN!"=="" (
    echo Enter your Docker Hub access token:
    set /p DOCKER_TOKEN=^> 
)

set DOCKER_USERNAME=kengen05

echo.
echo Building images...
docker-compose build

if errorlevel 1 (
    echo Error building images
    pause
    exit /b 1
)

echo.
echo Logging in to Docker Hub...
echo !DOCKER_TOKEN! | docker login -u !DOCKER_USERNAME! --password-stdin

if errorlevel 1 (
    echo Error logging in to Docker Hub
    pause
    exit /b 1
)

echo.
echo Pushing backend image...
docker push !DOCKER_USERNAME!/pisowifi-backend:latest

if errorlevel 1 (
    echo Error pushing backend image
    pause
    exit /b 1
)

echo.
echo Pushing frontend image...
docker push !DOCKER_USERNAME!/pisowifi-frontend:latest

if errorlevel 1 (
    echo Error pushing frontend image
    pause
    exit /b 1
)

echo.
echo === ✅ Successfully pushed to Docker Hub ===
echo.
echo Images available at:
echo   Backend:  https://hub.docker.com/r/!DOCKER_USERNAME!/pisowifi-backend
echo   Frontend: https://hub.docker.com/r/!DOCKER_USERNAME!/pisowifi-frontend
echo.
echo Watchtower will auto-update containers within 5 minutes
echo.
pause
