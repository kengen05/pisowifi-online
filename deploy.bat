@echo off
REM Piso WiFi Docker Deployment Script for Windows

setlocal enabledelayedexpansion

echo.
echo === Piso WiFi Docker Deployment ===
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed or not in PATH. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose is not installed or not in PATH.
    pause
    exit /b 1
)

REM Create .env if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo.env created. Please edit it with your configuration.
    pause
    exit /b 0
)

REM Build and start services
echo.
echo Building images...
docker-compose -f docker-compose.prod.yml build

echo.
echo Starting services...
docker-compose -f docker-compose.prod.yml up -d

echo.
echo Checking status...
docker-compose -f docker-compose.prod.yml ps

echo.
echo === Deployment Complete ===
echo.
echo Frontend: http://localhost
echo Backend API: http://localhost/api
echo MongoDB Express: http://localhost:8081
echo.
echo View logs: docker-compose -f docker-compose.prod.yml logs -f
echo Stop services: docker-compose -f docker-compose.prod.yml down
echo.
pause
