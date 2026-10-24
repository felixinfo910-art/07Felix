<?php
// ai.php - AI 智能助手与知识库大模型交互接口
require_once __DIR__ . '/config.php';

if (!checkAuth()) {
    jsonResponse(false, null, '需要身份验证');
}

$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true) ?: [];
$mode = $inputData['mode'] ?? 'chat'; // chat(问答), parse_task(拆解任务), weekly_report(生成周报)
$prompt = trim($inputData['prompt'] ?? '');

$apiKey = getConfig('ai_api_key', '');
$baseUrl = rtrim(getConfig('ai_base_url', 'https://api.deepseek.com'), '/');
$model = getConfig('ai_model', 'deepseek-chat');
$systemPrompt = getConfig('ai_system_prompt', '你是一位高水准的数字私人秘书与管理智囊，擅长分析管理事务、整理待办、总结周报并基于知识库为管理者提供清晰干练的行动建议。');

if (empty($apiKey)) {
    jsonResponse(false, null, '尚未配置 AI API Key，请先在顶部右侧【系统设置】中填入 API Key (如 DeepSeek、Kimi 或 OpenAI)。');
}

$db = Database::getConnection();

// 收集知识库背景（若有）
$kbDocs = $db->query("SELECT title, category, content FROM knowledge_docs LIMIT 10")->fetchAll();
$kbContext = "";
if (!empty($kbDocs)) {
    $kbContext .= "【管理者个人知识库背景参考】:\n";
    foreach ($kbDocs as $doc) {
        $kbContext .= "--- 文档: {$doc['title']} (分类: {$doc['category']}) ---\n";
        $kbContext .= mb_substr(strip_tags($doc['content']), 0, 500) . "\n\n";
    }
}

$messages = [];
$messages[] = ['role' => 'system', 'content' => $systemPrompt . "\n\n" . $kbContext];

if ($mode === 'chat') {
    if (empty($prompt)) {
        jsonResponse(false, null, '请输入你想咨询的问题或指令');
    }
    // 附带历史对话（如果有）
    if (!empty($inputData['history']) && is_array($inputData['history'])) {
        foreach (array_slice($inputData['history'], -6) as $h) {
            if (!empty($h['role']) && !empty($h['content'])) {
                $messages[] = ['role' => $h['role'], 'content' => $h['content']];
            }
        }
    }
    $messages[] = ['role' => 'user', 'content' => $prompt];

} elseif ($mode === 'parse_task') {
    $messages[] = [
        'role' => 'user', 
        'content' => "请分析以下管理者的口述或想法，拆解为待办任务。请严格输出为 JSON 数组，每个对象包含: 'title'(任务简短标题), 'priority'(high/medium/low), 'category'('daily'或'milestone'), 'due_date'('YYYY-MM-DD'格式，如果没提到就填下周或今日), 'note'(细节补充说明)。\n不要输出多余解释，只输出合法的 JSON 数组。\n口述内容:\n" . $prompt
    ];

} elseif ($mode === 'weekly_report') {
    // 汇总近期数据
    $doneTasks = $db->query("SELECT title, note FROM tasks WHERE status = 'done' LIMIT 10")->fetchAll();
    $urgentRenewals = $db->query("SELECT name, expire_date FROM renewals LIMIT 5")->fetchAll();
    $reimbs = $db->query("SELECT title, amount, status FROM reimbursements LIMIT 5")->fetchAll();

    $reportContext = "【本周完成事项】:\n";
    foreach ($doneTasks as $t) { $reportContext .= "- " . $t['title'] . "\n"; }
    $reportContext .= "\n【近期资产与续费情况】:\n";
    foreach ($urgentRenewals as $r) { $reportContext .= "- {$r['name']} (到期: {$r['expire_date']})\n"; }
    $reportContext .= "\n【垫资报销跟踪】:\n";
    foreach ($reimbs as $rm) { $reportContext .= "- {$rm['title']}: ￥{$rm['amount']} ({$rm['status']})\n"; }

    $messages[] = [
        'role' => 'user',
        'content' => "请根据以下我本周处理的事务数据和管理进展，帮我起草一份精炼、干练、结构规范的【管理者工作周报】(包含：本周核心工作总结、业务与资产健康度、垫资与财务跟进、下周重点计划)。\n\n" . $reportContext
    ];
}

// 组织请求发送到 OpenAI 规范端点
$endpoint = $baseUrl . '/chat/completions';
$payload = [
    'model' => $model,
    'messages' => $messages,
    'temperature' => 0.6
];

$ch = curl_init($endpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ],
    CURLOPT_TIMEOUT => 45,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    jsonResponse(false, null, 'AI 请求失败 (cURL 异常): ' . $curlError);
}

if ($httpCode !== 200) {
    $errJson = json_decode($response, true);
    $errMsg = $errJson['error']['message'] ?? ('HTTP 状态码: ' . $httpCode);
    jsonResponse(false, null, 'AI 接口报错: ' . $errMsg);
}

$resData = json_decode($response, true);
$reply = $resData['choices'][0]['message']['content'] ?? '';

if (empty($reply)) {
    jsonResponse(false, null, 'AI 未返回有效内容');
}

jsonResponse(true, [
    'reply' => $reply,
    'mode' => $mode
]);
