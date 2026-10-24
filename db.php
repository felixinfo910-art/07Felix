<?php
// db.php - SQLite 数据库管理与自动迁移

class Database {
    private static $pdo = null;

    public static function getConnection() {
        if (self::$pdo === null) {
            $dbDir = __DIR__ . '/data';
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0755, true);
            }
            $dbPath = $dbDir . '/workspace.db';
            $isNew = !file_exists($dbPath);

            try {
                self::$pdo = new PDO('sqlite:' . $dbPath);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                if ($isNew) {
                    self::initTables();
                    self::seedInitialData();
                } else {
                    self::initTables();
                }
            } catch (PDOException $e) {
                die("数据库连接失败: " . $e->getMessage());
            }
        }
        return self::$pdo;
    }

    private static function initTables() {
        $db = self::$pdo;

        // 系统设置表
        $db->exec("CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT
        )");

        // 公司 / 组织实体表 (Multi-Entity)
        $db->exec("CREATE TABLE IF NOT EXISTS companies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,              -- 公司全称 (开票抬头)
            short_name TEXT NOT NULL,        -- 简称 (如: 德泰外贸, 用于标签)
            tax_number TEXT,                 -- 纳税人识别号/税号
            bank_name TEXT,                  -- 开户银行
            bank_account TEXT,               -- 银行账号
            address_phone TEXT,              -- 开票地址与联系电话
            color TEXT DEFAULT 'blue',       -- 胶囊颜色 (blue, orange, green, purple, red)
            remark TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // 项目与网站矩阵
        $db->exec("CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER DEFAULT 0,    -- 归属公司主体ID
            name TEXT NOT NULL,
            code TEXT,
            description TEXT,
            category TEXT DEFAULT '核心官网',
            readme TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // 增量字段无损迁移
        try { $db->exec("ALTER TABLE projects ADD COLUMN company_id INTEGER DEFAULT 0"); } catch (Exception $e) {}
        try { $db->exec("ALTER TABLE projects ADD COLUMN readme TEXT"); } catch (Exception $e) {}
        try { $db->exec("ALTER TABLE projects ADD COLUMN category TEXT DEFAULT '核心官网'"); } catch (Exception $e) {}
        try { $db->exec("ALTER TABLE reimbursements ADD COLUMN company_id INTEGER DEFAULT 0"); } catch (Exception $e) {}
        try { $db->exec("ALTER TABLE renewals ADD COLUMN company_id INTEGER DEFAULT 0"); } catch (Exception $e) {}

        // 网站项目跳转链接
        $db->exec("CREATE TABLE IF NOT EXISTS project_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            type TEXT DEFAULT 'site', -- site(前台), admin(后台), server(宝塔/服务器), repo(代码), analytics(统计), other(其他)
            account_note TEXT,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )");

        // 资产与到期续费
        $db->exec("CREATE TABLE IF NOT EXISTS renewals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT DEFAULT 'domain', -- domain(域名), server(云服务器), ssl(SSL证书), saas(软件服务), other(其他)
            provider TEXT,                  -- 阿里云, 腾讯云, 华为云, Godaddy 等
            expire_date DATE NOT NULL,
            renew_url TEXT,                 -- 一键直达续费后台链接
            cost REAL DEFAULT 0,            -- 预计/单次续费金额
            account_note TEXT,              -- 购买账号备忘
            remind_days INTEGER DEFAULT 30, -- 提前预警天数
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // 个人垫资与报销管理
        $db->exec("CREATE TABLE IF NOT EXISTS reimbursements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            pay_date DATE NOT NULL,
            pay_method TEXT DEFAULT '微信', -- 微信, 支付宝, 个人信用卡, 银行卡
            status TEXT DEFAULT 'pending',  -- pending(待提报), submitted(已提交审批), done(已到账)
            invoice_img TEXT,               -- 发票/凭证截图路径
            remark TEXT,
            renewal_id INTEGER DEFAULT 0,   -- 关联的续费项ID(若是由续费一键转入)
            project_id INTEGER DEFAULT 0,   -- 关联的项目ID
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // 待办与长远事务
        $db->exec("CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT DEFAULT 'daily',  -- daily(日常待办), milestone(长久项目里程碑)
            priority TEXT DEFAULT 'medium', -- high, medium, low
            progress INTEGER DEFAULT 0,     -- 0-100%
            due_date DATE,
            status TEXT DEFAULT 'todo',     -- todo, done
            note TEXT,
            project_id INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // 个人/公司知识库文档
        $db->exec("CREATE TABLE IF NOT EXISTS knowledge_docs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT DEFAULT '业务SOP',
            tags TEXT,
            content TEXT,
            file_path TEXT,
            sort_order INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )");

        // 自动注入初始示范公司
        try {
            $companyCount = $db->query("SELECT COUNT(*) AS total FROM companies")->fetch()['total'] ?: 0;
            if ($companyCount == 0) {
                $compStmt = $db->prepare("INSERT INTO companies (name, short_name, tax_number, bank_name, bank_account, address_phone, color, remark, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $compStmt->execute([
                    '德泰进出口贸易(深圳)有限公司',
                    '德泰外贸',
                    '91440300MA5EXXXXXX',
                    '招商银行深圳高新园支行',
                    '7559 1234 5678 901',
                    '深圳市南山区高新南道某大厦 0755-88888888',
                    'orange',
                    '主营跨境B2B/B2C独立站业务主体',
                    1
                ]);
                $compStmt->execute([
                    '创思智能网络科技有限公司',
                    '创思科技',
                    '91440300MA5FYYYYYY',
                    '中国工商银行深圳科技园支行',
                    '4000 0230 1920 334',
                    '深圳市福田区深南中路某大厦 0755-66666666',
                    'blue',
                    '主营自研SaaS/CRM与国内技术服务',
                    2
                ]);
            }
        } catch (Exception $e) {}
    }

    private static function seedInitialData() {
        $db = self::$pdo;

        // 初始化默认系统配置
        $configs = [
            'app_title' => 'Felix 管理者个人工作台',
            'theme' => 'notion', // 默认 Notion 质感
            'access_password' => '', // 默认未设置密码，登录时自由开启
            'ai_base_url' => 'https://api.deepseek.com',
            'ai_api_key' => '',
            'ai_model' => 'deepseek-chat',
            'ai_system_prompt' => '你是一位高水准的数字私人秘书与管理智囊，擅长分析管理事务、整理待办、总结周报并基于知识库为管理者提供清晰干练的行动建议。'
        ];
        $stmt = $db->prepare("INSERT INTO system_config (key, value) VALUES (?, ?)");
        foreach ($configs as $k => $v) {
            $stmt->execute([$k, $v]);
        }

        // 示例项目1：核心官网与管理矩阵
        $db->exec("INSERT INTO projects (name, code, description, sort_order) VALUES 
            ('集团品牌主站与业务矩阵', 'GROUP-WEB', '集团核心官网、海外分站及内容管理后台统筹', 1)");
        $pId1 = $db->lastInsertId();

        $linkStmt = $db->prepare("INSERT INTO project_links (project_id, title, url, type, account_note, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
        $linkStmt->execute([$pId1, '官方前台入口', 'https://example.com', 'site', '主站入口', 1]);
        $linkStmt->execute([$pId1, '业务管理后台', 'https://example.com/admin', 'admin', '账号: admin / 动态口令认证', 2]);
        $linkStmt->execute([$pId1, '主站宝塔运维面板', 'http://120.79.xxx.xxx:8888', 'server', '阿里云深圳 4核8G', 3]);
        $linkStmt->execute([$pId1, '百度统计大屏', 'https://tongji.baidu.com', 'analytics', '流量日均 5k PV', 4]);

        // 示例项目2：新业务研发项目
        $db->exec("INSERT INTO projects (name, code, description, sort_order) VALUES 
            ('新客户CRM系统', 'CRM-PRO', '面向销售团队的自研客情管理系统', 2)");
        $pId2 = $db->lastInsertId();
        $linkStmt->execute([$pId2, '测试环境预览', 'https://crm-dev.example.com', 'site', '内网VPN可直连', 1]);
        $linkStmt->execute([$pId2, '代码仓库 (GitLab)', 'https://gitlab.com', 'repo', '分支: main / release', 2]);

        // 示例续费项 (临期预警测试)
        $today = date('Y-m-d');
        $renewStmt = $db->prepare("INSERT INTO renewals (name, category, provider, expire_date, renew_url, cost, account_note, remind_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        // 临期 6 天 (紧急红色)
        $date1 = date('Y-m-d', strtotime('+6 days'));
        $renewStmt->execute(['集团核心顶级域名 (example.com)', 'domain', '阿里云(万网)', $date1, 'https://dc.console.aliyun.com/next/index', 78.00, '账号: aliyun_admin@corp.com', 30]);
        // 临期 25 天 (黄色关注)
        $date2 = date('Y-m-d', strtotime('+25 days'));
        $renewStmt->execute(['生产业务主服务器 (ECS 高性能型)', 'server', '腾讯云', $date2, 'https://console.cloud.tencent.com/cvm', 3200.00, '每月按季度付 / 广州三区', 30]);
        // 充裕 180 天 (绿色)
        $date3 = date('Y-m-d', strtotime('+180 days'));
        $renewStmt->execute(['企业协同办公全员版 (Notion/SaaS)', 'saas', 'Notion 官方', $date3, 'https://www.notion.so/billing', 1420.00, '全员 Workspace 席位', 30]);

        // 示例垫资报销单
        $reimbStmt = $db->prepare("INSERT INTO reimbursements (title, amount, pay_date, pay_method, status, invoice_img, remark) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $reimbStmt->execute(['个人垫付腾讯云安全加速包续费', 680.00, date('Y-m-d', strtotime('-3 days')), '微信支付', 'pending', '', '自掏微信垫付，已开电子发票，待提报']);
        $reimbStmt->execute(['团队跨部门技术研讨工作餐', 432.50, date('Y-m-d', strtotime('-8 days')), '支付宝', 'submitted', '', '已交发票给行政，财务审核中']);
        $reimbStmt->execute(['上季度域名集中续期费用', 312.00, date('Y-m-d', strtotime('-25 days')), '个人信用卡', 'done', '', '财务已打款至招行卡']);

        // 示例任务
        $taskStmt = $db->prepare("INSERT INTO tasks (title, category, priority, progress, due_date, status, note, project_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $taskStmt->execute(['周一核对各站点 SSL 证书有效天数', 'daily', 'high', 0, date('Y-m-d'), 'todo', '重点排查二级分站证书', $pId1]);
        $taskStmt->execute(['将上月垫资发票整理并打印报销审批单', 'daily', 'high', 0, date('Y-m-d'), 'todo', '共计 1,112.5 元', 0]);
        $taskStmt->execute(['主站移动端 UI 体验全面改版优化', 'milestone', 'medium', 65, date('Y-m-d', strtotime('+20 days')), 'todo', '当前进度：UI设计稿完成，前端联调中', $pId1]);
        $taskStmt->execute(['完成公司海外业务架构服务器采购规划', 'milestone', 'medium', 30, date('Y-m-d', strtotime('+45 days')), 'todo', '评估 AWS 与 阿里云国际版网络延迟', 0]);

        // 示例知识库文档
        $kbStmt = $db->prepare("INSERT INTO knowledge_docs (title, category, tags, content) VALUES (?, ?, ?, ?)");
        $kbStmt->execute([
            '公司财务报销标准与发票抬头备忘',
            '财务报销',
            '发票, 报销, 流程',
            "### 公司发票抬头信息\n- **公司全称**：某某信息技术有限公司\n- **统一社会信用代码**：91440300XXXXXXXXXX\n- **开户银行**：招商银行高新园支行\n- **银行账号**：7559 1234 5678 901\n\n### 报销要点\n1. 垫付发票开具后需在 **30日内** 提报。\n2. 服务器与域名发票需开具“信息技术服务”或“软件服务”品类。\n3. 电子发票原件 PDF 随附在审批流中。"
        ]);
        $kbStmt->execute([
            '服务器运维与域名解析排查 SOP',
            '运维管理',
            '服务器, 域名, 应急',
            "### 站点无法访问应急排查步骤\n1. **检查域名状态**：使用 `whois` 确认是否过期停解析；\n2. **Ping 连通性测试**：排查 DNS 解析是否正常指向服务器 IP；\n3. **宝塔面板状态**：查看 Nginx / Apache 是否意外停止；\n4. **SSL 证书有效期**：确认是否因证书过期导致浏览器安全拦截拦截。"
        ]);
    }
}
