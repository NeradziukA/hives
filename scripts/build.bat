@echo off
call npm run build --prefix ./client
if %errorlevel% neq 0 exit /b %errorlevel%
mkdir server\static\client 2>/dev/null
xcopy client\dist server\static\client /E /I /Y
if %errorlevel% neq 0 exit /b %errorlevel%
call npm run build --prefix ./admin
if %errorlevel% neq 0 exit /b %errorlevel%
