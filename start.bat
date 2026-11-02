@echo off
chcp 65001 > nul
title ProIM - Intern Manager Local Server
echo ================================================================
echo   ProIM (Intern Manager) - ระบบจัดการการฝึกงานครบวงจร
echo ================================================================
echo.
echo กำลังเริ่มต้นเซิร์ฟเวอร์...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ไม่พบ Node.js ในเครื่องของคุณ!
    echo กรุณาติดตั้ง Node.js จาก https://nodejs.org/ เพื่อเปิดใช้งานเซิร์ฟเวอร์
    echo หรือเปิดไฟล์ index-offline.html เพื่อดูในโหมด Standalone
    pause
    exit /b
)

echo เปิดเบราว์เซอร์ที่ http://localhost:3000 อัตโนมัติใน 2 วินาที...
start "" "http://localhost:3000"

node server.js
pause
