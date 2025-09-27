@echo off
echo Testing palm client creation only...

echo c > input.txt
echo o >> input.txt
echo l >> input.txt
echo 20 >> input.txt
echo s >> input.txt
echo E >> input.txt
echo 1 >> input.txt
echo smartid_test >> input.txt
echo PALM001 >> input.txt
echo 127.0.0.1 >> input.txt
echo 8888 >> input.txt
echo. >> input.txt
echo q >> input.txt

type input.txt | .\palm_test.exe

del input.txt
