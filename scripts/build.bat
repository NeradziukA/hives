@echo off
call npm run build --prefix ./client
xcopy client\dist server\static /E /I /Y
