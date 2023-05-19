@echo off
start "Listener" cmd /k "Python Listen.py"
timeout /t 2 >nul
start "Connector" cmd /k "node Connect.js"