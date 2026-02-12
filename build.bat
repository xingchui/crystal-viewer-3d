@echo off
chcp 65001 >nul
echo ========================================
echo   Crystal Viewer 3D - 打包脚本
echo ========================================
echo.

set "TARGET=%~1"
if "%TARGET%"=="" set "TARGET=both"

:: 颜色定义
call :set_colors

:: 主逻辑
goto :main

:: 设置颜色
:set_colors
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"
goto :eof

:: 显示帮助
:show_help
echo 用法: build.bat [选项]
echo.
echo 选项:
echo   tauri     使用Tauri打包 (~5MB)
echo   electron  使用Electron打包 (~150MB)
echo   both      两种方案都打包 (默认)
echo   clean     清理构建文件
echo   help      显示此帮助
echo.
echo 示例:
echo   build.bat tauri     仅打包Tauri版本
echo   build.bat electron  仅打包Electron版本
echo   build.bat           打包两种版本
goto :eof

:: 清理构建文件
:clean_build
echo %YELLOW%清理构建文件...%NC%
if exist dist rmdir /s /q dist
if exist release rmdir /s /q release
if exist "src-tauri\target" rmdir /s /q "src-tauri\target"
echo %GREEN%清理完成%NC%
goto :eof

:: 检查Node.js
:check_node
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%错误: 未安装Node.js%NC%
    pause
    exit /b 1
)
echo %BLUE%Node.js版本:%NC%
node --version
goto :eof

:: 安装依赖
:install_deps
echo %YELLOW%检查依赖...%NC%
if not exist node_modules (
    echo %YELLOW%安装依赖...%NC%
    call npm install
    if errorlevel 1 (
        echo %RED%安装依赖失败%NC%
        pause
        exit /b 1
    )
)
goto :eof

:: 构建前端
:build_frontend
echo %YELLOW%构建前端...%NC%
call npm run build
if errorlevel 1 (
    echo %RED%前端构建失败%NC%
    pause
    exit /b 1
)
echo %GREEN%前端构建完成%NC%
goto :eof

:: Tauri打包
:build_tauri
echo %BLUE%========================================%NC%
echo %BLUE%  方案A: Tauri 打包%NC%
echo %BLUE%========================================%NC%

cargo --version >nul 2>&1
if errorlevel 1 (
    echo %RED%错误: 未安装Rust/Cargo%NC%
    echo %YELLOW%请访问 https://rustup.rs/ 安装Rust%NC%
    echo.
    echo %YELLOW%或者使用Electron方案:%NC%
    echo   build.bat electron
    exit /b 1
)

echo %BLUE%Rust版本:%NC%
cargo --version
echo %YELLOW%开始构建Tauri版本...%NC%

call npm run tauri-build
if errorlevel 1 (
    echo %RED%Tauri构建失败%NC%
    exit /b 1
)

echo %GREEN%Tauri构建完成!%NC%
echo %BLUE%输出位置: src-tauri\target\release\%NC%

:: 显示文件大小
if exist "src-tauri\target\release\Crystal Viewer 3D.exe" (
    echo.
    echo %GREEN%可执行文件:%NC%
    dir /b "src-tauri\target\release\Crystal Viewer 3D.exe"
)

if exist "src-tauri\target\release\bundle" (
    echo.
    echo %GREEN%安装包:%NC%
    dir /b "src-tauri\target\release\bundle\msi\*.msi" 2>nul
)

goto :eof

:: Electron打包
:build_electron
echo %BLUE%========================================%NC%
echo %BLUE%  方案B: Electron 打包%NC%
echo %BLUE%========================================%NC%

echo %YELLOW%开始构建Electron版本...%NC%

call npm run electron-build-win
if errorlevel 1 (
    echo %RED%Electron构建失败%NC%
    pause
    exit /b 1
)

echo %GREEN%Electron构建完成!%NC%
echo %BLUE%输出位置: release\%NC%

:: 显示文件大小
if exist release (
    echo.
    echo %GREEN%构建产物:%NC%
    dir /b release\*.exe 2>nul
)

goto :eof

:: 主函数
:main
if "%TARGET%"=="help" goto :show_help
if "%TARGET%"=="--help" goto :show_help
if "%TARGET%"=="-h" goto :show_help
if "%TARGET%"=="clean" goto :clean_build

call :check_node
call :install_deps
call :build_frontend

if "%TARGET%"=="tauri" (
    call :build_tauri
) else if "%TARGET%"=="electron" (
    call :build_electron
) else if "%TARGET%"=="both" (
    call :build_tauri
    if errorlevel 1 (
        echo %YELLOW%Tauri构建失败，继续Electron构建...%NC%
    )
    call :build_electron
) else (
    echo %RED%未知选项: %TARGET%%NC%
    call :show_help
    pause
    exit /b 1
)

echo.
echo %GREEN%========================================%NC%
echo %GREEN%  打包完成!%NC%
echo %GREEN%========================================%NC%
echo.
echo 按任意键退出...
pause >nul
goto :eof
