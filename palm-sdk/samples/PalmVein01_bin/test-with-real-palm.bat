@echo off
echo ========================================
echo TESTING REGISTRATION WITH REAL PALM
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Place your palm on the scanner when device starts
echo 2. Keep palm steady during the process
echo 3. Registration will attempt after device init
echo.
pause

(
echo c
echo o
echo l
echo 20
echo s
echo E
echo 1
echo smartid_test
echo PALM001  
echo 127.0.0.1
echo 8888
echo.
echo b
timeout /t 5
echo t
echo 2
echo .\sample.jpg
echo .\sample.jpg
echo q
) | .\palm_test.exe

echo.
echo Test completed. Check server for any connections.
