@echo off
echo Testing query operation...
echo.

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
echo 4
echo .\sample.jpg
echo .\sample.jpg
echo q
) | .\palm_test.exe

echo.
echo Query test completed.
