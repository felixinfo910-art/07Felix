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

set PHP_BIN="D:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe"

if exist %PHP_BIN% (
    echo [OK] 找到现成环境: %PHP_BIN%
    start "" http://127.0.0.1:8088
    %PHP_BIN% -S 0.0.0.0:8088 -t "%~dp0"
) else (
    echo [提示] 未在默认路径找到 php7.4.3，尝试系统默认 php 命令...
    start "" http://127.0.0.1:8088
    php -S 0.0.0.0:8088 -t "%~dp0"
)
pause
