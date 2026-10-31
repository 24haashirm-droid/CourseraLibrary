@echo off
title CourseFinder Launcher
echo ============================================================
echo   CourseFinder: Smart Global Library for Long Courses
echo ============================================================
echo.
echo Starting Backend API on http://localhost:5000 ...
start "CourseFinder Backend (5000)" cmd /k "cd /d "%~dp0backend" && npm start"

echo Starting Frontend on http://localhost:3000 ...
start "CourseFinder Frontend (3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [OK] Backend and Frontend started in separate windows!
echo - Web Application:  http://localhost:3000
echo - REST API:         http://localhost:5000
echo - Chrome Extension: %~dp0extension
echo.
echo You can load the unpacked extension in chrome://extensions
echo ============================================================
pause
