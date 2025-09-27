@echo off
echo Capturing real palm images...
echo.

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
echo a
timeout /t 10
echo t
echo q
) | .\palm_test.exe

echo.
echo Palm capture completed. Check PalmIMG folder for captured images.
