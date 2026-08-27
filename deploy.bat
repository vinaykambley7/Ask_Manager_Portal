@echo off
title Deploy ASK EOD Manager to Firebase
cls
echo ===================================================
echo     ASK EOD MANAGER - FIREBASE DEPLOYMENT TOOL
echo ===================================================
echo.
echo Step 1: Checking Firebase Authentication...
echo If a browser window opens, please click "Allow" with your Google account.
echo.
call npx -y firebase-tools login
echo.
echo ===================================================
echo Step 2: Deploying to Firebase Hosting (ask-managers-portal)...
echo ===================================================
echo.
call npx -y firebase-tools deploy --only hosting --project ask-managers-portal
echo.
echo ===================================================
echo Deployment Process Finished!
echo Your live URL: https://ask-managers-portal.web.app
echo ===================================================
pause
