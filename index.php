<?php
// index.php - 工作台前端主骨架与组件挂载中心
require_once __DIR__ . '/config.php';

$appTitle = getConfig('app_title', 'Felix 管理者工作台');
$theme = getConfig('theme', 'notion');
$cssVer = IS_PRODUCTION ? (file_exists(__DIR__ . '/css/app.css') ? filemtime(__DIR__ . '/css/app.css') : '1.0') : time();
$jsVer = max(
    file_exists(__DIR__ . '/js/app.js') ? filemtime(__DIR__ . '/js/app.js') : 0,
    file_exists(__DIR__ . '/js/modules/dashboard.js') ? filemtime(__DIR__ . '/js/modules/dashboard.js') : 0,
    file_exists(__DIR__ . '/js/modules/settings.js') ? filemtime(__DIR__ . '/js/modules/settings.js') : 0,
    file_exists(__DIR__ . '/js/modules/knowledge.js') ? filemtime(__DIR__ . '/js/modules/knowledge.js') : 0
);
if (!$jsVer) $jsVer = time();

// 线上协商缓存头
if (IS_PRODUCTION) {
    header("Cache-Control: no-cache, must-revalidate");
}
?>
<!DOCTYPE html>
<html lang="zh-CN" data-theme="<?php echo htmlspecialchars($theme); ?>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title><?php echo htmlspecialchars($appTitle); ?></title>
  
  <!-- 性能优化：最高优先级并行预加载核心样式与 JS 驱动 -->
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

  <!-- 1. 左侧固定侧边栏组件 -->
  <?php include __DIR__ . '/views/components/sidebar.php'; ?>

  <!-- 右侧主内容区域 -->
  <div class="main-content-layout">
    <!-- 2. 顶部导航栏与用户信息组件 -->
    <?php include __DIR__ . '/views/components/header.php'; ?>

    <!-- 3. 主体工作区各业务面板 (动态选项卡) -->
    <main class="main-wrapper">
      <?php include __DIR__ . '/views/panels/dashboard.php'; ?>
      <?php include __DIR__ . '/views/panels/projects.php'; ?>
      <?php include __DIR__ . '/views/panels/renewals.php'; ?>
      <?php include __DIR__ . '/views/panels/reimbursements.php'; ?>
      <?php include __DIR__ . '/views/panels/tasks.php'; ?>
      <?php include __DIR__ . '/views/panels/knowledge.php'; ?>
      <?php include __DIR__ . '/views/panels/companies.php'; ?>
      <?php include __DIR__ . '/views/panels/settings.php'; ?>
    </main>

    <!-- 4. 手机端专属底部固定导航栏组件 -->
    <?php include __DIR__ . '/views/components/mobile-tabs.php'; ?>
  </div>
</div>

<!-- 5. 模态弹窗与浮窗组件库统一装载 -->
<?php include __DIR__ . '/views/modals/all-modals.php'; ?>

<!-- 6. 原生 ES 模块化前端控制器驱动 -->
<script type="module" src="js/app.js?v=<?php echo $jsVer; ?>"></script>
</body>
</html>
