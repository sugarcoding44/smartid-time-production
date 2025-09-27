@echo off
echo ==========================================
echo PALM REGISTRATION TEST - FIXED INPUT
echo ==========================================
echo.
echo This will:
echo 1. Initialize device 
echo 2. Create palm client with server details
echo 3. Attempt registration 
echo.
echo IMPORTANT: Put your palm on scanner when prompted!
echo.
pause

echo Starting test...

(
echo c
echo.
echo o
echo.
echo l
echo.
echo 20
echo.
echo s
echo.
echo E
echo.
echo 1
echo.
echo smartid_test
echo.
echo PALM001
echo.
echo 127.0.0.1
echo.
echo 8888
echo.
echo.
echo.
echo 2
echo.
echo .\sample.jpg
echo.
echo .\sample.jpg
echo.
echo q
echo.
) | .\palm_test.exe

echo.
echo Registration test completed.
