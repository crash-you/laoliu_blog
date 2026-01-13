@echo off
chcp 65001 >nul
title 老刘博客 - 自定义管理后台

echo.
echo ========================================
echo    老刘的生财之道 - 自定义管理后台
echo ========================================
echo.
echo 正在启动服务...
echo.

cd /d "%~dp0"

:: 启动管理后台服务器
start /b cmd /c "node admin-server/server.mjs"

echo [√] 管理后台服务启动中...
echo.
echo 等待服务就绪（约3秒）...

:: 等待服务启动
timeout /t 3 /nobreak >nul

echo.
echo [√] 正在打开浏览器...
echo.

:: 打开管理后台
start http://localhost:3001

echo ========================================
echo   管理后台已启动！
echo.
echo   访问地址: http://localhost:3001
echo.
echo   功能支持:
echo   - 内容增删改查
echo   - 批量删除
echo   - 草稿管理
echo   - GitHub 自动同步
echo.
echo   关闭此窗口可停止服务
echo ========================================
echo.

:: 保持窗口打开
cmd /k
