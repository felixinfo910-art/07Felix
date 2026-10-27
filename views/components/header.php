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