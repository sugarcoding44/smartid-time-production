@echo off
echo =======================================
echo REAL PALM CAPTURE - INTERACTIVE
echo =======================================
echo.
echo Instructions:
echo 1. Device will initialize first
echo 2. When you see "Put your palm on scanner NOW!", place your palm
echo 3. Keep palm steady during capture
echo.
pause

echo Initializing device...
(
echo c
echo o
echo l  
echo 20
echo s
echo E
echo S
echo 1
echo .
) | .\palm_test.exe > device_init.log

echo.
echo *** PUT YOUR PALM ON THE SCANNER NOW! ***
echo Press any key when palm is positioned...
pause

echo Capturing palm...
echo a | .\palm_test.exe >> capture.log

echo.
echo Checking results...
if exist "PalmIMG" (
    echo Captured images:
    Get-ChildItem "PalmIMG" -Recurse -Include "*.bmp", "*.jpg", "*.png"
) else (
    echo No PalmIMG folder found
)
