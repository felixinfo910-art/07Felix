<?php
require_once __DIR__ . '/config.php';
$appTitle = getConfig('app_title', 'Felix 管理者工作台');
$theme = getConfig('theme', 'notion');
$cssVer = IS_PRODUCTION ? (file_exists(__DIR__ . '/css/app.css') ? filemtime(__DIR__ . '/css/app.css') : '1.0') : time();
$jsVer = IS_PRODUCTION ? (file_exists(__DIR__ . '/js/app.js') ? filemtime(__DIR__ . '/js/app.js') : '1.0') : time();

// 优化：生产环境开启协商缓存头，避免每次刷新重复重新传输 HTML 模板
if (IS_PRODUCTION) {
    header("Cache-Control: private, must-revalidate, max-age=60");
}
?>
<!DOCTYPE html>
<html lang="zh-CN" data-theme="<?php echo htmlspecialchars($theme); ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title><?php echo htmlspecialchars($appTitle); ?></title>
  
  <!-- 性能优化：并行预加载核心 JS 脚本与样式，消灭网络等待空白 -->
  <link rel="preload" href="css/app.css?v=<?php echo $cssVer; ?>" as="style">
  <link rel="preload" href="js/app.js?v=<?php echo $jsVer; ?>" as="script">
  
  <!-- PWA 支持：添加到手机主屏幕即为独立 App -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="管理工作台">
  <!-- 严禁任何搜索引擎爬取、收录、快照与索引 -->
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="googlebot" content="noindex, nofollow, noarchive, nosnippet">
  <meta name="baiduspider" content="noindex, nofollow, noarchive, nosnippet">
  
  <link rel="stylesheet" href="css/app.css?v=<?php echo $cssVer; ?>">
</head>
<body>

