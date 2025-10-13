@echo off
cls

:menu
echo.
echo --- Development Server Management ---
echo 1. Start Development Server (npm run dev)
echo 2. Build & Start Production Server
echo 3. Stop Server
echo 4. Restart Development Server
echo 5. Exit
echo -------------------------------------
set /p choice="Enter your choice [1-5]: "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto build_and_start
if "%choice%"=="3" goto stop_server
if "%choice%"=="4" goto restart_server
if "%choice%"=="5" goto exit_script

echo Invalid option. Please try again.
goto menu

:start_server
echo Starting Next.js development server...
start "Next.js Dev Server" cmd /c "npm run dev"
echo Server is starting in a new window.
goto menu

:build_and_start
echo Building application for production...
echo Running: npm run build
call npm run build
if errorlevel 1 (
    echo Build failed! Check the errors above.
    pause
    goto menu
)
echo Build successful! Starting production server...
start "Next.js Production Server" cmd /c "npm start"
echo Production server is starting in a new window.
goto menu

:stop_server
echo Attempting to stop the server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
    goto kill_process
)
echo No server found running on port 3000.
goto menu

:kill_process
if defined PID (
    echo Found process with PID: %PID%. Terminating...
    taskkill /PID %PID% /F
    echo Server stopped.
) else (
    echo Could not find process ID.
)
goto menu

:restart_server
echo Restarting server...
call :stop_server
timeout /t 2 /nobreak > nul
call :start_server
goto menu

:exit_script
echo Exiting.
exit /b
