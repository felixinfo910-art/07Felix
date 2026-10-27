@echo off
setlocal

set "HOME_PHP_PATH=C:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe"

where php >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "PHP_BIN=php"
    goto RUN
)

if exist "%HOME_PHP_PATH%" (
    set "PHP_BIN=%HOME_PHP_PATH%"
    goto RUN
)

if exist "D:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe" (
    set "PHP_BIN=D:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe"
    goto RUN
)

if exist "C:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe" (
    set "PHP_BIN=C:\phpstudy_pro\Extensions\php\php7.4.3nts\php.exe"
    goto RUN
)

echo [ERROR] PHP not found.
pause
exit /b 1

:RUN
echo [Felix Workbench] Starting server with: %PHP_BIN%
echo Local URL: http://127.0.0.1:8088
%PHP_BIN% -S 0.0.0.0:8088 -t .
