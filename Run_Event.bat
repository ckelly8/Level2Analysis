@echo off
start "Listener" cmd /k "Python Listen.py"
timeout /t 2 >nul
set NODE_OPTIONS=--max-old-space-size=16384
start "Connector" cmd /k "node Connect.js"