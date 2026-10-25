<?php
// api.php - 综合业务 RESTful API 控制器
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$db = Database::getConnection();

// 公开接口检查
$publicActions = ['login', 'check_status'];
if (!in_array($action, $publicActions) && !checkAuth()) {
    jsonResponse(false, null, '需要身份验证，请先登录');
}

// 接收数据 (多源安全合并: JSON + POST + GET)
$inputData = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $inputData = $decoded;
    }
}
$inputData = array_merge($_GET, $_POST, $inputData);

switch ($action) {
    // ---------------- 系统与鉴权 ----------------
    case 'check_status':
        $hasPassword = !empty(getConfig('access_password', ''));
        $isLoggedIn = !empty($_SESSION['auth_user']);
        $theme = getConfig('theme', 'notion');
        $appTitle = getConfig('app_title', 'Felix 管理者工作台');
        jsonResponse(true, [
            'has_password' => $hasPassword,
            'is_logged_in' => $hasPassword ? $isLoggedIn : true,
            'theme' => $theme,
            'app_title' => $appTitle
        ]);
        break;

    case 'login':
        $password = $inputData['password'] ?? '';
        $storedPassword = getConfig('access_password', '');
        if (empty($storedPassword) || $password === $storedPassword) {
            $_SESSION['auth_user'] = true;
            jsonResponse(true, null, '登录成功');
        } else {
            jsonResponse(false, null, '密码错误');
        }
        break;

    case 'logout':
        $_SESSION['auth_user'] = false;
        session_destroy();
        jsonResponse(true, null, '已退出登录');
        break;

    // ---------------- Dashboard 核心指标汇总 ----------------
    case 'dashboard':
        $today = date('Y-m-d');

        // 待报销总额
        $reimbPending = $db->query("SELECT SUM(amount) AS total FROM reimbursements WHERE status != 'done'")->fetch()['total'] ?: 0;
        $reimbTotalDone = $db->query("SELECT SUM(amount) AS total FROM reimbursements WHERE status = 'done'")->fetch()['total'] ?: 0;

        // 续费预警 (< 30 天关注, < 7 天紧急)
        $renewals = $db->query("SELECT * FROM renewals ORDER BY expire_date ASC")->fetchAll();
        $urgentRenewals = [];
        $warningRenewals = [];
        foreach ($renewals as &$r) {
            $days = (int)ceil((strtotime($r['expire_date']) - strtotime($today)) / 86400);
            $r['days_left'] = $days;
            if ($days <= 7) {
                $urgentRenewals[] = $r;
            } elseif ($days <= $r['remind_days']) {
                $warningRenewals[] = $r;
            }
        }

        // 今日任务完成情况
        $todayTasks = $db->query("SELECT * FROM tasks WHERE category = 'daily' ORDER BY status ASC, priority DESC, id DESC")->fetchAll();
        $totalDaily = count($todayTasks);
        $doneDaily = 0;
        foreach ($todayTasks as $t) {
            if ($t['status'] === 'done') $doneDaily++;
        }

        // 项目总数与链接统计
        $projectCount = $db->query("SELECT COUNT(*) AS total FROM projects")->fetch()['total'] ?: 0;
        $linkCount = $db->query("SELECT COUNT(*) AS total FROM project_links")->fetch()['total'] ?: 0;

        jsonResponse(true, [
            'metrics' => [
                'reimb_pending_amount' => (float)$reimbPending,
                'reimb_done_amount' => (float)$reimbTotalDone,
                'urgent_renewals_count' => count($urgentRenewals),
                'warning_renewals_count' => count($warningRenewals),
                'daily_task_total' => $totalDaily,
                'daily_task_done' => $doneDaily,
                'project_count' => (int)$projectCount,
                'link_count' => (int)$linkCount
            ],
            'urgent_renewals' => array_slice($urgentRenewals, 0, 5),
            'today_tasks' => array_slice($todayTasks, 0, 6)
        ]);
        break;

    // ---------------- 公司 / 组织实体管理 (Multi-Entity) ----------------
    case 'get_companies':
        $companies = $db->query("SELECT * FROM companies ORDER BY sort_order ASC, id ASC")->fetchAll();
        $projCountStmt = $db->prepare("SELECT COUNT(*) AS total FROM projects WHERE company_id = ?");
        $reimbStmt = $db->prepare("SELECT SUM(amount) AS total FROM reimbursements WHERE company_id = ? AND status != 'done'");
        foreach ($companies as &$c) {
            $projCountStmt->execute([$c['id']]);
            $c['project_count'] = (int)($projCountStmt->fetch()['total'] ?: 0);

            $reimbStmt->execute([$c['id']]);
            $c['pending_reimb_amount'] = (float)($reimbStmt->fetch()['total'] ?: 0);
        }
        jsonResponse(true, $companies);
        break;

    case 'save_company':
        $id = (int)($inputData['id'] ?? 0);
        $name = trim($inputData['name'] ?? '');
        $shortName = trim($inputData['short_name'] ?? '');
        $taxNumber = trim($inputData['tax_number'] ?? '');
        $bankName = trim($inputData['bank_name'] ?? '');
        $bankAccount = trim($inputData['bank_account'] ?? '');
        $addressPhone = trim($inputData['address_phone'] ?? '');
        $color = trim($inputData['color'] ?? 'blue');
        $remark = trim($inputData['remark'] ?? '');

        if (empty($name)) {
            jsonResponse(false, null, '公司全称不能为空');
        }
        if (empty($shortName)) {
            $shortName = mb_substr($name, 0, 4);
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE companies SET name = ?, short_name = ?, tax_number = ?, bank_name = ?, bank_account = ?, address_phone = ?, color = ?, remark = ? WHERE id = ?");
            $stmt->execute([$name, $shortName, $taxNumber, $bankName, $bankAccount, $addressPhone, $color, $remark, $id]);
        } else {
            $stmt = $db->prepare("INSERT INTO companies (name, short_name, tax_number, bank_name, bank_account, address_phone, color, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $shortName, $taxNumber, $bankName, $bankAccount, $addressPhone, $color, $remark]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '公司主体已保存');
        break;

    case 'delete_company':
        $id = (int)($inputData['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(false, null, '缺少有效公司ID');
        }
        // 解绑关联项目
        $db->prepare("UPDATE projects SET company_id = 0 WHERE company_id = ?")->execute([$id]);
        $db->prepare("DELETE FROM companies WHERE id = ?")->execute([$id]);
        jsonResponse(true, ['id' => $id], '公司主体已删除');
        break;

    // ---------------- 项目与多网站跳板 (带公司关联) ----------------
    case 'get_projects':
        $sql = "SELECT p.*, 
                       c.name AS company_name, 
                       c.short_name AS company_short_name, 
                       c.color AS company_color, 
                       c.tax_number AS company_tax_number, 
                       c.bank_name AS company_bank_name, 
                       c.bank_account AS company_bank_account, 
                       c.address_phone AS company_address_phone
                FROM projects p 
                LEFT JOIN companies c ON p.company_id = c.id 
                ORDER BY p.sort_order ASC, p.id ASC";
        $projects = $db->query($sql)->fetchAll();
        $linksStmt = $db->prepare("SELECT * FROM project_links WHERE project_id = ? ORDER BY sort_order ASC, id ASC");
        foreach ($projects as &$p) {
            $linksStmt->execute([$p['id']]);
            $p['links'] = $linksStmt->fetchAll();

            // 计算 SSL 证书倒计时 (如果配置了 ssl_expire_date)
            if (!empty($p['ssl_expire_date'])) {
                $today = new DateTime(date('Y-m-d'));
                $exp = new DateTime($p['ssl_expire_date']);
                $diff = (int)$today->diff($exp)->format('%r%a');
                $p['ssl_days_left'] = $diff;
                if ($diff < 0) {
                    $p['ssl_status'] = 'expired';
                } elseif ($diff <= 7) {
                    $p['ssl_status'] = 'danger';
                } elseif ($diff <= 30) {
                    $p['ssl_status'] = 'warning';
                } else {
                    $p['ssl_status'] = 'normal';
                }
            } else {
                $p['ssl_days_left'] = null;
                $p['ssl_status'] = 'none';
            }
        }
        jsonResponse(true, $projects);
        break;

    case 'save_project':
        $id = (int)($inputData['id'] ?? 0);
        $companyId = (int)($inputData['company_id'] ?? 0);
        $name = trim($inputData['name'] ?? '');
        $code = trim($inputData['code'] ?? '');
        $desc = trim($inputData['description'] ?? '');
        $category = trim($inputData['category'] ?? '核心官网');
        $readme = trim($inputData['readme'] ?? '');
        $sslExpireDate = trim($inputData['ssl_expire_date'] ?? '');
        $sslExpireDate = empty($sslExpireDate) ? null : $sslExpireDate;

        if (empty($name)) {
            jsonResponse(false, null, '项目名称不能为空');
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE projects SET company_id = ?, name = ?, code = ?, description = ?, category = ?, readme = ?, ssl_expire_date = ? WHERE id = ?");
            $stmt->execute([$companyId, $name, $code, $desc, $category, $readme, $sslExpireDate, $id]);
        } else {
            $sortOrder = (int)($inputData['sort_order'] ?? 0);
            $stmt = $db->prepare("INSERT INTO projects (company_id, name, code, description, category, readme, ssl_expire_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$companyId, $name, $code, $desc, $category, $readme, $sslExpireDate, $sortOrder]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '项目已保存');
        break;

    case 'save_project_readme':
        $id = (int)($inputData['id'] ?? 0);
        $readme = $inputData['readme'] ?? '';
        if ($id <= 0) {
            jsonResponse(false, null, '缺少项目ID');
        }
        $stmt = $db->prepare("UPDATE projects SET readme = ? WHERE id = ?");
        $stmt->execute([$readme, $id]);
        jsonResponse(true, null, '项目说明书已更新保存');
        break;

    case 'delete_project':
        $id = (int)($inputData['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(false, null, '缺少有效项目ID');
        }
        $db->prepare("DELETE FROM project_links WHERE project_id = ?")->execute([$id]);
        $db->prepare("DELETE FROM projects WHERE id = ?")->execute([$id]);
        jsonResponse(true, ['id' => $id], '项目已成功删除');
        break;

    case 'save_link':
        $id = (int)($inputData['id'] ?? 0);
        $projectId = (int)($inputData['project_id'] ?? 0);
        $title = trim($inputData['title'] ?? '');
        $url = trim($inputData['url'] ?? '');
        if (!empty($url) && !preg_match('#^(https?:)?//#i', $url)) {
            $url = 'https://' . $url;
        }

        $type = $inputData['type'] ?? 'site';
        $accountNote = trim($inputData['account_note'] ?? '');

        if (empty($title) || empty($url) || $projectId <= 0) {
            jsonResponse(false, null, '标题和链接为必填项');
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE project_links SET title = ?, url = ?, type = ?, account_note = ? WHERE id = ?");
            $stmt->execute([$title, $url, $type, $accountNote, $id]);
        } else {
            $sortOrder = (int)($inputData['sort_order'] ?? 0);
            $stmt = $db->prepare("INSERT INTO project_links (project_id, title, url, type, account_note, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$projectId, $title, $url, $type, $accountNote, $sortOrder]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '链接已保存');
        break;

    case 'delete_link':
        $id = (int)($inputData['id'] ?? 0);
        if ($id <= 0) {
            jsonResponse(false, null, '缺少有效入口ID');
        }
        $db->prepare("DELETE FROM project_links WHERE id = ?")->execute([$id]);
        jsonResponse(true, ['id' => $id], '直达入口已成功删除');
        break;

    // ---------------- 续费雷达与一键转报销 ----------------
    case 'get_renewals':
        $today = date('Y-m-d');
        $sql = "SELECT r.*, 
                       c.name AS company_name, 
                       c.short_name AS company_short_name, 
                       c.color AS company_color,
                       p.name AS project_name,
                       p.code AS project_code
                FROM renewals r
                LEFT JOIN companies c ON r.company_id = c.id
                LEFT JOIN projects p ON r.project_id = p.id
                ORDER BY r.expire_date ASC";
        $renewals = $db->query($sql)->fetchAll();
        foreach ($renewals as &$r) {
            $days = (int)ceil((strtotime($r['expire_date']) - strtotime($today)) / 86400);
            $r['days_left'] = $days;
            if ($days < 0) {
                $r['status_level'] = 'expired'; // 已过期
            } elseif ($days <= 7) {
                $r['status_level'] = 'danger';  // 极度紧急
            } elseif ($days <= (int)($r['remind_days'] ?: 30)) {
                $r['status_level'] = 'warning'; // 重点关注
            } else {
                $r['status_level'] = 'normal';  // 充裕安全
            }
        }
        jsonResponse(true, $renewals);
        break;

    case 'save_renewal':
        $id = (int)($inputData['id'] ?? 0);
        $companyId = (int)($inputData['company_id'] ?? 0);
        $projectId = (int)($inputData['project_id'] ?? 0);
        $name = trim($inputData['name'] ?? '');
        $category = $inputData['category'] ?? 'domain';
        $provider = trim($inputData['provider'] ?? '');
        $expireDate = trim($inputData['expire_date'] ?? '');
        $renewUrl = trim($inputData['renew_url'] ?? '');
        if (!empty($renewUrl) && !preg_match('#^(https?:)?//#i', $renewUrl)) {
            $renewUrl = 'https://' . $renewUrl;
        }
        $cost = (float)($inputData['cost'] ?? 0);
        $accountNote = trim($inputData['account_note'] ?? '');
        $remindDays = (int)($inputData['remind_days'] ?? 30);

        if (empty($name) || empty($expireDate)) {
            jsonResponse(false, null, '名称和到期日不能为空');
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE renewals SET company_id = ?, project_id = ?, name = ?, category = ?, provider = ?, expire_date = ?, renew_url = ?, cost = ?, account_note = ?, remind_days = ? WHERE id = ?");
            $stmt->execute([$companyId, $projectId, $name, $category, $provider, $expireDate, $renewUrl, $cost, $accountNote, $remindDays, $id]);
        } else {
            $stmt = $db->prepare("INSERT INTO renewals (company_id, project_id, name, category, provider, expire_date, renew_url, cost, account_note, remind_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$companyId, $projectId, $name, $category, $provider, $expireDate, $renewUrl, $cost, $accountNote, $remindDays]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '续费项已保存');
        break;

    case 'delete_renewal':
        $id = (int)($inputData['id'] ?? 0);
        $db->prepare("DELETE FROM renewals WHERE id = ?")->execute([$id]);
        jsonResponse(true, null, '已删除续费项');
        break;

    // 【神级联动】续费后更新到期日，并一键转个人垫付报销
    case 'renew_and_reimburse':
        $renewalId = (int)($inputData['renewal_id'] ?? 0);
        $newExpireDate = trim($inputData['new_expire_date'] ?? '');
        $doReimburse = !empty($inputData['do_reimburse']);
        $amount = (float)($inputData['amount'] ?? 0);
        $payMethod = trim($inputData['pay_method'] ?? '微信支付');
        $remark = trim($inputData['remark'] ?? '');
        $invoiceImg = trim($inputData['invoice_img'] ?? '');

        if ($renewalId <= 0 || empty($newExpireDate)) {
            jsonResponse(false, null, '缺少续费项ID或新到期日期');
        }

        // 更新续费项到期日
        $stmt = $db->prepare("UPDATE renewals SET expire_date = ? WHERE id = ?");
        $stmt->execute([$newExpireDate, $renewalId]);

        // 获取该续费项信息
        $rStmt = $db->prepare("SELECT * FROM renewals WHERE id = ?");
        $rStmt->execute([$renewalId]);
        $renewalItem = $rStmt->fetch();

        // 如果勾选了一键转报销
        if ($doReimburse && $amount > 0) {
            $reimbTitle = "续费垫付: " . ($renewalItem ? $renewalItem['name'] : '资产续费');
            $fullRemark = "续期至: {$newExpireDate}。" . ($remark ? " 备注: {$remark}" : '');
            $companyId = $renewalItem ? (int)($renewalItem['company_id'] ?? 0) : 0;
            $projectId = $renewalItem ? (int)($renewalItem['project_id'] ?? 0) : 0;
            $insReimb = $db->prepare("INSERT INTO reimbursements (title, amount, pay_date, pay_method, status, invoice_img, remark, renewal_id, company_id, project_id) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)");
            $insReimb->execute([$reimbTitle, $amount, date('Y-m-d'), $payMethod, $invoiceImg, $fullRemark, $renewalId, $companyId, $projectId]);
            jsonResponse(true, null, '续期成功，已同步生成一笔待提报的垫资报销单！');
        }

        jsonResponse(true, null, '续期时间已更新');
        break;

    // ---------------- 垫资与报销管家 ----------------
    case 'get_reimbursements':
        $reimbs = $db->query("SELECT * FROM reimbursements ORDER BY pay_date DESC, id DESC")->fetchAll();
        jsonResponse(true, $reimbs);
        break;

    case 'save_reimbursement':
        $id = (int)($inputData['id'] ?? 0);
        $title = trim($inputData['title'] ?? '');
        $amount = (float)($inputData['amount'] ?? 0);
        $payDate = trim($inputData['pay_date'] ?? date('Y-m-d'));
        $payMethod = trim($inputData['pay_method'] ?? '微信支付');
        $status = $inputData['status'] ?? 'pending';
        $invoiceImg = trim($inputData['invoice_img'] ?? '');
        $remark = trim($inputData['remark'] ?? '');

        if (empty($title) || $amount <= 0) {
            jsonResponse(false, null, '事项名称和有效金额为必填');
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE reimbursements SET title = ?, amount = ?, pay_date = ?, pay_method = ?, status = ?, invoice_img = ?, remark = ? WHERE id = ?");
            $stmt->execute([$title, $amount, $payDate, $payMethod, $status, $invoiceImg, $remark, $id]);
        } else {
            $stmt = $db->prepare("INSERT INTO reimbursements (title, amount, pay_date, pay_method, status, invoice_img, remark) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $amount, $payDate, $payMethod, $status, $invoiceImg, $remark]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '报销记录已保存');
        break;

    case 'update_reimbursement_status':
        $id = (int)($inputData['id'] ?? 0);
        $status = $inputData['status'] ?? 'pending';
        $stmt = $db->prepare("UPDATE reimbursements SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        jsonResponse(true, null, '状态已更新');
        break;

    case 'delete_reimbursement':
        $id = (int)($inputData['id'] ?? 0);
        $db->prepare("DELETE FROM reimbursements WHERE id = ?")->execute([$id]);
        jsonResponse(true, null, '报销记录已删除');
        break;

    // ---------------- 凭证与发票文件上传 ----------------
    case 'upload_file':
        if (!isset($_FILES['file'])) {
            jsonResponse(false, null, '未接收到上传文件');
        }
        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(false, null, '上传失败，错误码: ' . $file['error']);
        }
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExts)) {
            jsonResponse(false, null, '仅支持上传图片 (JPG, PNG, WebP) 或 PDF 发票');
        }

        $uploadsDir = __DIR__ . '/uploads';
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }
        $filename = 'inv_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $destPath = $uploadsDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $destPath)) {
            $relativeUrl = 'uploads/' . $filename;
            jsonResponse(true, ['url' => $relativeUrl, 'filename' => $filename], '上传成功');
        } else {
            jsonResponse(false, null, '文件存储失败');
        }
        break;

    // ---------------- 任务与长远事务 ----------------
    case 'get_tasks':
        $category = $_GET['category'] ?? '';
        if ($category) {
            $stmt = $db->prepare("SELECT * FROM tasks WHERE category = ? ORDER BY status ASC, priority DESC, due_date ASC, id DESC");
            $stmt->execute([$category]);
            $tasks = $stmt->fetchAll();
        } else {
            $tasks = $db->query("SELECT * FROM tasks ORDER BY status ASC, priority DESC, due_date ASC, id DESC")->fetchAll();
        }
        jsonResponse(true, $tasks);
        break;

    case 'save_task':
        $id = (int)($inputData['id'] ?? 0);
        $title = trim($inputData['title'] ?? '');
        $category = $inputData['category'] ?? 'daily';
        $priority = $inputData['priority'] ?? 'medium';
        $progress = (int)($inputData['progress'] ?? 0);
        $dueDate = trim($inputData['due_date'] ?? '');
        $note = trim($inputData['note'] ?? '');

        if (empty($title)) {
            jsonResponse(false, null, '任务标题不能为空');
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE tasks SET title = ?, category = ?, priority = ?, progress = ?, due_date = ?, note = ? WHERE id = ?");
            $stmt->execute([$title, $category, $priority, $progress, $dueDate, $note, $id]);
        } else {
            $stmt = $db->prepare("INSERT INTO tasks (title, category, priority, progress, due_date, status, note) VALUES (?, ?, ?, ?, ?, 'todo', ?)");
            $stmt->execute([$title, $category, $priority, $progress, $dueDate, $note]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '任务已保存');
        break;

    case 'toggle_task':
        $id = (int)($inputData['id'] ?? 0);
        $stmt = $db->prepare("SELECT status FROM tasks WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $newStatus = ($row['status'] === 'done') ? 'todo' : 'done';
            $newProgress = ($newStatus === 'done') ? 100 : 0;
            $uStmt = $db->prepare("UPDATE tasks SET status = ?, progress = ? WHERE id = ?");
            $uStmt->execute([$newStatus, $newProgress, $id]);
            jsonResponse(true, ['status' => $newStatus, 'progress' => $newProgress]);
        }
        jsonResponse(false, null, '任务不存在');
        break;

    case 'delete_task':
        $id = (int)($inputData['id'] ?? 0);
        $db->prepare("DELETE FROM tasks WHERE id = ?")->execute([$id]);
        jsonResponse(true, null, '任务已删除');
        break;

    // ---------------- 高频业务快速通道 ----------------
    case 'get_quick_portals':
        $portals = $db->query("SELECT * FROM quick_portals ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse(true, $portals);
        break;

    case 'save_quick_portal':
        $id = (int)($inputData['id'] ?? 0);
        $title = trim($inputData['title'] ?? '');
        $url = trim($inputData['url'] ?? '');
        $icon = trim($inputData['icon'] ?? '⚡');
        $category = trim($inputData['category'] ?? '常用业务');
        $accountNote = trim($inputData['account_note'] ?? '');
        $sortOrder = (int)($inputData['sort_order'] ?? 0);

        if (empty($title) || empty($url)) {
            jsonResponse(false, null, '平台名称和网址链接均为必填项');
        }

        // 规范化 URL 协议
        if (!preg_match('/^(https?:)?\/\//i', $url)) {
            $url = 'https://' . $url;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE quick_portals SET title = ?, url = ?, icon = ?, category = ?, account_note = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([$title, $url, $icon, $category, $accountNote, $sortOrder, $id]);
        } else {
            $stmt = $db->prepare("INSERT INTO quick_portals (title, url, icon, category, account_note, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $url, $icon, $category, $accountNote, $sortOrder]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '快速通道已保存');
        break;

    case 'delete_quick_portal':
        $id = (int)($inputData['id'] ?? 0);
        $db->prepare("DELETE FROM quick_portals WHERE id = ?")->execute([$id]);
        jsonResponse(true, null, '快速通道已成功移除');
        break;

    // ---------------- 知识库文档 ----------------
    case 'get_knowledge':
        $docs = $db->query("SELECT * FROM knowledge_docs ORDER BY sort_order ASC, id DESC")->fetchAll();
        jsonResponse(true, $docs);
        break;

    case 'save_knowledge':
        $id = (int)($inputData['id'] ?? 0);
        $title = trim($inputData['title'] ?? '');
        $category = trim($inputData['category'] ?? '通用备忘');
        $tags = trim($inputData['tags'] ?? '');
        $content = trim($inputData['content'] ?? '');

        if (empty($title)) {
            jsonResponse(false, null, '文档标题不能为空');
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE knowledge_docs SET title = ?, category = ?, tags = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$title, $category, $tags, $content, $id]);
        } else {
            $stmt = $db->prepare("INSERT INTO knowledge_docs (title, category, tags, content) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $category, $tags, $content]);
            $id = $db->lastInsertId();
        }
        jsonResponse(true, ['id' => $id], '知识库文档已保存');
        break;

    case 'delete_knowledge':
        $id = (int)($inputData['id'] ?? 0);
        $db->prepare("DELETE FROM knowledge_docs WHERE id = ?")->execute([$id]);
        jsonResponse(true, null, '文档已删除');
        break;

    // ---------------- 全局配置与偏好 ----------------
    case 'get_config':
        $theme = getConfig('theme', 'notion');
        $appTitle = getConfig('app_title', 'Felix 管理者工作台');
        $aiBaseUrl = getConfig('ai_base_url', 'https://api.deepseek.com');
        $aiModel = getConfig('ai_model', 'deepseek-chat');
        $aiPrompt = getConfig('ai_system_prompt', '');
        $hasKey = !empty(getConfig('ai_api_key', ''));

        jsonResponse(true, [
            'theme' => $theme,
            'app_title' => $appTitle,
            'ai_base_url' => $aiBaseUrl,
            'ai_model' => $aiModel,
            'ai_system_prompt' => $aiPrompt,
            'has_ai_key' => $hasKey,
            'has_password' => !empty(getConfig('access_password', ''))
        ]);
        break;

    case 'save_config':
        if (isset($inputData['theme'])) setConfig('theme', $inputData['theme']);
        if (isset($inputData['app_title'])) setConfig('app_title', trim($inputData['app_title']));
        if (isset($inputData['ai_base_url'])) setConfig('ai_base_url', trim($inputData['ai_base_url']));
        if (isset($inputData['ai_model'])) setConfig('ai_model', trim($inputData['ai_model']));
        if (isset($inputData['ai_system_prompt'])) setConfig('ai_system_prompt', trim($inputData['ai_system_prompt']));
        
        // 密码更新（若传了空字符串且原先有密码，则可选择不更新或清空）
        if (isset($inputData['access_password']) && $inputData['access_password'] !== '') {
            setConfig('access_password', trim($inputData['access_password']));
            $_SESSION['auth_user'] = true;
        }

        // AI Key 更新
        if (isset($inputData['ai_api_key']) && trim($inputData['ai_api_key']) !== '') {
            setConfig('ai_api_key', trim($inputData['ai_api_key']));
        }

        jsonResponse(true, null, '设置已保存');
        break;

    default:
        jsonResponse(false, null, '未知的操作请求');
        break;
}
