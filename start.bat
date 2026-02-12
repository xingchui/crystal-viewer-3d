@echo off
chcp 65001 >nul
echo ==========================================
echo   Crystal Viewer 3D - 晶体结构可视化
echo ==========================================
echo.
echo 正在启动应用...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误：未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    npm install
    if errorlevel 1 (
        echo 安装依赖失败
        pause
        exit /b 1
    )
)

REM 启动开发服务器
echo 启动服务器，请在浏览器中访问 http://localhost:5173
echo 按Ctrl+C停止服务器
echo.
npm run dev

pause