<div class="app-container">
  <!-- 侧边栏遮罩 (移动端展开时) -->
  <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="App.toggleSidebar(false)"></div>

  <!-- 左侧固定边栏 -->
  <aside class="app-sidebar" id="appSidebar">
    <!-- 侧边栏顶部品牌信息 -->
    <div class="sidebar-header">
      <div class="brand-section">
        <div class="brand-icon">📁</div>
        <div class="brand-info">
          <div class="brand-title" id="brandTitle"><?php echo htmlspecialchars($appTitle); ?></div>
          <span class="brand-badge">Manager Hub</span>
        </div>
      </div>
      <button class="sidebar-close-btn" onclick="App.toggleSidebar(false)" title="收起菜单" aria-label="收起菜单">✕</button>
    </div>

    <!-- 快捷搜索入口 -->
    <div class="sidebar-search">
      <button class="search-trigger-btn" onclick="App.openSearchModal()" title="快捷键 Ctrl+K">
        <div class="search-trigger-content">
          <span class="search-icon">🔍</span>
          <span class="search-text">搜索直达...</span>
        </div>
        <span class="kbd-shortcut">Ctrl K</span>
      </button>
    </div>

    <!-- 侧边栏导航菜单 -->
    <nav class="sidebar-nav">
      <div class="nav-group-title">工作矩阵</div>
      <button class="nav-tab-btn active" data-tab="dashboard">
        <span class="nav-icon">📊</span><span class="nav-label">总览看板</span>
      </button>
      <button class="nav-tab-btn" data-tab="projects">
        <span class="nav-icon">🚀</span><span class="nav-label">网站项目跳板</span>
      </button>
      <button class="nav-tab-btn" data-tab="renewals">
        <span class="nav-icon">⏰</span><span class="nav-label">资产续费雷达</span>
      </button>
      <button class="nav-tab-btn" data-tab="reimbursements">
        <span class="nav-icon">💳</span><span class="nav-label">垫资报销管家</span>
      </button>
      <button class="nav-tab-btn" data-tab="tasks">
        <span class="nav-icon">📋</span><span class="nav-label">事务与待办</span>
      </button>

      <div class="nav-group-title">知识与主体</div>
      <button class="nav-tab-btn" data-tab="knowledge">
        <span class="nav-icon">🧠</span><span class="nav-label">AI 知识库</span>
      </button>
      <button class="nav-tab-btn" data-tab="companies">
        <span class="nav-icon">🏢</span><span class="nav-label">公司主体</span>
      </button>

      <div class="nav-group-title">偏好与设置</div>
      <button class="nav-tab-btn" data-tab="settings">
        <span class="nav-icon">⚙️</span><span class="nav-label">系统设置</span>
      </button>
    </nav>

    <!-- 侧边栏底部操作区 -->
    <div class="sidebar-footer">
      <div class="theme-picker-wrap">
        <span class="theme-icon">🎨</span>
        <select id="themeSelector" class="form-control theme-select" title="视觉主题切换">
          <option value="notion">📜 Notion 纸面质感</option>
          <option value="linear">⚡ Linear 极客暗黑</option>
          <option value="apple">🍏 Apple 工业冷白</option>
          <option value="business">💼 商务稳健深蓝</option>
        </select>
      </div>
    </div>
  </aside>

  <!-- 右侧主内容区域 -->
  <div class="main-content-layout">
    <!-- 顶部极简工作条 -->
    <header class="top-header">
      <div class="header-left">
        <button class="mobile-toggle-btn" onclick="App.toggleSidebar(true)" title="展开菜单" aria-label="展开菜单">
          <span>☰</span>
        </button>
        <div class="current-page-indicator">
          <span class="page-parent">工作台</span>
          <span class="page-divider">/</span>
          <span class="page-current" id="currentTabTitle">📊 总览看板</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- 桌面端顶部搜索按钮 -->
        <button class="search-trigger-btn search-trigger-top" onclick="App.openSearchModal()" title="快捷键 Ctrl+K">
          <span>🔍 搜索直达</span>
          <span class="kbd-shortcut">Ctrl K</span>
        </button>

        <!-- 当前登录用户与退出按钮 -->
        <div class="user-pill-wrap" style="display:flex;align-items:center;gap:6px">
          <button class="btn btn-sm btn-secondary" onclick="App.switchTab('settings')" title="管理者账号管理" style="font-size:12px;padding:4px 10px">
            <span>👤</span>
            <span id="headerUserDisplayName">Felix</span>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="App.logout()" title="安全退出登录" style="font-size:12px;padding:4px 8px;color:var(--text-muted)">退出</button>
        </div>
      </div>
    </header>

    <!-- 主体工作区 -->
    <main class="main-wrapper">

    <!-- ==================== TAB 1: DASHBOARD 总览 ==================== -->
    <section id="panel-dashboard" class="tab-panel active">
      <!-- 紧急临期预警条 (动态显隐) -->
      <div id="urgentBanner" class="urgent-banner" style="display: none;">
        <div class="urgent-banner-content">
          <span style="font-size:18px">🚨</span>
          <span id="urgentBannerText"><strong>急迫提醒：</strong>有核心资产将在 7 天内到期！</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="App.switchTab('renewals')">立刻查看</button>
      </div>

      <!-- 核心指标卡片 -->
      <div class="kpi-grid">
        <div class="kpi-card" style="border-left: 3px solid var(--tag-orange-text)">
          <div class="kpi-header">
            <span class="kpi-title">个人垫资待报销</span>
            <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-value" id="kpiReimbAmount">￥0.00</div>
          <div class="kpi-footer">自掏腰包待财务回血总额</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--danger-color)">
          <div class="kpi-header">
            <span class="kpi-title">7天内紧急到期</span>
            <span class="kpi-icon">⏰</span>
          </div>
          <div class="kpi-value"><span id="kpiUrgentRenewals">0</span><span class="kpi-unit">个资产</span></div>
          <div class="kpi-footer">域名/服务器/证书防停摆</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--success-color)">
          <div class="kpi-header">
            <span class="kpi-title">今日待办完成度</span>
            <span class="kpi-icon">✅</span>
          </div>
          <div class="kpi-value"><span id="kpiDailyTasks">0 / 0</span></div>
          <div class="kpi-footer">聚焦今日关键推进事项</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--accent-color)">
          <div class="kpi-header">
            <span class="kpi-title">纳管网站矩阵</span>
            <span class="kpi-icon">🌐</span>
          </div>
          <div class="kpi-value" id="kpiProjectCount">0 项目</div>
          <div class="kpi-footer">前台/后台/宝塔全景直达</div>
        </div>
      </div>

      <!-- 下方双列面板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <!-- 待续费资产速查 -->
        <div class="kpi-card">
          <div class="section-header" style="margin-bottom: 12px;">
            <div class="section-title-wrap">
              <span>🚨</span>
              <span class="section-title" style="font-size: 15px;">近期急迫到期资产</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.switchTab('renewals')">全部资产</button>
          </div>
          <div id="dashUrgentList">
            <div style="color:var(--text-muted);font-size:13px;padding:8px 0;">加载中...</div>
          </div>
        </div>

        <!-- 今日待办事项 -->
        <div class="kpi-card">
          <div class="section-header" style="margin-bottom: 12px;">
            <div class="section-title-wrap">
              <span>📝</span>
              <span class="section-title" style="font-size: 15px;">今日行动清单</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.openAddTaskModal('daily')">记待办</button>
          </div>
          <div id="dashTodayTasks">
            <div style="color:var(--text-muted);font-size:13px;padding:8px 0;">加载中...</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== TAB 2: PROJECTS 网站项目大框架与通道 ==================== -->
    <section id="panel-projects" class="tab-panel">
      <!-- 第一层：全局大框架 (项目矩阵列表) -->
      <div id="projectsOverviewView">
        <div class="section-header">
          <div>
            <div class="section-title">网站项目总控矩阵</div>
            <div class="section-subtitle">高密度管理全量网站通道，点击任意项目进入专属工作间与自写说明书</div>
          </div>
          <button class="btn btn-primary" onclick="App.openAddProjectModal()">新增项目</button>
        </div>

        <!-- 顶部过滤与搜索条 -->
        <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:16px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
          <!-- 分类标签过滤器 -->
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <div id="projectCategoryFilter" style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-sm btn-primary proj-filter-btn" data-cat="all" onclick="App.filterProjectsByCategory('all')">全部 (<span id="catCountAll">0</span>)</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="核心官网" onclick="App.filterProjectsByCategory('核心官网')">核心官网</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="自研系统" onclick="App.filterProjectsByCategory('自研系统')">自研系统</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="外贸独立站" onclick="App.filterProjectsByCategory('外贸独立站')">外贸独立站</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="服务器运维" onclick="App.filterProjectsByCategory('服务器运维')">服务器运维</button>
            </div>

            <!-- 按公司主体筛选 -->
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:12px;color:var(--text-muted)">🏢 公司:</span>
              <select id="projectCompanyFilterSelect" class="form-control" style="width:auto;padding:3px 8px;font-size:12px" onchange="App.filterProjectsByCompany(this.value)">
                <option value="all">全部公司主体</option>
              </select>
            </div>
          </div>

          <!-- 快速搜索过滤框 -->
          <div style="display:flex;align-items:center;gap:6px;min-width:240px">
            <span style="font-size:13px;color:var(--text-muted)">🔍</span>
            <input type="text" id="projectSearchInput" class="form-control" placeholder="按名称/代号/主域名快速筛选..." style="padding:4px 8px;font-size:12.5px" oninput="App.filterProjectsByQuery(this.value)">
          </div>
        </div>

        <!-- 高密度项目列表容器 -->
        <div class="notion-table-container">
          <table class="notion-table">
            <thead>
              <tr>
                <th style="width:23%">项目 / 站点名称</th>
                <th style="width:12%">所属公司</th>
                <th style="width:10%">业务分类</th>
                <th style="width:20%">主访问网址 (前台/后台)</th>
                <th style="width:12%">SSL 证书到期</th>
                <th style="width:8%">直达入口</th>
                <th style="width:7%">说明书</th>
                <th style="min-width:140px;text-align:right">操作</th>
              </tr>
            </thead>
            <tbody id="projectsTableBody">
              <tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 第二层：单项目专属工作通道 (Project Channel) -->
      <div id="projectChannelView" style="display:none">
        <!-- 顶部返回与项目标题栏 -->
        <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;box-shadow:var(--shadow-notion);flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <button class="btn btn-sm btn-secondary" onclick="App.backToProjectsOverview()">返回项目列表</button>
            <div style="font-size:14px;color:var(--text-muted)">/</div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span id="channelProjectName" style="font-size:18px;font-weight:700"></span>
                <span id="channelProjectCompany" class="badge-status" style="display:none"></span>
                <span id="channelProjectCategory" class="badge-status normal"></span>
                <span id="channelProjectSsl" class="badge-status" style="display:none"></span>
                <code id="channelProjectCode" style="font-size:11px"></code>
              </div>
              <div id="channelProjectDesc" style="font-size:12.5px;color:var(--text-secondary);margin-top:2px"></div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button id="btnCopyCompanyInvoice" class="btn btn-sm btn-secondary" style="display:none" onclick="App.copyCurrentProjectCompanyInvoice()" title="一键复制开票抬头、税号及银行账户">复制开票信息</button>
            <button class="btn btn-sm btn-secondary" onclick="App.openAddLinkModal(App.state.currentChannelProjectId)">添加入口</button>
            <button class="btn btn-sm btn-secondary" onclick="App.openEditProjectModal(App.state.currentChannelProjectId)">项目设置</button>
          </div>
        </div>

        <!-- 通道核心 1：快捷直达站台 Launchpad -->
        <div class="kpi-card" style="margin-bottom:18px">
          <div style="font-weight:600;font-size:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:6px">
              <span>🚀</span><span>直达跳转站台 (Launchpad)</span>
            </div>
            <span style="font-size:12px;color:var(--text-muted)">点击在新标签页直达，点击 ✎ 修改写错的网址</span>
          </div>
          <div id="channelLinksWrap" class="project-links-wrap" style="margin:6px 0"></div>
        </div>

        <!-- 通道核心 2：项目专属说明书 / 运维手册 (Project Readme) -->
        <div class="kpi-card" style="margin-bottom:18px;border-top:3px solid var(--accent-color)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border-light)">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px">📖</span>
              <span style="font-weight:600;font-size:15px">项目专属说明书 / 运维交付手册</span>
              <span style="font-size:11.5px;color:var(--text-muted)">记录技术栈、部署步骤、特殊注意事项与交接指南</span>
            </div>
            <div style="display:flex;gap:8px">
              <button id="btnTplReadme" class="btn btn-sm btn-secondary" style="display:none" onclick="App.applyReadmeTemplate()">套用规范模版</button>
              <button id="btnToggleEditReadme" class="btn btn-sm btn-primary" onclick="App.toggleEditChannelReadme()">编辑说明书</button>
            </div>
          </div>

          <!-- 说明书查看视图 -->
          <div id="channelReadmeView" style="min-height:120px;font-size:13.5px;line-height:1.7;color:var(--text-main);white-space:pre-wrap;background:var(--bg-subtle);padding:16px;border-radius:var(--radius-sm)"></div>

          <!-- 说明书编辑视图 (默认隐藏) -->
          <div id="channelReadmeEditWrap" style="display:none;flex-direction:column;gap:10px">
            <textarea id="channelReadmeTextarea" class="form-control" rows="12" style="font-family:monospace;font-size:13px;line-height:1.6" placeholder="在此编写该网站项目的专属说明书...
例如：
### 1. 业务概述与系统架构
- 网站类型：WordPress 外贸展示站 / 自研 CRM
- 服务器环境：PHP 7.4 + MySQL 5.7 (宝塔)
- 源码分支：git@gitlab.com:... (main 分支)

### 2. 核心运维与发布注意
- 发布新版本时必须手动重启 Redis 容器并清理缓存
- 上传目录已软链至共享存储 /data/uploads

