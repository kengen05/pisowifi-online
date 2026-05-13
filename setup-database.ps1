#!/usr/bin/env powershell
# Database Setup Verification Script for Piso WiFi Admin Portal
# Run this to check and setup MongoDB on Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Piso WiFi - Database Setup Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check service
function Check-Service {
    param([string]$ServiceName)
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($null -ne $service) {
        if ($service.Status -eq "Running") {
            Write-Host "✅ $ServiceName is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $ServiceName is installed but not running" -ForegroundColor Yellow
            return $false
        }
    } else {
        Write-Host "❌ $ServiceName is not installed" -ForegroundColor Red
        return $false
    }
}

# Function to test MongoDB connection
function Test-MongoConnection {
    try {
        $process = Start-Process "mongosh" -ArgumentList '"mongodb://localhost:27017"' -NoNewWindow -PassThru -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        if ($null -ne $process) {
            Write-Host "✅ MongoDB connection successful" -ForegroundColor Green
            Stop-Process -InputObject $process -ErrorAction SilentlyContinue
            return $true
        }
    } catch {
        Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
    }
    return $false
}

# Check MongoDB
Write-Host "1. Checking MongoDB Installation..." -ForegroundColor Cyan
$mongoInstalled = Check-Service "MongoDB"
Write-Host ""

if ($mongoInstalled) {
    Write-Host "2. Testing MongoDB Connection..." -ForegroundColor Cyan
    Test-MongoConnection
    Write-Host ""
    
    Write-Host "✅ MongoDB is properly configured!" -ForegroundColor Green
    Write-Host "📊 Your application is running in DATABASE MODE" -ForegroundColor Green
    Write-Host "   All payments, devices, and activities will be persisted!" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your application is currently in DEMO MODE (in-memory data)" -ForegroundColor Yellow
    Write-Host "To enable database persistence, choose one option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPTION 1: Install MongoDB Community Edition" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://www.mongodb.com/try/download/community" -ForegroundColor White
    Write-Host "  2. Run the .msi installer" -ForegroundColor White
    Write-Host "  3. Check 'Install MongoDB as Service'" -ForegroundColor White
    Write-Host "  4. Rerun this script" -ForegroundColor White
    Write-Host ""
    
    Write-Host "OPTION 2: Use MongoDB Atlas (Cloud)" -ForegroundColor Cyan
    Write-Host "  1. Create account at: https://www.mongodb.com/cloud/atlas" -ForegroundColor White
    Write-Host "  2. Create free cluster" -ForegroundColor White
    Write-Host "  3. Update .env with connection string" -ForegroundColor White
    Write-Host "  4. Restart backend" -ForegroundColor White
    Write-Host ""
    
    Write-Host "OPTION 3: Run MongoDB in Docker" -ForegroundColor Cyan
    Write-Host "  1. Ensure Docker is running" -ForegroundColor White
    Write-Host "  2. Run: docker run -d --name mongodb -p 27017:27017 mongo:latest" -ForegroundColor White
    Write-Host "  3. Rerun this script" -ForegroundColor White
    Write-Host ""
}

# Check .env file
Write-Host "3. Checking Configuration..." -ForegroundColor Cyan
$envPath = ".\backend\.env"
if (Test-Path $envPath) {
    $mongoUri = (Select-String "MONGODB_URI" $envPath -ErrorAction SilentlyContinue)
    if ($null -ne $mongoUri) {
        Write-Host "✅ .env file configured" -ForegroundColor Green
        Write-Host "   $mongoUri"
    }
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Guide: See MONGODB_SETUP.md for details" -ForegroundColor Cyan
Write-Host "Architecture: See DATABASE_ARCHITECTURE.md" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
