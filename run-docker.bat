@echo off
setlocal enabledelayedexpansion

cls
echo.
echo === Piso WiFi Local Docker Setup ===
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed or not in PATH
    echo Install Docker from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo Error: Docker daemon is not running
    echo Please start Docker Desktop or Docker daemon and try again
    pause
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed
    echo Install Docker Compose from: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo Starting local development environment...
echo.

REM Start services
echo Starting containers...
docker-compose up -d

if errorlevel 1 (
    echo Error starting containers
    pause
    exit /b 1
)

echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak

REM Check status
echo.
echo Container Status:
docker-compose ps

echo.
echo === ✅ Local environment is ready ===
echo.
echo Access Points:
echo   Frontend (React):      http://localhost:3000
echo   Backend API:           http://localhost:5000
echo   MongoDB Express:       http://localhost:8081
echo   MongoDB Direct:        localhost:27017
echo.
echo Database Credentials:
echo   Username:              admin
echo   Password:              password123
echo.
echo Useful Commands:
echo   View logs:             docker-compose logs -f
echo   Stop containers:       docker-compose down
echo   View specific log:     docker-compose logs -f [backend^|frontend^|mongodb]
echo   Rebuild images:        docker-compose up -d --build
echo   Clean everything:      docker-compose down -v
echo.
echo Open http://localhost:3000 to access the admin portal
echo.
pause