### 3. 账号与权限规则
- 生产后台开启了 Google 动态二次验证 (2FA)
- 数据库端口仅开放给内部 VPN IP 访问"></textarea>
            <div style="display:flex;justify-content:flex-end;gap:8px">
              <button class="btn btn-secondary" onclick="App.cancelEditChannelReadme()">取消</button>
              <button class="btn btn-primary" onclick="App.saveChannelReadme()">保存说明书</button>
            </div>
          </div>
        </div>

        <!-- 通道核心 3：该项目绑定的到期资产与生命周期 -->
        <div class="kpi-card">
          <div style="font-weight:600;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <span>⏰</span><span>关联资产与续费生命周期</span>
          </div>
          <div id="channelRenewalsList"></div>
        </div>
      </div>
    </section>

    <!-- ==================== TAB 3: RENEWALS 资产续费雷达 ==================== -->
    <section id="panel-renewals" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">资产与到期续费雷达 (Renewal Radar)</div>
          <div class="section-subtitle">域名、云服务器、SSL证书、SaaS订阅全生命周期监控；官网控制台一键直达，到期预警与资产台账统筹管理</div>
        </div>
        <button class="btn btn-primary" onclick="App.openAddRenewalModal()">新增资产</button>
      </div>

      <!-- 移动端专属纯净统计条 (替代臃肿的4色大盘栅格) -->
      <div id="renewalsMobileSummary" class="renewals-mobile-summary" style="display:none">
        <span>全部资产 (<span id="renewalsMobileTotalCount">0</span>)</span>
        <span id="renewalsMobileUrgentNotice"></span>
      </div>

      <!-- 核心雷达指标看板 KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 18px;">
        <div class="kpi-card" style="border-left: 3px solid var(--danger-color); cursor: pointer;" onclick="App.filterRenewalsByStatus('danger')" title="点击筛选7天内紧急资产">
          <div class="kpi-header">
            <span class="kpi-title">7天内紧急临期</span>
            <span class="kpi-icon">🚨</span>
          </div>
          <div class="kpi-value"><span id="radarUrgentCount">0</span><span class="kpi-unit">个资产</span></div>
          <div class="kpi-footer">面临断服/赎回风险，需即刻处理</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--tag-orange-text); cursor: pointer;" onclick="App.filterRenewalsByStatus('warning')" title="点击筛选30天内预警资产">
          <div class="kpi-header">
            <span class="kpi-title">30天内预警</span>
            <span class="kpi-icon">⚠️</span>
          </div>
          <div class="kpi-value"><span id="radarWarningCount">0</span><span class="kpi-unit">个资产</span></div>
          <div class="kpi-footer">建议本月提上日程安排续约</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--accent-color); cursor: pointer;" onclick="App.filterRenewalsByStatus('all')" title="点击查看纳管全量资产">
          <div class="kpi-header">
            <span class="kpi-title">纳管资产总项</span>
            <span class="kpi-icon">🌐</span>
          </div>
          <div class="kpi-value"><span id="radarTotalCount">0</span><span class="kpi-unit">项资产</span></div>
          <div class="kpi-footer">域名/服务器/证书/SaaS全量</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--success-color)">
          <div class="kpi-header">
            <span class="kpi-title">预估年化续费预算</span>
            <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-value"><span id="radarTotalCost">￥0.00</span></div>
          <div class="kpi-footer">纳管资产周期性年支出总计</div>
        </div>
      </div>

      <!-- 顶部多维筛选与搜索工具条 (移动端隐藏，免除筛选展示全部) -->
      <div id="renewalFilterToolbar" style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:16px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <!-- 分类药丸按钮组 -->
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <div id="renewalCategoryFilter" style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-sm btn-primary renewal-cat-btn" data-cat="all" onclick="App.filterRenewalsByCategory('all')">全部 (<span id="radarCatCountAll">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="domain" onclick="App.filterRenewalsByCategory('domain')">域名 (<span id="radarCatCountDomain">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="server" onclick="App.filterRenewalsByCategory('server')">云服务器 (<span id="radarCatCountServer">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="ssl" onclick="App.filterRenewalsByCategory('ssl')">SSL证书 (<span id="radarCatCountSsl">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="saas" onclick="App.filterRenewalsByCategory('saas')">软件订阅 (<span id="radarCatCountSaas">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="other" onclick="App.filterRenewalsByCategory('other')">其他 (<span id="radarCatCountOther">0</span>)</button>
          </div>

          <!-- 紧急度状态筛选下拉 -->
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:12px;color:var(--text-muted)">⚡ 紧急度:</span>
            <select id="renewalStatusFilterSelect" class="form-control" style="width:auto;padding:3px 8px;font-size:12px" onchange="App.filterRenewalsByStatus(this.value)">
              <option value="all">全部生命周期</option>
              <option value="danger">🚨 7天内紧急</option>
              <option value="warning">⚠️ 30天内预警</option>
              <option value="normal">🟢 充裕正常</option>
              <option value="expired">⚫ 已逾期</option>
            </select>
          </div>

          <!-- 按公司主体筛选下拉 -->
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:12px;color:var(--text-muted)">🏢 归属主体:</span>
            <select id="renewalCompanyFilterSelect" class="form-control" style="width:auto;padding:3px 8px;font-size:12px" onchange="App.filterRenewalsByCompany(this.value)">
              <option value="all">全部公司主体</option>
            </select>
          </div>
        </div>

        <!-- 实时快速搜索框 -->
        <div style="display:flex;align-items:center;gap:6px;min-width:240px">
          <span style="font-size:13px;color:var(--text-muted)">🔍</span>
          <input type="text" id="renewalSearchInput" class="form-control" placeholder="按资产名称/服务商/账号备忘筛选..." style="padding:4px 8px;font-size:12.5px" oninput="App.filterRenewalsByQuery(this.value)">
        </div>
      </div>

      <!-- 高密度资产表格 (桌面端) -->
      <div class="notion-table-container">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width:20%">资产 / 域名名称</th>
              <th style="width:14%">归属主体 / 关联项目</th>
              <th style="width:9%">类型分类</th>
              <th style="width:10%">注册 / 托管商</th>
              <th style="width:11%">到期日期</th>
              <th style="width:12%">生命周期雷达</th>
              <th style="width:8%">续费预估</th>
              <th style="min-width:260px;text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="renewalsTableBody">
            <tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 移动端专属高密度轻量卡片流 (手机端以查看速览为主，操作精简，安全防误触) -->
      <div id="renewalsCardsMobile" class="renewals-cards-mobile">
        <div style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</div>
      </div>
    </section>

    <!-- ==================== TAB 4: REIMBURSEMENTS 垫资报销管家 ==================== -->
    <section id="panel-reimbursements" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">个人垫资与发票报销管家</div>
          <div class="section-subtitle">手机随手拍照上传发票/扣费凭证，状态全程流转跟踪，告别自掏腰包漏报销</div>
        </div>
        <button class="btn btn-primary" onclick="App.openAddReimbModal()">记一笔垫资</button>
      </div>
      <div id="reimbContainer" class="reimb-cards-grid"></div>
    </section>

    <!-- ==================== TAB 5: TASKS 事务统筹 ==================== -->
    <section id="panel-tasks" class="tab-panel">
      <!-- 极简高频业务直达 -->
      <div class="quick-portals-bar">
        <div class="quick-portals-bar-head">
          <div class="quick-portals-bar-title">
            <span>⚡</span>
            <span>常用直达</span>
          </div>
          <div class="quick-portals-bar-actions">
            <div id="portalCategoryFilter" class="portal-filter-bar"></div>
            <button class="btn btn-sm btn-secondary" onclick="App.openManagePortalsModal()" style="font-size:12px;padding:3px 8px" title="批量设置与修改常用直达通道">⚙️ 管理直达</button>
            <button class="btn btn-sm btn-primary" onclick="App.openAddPortalModal()" style="font-size:12px;padding:3px 8px">+ 添加</button>
          </div>
        </div>
        <div id="quickPortalsGrid" class="quick-portals-chips">
          <div style="color:var(--text-muted);font-size:12px;padding:8px 0;">加载中...</div>
        </div>
      </div>

      <div class="section-header" style="margin-top:24px">
        <div>
          <div class="section-title">事务与长远任务统筹</div>
          <div class="section-subtitle">兼顾今日日常琐事（勾选归档）与跨周期战略项目（百分比进度推进）</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" onclick="App.openAddTaskModal('daily')">记待办</button>
          <button class="btn btn-primary" onclick="App.openAddTaskModal('milestone')">新建里程碑</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <div class="kpi-card">
          <div style="font-weight:600;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">
            <span>📝</span><span>今日日常任务</span>
          </div>
          <div id="tasksDailyList"></div>
        </div>

        <div class="kpi-card">
          <div style="font-weight:600;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">
            <span>🎯</span><span>长期项目与跨期里程碑</span>
          </div>
          <div id="tasksMilestoneList"></div>
        </div>
      </div>
    </section>

    <!-- ==================== TAB 6: KNOWLEDGE AI 知识库与智能幕僚 ==================== -->
    <section id="panel-knowledge" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">个人知识库与 AI 智能幕僚</div>
          <div class="section-subtitle">沉淀公司规章、业务 SOP、技术运维要点；支持 AI 智能问答、一键拆解杂乱想法、自动起草管理周报</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" onclick="App.sendAiMessage('parse_task')">AI 拆解任务</button>
          <button class="btn btn-secondary" onclick="App.sendAiMessage('weekly_report')">生成管理周报</button>
        </div>
      </div>

      <div class="kb-layout">
        <!-- 左侧文档列表 -->
        <div class="kb-sidebar">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span style="font-weight:600;font-size:13px">知识文档分类</span>
            <button class="btn btn-sm btn-secondary" onclick="App.resetKbForm()">写文档</button>
          </div>
          <div id="kbDocsList" style="flex:1;overflow-y:auto"></div>
        </div>

        <!-- 右侧：上部知识编辑 / 下部 AI 对话 -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- 文档详情/编辑卡片 -->
          <div class="kpi-card" style="padding:16px">
            <input type="hidden" id="kbEditId">
            <div style="display:flex;gap:10px;margin-bottom:10px">
              <input type="text" id="kbEditTitle" class="form-control" placeholder="文档标题 (如: 域名备案与续费规范)" style="flex:2">
              <input type="text" id="kbEditCategory" class="form-control" placeholder="分类 (如: 运维管理)" style="flex:1">
              <input type="text" id="kbEditTags" class="form-control" placeholder="标签 (逗号分隔)" style="flex:1">
              <button class="btn btn-primary" onclick="App.saveKbDoc()">保存文档</button>
            </div>
            <textarea id="kbEditContent" class="form-control" rows="5" placeholder="在此沉淀你的工作经验、SOP规范、账号规则、合同备忘等... AI 回答时将自动参考此背景知识"></textarea>
          </div>

          <!-- AI 智能问答交互窗 -->
          <div class="ai-chat-box" style="height:380px">
            <div style="padding:10px 16px;background:var(--bg-subtle);border-bottom:1px solid var(--border-light);font-size:12.5px;font-weight:600;display:flex;justify-content:space-between">
              <span>🤖 24小时私人管理幕僚 (基于你的知识库深度协同)</span>
              <span style="font-size:11px;color:var(--text-muted)">兼容 DeepSeek / Kimi / OpenAI</span>
            </div>
            <div id="aiMessagesList" class="ai-messages-list">
              <div class="chat-bubble ai">您好！我是您的私人管理智囊。我已经接入了您的个人工作台知识库背景，您可以随时向我咨询业务 SOP、公司制度，或者输入一段凌乱的想法让我为您拆解成任务清单！</div>
            </div>
            <div class="ai-input-area">
              <textarea id="aiPromptInput" class="ai-textarea" rows="2" placeholder="在此输入问题，或粘贴一段会议速记/杂乱事务让 AI 处理 (Enter发送)..."></textarea>
              <button class="btn btn-primary" onclick="App.sendAiMessage('chat')">发送咨询</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== TAB: COMPANIES 公司主体管理 ==================== -->
    <section id="panel-companies" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">公司主体与实体统筹</div>
          <div class="section-subtitle">维护各公司主体执照信息、开票抬头、税号与对公账户；网站、资产与垫资报销按公司归类统筹</div>
        </div>
        <button class="btn btn-primary" onclick="App.openAddCompanyModal()">新增公司主体</button>
      </div>

      <div class="notion-table-container">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width:14%">主体简称 / 标识</th>
              <th style="width:24%">公司法定全称 (开票抬头)</th>
              <th style="width:18%">纳税人识别号 (税号)</th>
              <th style="width:20%">开户银行及账号</th>
              <th style="width:12%">统筹纳管统计</th>
              <th style="min-width:140px;text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="companiesTableBody">
            <tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ==================== TAB 7: SETTINGS 系统设置 ==================== -->
    <section id="panel-settings" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">系统与参数设置</div>
          <div class="section-subtitle">配置线上访问密码锁、AI 大模型 API Key 与工作台名称</div>
        </div>
        <button class="btn btn-primary" onclick="App.saveConfigSettings()">保存配置</button>
      </div>

      <div class="kpi-card" style="max-width:720px">
        <div class="form-group">
          <label class="form-label">工作台展示名称</label>
          <input type="text" id="cfgAppTitle" class="form-control">
        </div>

        <!-- 管理者账号管理 -->
        <div style="margin:16px 0 20px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div>
              <div style="font-weight:600;font-size:14px;color:var(--text-main)">👤 管理者账号管理</div>
              <div style="font-size:12px;color:var(--text-muted)">统一管理管理者与协同账号，支持修改账号密码</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.openAddUserModal()">+ 新增账号</button>
          </div>

          <div class="notion-table-container" style="margin-bottom:0">
            <table class="notion-table">
              <thead>
                <tr>
                  <th style="width:28%">登录账号 (用户名)</th>
                  <th style="width:28%">展示昵称</th>
                  <th style="width:26%">上次登录</th>
                  <th style="text-align:right">操作</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                <tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-muted)">加载中...</td></tr>
              </tbody>
            </table>
          </div>
        </div>



        <div style="font-weight:600;font-size:14px;margin-bottom:12px">🤖 AI 大模型服务配置</div>

        <div class="form-group">
          <label class="form-label">API 接口地址 (Base URL)</label>
          <input type="text" id="cfgAiBaseUrl" class="form-control" placeholder="如 https://api.deepseek.com 或 https://api.moonshot.cn/v1">
        </div>

        <div class="form-group">
          <label class="form-label">模型名称 (Model)</label>
          <input type="text" id="cfgAiModel" class="form-control" placeholder="如 deepseek-chat, moonshot-v1-8k, gpt-4o">
        </div>

        <div class="form-group">
          <label class="form-label">API Key 密匙 (<span id="cfgAiKeyStatus">检查中...</span>)</label>
          <input type="password" id="cfgAiKey" class="form-control" placeholder="填入以 sk- 开头的 API Key (安全保存在服务器本地 SQLite)">
        </div>

        <div class="form-group">
          <label class="form-label">AI 幕僚系统人设提示词 (System Prompt)</label>
          <textarea id="cfgAiPrompt" class="form-control" rows="3"></textarea>
        </div>

        <hr style="margin:20px 0;border:none;border-top:1px solid var(--border-light)">

        <div style="font-weight:600;font-size:14px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">
            <span>🖥️</span><span>运行环境与宝塔部署</span>
          </div>
          <span class="badge-status <?php echo IS_PRODUCTION ? 'normal' : 'warning'; ?>">
            <?php echo IS_PRODUCTION ? '🟢 线上生产模式' : '🟡 本地开发模式'; ?>
          </span>
        </div>

        <div style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:12px 14px;font-size:12.5px;line-height:1.6;color:var(--text-secondary);margin-bottom:14px">
          <div>• <strong>宝塔项目根路径</strong>：<code>/www/wwwroot/07Felix</code></div>
          <div>• <strong>当前运行模式</strong>：<code><?php echo htmlspecialchars(APP_ENV); ?></code> (可在根目录 <code>.env</code> 中指定 <code>APP_ENV=production</code> 或 <code>local</code>)</div>
          <div>• <strong>数据库引擎</strong>：SQLite 3 (WAL 极速并发读写已就绪，版本: <?php echo Database::SCHEMA_VERSION; ?>)</div>
          <div>• <strong>一键热更新命令</strong>：宝塔终端进入 <code>cd /www/wwwroot/07Felix && bash update.sh</code> 即可平滑升级</div>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label" style="display:flex;justify-content:space-between">
            <span>宝塔 Nginx 关键安全防护规则 (在宝塔面板-网站设置-配置文件中添加)</span>
            <span style="font-size:11px;color:var(--text-muted)">防数据库被外部恶意下载</span>
          </label>
          <pre style="background:var(--bg-page);border:1px solid var(--border-light);padding:10px 12px;border-radius:var(--radius-sm);font-size:11.5px;color:var(--text-main);overflow-x:auto;user-select:all;margin:0">location ~ ^/(data|uploads/.*\.php|\.git|\.env|.*\.sh|.*\.bat) {
    deny all;
    return 404;
}</pre>
        </div>
      </div>
    </section>

  </main>

  <!-- 手机端专属底部固定导航栏 -->
  <nav class="mobile-tab-bar">
    <div class="mobile-tab-item active" data-tab="dashboard">
      <span class="mobile-tab-icon">📊</span>
      <span>总览</span>
    </div>
    <div class="mobile-tab-item" data-tab="projects">
      <span class="mobile-tab-icon">🚀</span>
      <span>跳板</span>
    </div>
    <div class="mobile-tab-item" data-tab="renewals">
      <span class="mobile-tab-icon">⏰</span>
      <span>续费</span>
    </div>
    <div class="mobile-tab-item" data-tab="reimbursements">
      <span class="mobile-tab-icon">💳</span>
      <span>报销</span>
    </div>
    <div class="mobile-tab-item" data-tab="knowledge">
      <span class="mobile-tab-icon">🧠</span>
      <span>AI/知识</span>
    </div>
  </nav>
  </div>
