@echo off
setlocal enabledelayedexpansion

cls
echo.
echo === Piso WiFi Repository Sync ===
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Error: Git repository not found. Please run 'git init' first.
    pause
    exit /b 1
)

REM Show current status
echo Current status:
git status --short
echo.

REM Get commit message
if "%1"=="" (
    echo Enter commit message (or press Enter for auto-generated):
    set /p COMMIT_MSG=^> 
    
    if "!COMMIT_MSG!"=="" (
        for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
        for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)
        set COMMIT_MSG=Update: !mydate! !mytime!
    )
) else (
    set COMMIT_MSG=%1
)

echo.
echo Syncing changes...
echo.

REM Add all changes
echo Adding files...
git add -A

REM Commit
echo Committing: !COMMIT_MSG!
git commit -m "!COMMIT_MSG!"

if errorlevel 1 (
    echo Nothing to commit. Repository is up to date.
    pause
    exit /b 0
)

echo.

REM Push to remote
echo Pushing to remote...
git push

if %errorlevel% equ 0 (
    echo.
    echo === ✅ Successfully synced to GitHub ===
    echo.
    echo View your changes: https://github.com/kengen05/pisowifi-online
) else (
    echo Error pushing to remote. Check your connection and credentials.
    pause
    exit /b 1
)

pause
