<?php
// config.php - 全局安全验证与辅助函数
session_start();

require_once __DIR__ . '/db.php';

function jsonResponse($success, $data = null, $message = '') {
    header('Content-Type: application/json; charset=utf-8');
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

// 检查是否需要登录
function checkAuth() {
    $password = getConfig('access_password', '');
    if (empty($password)) {
        return true; // 未设密码则无需验证
    }
    return !empty($_SESSION['auth_user']);
}
