@echo off
start "Record" cmd /k "Python Record.py"
timeout /t 2 >nul
set NODE_OPTIONS=--max-old-space-size=16384
start "Connector" cmd /k "node Connect.js"