export const CoreModule = {
  async init() {
    this.bindEvents();
    // 性能优化：首屏请求全部并行发起，彻底消除瀑布流排队等待
    const loggedIn = await this.checkStatusAndLoadConfig();
    if (!loggedIn) return;
    
    // 登录就绪后，快捷入口与默认大盘数据并发拉取
    Promise.all([
      this.loadQuickPortals(),
      this.switchTab('dashboard')
    ]);
  },

  // 智能规整外部跳转网址：若用户只输入 www.xxx.com，自动前缀 https:// 防止浏览器将其误识别为相对路径
  formatUrl(url) {
    if (!url) return '#';
    url = String(url).trim();
    if (!/^(https?:)?\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  },

  // 检查状态和加载偏好
  async checkStatusAndLoadConfig() {
    try {
      const res = await fetch('api.php?action=check_status').then(r => r.json());
      if (res.success) {
        if (!res.data.is_logged_in) {
          this.showLoginModal();
          return false;
        }
        if (res.data.current_user) {
          this.state.currentUser = res.data.current_user;
          const userEl = document.getElementById('headerUserDisplayName');
          if (userEl) userEl.innerText = res.data.current_user.display_name || res.data.current_user.username;
        }
        if (res.data.theme) {
          this.setTheme(res.data.theme, false);
        }
        if (res.data.app_title) {
          document.getElementById('brandTitle').innerText = res.data.app_title;
        }
        return true;
      }
    } catch (e) {
      console.error('初始化失败', e);
    }
    return false;
  },

  bindEvents() {
    // 桌面/侧边栏导航切换
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
        if (window.innerWidth <= 768) {
          this.toggleSidebar(false);
        }
      });
    });

    // 移动端底部栏切换
    document.querySelectorAll('.mobile-tab-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // 快捷键 Ctrl+K 唤醒全局搜索
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // 主题切换下拉
    const themeSelect = document.getElementById('themeSelector');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.setTheme(e.target.value, true);
      });
    }
  },

  // 主题换肤系统 (Notion / Linear / Apple / Business)
  setTheme(themeName, syncBackend = true) {
    this.state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    const themeSelect = document.getElementById('themeSelector');
    if (themeSelect) themeSelect.value = themeName;

    if (syncBackend) {
      fetch('api.php?action=save_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeName })
      });
    }
  },

  // 切换侧边栏展开/折叠 (移动端抽屉)
  toggleSidebar(open) {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;
    const isOpen = open !== undefined ? open : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', isOpen);
    if (backdrop) {
      if (isOpen) {
        backdrop.classList.add('active');
      } else {
        backdrop.classList.remove('active');
      }
    }
  },

  // 标签页切换
  switchTab(tabName) {
    this.state.currentTab = tabName;

    // 更新导航高亮
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.querySelectorAll('.mobile-tab-item').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    // 隐藏/显示面板
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.remove('active');
    });
    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activePanel) activePanel.classList.add('active');

    // 更新顶部当前栏目标题面包屑
    const titleEl = document.getElementById('currentTabTitle');
    if (titleEl) {
      const titles = {
        dashboard: '📊 总览看板',
        projects: '🚀 网站项目跳板',
        renewals: '⏰ 资产续费雷达',
        reimbursements: '💳 垫资报销管家',
        tasks: '📋 事务与待办',
        knowledge: '🧠 AI 知识库',
        companies: '🏢 公司主体',
        settings: '⚙️ 系统设置'
      };
      titleEl.innerText = titles[tabName] || tabName;
    }

    // 动态加载对应数据
    switch (tabName) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'projects':
        this.loadProjects();
        break;
      case 'renewals':
        this.loadRenewals();
        break;
      case 'reimbursements':
        this.loadReimbursements();
        break;
      case 'tasks':
        this.loadTasks();
        break;
      case 'knowledge':
        this.loadKnowledge();
        break;
      case 'companies':
        this.loadCompanies();
        break;
      case 'settings':
        this.loadConfigSettings();
        this.loadUsers();
        break;
    }
  },
};