</div>

<!-- ==================== 模态弹窗库 ==================== -->

<!-- 1. 全局快捷搜索 Command Palette (Ctrl+K) -->
<div id="searchModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeSearchModal()">
  <div class="modal-dialog">
    <div style="padding:14px 18px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:10px">
      <span style="font-size:16px">🔍</span>
      <input type="text" id="searchBoxInput" class="form-control" placeholder="输入关键字快速跳转任何网站后台、续费项、知识库..." style="border:none;background:transparent;font-size:15px" oninput="App.renderSearchResults(this.value)">
      <span class="kbd-shortcut">ESC</span>
    </div>
    <div id="searchResultsList" style="max-height:380px;overflow-y:auto;padding:8px"></div>
  </div>
</div>

<!-- 2. 新增/编辑项目弹窗 -->
<div id="projectModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="projModalTitleText">网站项目维护</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="projModalId">
      <div class="form-group">
        <label class="form-label">项目名称</label>
        <input type="text" id="projModalName" class="form-control" placeholder="如：品牌核心官网与分站矩阵">
      </div>
      <div class="form-group">
        <label class="form-label">业务代号 (Code)</label>
        <input type="text" id="projModalCode" class="form-control" placeholder="如：WEB-MAIN">
      </div>
      <div class="form-group">
        <label class="form-label">所属公司主体 (用于多实体资产开票与发票归集)</label>
        <select id="projModalCompanyId" class="form-control">
          <option value="0">-- 暂不归属特定公司 (公共/通用) --</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">业务分组/分类</label>
        <select id="projModalCategory" class="form-control">
          <option value="核心官网">🌐 核心官网与品牌矩阵</option>
          <option value="自研系统">⚙️ 自研业务系统/后台</option>
          <option value="外贸独立站">📦 外贸独立站/海外商城</option>
          <option value="服务器运维">🖥️ 云主机与运维设施</option>
          <option value="综合项目">📁 综合业务/其他</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">项目概要与说明</label>
        <textarea id="projModalDesc" class="form-control" rows="2" placeholder="简述该项目的主要职能与服务对象"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
          <span>🔒 SSL 证书到期时间 (可选)</span>
          <span style="font-size:11px;color:var(--text-muted);font-weight:normal">手写/选择到期日后自动倒计时，留空则不监控</span>
        </label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="date" id="projModalSslDate" class="form-control">
          <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('projModalSslDate').value=''" title="清空并关闭此项倒计时">清空</button>
        </div>
      </div>

      <!-- 网站设置内的入口列表管理区 (支持直接编辑和删除写错的入口) -->
      <div id="projModalLinksSection" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <label class="form-label" style="font-weight:600;margin-bottom:0">已纳管的直达入口 (<span id="projModalLinksCount">0</span> 个)</label>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.openAddLinkModal(document.getElementById('projModalId').value)">添加入口</button>
        </div>
        <div id="projModalLinksList" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto"></div>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="projModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteProject()">删除此项目</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveProject()">保存项目</button>
      </div>
    </div>
  </div>
