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

set DOCKER_USERNAME=codehubit
set IMAGE_NAME=pisowifi-online

echo.
echo Building Docker image...
docker build -t !DOCKER_USERNAME!/!IMAGE_NAME!:latest .

if errorlevel 1 (
    echo Error building Docker image
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
echo Pushing image to Docker Hub...
docker push !DOCKER_USERNAME!/!IMAGE_NAME!:latest

if errorlevel 1 (
    echo Error pushing image
    pause
    exit /b 1
)

echo.
echo === ✅ Successfully pushed to Docker Hub ===
echo.
echo Image available at:
echo   https://hub.docker.com/r/!DOCKER_USERNAME!/!IMAGE_NAME!
echo.
pause
