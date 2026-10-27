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
    if (is_dir($logDir) && is_writable($logDir)) {
        ini_set('error_log', $logDir . '/php_errors.log');
    }

    // 线上生产安全防护与防抓取收录响应头
    if (!headers_sent()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('X-Robots-Tag: noindex, nofollow, noarchive, nosnippet');
    }
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// 全局异常与致命错误守护，确保任何未捕获错误均以标准 JSON 输出，防止前端 response.json() 抛出 Unexpected end of JSON
set_exception_handler(function($e) {
    $msg = $e->getMessage();
    $file = basename($e->getFile());
    $line = $e->getLine();
    error_log("[Uncaught Exception] {$msg} in {$file}:{$line}");
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
    }
    echo json_encode([
        'success' => false,
        'message' => "服务异常 [{$file}:{$line}]: " . $msg
    ], JSON_UNESCAPED_UNICODE);
    exit;
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $msg = $error['message'];
        $file = basename($error['file']);
        $line = $error['line'];
        error_log("[Fatal Error] {$msg} in {$file}:{$line}");
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
        }
        echo json_encode([
            'success' => false,
            'message' => "致命错误 [{$file}:{$line}]: " . $msg
        ], JSON_UNESCAPED_UNICODE);
    }
});

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

// ---------------- 工业级 AES-256-GCM 凭据加密与解密守护 ----------------
function getEncryptionKey() {
    static $cachedKey = null;
    if ($cachedKey !== null) return $cachedKey;
    
    // 1. 优先从 .env 读取高安全独立密钥
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, 'APP_KEY=') === 0) {
                $val = trim(substr($line, 8));
                if (!empty($val)) {
                    $cachedKey = hash('sha256', $val, true);
                    return $cachedKey;
                }
            }
        }
    }
    
    // 2. 若未在 .env 配置，则从数据库持久化读取系统自生根秘钥，保证秘钥生命周期恒定
    $dbKey = getConfig('app_system_secret', '');
    if (empty($dbKey)) {
        $dbKey = bin2hex(random_bytes(32));
        setConfig('app_system_secret', $dbKey);
    }
    $cachedKey = hash('sha256', $dbKey, true);
    return $cachedKey;
}

function encryptSecret($plainText) {
    if ($plainText === null || $plainText === '') return '';
    $key = getEncryptionKey();
    $iv = random_bytes(12); // GCM 推荐标准 12 字节 IV
    $tag = '';
    $cipher = openssl_encrypt($plainText, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    if ($cipher === false) return '';
    return base64_encode($iv . $tag . $cipher);
}

function decryptSecret($cipherText) {
    if (empty($cipherText)) return '';
    $data = base64_decode($cipherText);
    if (strlen($data) < 28) return ''; // 12字节IV + 16字节Tag
    $iv = substr($data, 0, 12);
    $tag = substr($data, 12, 16);
    $cipher = substr($data, 28);
    $key = getEncryptionKey();
    $plain = openssl_decrypt($cipher, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    return $plain === false ? '' : $plain;
}