</div>

<!-- 4. 添加入口链接弹窗 -->
<div id="linkModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="linkModalTitleText">添加直达跳转入口</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="linkModalId">
      <input type="hidden" id="linkModalProjectId">
      <div class="form-group">
        <label class="form-label">入口名称</label>
        <input type="text" id="linkModalTitle" class="form-control" placeholder="如：管理后台 / 宝塔面板 / 生产服务器">
      </div>
      <div class="form-group">
        <label class="form-label">直达跳转网址 (URL)</label>
        <input type="url" id="linkModalUrl" class="form-control" placeholder="https://...">
      </div>
      <div class="form-group">
        <label class="form-label">类型分类 (不同分类有专属配色高亮)</label>
        <select id="linkModalType" class="form-control">
          <option value="admin">⚙️ 业务后台 (Admin)</option>
          <option value="site">🌐 前台页面 (Website)</option>
          <option value="server">🖥️ 服务器/宝塔 (Server)</option>
          <option value="repo">📦 代码仓库 (Git)</option>
          <option value="analytics">📊 流量与统计 (Analytics)</option>
          <option value="other">🔗 其他快捷链接</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">关联账号备忘 (鼠标悬停即见，防止遗忘)</label>
        <input type="text" id="linkModalNote" class="form-control" placeholder="如：admin / 密码见密码本">
      </div>

      <!-- 凭据安全配置区域 (可选) -->
      <div class="credential-box" style="margin-top:14px;padding:12px;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;font-weight:600;color:var(--text-main);display:flex;align-items:center;gap:5px">
            🔑 登录凭据配置 <span style="font-size:11px;font-weight:normal;color:var(--text-muted)">(可选 · AES-256-GCM 加密存储)</span>
          </span>
          <span id="linkModalPassStatusBadge" class="badge" style="display:none;background:rgba(46,160,67,0.15);color:var(--success-color);font-size:10px">已存密保</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录账号 (选填)</label>
            <input type="text" id="linkModalLoginAccount" class="form-control" placeholder="用户名/邮箱/手机" style="font-size:12px">
          </div>
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录密码 (选填)</label>
            <div style="position:relative">
              <input type="password" id="linkModalLoginPassword" class="form-control" placeholder="留空则不修改" style="font-size:12px;padding-right:30px">
              <span onclick="App.togglePasswordVisibility('linkModalLoginPassword')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:13px;opacity:0.6" title="显示/隐藏">👁️</span>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:11px">自动跳板策略</label>
            <select id="linkModalAutoLoginType" class="form-control" style="font-size:12px" onchange="App.handleAutoLoginTypeChange(this, 'linkModalPostTargetGroup')">
              <option value="copy_and_jump">🚀 一键直达 + 剪贴板安全速填 (推荐)</option>
              <option value="post_submit">⚡ 内部系统自动 POST 免密登录</option>
              <option value="none">🔒 仅加密备忘 (不自动填充)</option>
            </select>
          </div>
          <div style="padding-top:16px">
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 8px" onclick="App.generateRandomPassword('linkModalLoginPassword')" title="生成高强度随机密码">🎲 随机强密码</button>
          </div>
        </div>
        <div id="linkModalPostTargetGroup" class="form-group" style="display:none;margin-top:8px;margin-bottom:0">
          <label class="form-label" style="font-size:11px">自动 POST 提交地址 (若不填则默认提交到上方跳转网址)</label>
          <input type="text" id="linkModalPostTargetUrl" class="form-control" placeholder="如: https://example.com/api/login" style="font-size:12px">
        </div>
        <div id="linkModalClearPassWrap" style="display:none;margin-top:6px;text-align:right">
          <label style="font-size:11px;color:var(--danger-color);cursor:pointer;display:inline-flex;align-items:center;gap:4px">
            <input type="checkbox" id="linkModalClearPass"> 清除并移除已保存的加密密码
          </label>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="linkModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteLink()">删除此入口</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveLink()">保存入口</button>
      </div>
    </div>
  </div>
