@echo off
cd /d "C:\proyek\edgemon"
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0."
exit
