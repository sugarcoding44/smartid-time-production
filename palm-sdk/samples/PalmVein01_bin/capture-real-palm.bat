@echo off
echo ===== PALM CAPTURE SESSION =====
echo 1. Place your palm over the scanner
echo 2. This will initialize device and capture real palm images
echo 3. Images will be saved to PalmIMG folder
echo.
pause

echo Starting palm capture...

(
echo c
echo o  
echo l
echo 20
echo s
echo E
echo S
echo 5
echo .\PalmIMG
echo a
) | .\palm_test.exe

echo.
echo Checking captured images...
if exist "PalmIMG" (
    echo PalmIMG folder contents:
    dir PalmIMG /s
) else (
    echo No PalmIMG folder found
)

pause