</div>

<!-- 5. 记一笔垫资弹窗 -->
<div id="reimbModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span>记一笔个人垫资与发票</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="reimbModalId">
      <div class="form-group">
        <label class="form-label">事项说明</label>
        <input type="text" id="reimbModalTitle" class="form-control" placeholder="如：自掏垫付腾讯云安全包续费 / 客户招待餐费">
      </div>
      <div class="form-group">
        <label class="form-label">垫付金额 (元)</label>
        <input type="number" step="0.01" id="reimbModalAmount" class="form-control" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">支付日期</label>
        <input type="date" id="reimbModalDate" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">垫资支付渠道</label>
        <select id="reimbModalMethod" class="form-control">
          <option value="微信支付">微信支付</option>
          <option value="支付宝">支付宝</option>
          <option value="个人信用卡">个人信用卡</option>
          <option value="银行卡转账">银行卡转账</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">拍照上传发票或截图凭证 (手机端点击可直接唤醒相机拍照)</label>
        <input type="file" accept="image/*" class="form-control" onchange="App.handleFileUpload(this, 'reimbModalInvoiceUrl', 'reimbInvoicePreview')">
        <input type="hidden" id="reimbModalInvoiceUrl">
        <img id="reimbInvoicePreview" style="display:none;width:120px;height:80px;object-fit:cover;margin-top:6px;border-radius:4px" alt="凭证预览">
      </div>
      <div class="form-group">
        <label class="form-label">备注说明</label>
        <input type="text" id="reimbModalRemark" class="form-control" placeholder="如：已开具专票，发票原件在抽屉">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
      <button class="btn btn-primary" onclick="App.saveReimbursement()">保存垫资单</button>
    </div>
  </div>
</div>

<!-- 6. 续费项弹窗 -->
<div id="renewalModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="renewalModalTitleText">资产与续费维护</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="renewalEditId">
      <div class="form-group">
        <label class="form-label">资产名称 <span style="color:var(--danger-color)">*</span></label>
        <input type="text" id="renewalEditName" class="form-control" placeholder="如：主域名 (example.com) 或 核心生产服务器">
      </div>
      <div class="form-group">
        <label class="form-label">所属公司主体 (用于多实体资产核算与发票归集)</label>
        <select id="renewalEditCompanyId" class="form-control">
          <option value="0">-- 暂不归属特定主体 (公共/通用) --</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">关联网站项目 (可选，在项目工作台通道中将自动展示联动)</label>
        <select id="renewalEditProjectId" class="form-control">
          <option value="0">-- 暂不关联特定网站项目 (独立资产) --</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">资产分类</label>
        <select id="renewalEditCategory" class="form-control">
          <option value="domain">🌐 域名 (Domain)</option>
          <option value="server">🖥️ 云服务器 (ECS/CVM)</option>
          <option value="ssl">🔒 SSL 证书</option>
          <option value="saas">💼 软件订阅 (SaaS)</option>
          <option value="other">📦 其他重要到期项</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">注册 / 托管服务商</label>
        <input type="text" id="renewalEditProvider" class="form-control" placeholder="如：阿里云、腾讯云、Godaddy、Notion、AWS、Cloudflare">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">到期日期 <span style="color:var(--danger-color)">*</span></label>
          <input type="date" id="renewalEditExpireDate" class="form-control">
          <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">
            <span style="font-size:11px;color:var(--text-muted);display:flex;align-items:center">快捷延期:</span>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(1, 'year')">+1年</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(6, 'month')">+6个月</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(3, 'month')">+3个月</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(1, 'month')">+1个月</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(1, 'year', true)">今日起+1年</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">提前预警阈值</label>
          <select id="renewalEditRemindDays" class="form-control">
            <option value="7">提前 7 天紧急预警</option>
            <option value="15">提前 15 天预警</option>
            <option value="30" selected>提前 30 天常规预警</option>
            <option value="60">提前 60 天长周期预警</option>
            <option value="90">提前 90 天远期预警</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">预计续费成本 (元)</label>
        <input type="number" step="0.01" id="renewalEditCost" class="form-control" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">官方续费后台直达链接 (点击可直接跳转缴费)</label>
        <input type="url" id="renewalEditUrl" class="form-control" placeholder="https://...">
      </div>

      <!-- 登录凭据与账号密码安全管理 (AES-256 加密) -->
      <div style="margin:14px 0 10px 0;border:1px solid var(--border-light);border-radius:var(--radius-sm);background:var(--bg-card);overflow:hidden">
        <div style="padding:10px 12px;background:var(--bg-subtle);display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="document.getElementById('renewalCredentialSec').style.display = document.getElementById('renewalCredentialSec').style.display === 'none' ? 'block' : 'none'">
          <div style="font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:6px">
            <span>🔑</span><span>控制台登录安全凭据 (可选，AES-256 加密存储)</span>
          </div>
          <span style="font-size:11px;color:var(--text-muted)">展开 / 折叠 ▾</span>
        </div>
        <div id="renewalCredentialSec" style="padding:12px;display:none">
          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between">
              <span>登录账号 / 手机 / 邮箱</span>
              <span id="renewalCurrentPassStatus" style="font-size:11px"></span>
            </label>
            <input type="text" id="renewalLoginAccount" class="form-control" placeholder="如：admin@company.com 或 13800138000">
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between">
              <span>登录密码 (AES-256 加密存管)</span>
              <div style="display:flex;gap:8px">
                <a href="javascript:void(0)" onclick="App.generateRandomPassword('renewalLoginPassword')" style="font-size:11.5px;color:var(--accent-color)">🎲 随机生成强密码</a>
                <a href="javascript:void(0)" onclick="App.togglePasswordVisibility('renewalLoginPassword')" style="font-size:11.5px;color:var(--text-secondary)">👁️ 显示/隐藏</a>
              </div>
            </label>
            <input type="password" id="renewalLoginPassword" class="form-control" placeholder="留空则保持原密码不变；如需修改输入新密码">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);margin-top:6px;cursor:pointer">
              <input type="checkbox" id="renewalClearPassword"> 清除已保存的密码
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">直达自动化模式</label>
            <select id="renewalAutoLoginType" class="form-control" onchange="document.getElementById('renewalPostTargetGroup').style.display = this.value === 'post_submit' ? 'block' : 'none'">
              <option value="copy_and_jump">🚀 安全浮窗倒计时与一键快填 (推荐: 打开官网+浮窗倒计时)</option>
              <option value="post_submit">⚡ 表单模拟自动提交 (内部系统/需目标支持)</option>
              <option value="none">仅记录，普通跳转</option>
            </select>
          </div>
          <div class="form-group" id="renewalPostTargetGroup" style="display:none">
            <label class="form-label">自定义 POST 目标 Action URL</label>
            <input type="url" id="renewalPostTargetUrl" class="form-control" placeholder="https://...">
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">备忘 / 账号说明</label>
        <input type="text" id="renewalEditNote" class="form-control" placeholder="如：账号 admin@corp.com / 见密码本">
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="renewalModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteRenewal(this)">删除此资产</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveRenewalItem()">保存资产修改</button>
      </div>
    </div>
  </div>
