<?php
// config.php - 全局环境识别、安全策略与辅助函数

// 1. 运行模式识别 (优先从 .env 读取，未配置则按域名/IP自动智能判定)
function detectEnvironment() {
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                if (trim($k) === 'APP_ENV') {
                    return strtolower(trim($v));
                }
            }
        }
    }
    
    // 自动判定：如果访问的主机头是 localhost, 127.0.0.1 或内网 IP，则视为本地开发模式
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $hostWithoutPort = explode(':', $host)[0];
    if (in_array($hostWithoutPort, ['localhost', '127.0.0.1', '::1']) || preg_match('/^192\.168\./', $hostWithoutPort) || preg_match('/^10\./', $hostWithoutPort)) {
        return 'local';
    }
    return 'production';
}

if (!defined('APP_ENV')) {
    define('APP_ENV', detectEnvironment());
    define('IS_PRODUCTION', APP_ENV === 'production');
}

// 2. 根据模式配置报错回显与安全策略
if (IS_PRODUCTION) {
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    $logDir = __DIR__ . '/data';
    if (is_dir($logDir)) {
        ini_set('error_log', $logDir . '/php_errors.log');
    }

    // 线上生产安全防护响应头
    if (!headers_sent()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
    }
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// 3. 安全启动会话
if (session_status() === PHP_SESSION_NONE) {
    if (IS_PRODUCTION) {
        session_set_cookie_params([
            'lifetime' => 86400 * 7,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
    session_start();
}

require_once __DIR__ . '/db.php';

function jsonResponse($success, $data = null, $message = '') {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function getConfig($key, $default = '') {
    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT value FROM system_config WHERE key = ?");
    $stmt->execute([$key]);
    $row = $stmt->fetch();
    return $row ? $row['value'] : $default;
}

function setConfig($key, $value) {
    $db = Database::getConnection();
    $stmt = $db->prepare("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)");
    return $stmt->execute([$key, $value]);
}

// 检查是否登录
function checkAuth() {
    return !empty($_SESSION['auth_user']);
}

