@echo off
start "Listener" cmd /k "Python Listen.py"
timeout /t 2 >nul
set NODE_OPTIONS=--max-old-space-size=12288
start "Connector" cmd /k "node Connect.js"