</div>

<!-- 7. 任务新建弹窗 -->
<div id="taskModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span>记一笔待办 / 里程碑</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">事务类型</label>
        <select id="taskEditCategory" class="form-control">
          <option value="daily">📝 今日/日常待办事项</option>
          <option value="milestone">🎯 长期项目与跨周期里程碑</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">任务内容</label>
        <input type="text" id="taskEditTitle" class="form-control" placeholder="如：核对下半年服务器预算规划">
      </div>
      <div class="form-group">
        <label class="form-label">优先级</label>
        <select id="taskEditPriority" class="form-control">
          <option value="high">🚨 紧急高优</option>
          <option value="medium">⚖️ 常规推进</option>
          <option value="low">🌱 低优先级/备忘</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">截止/目标日期</label>
        <input type="date" id="taskEditDate" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">细节补充与备忘</label>
        <textarea id="taskEditNote" class="form-control" rows="2" placeholder="补充上下文或要点"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
      <button class="btn btn-primary" onclick="App.saveTaskItem()">确认创建</button>
    </div>
  </div>
</div>

<!-- 8. 新增/编辑公司主体弹窗 -->
<div id="companyModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="companyModalTitleText">维护公司主体</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="companyModalId">
      <div class="form-group">
        <label class="form-label">公司法定全称 (开票完整抬头) *</label>
        <input type="text" id="companyModalName" class="form-control" placeholder="如：德泰进出口贸易(深圳)有限公司">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">展示简称 (用于标签徽章) *</label>
          <input type="text" id="companyModalShortName" class="form-control" placeholder="如：德泰外贸">
        </div>
        <div class="form-group">
          <label class="form-label">胶囊标识配色</label>
          <select id="companyModalColor" class="form-control">
            <option value="blue">🔵 科技深蓝</option>
            <option value="orange">🟠 商务活力橙</option>
            <option value="green">🟢 稳健清绿</option>
            <option value="purple">🟣 典雅雅紫</option>
            <option value="red">🔴 热情绯红</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">统一社会信用代码 (纳税人识别号/税号)</label>
        <input type="text" id="companyModalTaxNumber" class="form-control" placeholder="91440300XXXXXXXXXX">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">开户银行全称</label>
          <input type="text" id="companyModalBankName" class="form-control" placeholder="如：招商银行深圳高新园支行">
        </div>
        <div class="form-group">
          <label class="form-label">银行对公账号</label>
          <input type="text" id="companyModalBankAccount" class="form-control" placeholder="7559 1234 5678 901">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">开票注册地址及联系电话</label>
        <input type="text" id="companyModalAddressPhone" class="form-control" placeholder="如：深圳市南山区高新南道某大厦 0755-88888888">
      </div>
      <div class="form-group">
        <label class="form-label">备注备忘 (主营范围、业务定位)</label>
        <textarea id="companyModalRemark" class="form-control" rows="2" placeholder="简述该主体的定位与经营方向"></textarea>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="companyModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteCompany()">删除此公司</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveCompany()">保存公司主体</button>
      </div>
    </div>
  </div>
</div>

<!-- 8.5. 新增/编辑快速通道弹窗 -->
<div id="portalModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog" style="max-width:460px">
    <div class="modal-header">
      <span id="portalModalTitleText">新增快速业务通道</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="portalModalId">
      <div style="display:grid;grid-template-columns:84px 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">图标/Emoji</label>
          <input type="text" id="portalModalIcon" class="form-control" style="text-align:center;font-size:18px" placeholder="⚡" maxlength="4">
        </div>
        <div class="form-group">
          <label class="form-label">平台/通道名称 *</label>
          <input type="text" id="portalModalTitle" class="form-control" placeholder="如：阿里巴巴国际站">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">跳转网址 (URL) *</label>
        <input type="text" id="portalModalUrl" class="form-control" placeholder="https://seller.alibaba.com">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">业务分类</label>
          <input type="text" id="portalModalCategory" list="portalCategoryDatalist" class="form-control" placeholder="如: 外贸拓客 / 采购供应链">
          <datalist id="portalCategoryDatalist">
            <option value="外贸拓客">
            <option value="采购供应链">
            <option value="协同通信">
            <option value="实用工具">
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">排序权重</label>
          <input type="number" id="portalModalSort" class="form-control" placeholder="0 (越小越靠前)">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">常用账号提示 / 备忘说明 (非密码)</label>
        <input type="text" id="portalModalNote" class="form-control" placeholder="如：主店铺后台 / 邮箱 sales@corp.com">
      </div>

      <!-- 凭据安全配置区域 (可选) -->
      <div class="credential-box" style="margin-top:14px;padding:12px;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;font-weight:600;color:var(--text-main);display:flex;align-items:center;gap:5px">
            🔑 登录凭据配置 <span style="font-size:11px;font-weight:normal;color:var(--text-muted)">(可选 · AES-256-GCM 加密存储)</span>
          </span>
          <span id="portalModalPassStatusBadge" class="badge" style="display:none;background:rgba(46,160,67,0.15);color:var(--success-color);font-size:10px">已存密保</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录账号 (选填)</label>
            <input type="text" id="portalModalLoginAccount" class="form-control" placeholder="用户名/邮箱/手机" style="font-size:12px">
          </div>
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录密码 (选填)</label>
            <div style="position:relative">
              <input type="password" id="portalModalLoginPassword" class="form-control" placeholder="留空则不修改" style="font-size:12px;padding-right:30px">
              <span onclick="App.togglePasswordVisibility('portalModalLoginPassword')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:13px;opacity:0.6" title="显示/隐藏">👁️</span>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:11px">自动跳板策略</label>
            <select id="portalModalAutoLoginType" class="form-control" style="font-size:12px" onchange="App.handleAutoLoginTypeChange(this, 'portalModalPostTargetGroup')">
              <option value="copy_and_jump">🚀 一键直达 + 剪贴板安全速填 (推荐)</option>
              <option value="post_submit">⚡ 内部系统自动 POST 免密登录</option>
              <option value="none">🔒 仅加密备忘 (不自动填充)</option>
            </select>
          </div>
          <div style="padding-top:16px">
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 8px" onclick="App.generateRandomPassword('portalModalLoginPassword')" title="生成高强度随机密码">🎲 随机强密码</button>
          </div>
        </div>
        <div id="portalModalPostTargetGroup" class="form-group" style="display:none;margin-top:8px;margin-bottom:0">
          <label class="form-label" style="font-size:11px">自动 POST 提交地址 (若不填则默认提交到上方跳转网址)</label>
          <input type="text" id="portalModalPostTargetUrl" class="form-control" placeholder="如: https://example.com/api/login" style="font-size:12px">
        </div>
        <div id="portalModalClearPassWrap" style="display:none;margin-top:6px;text-align:right">
          <label style="font-size:11px;color:var(--danger-color);cursor:pointer;display:inline-flex;align-items:center;gap:4px">
            <input type="checkbox" id="portalModalClearPass"> 清除并移除已保存的加密密码
          </label>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="portalModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deletePortalFromModal()">删除通道</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.savePortalItem()">保存通道</button>
      </div>
    </div>
  </div>
</div>

<!-- 8.6. 常用直达综合设置与管理弹窗 -->
<div id="managePortalsModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog" style="max-width:700px">
    <div class="modal-header">
      <span style="display:flex;align-items:center;gap:6px">⚡ 常用直达综合设置与管理</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body" style="padding:16px 20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:12.5px;color:var(--text-muted)">集中设置、修改与管理首页及事务顶部的各常用业务直达平台</div>
        <button class="btn btn-sm btn-primary" onclick="App.openAddPortalModal()">+ 新增通道</button>
      </div>
      <div class="notion-table-container" style="max-height:420px;overflow-y:auto;margin-bottom:0">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width:24%">平台名称</th>
              <th style="width:16%">业务分类</th>
              <th style="width:34%">跳转网址</th>
              <th style="width:12%">安全密保</th>
              <th style="text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="managePortalsTableBody">
            <tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-muted)">加载中...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="App.closeAllModals()">关闭</button>
    </div>
  </div>
