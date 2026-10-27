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