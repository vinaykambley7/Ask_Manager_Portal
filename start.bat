@echo off
title ASK EOD Manager Portal Launcher
color 1F
echo ========================================================
echo          ASK EOD Manager - Work Portal Launcher
echo ========================================================
echo.
echo Launching the web application in your default browser...
start "" "%~dp0index.html"
echo.
echo [OK] Web Portal opened successfully!
echo.
echo Note: If you prefer running via local Node server, run:
echo       node server.js
echo.
echo Press any key to exit this launcher window...
pause >nul
