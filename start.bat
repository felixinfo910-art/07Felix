@echo off
chcp 65001 >nul
title Felix 管理者个人工作台
echo ========================================================
echo        Felix 管理者个人工作台 (Notion 纸面质感)
echo ========================================================
echo.
echo 正在检查并启动本地 PHP 服务...
echo 本地访问地址: http://127.0.0.1:8088
echo 局域网/手机同一WiFi访问地址: 请查看本机内网IP:8088
echo.

where php >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] 找到系统环境中的 PHP
    start "" http://127.0.0.1:8088
    php -S 0.0.0.0:8088 -t "%~dp0"
    goto end
)

if exist "D:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe" (
    echo [OK] 找到环境: php7.4.3nts
    start "" http://127.0.0.1:8088
    "D:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe" -S 0.0.0.0:8088 -t "%~dp0"
    goto end
)

if exist "D:\phpstudy_pro\Extensions\php\php7.3.4nts\php.exe" (
    echo [OK] 找到环境: php7.3.4nts
    start "" http://127.0.0.1:8088
    "D:\phpstudy_pro\Extensions\php\php7.3.4nts\php.exe" -S 0.0.0.0:8088 -t "%~dp0"
    goto end
)

echo [错误] 未检测到 PHP 环境，请确认已安装或将其加入环境变量。
pause

:end
