@echo off
cls

:menu
echo.
echo --- Development Server Management ---
echo 1. Start Server
echo 2. Stop Server
echo 3. Restart Server
echo 4. Exit
echo -------------------------------------
set /p choice="Enter your choice [1-4]: "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto stop_server
if "%choice%"=="3" goto restart_server
if "%choice%"=="4" goto exit_script

echo Invalid option. Please try again.
goto menu

:start_server
echo Starting Next.js development server...
start "Next.js Dev Server" cmd /c "npm run dev"
echo Server is starting in a new window.
goto end

:stop_server
echo Attempting to stop the server on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    set PID=%%a
    goto kill_process
)
echo No server found running on port 3000.
goto end

:kill_process
if defined PID (
    echo Found process with PID: %PID%. Terminating...
    taskkill /PID %PID% /F
    echo Server stopped.
) else (
    echo Could not find process ID.
)
goto end

:restart_server
echo Restarting server...
call :stop_server
timeout /t 2 /nobreak > nul
call :start_server
goto end

:exit_script
echo Exiting.
goto end

:end
pause