</div>

<!-- 9. 简洁账号登录弹窗 -->
<div id="loginModal" class="modal-overlay" style="display:none;z-index:9999;backdrop-filter:blur(6px);background:rgba(0,0,0,0.45)">
  <div class="modal-dialog" style="max-width:360px;box-shadow:var(--shadow-modal);border-radius:var(--radius-md)">
    <div class="modal-header" style="justify-content:center;border-bottom:none;padding-top:24px;padding-bottom:6px">
      <div style="text-align:center">
        <div style="font-size:32px;margin-bottom:6px">📁</div>
        <div style="font-size:16px;font-weight:700;color:var(--text-main)" id="loginAppTitle"><?php echo htmlspecialchars($appTitle); ?></div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">管理者工作台 · 安全验证</div>
      </div>
    </div>
    <div class="modal-body" style="padding:16px 24px">
      <div class="form-group">
        <label class="form-label">登录账号</label>
        <input type="text" id="loginUsernameInput" class="form-control" placeholder="输入账号 (默认: admin)" autocomplete="username" onkeydown="if(event.key==='Enter') document.getElementById('loginPasswordInput').focus()">
      </div>
      <div class="form-group">
        <label class="form-label">登录密码</label>
        <input type="password" id="loginPasswordInput" class="form-control" placeholder="输入密码 (默认: felix123)" autocomplete="current-password" onkeydown="if(event.key==='Enter') App.submitLogin()">
      </div>
      <div id="loginErrorMsg" style="color:var(--danger-color);font-size:12px;display:none;margin-top:-6px;margin-bottom:10px;text-align:center"></div>
    </div>
    <div class="modal-footer" style="padding:0 24px 24px 24px;border-top:none;flex-direction:column;gap:8px">
      <button class="btn btn-primary" style="width:100%;height:38px;font-size:14px" onclick="App.submitLogin()">登 录 ➔</button>
      <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:4px;width:100%">
        首次使用默认账号 <code>admin</code> 密码 <code>felix123</code>
      </div>
    </div>
  </div>
</div>

<!-- 10. 管理者账号维护弹窗 -->
<div id="userModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog" style="max-width:420px">
    <div class="modal-header">
      <span id="userModalTitleText">维护管理者账号</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="userModalId">
      <div class="form-group">
        <label class="form-label">登录账号 (用户名) *</label>
        <input type="text" id="userModalUsername" class="form-control" placeholder="如: admin 或 felix">
      </div>
      <div class="form-group">
        <label class="form-label">展示昵称</label>
        <input type="text" id="userModalDisplayName" class="form-control" placeholder="如: Felix (主理人)">
      </div>
      <div class="form-group">
        <label class="form-label" id="userModalPassLabel">登录密码</label>
        <input type="password" id="userModalPassword" class="form-control" placeholder="留空则保持原密码不变">
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="userModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteUserFromModal()">删除账号</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveUserItem()">保存账号</button>
      </div>
    </div>
  </div>
</div>

<!-- 11. 移动端专属：资产轻量速览与快捷延期抽屉 (Detail Sheet) -->
<div id="renewalDetailSheet" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog renewal-sheet-dialog">
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:6px">
        <span id="sheetCatIcon" style="font-size:16px">🌐</span>
        <span id="sheetTitleText" style="font-weight:600;font-size:14.5px">资产详情速览</span>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body" style="padding:14px 16px">
      <!-- 倒计时横幅 -->
      <div id="sheetStatusBanner" style="padding:10px 12px;border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;background:var(--bg-subtle)">
        <div style="display:flex;flex-direction:column">
          <span style="font-size:11px;color:var(--text-muted)">当前生命周期</span>
          <span id="sheetStatusText" style="font-weight:600;font-size:13.5px"></span>
        </div>
        <div style="text-align:right">
          <span style="font-size:11px;color:var(--text-muted)">到期日期</span>
          <div id="sheetExpireDate" style="font-weight:600;font-size:13px;font-family:monospace"></div>
        </div>
      </div>

      <!-- 核心指标两列排布 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="sheet-info-cell">
          <span class="sheet-info-label">归属主体</span>
          <span id="sheetCompany" class="sheet-info-val">-</span>
        </div>
        <div class="sheet-info-cell">
          <span class="sheet-info-label">关联项目</span>
          <span id="sheetProject" class="sheet-info-val">-</span>
        </div>
        <div class="sheet-info-cell">
          <span class="sheet-info-label">托管服务商</span>
          <span id="sheetProvider" class="sheet-info-val">-</span>
        </div>
        <div class="sheet-info-cell">
          <span class="sheet-info-label">续费成本预估</span>
          <span id="sheetCost" class="sheet-info-val" style="color:var(--accent-color);font-weight:600">￥0.00</span>
        </div>
      </div>

      <!-- 账号与安全密保卡片 -->
      <div id="sheetCredentialSec" style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px">
        <div style="font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;gap:4px;margin-bottom:4px">
          <span>🔑</span><span>登录账号 / 备忘说明</span>
        </div>
        <div id="sheetAccountVal" style="font-size:12.5px;font-weight:500;word-break:break-all">暂无备忘</div>
      </div>

      <!-- 一键快捷延期 (已在官网续期，手机上轻触快速同步更新) -->
      <div style="margin-bottom:6px;border:1px dashed var(--border-medium);border-radius:var(--radius-sm);padding:10px 12px">
        <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px">⚡ 快捷延期更新 (厂商已扣款续期，轻触快速同步):</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(1, 'year')">+1年</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(6, 'month')">+6个月</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(3, 'month')">+3个月</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(1, 'year', true)">今日起+1年</button>
        </div>
      </div>

      <input type="hidden" id="sheetRenewalId">
    </div>

    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" class="btn btn-secondary" onclick="App.editFromSheet()">
        ✏️ 完整编辑
      </button>
      <div style="display:flex;gap:8px">
        <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">关闭</button>
        <span id="sheetLaunchBtnWrap"></span>
      </div>
    </div>
  </div>
</div>
<div id="securityLoginDock" class="security-login-dock" style="display:none">
  <div class="dock-header">
    <div class="dock-title-wrap">
      <span class="dock-icon">🛡️</span>
      <div>
        <div class="dock-title" id="dockSiteTitle">已直达目标平台</div>
        <div class="dock-sub" id="dockSiteUrl">https://...</div>
      </div>
    </div>
    <button class="dock-close-btn" onclick="App.closeSecurityDock()" title="关闭助手">✕</button>
  </div>
  <div class="dock-body">
    <!-- 账号复制行 -->
    <div class="dock-field-row" id="dockAccountRow" style="display:none">
      <div class="dock-field-label">账号</div>
      <div class="dock-field-value" id="dockAccountVal">--</div>
      <button class="btn btn-sm btn-secondary dock-btn" onclick="App.copyDockCredential('account')">📋 复制</button>
    </div>
    <!-- 密码复制行 -->
    <div class="dock-field-row" id="dockPasswordRow" style="display:none">
      <div class="dock-field-label">密码</div>
      <div class="dock-field-value dock-pass-val" id="dockPasswordVal">••••••••</div>
      <div style="display:flex;gap:4px">
        <button class="btn btn-sm btn-secondary dock-btn" onclick="App.toggleDockPassReveal()" title="查看/隐藏">👁️</button>
        <button class="btn btn-sm btn-primary dock-btn" onclick="App.copyDockCredential('password')">📋 复制密码</button>
      </div>
    </div>
    <!-- 提示与自动清空倒计时条 -->
    <div class="dock-countdown-bar" id="dockCountdownBar">
      <div class="dock-countdown-fill" id="dockCountdownFill"></div>
    </div>
    <div class="dock-footer-tip" id="dockFooterTip">
      ⏱️ 剪贴板安全保护中 · 15 秒后自动抹除剪贴板
    </div>
  </div>
</div>

<script src="js/app.js?v=<?php echo $jsVer; ?>"></script>
</body>
</html>
