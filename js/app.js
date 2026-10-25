// app.js - 前端状态驱动与业务交互逻辑
const App = {
  state: {
    currentTab: 'dashboard',
    theme: 'notion',
    dashboardData: null,
    projects: [],
    companies: [],
    selectedCompanyFilter: 'all',
    currentChannelProjectId: null,
    selectedProjectCategory: 'all',
    projectSearchQuery: '',
    renewals: [],
    selectedRenewalCategory: 'all',
    selectedRenewalStatus: 'all',
    selectedRenewalCompany: 'all',
    renewalSearchQuery: '',
    reimbursements: [],
    tasks: [],
    quickPortals: [],
    selectedPortalCategory: 'all',
    knowledgeDocs: [],
    selectedDoc: null,
    aiChatHistory: [],
    config: {},
    searchQuery: '',
    searchOpen: false
  },

  async init() {
    this.bindEvents();
    await this.checkStatusAndLoadConfig();
    this.loadQuickPortals();
    this.switchTab('dashboard');
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
          return;
        }
        if (res.data.theme) {
          this.setTheme(res.data.theme, false);
        }
        if (res.data.app_title) {
          document.getElementById('brandTitle').innerText = res.data.app_title;
        }
      }
    } catch (e) {
      console.error('初始化失败', e);
    }
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
        break;
    }
  },

  // ---------------- 1. Dashboard 总览 ----------------
  async loadDashboard() {
    try {
      const res = await fetch('api.php?action=dashboard').then(r => r.json());
      if (!res.success) return;
      const data = res.data;
      this.state.dashboardData = data;

      // 更新 KPI
      document.getElementById('kpiReimbAmount').innerText = '￥' + data.metrics.reimb_pending_amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 });
      document.getElementById('kpiUrgentRenewals').innerText = data.metrics.urgent_renewals_count;
      document.getElementById('kpiDailyTasks').innerText = `${data.metrics.daily_task_done} / ${data.metrics.daily_task_total}`;
      document.getElementById('kpiProjectCount').innerText = `${data.metrics.project_count} 项目 (${data.metrics.link_count} 入口)`;

      // 紧急到期提醒横幅
      const banner = document.getElementById('urgentBanner');
      if (data.metrics.urgent_renewals_count > 0) {
        banner.style.display = 'flex';
        document.getElementById('urgentBannerText').innerHTML = `<strong>急迫提醒：</strong>有 <strong>${data.metrics.urgent_renewals_count}</strong> 项核心资产即将在 7 天内到期！`;
      } else {
        banner.style.display = 'none';
      }

      // 临期列表速览
      const urgentListEl = document.getElementById('dashUrgentList');
      if (urgentListEl) {
        if (data.urgent_renewals.length === 0) {
          urgentListEl.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:8px 0;">近期无急迫到期资产，运行安全。</div>`;
        } else {
          urgentListEl.innerHTML = data.urgent_renewals.map(r => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light)">
              <div>
                <span style="font-weight:600">${r.name}</span>
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${r.provider || ''}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="badge-status danger">剩 ${r.days_left} 天到期</span>
                <button class="btn btn-sm btn-secondary" onclick="App.openRenewModal(${r.id})">续费/转报销</button>
              </div>
            </div>
          `).join('');
        }
      }

      // 今日待办速览
      const todayTasksEl = document.getElementById('dashTodayTasks');
      if (todayTasksEl) {
        if (data.today_tasks.length === 0) {
          todayTasksEl.innerHTML = `<div style="color:var(--text-muted);font-size:13px;padding:8px 0;">今日暂无紧急待办，可轻松推进长期项目。</div>`;
        } else {
          todayTasksEl.innerHTML = data.today_tasks.map(t => `
            <div class="task-item ${t.status === 'done' ? 'is-done' : ''}" style="margin-bottom:6px;padding:8px 12px">
              <div class="task-checkbox-wrap">
                <input type="checkbox" class="task-checkbox" ${t.status === 'done' ? 'checked' : ''} onchange="App.toggleTask(${t.id})">
                <span class="task-title" style="font-size:13px">${t.title}</span>
              </div>
              <span class="badge-status ${t.priority === 'high' ? 'danger' : 'warning'}">${t.priority === 'high' ? '高优' : '常规'}</span>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      console.error(e);
    }
  },

  // ---------------- 2. 网站项目大框架与专属通道 ----------------
  async loadProjects() {
    try {
      // 同时拉取公司主体和项目列表
      const [resProj, resComp] = await Promise.all([
        fetch('api.php?action=get_projects').then(r => r.json()),
        fetch('api.php?action=get_companies').then(r => r.json())
      ]);
      if (resComp && resComp.success) {
        this.state.companies = resComp.data || [];
        this.updateCompanyDropdowns();
      }
      if (!resProj.success) return;
      this.state.projects = resProj.data;
      
      // 如果当前正处于某个项目的专属通道内，实时刷新该通道数据
      if (this.state.currentChannelProjectId) {
        this.openProjectChannel(this.state.currentChannelProjectId, false);
      } else {
        this.renderProjects();
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 更新所有公司与项目关联下拉选框 (过滤条 + 项目弹窗 + 续费雷达)
  updateCompanyDropdowns() {
    // 1. 项目矩阵 - 公司筛选下拉
    const filterSelect = document.getElementById('projectCompanyFilterSelect');
    if (filterSelect) {
      const curVal = this.state.selectedCompanyFilter || 'all';
      filterSelect.innerHTML = `<option value="all">全部公司主体 (${this.state.companies.length})</option>` +
        this.state.companies.map(c => `<option value="${c.id}">${c.short_name} (${c.name})</option>`).join('');
      filterSelect.value = curVal;
    }

    // 2. 网站项目编辑弹窗 - 所属公司下拉
    const modalSelect = document.getElementById('projModalCompanyId');
    if (modalSelect) {
      const curVal = modalSelect.value || '0';
      modalSelect.innerHTML = `<option value="0">-- 暂不归属特定公司 (公共/通用) --</option>` +
        this.state.companies.map(c => `<option value="${c.id}">${c.short_name} · ${c.name}</option>`).join('');
      modalSelect.value = curVal;
    }

    // 3. 资产续费雷达 - 归属主体筛选下拉
    const renewalCompSelect = document.getElementById('renewalCompanyFilterSelect');
    if (renewalCompSelect) {
      const curVal = this.state.selectedRenewalCompany || 'all';
      renewalCompSelect.innerHTML = `<option value="all">全部公司主体 (${this.state.companies.length})</option>` +
        this.state.companies.map(c => `<option value="${c.id}">${c.short_name}</option>`).join('');
      renewalCompSelect.value = curVal;
    }

    // 4. 资产续费编辑弹窗 - 所属公司主体下拉
    const renewalEditCompSelect = document.getElementById('renewalEditCompanyId');
    if (renewalEditCompSelect) {
      const curVal = renewalEditCompSelect.value || '0';
      renewalEditCompSelect.innerHTML = `<option value="0">-- 暂不归属特定主体 (公共/通用) --</option>` +
        this.state.companies.map(c => `<option value="${c.id}">${c.short_name} · ${c.name}</option>`).join('');
      renewalEditCompSelect.value = curVal;
    }

    // 5. 资产续费编辑弹窗 - 关联网站项目下拉
    const renewalEditProjSelect = document.getElementById('renewalEditProjectId');
    if (renewalEditProjSelect) {
      const curVal = renewalEditProjSelect.value || '0';
      renewalEditProjSelect.innerHTML = `<option value="0">-- 暂不关联特定网站项目 (独立资产) --</option>` +
        (this.state.projects || []).map(p => `<option value="${p.id}">${p.name} (${p.code || 'WEB'})</option>`).join('');
      renewalEditProjSelect.value = curVal;
    }
  },

  // 筛选：按分类
  filterProjectsByCategory(cat) {
    this.state.selectedProjectCategory = cat;
    document.querySelectorAll('.proj-filter-btn').forEach(btn => {
      btn.className = (btn.dataset.cat === cat) ? 'btn btn-sm btn-primary proj-filter-btn' : 'btn btn-sm btn-secondary proj-filter-btn';
    });
    this.renderProjects();
  },

  // 筛选：按公司主体
  filterProjectsByCompany(companyId) {
    this.state.selectedCompanyFilter = companyId;
    this.renderProjects();
  },

  // 筛选：按输入关键词
  filterProjectsByQuery(q) {
    this.state.projectSearchQuery = (q || '').trim().toLowerCase();
    this.renderProjects();
  },

  // 第一层：渲染高密度项目总控矩阵表格 (Fleet Table)
  renderProjects() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;

    // 统计各分类数量
    const allProjects = this.state.projects || [];
    const catCountAll = document.getElementById('catCountAll');
    if (catCountAll) catCountAll.innerText = allProjects.length;

    // 进行多维过滤 (分类 + 公司主体 + 关键词)
    let filtered = allProjects;
    if (this.state.selectedProjectCategory && this.state.selectedProjectCategory !== 'all') {
      filtered = filtered.filter(p => (p.category || '核心官网') === this.state.selectedProjectCategory);
    }
    if (this.state.selectedCompanyFilter && this.state.selectedCompanyFilter !== 'all') {
      filtered = filtered.filter(p => String(p.company_id) === String(this.state.selectedCompanyFilter));
    }
    if (this.state.projectSearchQuery) {
      const q = this.state.projectSearchQuery;
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.company_name && p.company_name.toLowerCase().includes(q)) ||
        (p.company_short_name && p.company_short_name.toLowerCase().includes(q)) ||
        (p.links || []).some(l => l.url.toLowerCase().includes(q) || l.title.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:36px;color:var(--text-muted)">无匹配的网站项目，可切换筛选条件或点击右上角【+ 新增网站项目】。</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      // 提取主访问链接 (优先前台或后台)
      const links = p.links || [];
      const primaryLink = links.find(l => l.type === 'site') || links.find(l => l.type === 'admin') || links[0];
      const hasReadme = p.readme && p.readme.trim().length > 0;
      const compColor = p.company_color || 'blue';
      const compShortName = p.company_short_name || '';

      // SSL 证书倒计时渲染
      let sslBadgeHtml = '<span style="color:var(--text-muted);font-size:11.5px">未配置</span>';
      if (p.ssl_expire_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(p.ssl_expire_date);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((expDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          sslBadgeHtml = `<span class="badge-status danger" title="SSL到期日: ${p.ssl_expire_date}">🔒 已过期 (${Math.abs(diffDays)}天前)</span>`;
        } else if (diffDays <= 7) {
          sslBadgeHtml = `<span class="badge-status danger" title="SSL到期日: ${p.ssl_expire_date}">🚨 剩 ${diffDays} 天</span>`;
        } else if (diffDays <= 30) {
          sslBadgeHtml = `<span class="badge-status warning" title="SSL到期日: ${p.ssl_expire_date}">⏰ 剩 ${diffDays} 天</span>`;
        } else {
          sslBadgeHtml = `<span class="badge-status normal" title="SSL到期日: ${p.ssl_expire_date}">🛡️ 剩 ${diffDays} 天</span>`;
        }
        sslBadgeHtml += `<div style="font-size:10.5px;color:var(--text-muted);margin-top:2px">${p.ssl_expire_date}</div>`;
      }

      return `
        <tr>
          <td>
            <div style="font-weight:600;font-size:14px;color:var(--text-main);cursor:pointer;display:flex;align-items:center;gap:6px" onclick="App.openProjectChannel(${p.id})">
              <span>🌐</span>
              <span class="hover-underline">${p.name}</span>
            </div>
            <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">
              代号: <code>${p.code || 'MAIN'}</code> ${p.description ? '· ' + p.description : ''}
            </div>
          </td>
          <td>
            ${compShortName ? `
              <span class="badge-company color-${compColor}" title="${p.company_name || ''}">🏢 ${compShortName}</span>
            ` : `<span style="color:var(--text-muted);font-size:11.5px">通用/公共</span>`}
          </td>
          <td>
            <span class="badge-status normal">${p.category || '核心官网'}</span>
          </td>
          <td>
            ${primaryLink ? `
              <a href="${this.formatUrl(primaryLink.url)}" target="_blank" style="color:var(--accent-color);font-size:12.5px;display:inline-flex;align-items:center;gap:4px">
                <span>${primaryLink.title}</span>
                <span style="font-size:10px">↗</span>
              </a>
              <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px">${primaryLink.url}</div>
            ` : `<span style="color:var(--text-muted);font-size:12px">暂未配置主入口</span>`}
          </td>
          <td>
            ${sslBadgeHtml}
          </td>
          <td>
            <span style="font-weight:600;font-size:13px">${links.length}</span>
            <span style="font-size:11px;color:var(--text-muted)"> 个通道入口</span>
          </td>
          <td>
            ${hasReadme ? `
              <span class="badge-status normal" title="已沉淀专属说明书">📖 已有说明</span>
            ` : `
              <span class="badge-status" style="background:var(--bg-subtle);color:var(--text-muted)">📝 待编写</span>
            `}
          </td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:6px">
              <button class="btn btn-sm btn-primary" onclick="App.openProjectChannel(${p.id})">进入通道 ➔</button>
              <button class="btn btn-sm btn-secondary" onclick="App.openEditProjectModal(${p.id})">设置</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // 第二层：打开单项目专属通道 (Project Channel)
  openProjectChannel(projectId, smoothScroll = true) {
    const p = this.state.projects.find(x => String(x.id) === String(projectId));
    if (!p) return;

    this.state.currentChannelProjectId = p.id;

    // 切换视图显示：隐藏外层列表，显示内层通道
    document.getElementById('projectsOverviewView').style.display = 'none';
    const channelView = document.getElementById('projectChannelView');
    channelView.style.display = 'block';

    if (smoothScroll) {
      channelView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 填充头部信息与公司主体
    document.getElementById('channelProjectName').innerText = p.name;
    document.getElementById('channelProjectCategory').innerText = p.category || '核心官网';
    document.getElementById('channelProjectCode').innerText = p.code || 'MAIN';
    document.getElementById('channelProjectDesc').innerText = p.description || '暂无项目补充描述';

    // 渲染通道内的 SSL 证书倒计时徽章
    const sslBadge = document.getElementById('channelProjectSsl');
    if (sslBadge) {
      if (p.ssl_expire_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(p.ssl_expire_date);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((expDate - today) / (1000 * 60 * 60 * 24));
        sslBadge.style.display = 'inline-flex';
        if (diffDays < 0) {
          sslBadge.className = 'badge-status danger';
          sslBadge.innerText = `🔒 SSL已过期 (${Math.abs(diffDays)}天前)`;
        } else if (diffDays <= 7) {
          sslBadge.className = 'badge-status danger';
          sslBadge.innerText = `🚨 SSL剩 ${diffDays} 天 (紧急)`;
        } else if (diffDays <= 30) {
          sslBadge.className = 'badge-status warning';
          sslBadge.innerText = `⏰ SSL剩 ${diffDays} 天`;
        } else {
          sslBadge.className = 'badge-status normal';
          sslBadge.innerText = `🛡️ SSL剩 ${diffDays} 天`;
        }
        sslBadge.title = `SSL证书到期日: ${p.ssl_expire_date}`;
      } else {
        sslBadge.style.display = 'none';
      }
    }

    const compBadge = document.getElementById('channelProjectCompany');
    const copyInvoiceBtn = document.getElementById('btnCopyCompanyInvoice');
    if (p.company_short_name) {
      compBadge.style.display = 'inline-flex';
      compBadge.className = `badge-company color-${p.company_color || 'blue'}`;
      compBadge.innerText = `🏢 ${p.company_short_name}`;
      compBadge.title = p.company_name;

      if (copyInvoiceBtn) {
        copyInvoiceBtn.style.display = 'inline-flex';
      }
    } else {
      compBadge.style.display = 'none';
      if (copyInvoiceBtn) copyInvoiceBtn.style.display = 'none';
    }

    // 1. 渲染通道内的直达跳转入口 (Launchpad)
    const linksWrap = document.getElementById('channelLinksWrap');
    const links = p.links || [];
    if (links.length === 0) {
      linksWrap.innerHTML = `
        <div style="font-size:12.5px;color:var(--text-muted);padding:8px 0">
          该项目通道下暂无直达入口。点击右侧【+ 添加入口】快速配置前台、后台或宝塔地址。
        </div>
      `;
    } else {
      linksWrap.innerHTML = links.map(link => `
        <div class="launcher-item-wrap">
          <a href="${this.formatUrl(link.url)}" target="_blank" class="launcher-btn type-${link.type}" title="${link.account_note ? '账号备忘: ' + link.account_note : '点击访问直达'}">
            <span>${this.getLinkTypeIcon(link.type)}</span>
            <span>${link.title}</span>
            <span style="font-size:10px;opacity:0.6">↗</span>
          </a>
          <button type="button" class="launcher-edit-btn" onclick="event.preventDefault(); event.stopPropagation(); App.openEditLinkModal(${link.id}, ${p.id})" title="修改此入口网址或账号">✎</button>
        </div>
      `).join('');
    }

    // 2. 渲染通道内的说明书 (Readme)
    this.renderChannelReadme(p);

    // 3. 渲染该项目绑定的续费/资产情况
    this.renderChannelRenewals(p);
  },

  // 从通道返回到项目大框架
  backToProjectsOverview() {
    this.state.currentChannelProjectId = null;
    document.getElementById('projectChannelView').style.display = 'none';
    document.getElementById('projectsOverviewView').style.display = 'block';
    this.renderProjects();
  },

  // 渲染项目专属说明书
  renderChannelReadme(p) {
    const readmeView = document.getElementById('channelReadmeView');
    const readmeEditWrap = document.getElementById('channelReadmeEditWrap');
    const btnToggle = document.getElementById('btnToggleEditReadme');
    const btnTpl = document.getElementById('btnTplReadme');

    readmeEditWrap.style.display = 'none';
    readmeView.style.display = 'block';
    btnToggle.innerText = '✏️ 编辑说明书';
    btnTpl.style.display = 'none';

    if (p.readme && p.readme.trim().length > 0) {
      readmeView.innerHTML = this.formatReadmeContent(p.readme);
    } else {
      readmeView.innerHTML = `
        <div style="color:var(--text-muted);font-size:13px;text-align:center;padding:24px 0">
          <div style="font-size:24px;margin-bottom:6px">📝</div>
          <div>尚未为 <strong>${p.name}</strong> 编写专属说明书。</div>
          <div style="font-size:12px;margin-top:4px">点击右上角【✏️ 编辑说明书】，沉淀这个网站的业务逻辑、架构环境、账号规则或运维避坑指南！</div>
        </div>
      `;
    }
  },

  // 简易 Markdown / 格式美化
  formatReadmeContent(text) {
    const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safe
      .replace(/^### (.*$)/gim, '<h3 style="font-size:14.5px;font-weight:700;margin:12px 0 6px;color:var(--text-main)">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size:16px;font-weight:700;margin:16px 0 8px;color:var(--text-main);border-bottom:1px solid var(--border-light);padding-bottom:4px">$1</h2>')
      .replace(/^\- (.*$)/gim, '<li style="margin-left:18px;margin-bottom:3px">$1</li>')
      .replace(/`(.*?)`/g, '<code style="background:var(--bg-subtle);padding:2px 5px;border-radius:3px;font-size:12px">$1</code>');
  },

  // 切换说明书编辑状态
  toggleEditChannelReadme() {
    const p = this.state.projects.find(x => String(x.id) === String(this.state.currentChannelProjectId));
    if (!p) return;

    const readmeView = document.getElementById('channelReadmeView');
    const readmeEditWrap = document.getElementById('channelReadmeEditWrap');
    const textarea = document.getElementById('channelReadmeTextarea');
    const btnToggle = document.getElementById('btnToggleEditReadme');
    const btnTpl = document.getElementById('btnTplReadme');

    if (readmeEditWrap.style.display === 'none') {
      readmeView.style.display = 'none';
      readmeEditWrap.style.display = 'flex';
      textarea.value = p.readme || '';
      textarea.focus();
      btnToggle.innerText = '取消编辑';
      btnTpl.style.display = 'inline-flex';
    } else {
      this.cancelEditChannelReadme();
    }
  },

  cancelEditChannelReadme() {
    const p = this.state.projects.find(x => String(x.id) === String(this.state.currentChannelProjectId));
    if (p) this.renderChannelReadme(p);
  },

  // 套用规范说明书模版
  applyReadmeTemplate() {
    const p = this.state.projects.find(x => String(x.id) === String(this.state.currentChannelProjectId));
    const name = p ? p.name : '本项目';
    const tpl = `## 📖 ${name} - 专属运维与业务说明书

### 1. 业务概述与系统定位
- 核心职能：
- 目标受众与业务线：
- 项目负责人 / 对接人：

### 2. 技术架构与服务器环境
- 前端框架 / 站点程序：(如 WordPress / Vue / 原生 PHP)
- 运行环境：(如 Nginx 1.22 + PHP 7.4 + MySQL 5.7 宝塔面板)
- 代码仓库与发布分支：(如 main 分支)

### 3. 运维要点与避坑指南
- 发布与部署规范：(例如：改完代码后必须手动清理 Redis 缓存)
- 伪静态与特定端口规则：
- 数据库与备份策略：

### 4. 账号与权限规则
- 管理后台地址及双重认证 (2FA) 规则：
- 关联企业邮箱 / 短信服务提供商：`;

    const textarea = document.getElementById('channelReadmeTextarea');
    if (textarea) {
      textarea.value = tpl;
      textarea.focus();
    }
  },

  // 保存通道说明书
  async saveChannelReadme() {
    const p = this.state.projects.find(x => String(x.id) === String(this.state.currentChannelProjectId));
    if (!p) return;

    const readme = document.getElementById('channelReadmeTextarea').value;

    const res = await fetch('api.php?action=save_project_readme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, readme })
    }).then(r => r.json());

    if (res.success) {
      p.readme = readme;
      this.renderChannelReadme(p);
      alert('说明书保存成功！下次进入本通道即可一眼全览。');
    } else {
      alert(res.message);
    }
  },

  // 渲染该项目绑定的续费/资产
  renderChannelRenewals(p) {
    const listEl = document.getElementById('channelRenewalsList');
    if (!listEl) return;

    // 优先通过 project_id 精确绑定，其次兼顾包含项目名称或代号的续费项
    const pId = Number(p.id);
    const pName = (p.name || '').toLowerCase();
    const pCode = (p.code || '').toLowerCase();
    const matched = (this.state.renewals || []).filter(r => {
      if (r.project_id && Number(r.project_id) === pId) return true;
      const rName = (r.name || '').toLowerCase();
      const rNote = (r.account_note || '').toLowerCase();
      return rName.includes(pName) || (pCode && rName.includes(pCode)) || rNote.includes(pName);
    });

    if (matched.length === 0) {
      listEl.innerHTML = `
        <div style="font-size:12.5px;color:var(--text-muted);padding:10px 0">
          该站点目前暂无独立关联的临期域名或专属服务器资产。如需统筹，可在【资产续费雷达】中选择关联本项目。
        </div>
      `;
      return;
    }

    listEl.innerHTML = matched.map(r => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light)">
        <div>
          <span style="font-weight:600">${r.name}</span>
          <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${r.provider || ''} · 到期日: ${r.expire_date}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge-status ${r.status_level === 'danger' ? 'danger' : (r.status_level === 'warning' ? 'warning' : 'normal')}">剩 ${r.days_left} 天</span>
          ${r.renew_url ? `<a href="${this.formatUrl(r.renew_url)}" target="_blank" class="btn btn-sm btn-secondary">去官网续费 ↗</a>` : ''}
          <button class="btn btn-sm btn-primary" onclick="App.openRenewModal(${r.id})">更新/转报销</button>
        </div>
      </div>
    `).join('');
  },

  getLinkTypeIcon(type) {
    switch (type) {
      case 'site': return '🌐';
      case 'admin': return '⚙️';
      case 'server': return '🖥️';
      case 'repo': return '📦';
      case 'analytics': return '📊';
      default: return '🔗';
    }
  },

  // ---------------- 3. 到期续费预警与一键转报销 ----------------
  async loadRenewals() {
    try {
      const [resRen, resComp, resProj] = await Promise.all([
        fetch('api.php?action=get_renewals').then(r => r.json()),
        this.state.companies.length === 0 ? fetch('api.php?action=get_companies').then(r => r.json()) : Promise.resolve({ success: true, data: this.state.companies }),
        this.state.projects.length === 0 ? fetch('api.php?action=get_projects').then(r => r.json()) : Promise.resolve({ success: true, data: this.state.projects })
      ]);
      if (resComp && resComp.success && resComp.data) {
        this.state.companies = resComp.data;
      }
      if (resProj && resProj.success && resProj.data) {
        this.state.projects = resProj.data;
      }
      this.updateCompanyDropdowns();

      if (!resRen.success) return;
      this.state.renewals = resRen.data || [];
      this.renderRenewals();
    } catch (e) {
      console.error(e);
    }
  },

  // 筛选：按资产类型
  filterRenewalsByCategory(cat) {
    this.state.selectedRenewalCategory = cat;
    document.querySelectorAll('.renewal-cat-btn').forEach(btn => {
      btn.className = (btn.dataset.cat === cat) ? 'btn btn-sm btn-primary renewal-cat-btn' : 'btn btn-sm btn-secondary renewal-cat-btn';
    });
    this.renderRenewals();
  },

  // 筛选：按生命周期状态 (全部/紧急/预警/正常/已逾期)
  filterRenewalsByStatus(status) {
    this.state.selectedRenewalStatus = status;
    const select = document.getElementById('renewalStatusFilterSelect');
    if (select) select.value = status;
    this.renderRenewals();
  },

  // 筛选：按归属公司主体
  filterRenewalsByCompany(companyId) {
    this.state.selectedRenewalCompany = companyId;
    this.renderRenewals();
  },

  // 筛选：按关键词搜索
  filterRenewalsByQuery(q) {
    this.state.renewalSearchQuery = (q || '').trim().toLowerCase();
    this.renderRenewals();
  },

  renderRenewals() {
    const tbody = document.getElementById('renewalsTableBody');
    if (!tbody) return;

    const allRenewals = this.state.renewals || [];

    // 1. 统计大盘核心 KPI 指标
    const urgentCount = allRenewals.filter(r => r.status_level === 'danger' || (r.days_left >= 0 && r.days_left <= 7)).length;
    const warningCount = allRenewals.filter(r => r.status_level === 'warning' || (r.days_left > 7 && r.days_left <= 30)).length;
    const totalCount = allRenewals.length;
    const totalCost = allRenewals.reduce((sum, r) => sum + parseFloat(r.cost || 0), 0);

    const urgentEl = document.getElementById('radarUrgentCount');
    if (urgentEl) urgentEl.innerText = urgentCount;
    const warningEl = document.getElementById('radarWarningCount');
    if (warningEl) warningEl.innerText = warningCount;
    const totalEl = document.getElementById('radarTotalCount');
    if (totalEl) totalEl.innerText = totalCount;
    const costEl = document.getElementById('radarTotalCost');
    if (costEl) costEl.innerText = '￥' + totalCost.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 2. 统计各分类按钮数量
    const catCounts = { all: allRenewals.length, domain: 0, server: 0, ssl: 0, saas: 0, other: 0 };
    allRenewals.forEach(r => {
      const c = r.category || 'other';
      if (catCounts[c] !== undefined) catCounts[c]++;
      else catCounts.other++;
    });
    const setCatText = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.innerText = count;
    };
    setCatText('radarCatCountAll', catCounts.all);
    setCatText('radarCatCountDomain', catCounts.domain);
    setCatText('radarCatCountServer', catCounts.server);
    setCatText('radarCatCountSsl', catCounts.ssl);
    setCatText('radarCatCountSaas', catCounts.saas);
    setCatText('radarCatCountOther', catCounts.other);

    // 3. 多维筛选过滤 (分类 + 紧急度 + 公司 + 搜索)
    let filtered = allRenewals;
    if (this.state.selectedRenewalCategory && this.state.selectedRenewalCategory !== 'all') {
      filtered = filtered.filter(r => (r.category || 'other') === this.state.selectedRenewalCategory);
    }
    if (this.state.selectedRenewalStatus && this.state.selectedRenewalStatus !== 'all') {
      const st = this.state.selectedRenewalStatus;
      if (st === 'danger') {
        filtered = filtered.filter(r => r.status_level === 'danger' || (r.days_left >= 0 && r.days_left <= 7));
      } else if (st === 'warning') {
        filtered = filtered.filter(r => r.status_level === 'warning' || (r.days_left > 7 && r.days_left <= 30));
      } else if (st === 'normal') {
        filtered = filtered.filter(r => r.status_level === 'normal' || r.days_left > 30);
      } else if (st === 'expired') {
        filtered = filtered.filter(r => r.status_level === 'expired' || r.days_left < 0);
      }
    }
    if (this.state.selectedRenewalCompany && this.state.selectedRenewalCompany !== 'all') {
      filtered = filtered.filter(r => String(r.company_id) === String(this.state.selectedRenewalCompany));
    }
    if (this.state.renewalSearchQuery) {
      const q = this.state.renewalSearchQuery;
      filtered = filtered.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) || 
        (r.provider && r.provider.toLowerCase().includes(q)) ||
        (r.account_note && r.account_note.toLowerCase().includes(q)) ||
        (r.company_name && r.company_name.toLowerCase().includes(q)) ||
        (r.project_name && r.project_name.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:36px;color:var(--text-muted)">未找到符合条件的资产记录，可尝试切换筛选条件或点击【+ 新增续费资产】。</td></tr>`;
      return;
    }

    // 类别映射
    const categoryMap = {
      domain: { label: '域名', icon: '🌐', badge: 'normal' },
      server: { label: '云服务器', icon: '🖥️', badge: 'warning' },
      ssl: { label: 'SSL证书', icon: '🔒', badge: 'normal' },
      saas: { label: 'SaaS软件', icon: '💼', badge: 'normal' },
      other: { label: '其他到期', icon: '📦', badge: 'normal' }
    };

    tbody.innerHTML = filtered.map(r => {
      let badgeClass = 'normal';
      let statusText = `🟢 剩 ${r.days_left} 天`;
      if (r.days_left < 0 || r.status_level === 'expired') {
        badgeClass = 'danger';
        statusText = `⚫ 已过期 (${Math.abs(r.days_left)}天前)`;
      } else if (r.days_left <= 7 || r.status_level === 'danger') {
        badgeClass = 'danger';
        statusText = `🚨 仅剩 ${r.days_left} 天 (急迫)`;
      } else if (r.days_left <= 30 || r.status_level === 'warning') {
        badgeClass = 'warning';
        statusText = `⚠️ 剩 ${r.days_left} 天 (临期)`;
      }

      const catMeta = categoryMap[r.category] || categoryMap.other;

      // 归属主体与关联项目
      let compHtml = '';
      if (r.company_short_name) {
        compHtml = `<span class="badge-company color-${r.company_color || 'blue'}" title="${r.company_name}">🏢 ${r.company_short_name}</span>`;
      }
      let projHtml = '';
      if (r.project_name) {
        projHtml = `<span class="badge-status normal" style="font-size:11px;padding:2px 6px" title="关联网站: ${r.project_name}">🌐 ${r.project_name}</span>`;
      }
      const ownerHtml = (compHtml || projHtml) 
        ? `<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start">${compHtml}${projHtml}</div>`
        : `<span style="font-size:11.5px;color:var(--text-muted)">通用/未绑定</span>`;

      return `
        <tr id="renewalRow_${r.id}">
          <td>
            <div style="font-weight:600;font-size:13.5px;color:var(--text-main)">${r.name}</div>
            ${r.account_note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:3px"><span>🔑</span><span>${r.account_note}</span></div>` : ''}
          </td>
          <td>${ownerHtml}</td>
          <td>
            <span class="badge-status normal" style="font-size:11.5px">${catMeta.icon} ${catMeta.label}</span>
          </td>
          <td>
            <span style="font-size:12.5px;font-weight:500;color:var(--text-main)">${r.provider || '-'}</span>
          </td>
          <td>
            <div style="font-size:12.5px;font-family:monospace">${r.expire_date}</div>
          </td>
          <td>
            <span class="badge-status ${badgeClass}" style="font-weight:600">${statusText}</span>
          </td>
          <td>
            <strong style="font-size:13px;color:var(--text-main)">￥${parseFloat(r.cost || 0).toFixed(2)}</strong>
          </td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:4px;align-items:center">
              ${r.renew_url ? `<a href="${this.formatUrl(r.renew_url)}" target="_blank" class="btn btn-sm btn-secondary" title="官网控制台直达缴费">直达 ↗</a>` : ''}
              <button class="btn btn-sm btn-primary" onclick="App.openRenewModal(${r.id})" title="续费并一键生成个人垫资报销单">续期/转报销</button>
              <button class="btn btn-sm btn-secondary" onclick="App.openEditRenewalModal(${r.id})" title="修改资产信息">✎</button>
              <button type="button" class="btn btn-sm btn-danger renewal-del-btn" onclick="App.quickDeleteRenewal(${r.id}, this)" title="双击确认快速删除">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ---------------- 4. 垫资与报销管家 ----------------
  async loadReimbursements() {
    try {
      const res = await fetch('api.php?action=get_reimbursements').then(r => r.json());
      if (!res.success) return;
      this.state.reimbursements = res.data;
      this.renderReimbursements();
    } catch (e) {
      console.error(e);
    }
  },

  renderReimbursements() {
    const container = document.getElementById('reimbContainer');
    if (!container) return;

    if (this.state.reimbursements.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:var(--text-muted)">暂无个人垫资记录。手机随时拍照上传发票，告别自掏腰包漏报销！</div>`;
      return;
    }

    container.innerHTML = this.state.reimbursements.map(rm => {
      let statusBadge = '<span class="badge-status danger">待提报</span>';
      if (rm.status === 'submitted') statusBadge = '<span class="badge-status warning">审批中</span>';
      if (rm.status === 'done') statusBadge = '<span class="badge-status normal">已到账</span>';

      return `
        <div class="reimb-card">
          <div class="reimb-card-top">
            <div>
              <div style="font-weight:600;font-size:15px">${rm.title}</div>
              <div style="font-size:12px;color:var(--text-muted)">${rm.pay_date} · ${rm.pay_method}</div>
            </div>
            <div class="reimb-amount">￥${parseFloat(rm.amount).toFixed(2)}</div>
          </div>

          ${rm.invoice_img ? `
            <img src="${rm.invoice_img}" class="reimb-thumb" onclick="window.open('${rm.invoice_img}', '_blank')" alt="发票凭证" title="点击放大查看原图">
          ` : `
            <div style="height:60px;background:var(--bg-subtle);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:12px">暂未上传发票凭证</div>
          `}

          <div style="font-size:12px;color:var(--text-secondary)">${rm.remark || '无备注'}</div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--border-light)">
            <div>${statusBadge}</div>
            <div style="display:flex;gap:6px">
              <select class="form-control" style="width:auto;padding:3px 6px;font-size:11.5px" onchange="App.changeReimbStatus(${rm.id}, this.value)">
                <option value="pending" ${rm.status === 'pending' ? 'selected' : ''}>标记: 待提报</option>
                <option value="submitted" ${rm.status === 'submitted' ? 'selected' : ''}>标记: 审批中</option>
                <option value="done" ${rm.status === 'done' ? 'selected' : ''}>标记: 已到账</option>
              </select>
              <button class="btn btn-sm btn-danger" onclick="App.deleteReimb(${rm.id})">删除</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async changeReimbStatus(id, newStatus) {
    await fetch('api.php?action=update_reimbursement_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    this.loadReimbursements();
  },

  async deleteReimb(id) {
    if (!confirm('确认删除该笔垫资报销记录？')) return;
    await fetch('api.php?action=delete_reimbursement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    this.loadReimbursements();
  },

  // ---------------- 5. 待办与长远事务 ----------------
  async loadTasks() {
    this.loadQuickPortals();
    try {
      const res = await fetch('api.php?action=get_tasks').then(r => r.json());
      if (!res.success) return;
      this.state.tasks = res.data;
      this.renderTasks();
    } catch (e) {
      console.error(e);
    }
  },

  // ---------------- 高频业务快速通道 ----------------
  async loadQuickPortals() {
    try {
      const res = await fetch('api.php?action=get_quick_portals').then(r => r.json());
      if (!res.success) return;
      this.state.quickPortals = res.data || [];
      this.renderQuickPortals();
    } catch (e) {
      console.error(e);
    }
  },

  filterPortalsByCategory(cat) {
    this.state.selectedPortalCategory = cat;
    this.renderQuickPortals();
  },

  renderQuickPortals() {
    const gridEl = document.getElementById('quickPortalsGrid');
    const filterEl = document.getElementById('portalCategoryFilter');
    if (!gridEl) return;

    const portals = this.state.quickPortals || [];

    // 渲染极简分类胶囊 (仅当分类较多时展示，保持克制)
    if (filterEl) {
      const categories = ['all'];
      portals.forEach(p => {
        const c = p.category ? p.category.trim() : '';
        if (c && !categories.includes(c)) categories.push(c);
      });

      if (!categories.includes(this.state.selectedPortalCategory)) {
        this.state.selectedPortalCategory = 'all';
      }

      if (categories.length > 2) {
        filterEl.style.display = 'flex';
        filterEl.innerHTML = categories.map(cat => {
          const isActive = this.state.selectedPortalCategory === cat;
          const label = cat === 'all' ? '全部' : cat;
          return `<button class="portal-pill-btn ${isActive ? 'active' : ''}" onclick="App.filterPortalsByCategory('${cat}')">${label}</button>`;
        }).join('');
      } else {
        filterEl.style.display = 'none';
        filterEl.innerHTML = '';
      }
    }

    // 筛选卡片
    const filtered = this.state.selectedPortalCategory === 'all' 
      ? portals 
      : portals.filter(p => (p.category || '常用业务') === this.state.selectedPortalCategory);

    if (filtered.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 14px 10px; color: var(--text-muted); font-size: 12px;">
          暂无通道，点击右上角「+ 添加」即可快速建立！
        </div>
      `;
      return;
    }

    gridEl.innerHTML = filtered.map(p => {
      const icon = p.icon || '⚡';
      const url = this.formatUrl(p.url);
      const note = p.account_note ? p.account_note.trim() : '';

      return `
        <div class="portal-chip-item">
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="portal-chip-link" title="${p.title}${note ? ' · ' + note : ''}">
            <span class="portal-chip-icon">${icon}</span>
            <div class="portal-chip-text">
              <span class="portal-chip-name">${p.title}</span>
              ${note ? `<span class="portal-chip-hint">${note}</span>` : ''}
            </div>
          </a>
          <button class="portal-chip-edit-btn" onclick="event.preventDefault(); event.stopPropagation(); App.openEditPortalModal(${p.id})" title="编辑此通道">⚙️</button>
        </div>
      `;
    }).join('');
  },

  openAddPortalModal() {
    document.getElementById('portalModalId').value = '';
    document.getElementById('portalModalTitleText').innerText = '新增快速业务通道';
    document.getElementById('portalModalIcon').value = '⚡';
    document.getElementById('portalModalTitle').value = '';
    document.getElementById('portalModalUrl').value = '';
    document.getElementById('portalModalCategory').value = '外贸拓客';
    document.getElementById('portalModalSort').value = '0';
    document.getElementById('portalModalNote').value = '';
    const delBtn = document.getElementById('portalModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';

    document.getElementById('portalModal').style.display = 'flex';
  },

  openEditPortalModal(id) {
    const p = (this.state.quickPortals || []).find(x => x.id === id);
    if (!p) return;

    document.getElementById('portalModalId').value = p.id;
    document.getElementById('portalModalTitleText').innerText = '编辑快速通道';
    document.getElementById('portalModalIcon').value = p.icon || '⚡';
    document.getElementById('portalModalTitle').value = p.title || '';
    document.getElementById('portalModalUrl').value = p.url || '';
    document.getElementById('portalModalCategory').value = p.category || '外贸拓客';
    document.getElementById('portalModalSort').value = p.sort_order || 0;
    document.getElementById('portalModalNote').value = p.account_note || '';
    const delBtn = document.getElementById('portalModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'block';

    document.getElementById('portalModal').style.display = 'flex';
  },

  async savePortalItem() {
    const id = document.getElementById('portalModalId').value;
    const title = document.getElementById('portalModalTitle').value.trim();
    const url = document.getElementById('portalModalUrl').value.trim();
    const icon = document.getElementById('portalModalIcon').value.trim() || '⚡';
    const category = document.getElementById('portalModalCategory').value.trim() || '常用业务';
    const sortOrder = parseInt(document.getElementById('portalModalSort').value, 10) || 0;
    const accountNote = document.getElementById('portalModalNote').value.trim();

    if (!title || !url) {
      alert('请填写通道名称与跳转网址！');
      return;
    }

    try {
      const res = await fetch('api.php?action=save_quick_portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          url,
          icon,
          category,
          sort_order: sortOrder,
          account_note: accountNote
        })
      }).then(r => r.json());

      if (res.success) {
        this.closeAllModals();
        this.loadQuickPortals();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert('保存失败: ' + e.message);
    }
  },

  async deletePortal(id) {
    if (!confirm('确定要移除此快速通道吗？')) return;
    try {
      const res = await fetch('api.php?action=delete_quick_portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).then(r => r.json());

      if (res.success) {
        this.loadQuickPortals();
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert('删除失败: ' + e.message);
    }
  },

  async deletePortalFromModal() {
    const id = document.getElementById('portalModalId').value;
    if (!id) return;
    await this.deletePortal(parseInt(id, 10));
    this.closeAllModals();
  },

  renderTasks() {
    const dailyListEl = document.getElementById('tasksDailyList');
    const milestoneListEl = document.getElementById('tasksMilestoneList');
    if (!dailyListEl || !milestoneListEl) return;

    const dailyTasks = this.state.tasks.filter(t => t.category === 'daily');
    const milestoneTasks = this.state.tasks.filter(t => t.category === 'milestone');

    dailyListEl.innerHTML = dailyTasks.length === 0 ? `<div style="color:var(--text-muted);font-size:13px">今日无日常待办</div>` :
      dailyTasks.map(t => `
        <div class="task-item ${t.status === 'done' ? 'is-done' : ''}">
          <div class="task-checkbox-wrap">
            <input type="checkbox" class="task-checkbox" ${t.status === 'done' ? 'checked' : ''} onchange="App.toggleTask(${t.id})">
            <div>
              <div class="task-title" style="font-weight:500">${t.title}</div>
              ${t.note ? `<div style="font-size:12px;color:var(--text-muted)">${t.note}</div>` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge-status ${t.priority === 'high' ? 'danger' : 'warning'}">${t.priority === 'high' ? '高优' : '日常'}</span>
            <button class="btn btn-sm btn-secondary" onclick="App.deleteTask(${t.id})">✕</button>
          </div>
        </div>
      `).join('');

    milestoneListEl.innerHTML = milestoneTasks.length === 0 ? `<div style="color:var(--text-muted);font-size:13px">暂无长期里程碑项目</div>` :
      milestoneTasks.map(t => `
        <div class="task-item" style="flex-direction:column;align-items:stretch;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600">${t.title}</div>
              <div style="font-size:12px;color:var(--text-muted)">截止目标: ${t.due_date || '长期推进'}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-weight:700;font-size:14px">${t.progress}%</span>
              <button class="btn btn-sm btn-secondary" onclick="App.deleteTask(${t.id})">✕</button>
            </div>
          </div>
          <input type="range" min="0" max="100" value="${t.progress}" style="width:100%;cursor:pointer" onchange="App.updateTaskProgress(${t.id}, this.value)">
          ${t.note ? `<div style="font-size:12px;color:var(--text-secondary);background:var(--bg-subtle);padding:6px;border-radius:4px">${t.note}</div>` : ''}
        </div>
      `).join('');
  },

  async toggleTask(id) {
    await fetch('api.php?action=toggle_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    this.loadTasks();
    if (this.state.currentTab === 'dashboard') {
      this.loadDashboard();
    }
  },

  async updateTaskProgress(id, progress) {
    const t = this.state.tasks.find(x => x.id === id);
    if (!t) return;
    t.progress = parseInt(progress);
    await fetch('api.php?action=save_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    });
    this.renderTasks();
  },

  async deleteTask(id) {
    await fetch('api.php?action=delete_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    this.loadTasks();
  },

  // ---------------- 6. AI 知识库与智能协同 ----------------
  async loadKnowledge() {
    try {
      const res = await fetch('api.php?action=get_knowledge').then(r => r.json());
      if (!res.success) return;
      this.state.knowledgeDocs = res.data;
      this.renderKnowledgeSidebar();
    } catch (e) {
      console.error(e);
    }
  },

  renderKnowledgeSidebar() {
    const listEl = document.getElementById('kbDocsList');
    if (!listEl) return;

    if (this.state.knowledgeDocs.length === 0) {
      listEl.innerHTML = `<div style="font-size:12px;color:var(--text-muted);padding:10px">知识库暂无文档</div>`;
      return;
    }

    listEl.innerHTML = this.state.knowledgeDocs.map((doc, idx) => `
      <div class="kb-doc-item ${this.state.selectedDoc && this.state.selectedDoc.id === doc.id ? 'active' : ''}" onclick="App.selectKbDoc(${doc.id})">
        <div>
          <div style="font-weight:500">${doc.title}</div>
          <div style="font-size:11px;color:var(--text-muted)">${doc.category}</div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); App.deleteKbDoc(${doc.id})">✕</button>
      </div>
    `).join('');
  },

  selectKbDoc(id) {
    const doc = this.state.knowledgeDocs.find(d => d.id === id);
    if (!doc) return;
    this.state.selectedDoc = doc;
    this.renderKnowledgeSidebar();

    // 填充到编辑器
    document.getElementById('kbEditId').value = doc.id;
    document.getElementById('kbEditTitle').value = doc.title;
    document.getElementById('kbEditCategory').value = doc.category;
    document.getElementById('kbEditTags').value = doc.tags || '';
    document.getElementById('kbEditContent').value = doc.content || '';
  },

  resetKbForm() {
    this.state.selectedDoc = null;
    this.renderKnowledgeSidebar();
    document.getElementById('kbEditId').value = '';
    document.getElementById('kbEditTitle').value = '';
    document.getElementById('kbEditCategory').value = '业务SOP';
    document.getElementById('kbEditTags').value = '';
    document.getElementById('kbEditContent').value = '';
  },

  async saveKbDoc() {
    const id = document.getElementById('kbEditId').value;
    const title = document.getElementById('kbEditTitle').value.trim();
    const category = document.getElementById('kbEditCategory').value.trim();
    const tags = document.getElementById('kbEditTags').value.trim();
    const content = document.getElementById('kbEditContent').value.trim();

    if (!title) {
      alert('请输入文档标题');
      return;
    }

    const res = await fetch('api.php?action=save_knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, category, tags, content })
    }).then(r => r.json());

    if (res.success) {
      alert('文档已保存到知识库');
      this.loadKnowledge();
    } else {
      alert(res.message);
    }
  },

  async deleteKbDoc(id) {
    if (!confirm('确认删除该篇知识库文档？')) return;
    await fetch('api.php?action=delete_knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    this.resetKbForm();
    this.loadKnowledge();
  },

  // AI 发送指令/提问
  async sendAiMessage(mode = 'chat') {
    const inputEl = document.getElementById('aiPromptInput');
    const prompt = inputEl.value.trim();
    if (!prompt && mode === 'chat') {
      alert('请输入要咨询或让 AI 处理的内容');
      return;
    }

    const messagesList = document.getElementById('aiMessagesList');
    
    // 显示用户提问气泡
    if (prompt) {
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.innerText = prompt;
      messagesList.appendChild(userBubble);
      inputEl.value = '';
    }

    // AI 思考中占位气泡
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    aiBubble.innerText = '🤖 思考中...';
    messagesList.appendChild(aiBubble);
    messagesList.scrollTop = messagesList.scrollHeight;

    try {
      const res = await fetch('ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          prompt: prompt,
          history: this.state.aiChatHistory
        })
      }).then(r => r.json());

      if (res.success) {
        aiBubble.innerText = res.data.reply;
        this.state.aiChatHistory.push({ role: 'user', content: prompt });
        this.state.aiChatHistory.push({ role: 'assistant', content: res.data.reply });

        // 如果是拆解任务模式，尝试自动解析 JSON 添加任务
        if (mode === 'parse_task') {
          this.handleAiTasksParse(res.data.reply);
        }
      } else {
        aiBubble.innerText = '❌ ' + res.message;
      }
    } catch (e) {
      aiBubble.innerText = '❌ 请求异常: ' + e.message;
    }
    messagesList.scrollTop = messagesList.scrollHeight;
  },

  // 处理 AI 自动拆解任务的响应
  async handleAiTasksParse(replyText) {
    try {
      const jsonMatch = replyText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tasks = JSON.parse(jsonMatch[0]);
        for (const t of tasks) {
          await fetch('api.php?action=save_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t)
          });
        }
        alert(`已成功由 AI 提炼并创建了 ${tasks.length} 项待办任务！`);
      }
    } catch (e) {
      console.log('AI 未返回标准 JSON 数组，已直接呈现文本供参考');
    }
  },

  // ---------------- 7. 全局 Ctrl+K 搜索 (Command Palette) ----------------
  openSearchModal() {
    this.state.searchOpen = true;
    document.getElementById('searchModal').style.display = 'flex';
    const input = document.getElementById('searchBoxInput');
    input.value = '';
    input.focus();
    this.renderSearchResults('');
  },

  closeSearchModal() {
    this.state.searchOpen = false;
    document.getElementById('searchModal').style.display = 'none';
  },

  renderSearchResults(query) {
    const resultsEl = document.getElementById('searchResultsList');
    if (!resultsEl) return;
    const q = query.toLowerCase().trim();

    // 收集各模块结果
    const results = [];

    // 搜索项目及链接
    (this.state.projects || []).forEach(p => {
      if (p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))) {
        results.push({ type: '项目', title: p.name, desc: p.description, action: () => { App.switchTab('projects'); App.closeSearchModal(); } });
      }
      (p.links || []).forEach(l => {
        if (l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)) {
          results.push({ type: '快捷直达', title: `${p.name} ➔ ${l.title}`, desc: l.url, action: () => { window.open(this.formatUrl(l.url), '_blank'); App.closeSearchModal(); } });
        }
      });
    });

    // 搜索续费项
    (this.state.renewals || []).forEach(r => {
      if (r.name.toLowerCase().includes(q) || (r.provider && r.provider.toLowerCase().includes(q))) {
        results.push({ type: '资产续费', title: r.name, desc: `到期: ${r.expire_date} · 剩 ${r.days_left} 天`, action: () => { App.switchTab('renewals'); App.closeSearchModal(); } });
      }
    });

    // 搜索知识库
    (this.state.knowledgeDocs || []).forEach(k => {
      if (k.title.toLowerCase().includes(q) || (k.tags && k.tags.toLowerCase().includes(q))) {
        results.push({ type: '知识库', title: k.title, desc: k.category, action: () => { App.switchTab('knowledge'); App.selectKbDoc(k.id); App.closeSearchModal(); } });
      }
    });

    // 搜索快速通道 (如 1688、国际站、邮箱等直达)
    (this.state.quickPortals || []).forEach(p => {
      const title = p.title || '';
      const cat = p.category || '';
      const note = p.account_note || '';
      const url = p.url || '';
      if (title.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || note.toLowerCase().includes(q) || url.toLowerCase().includes(q)) {
        results.push({
          type: '快速通道',
          title: `${p.icon || '⚡'} ${p.title} · ${cat}`,
          desc: note ? `${note} · ${url}` : url,
          action: () => { window.open(this.formatUrl(p.url), '_blank'); App.closeSearchModal(); }
        });
      }
    });

    if (results.length === 0) {
      resultsEl.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted)">无匹配结果</div>`;
      return;
    }

    resultsEl.innerHTML = results.slice(0, 8).map((item, idx) => `
      <div class="search-result-item" style="padding:10px 14px;border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light)" onclick="App.triggerSearchResult(${idx})">
        <div>
          <div style="font-weight:600;font-size:13.5px">${item.title}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${item.desc || ''}</div>
        </div>
        <span class="badge-status normal">${item.type}</span>
      </div>
    `).join('');

    this.state.currentSearchResults = results;
  },

  triggerSearchResult(index) {
    if (this.state.currentSearchResults && this.state.currentSearchResults[index]) {
      this.state.currentSearchResults[index].action();
    }
  },

  // ---------------- 模态框与弹窗管理 ----------------
  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
  },

  // 打开【续费并一键转垫资报销】弹窗（核心联动功能）
  openRenewModal(renewalId) {
    const r = this.state.renewals.find(x => x.id === renewalId);
    if (!r) return;

    document.getElementById('renewModalId').value = r.id;
    document.getElementById('renewModalName').innerText = r.name;
    document.getElementById('renewModalOldExpire').innerText = r.expire_date;
    
    // 默认新到期日加 1 年
    const d = new Date(r.expire_date);
    d.setFullYear(d.getFullYear() + 1);
    document.getElementById('renewModalNewDate').value = d.toISOString().split('T')[0];
    document.getElementById('renewModalAmount').value = r.cost || '';
    document.getElementById('renewModalAutoReimb').checked = true;
    document.getElementById('renewModalInvoiceUrl').value = '';
    document.getElementById('renewInvoicePreview').style.display = 'none';

    document.getElementById('renewModal').style.display = 'flex';
  },

  async submitRenewAndReimburse() {
    const renewalId = document.getElementById('renewModalId').value;
    const newExpireDate = document.getElementById('renewModalNewDate').value;
    const doReimburse = document.getElementById('renewModalAutoReimb').checked;
    const amount = document.getElementById('renewModalAmount').value;
    const payMethod = document.getElementById('renewModalPayMethod').value;
    const invoiceImg = document.getElementById('renewModalInvoiceUrl').value;
    const remark = document.getElementById('renewModalRemark').value;

    const res = await fetch('api.php?action=renew_and_reimburse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        renewal_id: renewalId,
        new_expire_date: newExpireDate,
        do_reimburse: doReimburse,
        amount: amount,
        pay_method: payMethod,
        invoice_img: invoiceImg,
        remark: remark
      })
    }).then(r => r.json());

    if (res.success) {
      alert(res.message);
      this.closeAllModals();
      this.loadRenewals();
      if (this.state.currentTab === 'dashboard') this.loadDashboard();
    } else {
      alert(res.message);
    }
  },

  // 上传发票凭证处理
  async handleFileUpload(fileInput, targetUrlInputId, previewImgId) {
    if (!fileInput.files || fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('api.php?action=upload_file', {
      method: 'POST',
      body: formData
    }).then(r => r.json());

    if (res.success) {
      document.getElementById(targetUrlInputId).value = res.data.url;
      const preview = document.getElementById(previewImgId);
      if (preview) {
        preview.src = res.data.url;
        preview.style.display = 'block';
      }
      alert('凭证已上传成功');
    } else {
      alert('上传失败: ' + res.message);
    }
  },

  // 打开新增项目弹窗
  openAddProjectModal() {
    this.updateCompanyDropdowns();
    document.getElementById('projModalId').value = '';
    document.getElementById('projModalName').value = '';
    document.getElementById('projModalCode').value = '';
    document.getElementById('projModalCompanyId').value = (this.state.selectedCompanyFilter !== 'all' ? this.state.selectedCompanyFilter : '0');
    document.getElementById('projModalCategory').value = '核心官网';
    document.getElementById('projModalDesc').value = '';
    const sslDateInput = document.getElementById('projModalSslDate');
    if (sslDateInput) sslDateInput.value = '';
    const titleText = document.getElementById('projModalTitleText');
    if (titleText) titleText.innerText = '新增网站项目';
    const delBtn = document.getElementById('projModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';
    const linksSection = document.getElementById('projModalLinksSection');
    if (linksSection) linksSection.style.display = 'none';
    document.getElementById('projectModal').style.display = 'flex';
  },

  openEditProjectModal(id) {
    this.updateCompanyDropdowns();
    const p = this.state.projects.find(x => String(x.id) === String(id));
    if (!p) {
      console.warn('未找到项目，id:', id, this.state.projects);
      return;
    }
    document.getElementById('projModalId').value = p.id;
    document.getElementById('projModalName').value = p.name || '';
    document.getElementById('projModalCode').value = p.code || '';
    document.getElementById('projModalCompanyId').value = p.company_id || '0';
    document.getElementById('projModalCategory').value = p.category || '核心官网';
    document.getElementById('projModalDesc').value = p.description || '';
    const sslDateInput = document.getElementById('projModalSslDate');
    if (sslDateInput) sslDateInput.value = p.ssl_expire_date || '';
    const titleText = document.getElementById('projModalTitleText');
    if (titleText) titleText.innerText = '网站设置 (' + p.name + ')';
    const delBtn = document.getElementById('projModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'inline-flex';

    // 渲染网站设置弹窗内的入口列表
    const linksSection = document.getElementById('projModalLinksSection');
    if (linksSection) linksSection.style.display = 'block';
    this.renderProjectModalLinks(p);

    document.getElementById('projectModal').style.display = 'flex';
  },

  // 网页内优雅 Toast 提示 (永不被浏览器拦截)
  showToast(message, type = 'success') {
    let toast = document.getElementById('globalAppToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalAppToast';
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;padding:9px 18px;border-radius:6px;font-size:13.5px;font-weight:600;box-shadow:0 8px 16px rgba(0,0,0,0.12);transition:all 0.25s ease;opacity:0;pointer-events:none;display:flex;align-items:center;gap:8px;';
      document.body.appendChild(toast);
    }
    toast.innerText = (type === 'success' ? '✅ ' : '❌ ') + message;
    toast.style.backgroundColor = (type === 'success' ? '#EDF3EC' : '#FBEBEB');
    toast.style.color = (type === 'success' ? '#448361' : '#BE3838');
    toast.style.border = (type === 'success' ? '1px solid rgba(68,131,97,0.3)' : '1px solid rgba(190,56,56,0.3)');
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(4px)';

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 2400);
  },

  // 彻底删除项目 (双击防误触确认，100% 免疫浏览器原生弹窗屏蔽)
  async deleteProject(btnEl) {
    const id = document.getElementById('projModalId').value;
    if (!id) {
      this.showToast('无法获取项目ID', 'error');
      return;
    }

    const btn = btnEl || document.getElementById('projModalDeleteBtn');
    if (btn && btn.dataset.confirming !== 'true') {
      btn.dataset.confirming = 'true';
      btn.dataset.originText = btn.innerText;
      btn.innerText = '⚠️ 再次点击确认删除整个项目！';
      btn.style.backgroundColor = '#BE3838';
      btn.style.color = '#FFF';
      clearTimeout(btn._timer);
      btn._timer = setTimeout(() => {
        btn.dataset.confirming = 'false';
        btn.innerText = btn.dataset.originText || '删除此项目';
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 3500);
      return;
    }

    try {
      const res = await fetch(`api.php?action=delete_project&id=${Number(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      }).then(r => r.json());

      if (res.success) {
        this.closeAllModals();
        this.backToProjectsOverview();
        await this.loadProjects();
        this.showToast('项目及其全部入口已彻底删除！');
      } else {
        this.showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      this.showToast('网络请求异常: ' + e.message, 'error');
    }
  },

  // 渲染网站设置弹窗内的直达入口列表
  renderProjectModalLinks(p) {
    const listEl = document.getElementById('projModalLinksList');
    const countEl = document.getElementById('projModalLinksCount');
    if (!listEl) return;
    const links = p.links || [];
    if (countEl) countEl.innerText = links.length;

    if (links.length === 0) {
      listEl.innerHTML = `<div style="font-size:12px;color:var(--text-muted);padding:8px 10px;background:var(--bg-subtle);border-radius:4px">暂未配置任何入口，点击上方【+ 添加入口】添加。</div>`;
      return;
    }

    listEl.innerHTML = links.map(link => `
      <div id="modalLinkRow_${link.id}" style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:var(--bg-subtle);border-radius:4px;border:1px solid var(--border-light)">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px;font-size:12.5px">
          <span style="font-weight:600">${this.getLinkTypeIcon(link.type)} ${link.title}</span>
          <span style="font-size:11px;color:var(--text-muted);margin-left:6px">${link.url}</span>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          <button type="button" class="btn btn-sm btn-secondary" style="padding:2px 6px;font-size:11px" onclick="App.openEditLinkModal(${link.id}, ${p.id})">✎ 编辑</button>
          <button type="button" class="btn btn-sm btn-danger link-del-btn" style="padding:2px 6px;font-size:11px" onclick="App.quickDeleteLink(${link.id}, ${p.id}, this)">🗑️ 删除</button>
        </div>
      </div>
    `).join('');
  },

  // 在网站设置中一键秒删入口 (免原生弹窗，双击确认)
  async quickDeleteLink(linkId, projectId, btnEl) {
    if (btnEl && btnEl.dataset.confirming !== 'true') {
      btnEl.dataset.confirming = 'true';
      btnEl.innerText = '⚠️ 确定删?';
      btnEl.style.backgroundColor = '#BE3838';
      btnEl.style.color = '#FFF';
      clearTimeout(btnEl._timer);
      btnEl._timer = setTimeout(() => {
        btnEl.dataset.confirming = 'false';
        btnEl.innerText = '🗑️ 删除';
        btnEl.style.backgroundColor = '';
        btnEl.style.color = '';
      }, 3000);
      return;
    }

    try {
      const res = await fetch(`api.php?action=delete_link&id=${Number(linkId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(linkId) })
      }).then(r => r.json());

      if (res.success) {
        // DOM 立即移除该行，体验极为丝滑
        const row = document.getElementById(`modalLinkRow_${linkId}`);
        if (row) row.remove();

        const p = this.state.projects.find(x => String(x.id) === String(projectId));
        if (p) {
          p.links = (p.links || []).filter(l => String(l.id) !== String(linkId));
          const countEl = document.getElementById('projModalLinksCount');
          if (countEl) countEl.innerText = p.links.length;
        }

        // 重新刷新背景列表
        this.loadProjects();
        this.showToast('直达入口已成功删除！');
      } else {
        this.showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      this.showToast('请求异常: ' + e.message, 'error');
    }
  },

  async saveProject() {
    const id = document.getElementById('projModalId').value;
    const companyId = document.getElementById('projModalCompanyId') ? document.getElementById('projModalCompanyId').value : 0;
    const name = document.getElementById('projModalName').value.trim();
    const code = document.getElementById('projModalCode').value.trim();
    const category = document.getElementById('projModalCategory').value;
    const description = document.getElementById('projModalDesc').value.trim();
    const sslExpireDate = document.getElementById('projModalSslDate') ? document.getElementById('projModalSslDate').value.trim() : '';

    if (!name) { this.showToast('请输入项目名称', 'error'); return; }

    const res = await fetch('api.php?action=save_project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id ? Number(id) : 0, company_id: Number(companyId), name, code, category, description, ssl_expire_date: sslExpireDate })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      await this.loadProjects();
      this.showToast('项目资料已保存！');
    } else {
      this.showToast(res.message, 'error');
    }
  },

  // 打开添加链接弹窗
  openAddLinkModal(projectId) {
    document.getElementById('linkModalId').value = '';
    document.getElementById('linkModalProjectId').value = projectId;
    document.getElementById('linkModalTitle').value = '';
    document.getElementById('linkModalUrl').value = '';
    document.getElementById('linkModalType').value = 'site';
    document.getElementById('linkModalNote').value = '';
    const titleText = document.getElementById('linkModalTitleText');
    if (titleText) titleText.innerText = '添加直达跳转入口';
    const delBtn = document.getElementById('linkModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';
    document.getElementById('linkModal').style.display = 'flex';
  },

  // 打开修改链接弹窗
  openEditLinkModal(linkId, projectId) {
    const p = this.state.projects.find(x => String(x.id) === String(projectId));
    if (!p) {
      console.warn('未找到父项目，projectId:', projectId);
      return;
    }
    const link = (p.links || []).find(l => String(l.id) === String(linkId));
    if (!link) {
      console.warn('未找到链接，linkId:', linkId);
      return;
    }

    document.getElementById('linkModalId').value = link.id;
    document.getElementById('linkModalProjectId').value = p.id;
    document.getElementById('linkModalTitle').value = link.title || '';
    document.getElementById('linkModalUrl').value = link.url || '';
    document.getElementById('linkModalType').value = link.type || 'site';
    document.getElementById('linkModalNote').value = link.account_note || '';

    const titleText = document.getElementById('linkModalTitleText');
    if (titleText) titleText.innerText = '修改直达跳转入口';
    const delBtn = document.getElementById('linkModalDeleteBtn');
    if (delBtn) {
      delBtn.style.display = 'inline-flex';
      delBtn.dataset.confirming = 'false';
      delBtn.innerText = '删除此入口';
      delBtn.style.backgroundColor = '';
      delBtn.style.color = '';
    }
    document.getElementById('linkModal').style.display = 'flex';
  },

  // 单独入口编辑弹窗中的删除操作 (双击确认)
  async deleteLink(btnEl) {
    const id = document.getElementById('linkModalId').value;
    if (!id) {
      this.showToast('无法获取入口ID', 'error');
      return;
    }

    const btn = btnEl || document.getElementById('linkModalDeleteBtn');
    if (btn && btn.dataset.confirming !== 'true') {
      btn.dataset.confirming = 'true';
      btn.innerText = '⚠️ 再次点击确认删除！';
      btn.style.backgroundColor = '#BE3838';
      btn.style.color = '#FFF';
      clearTimeout(btn._timer);
      btn._timer = setTimeout(() => {
        btn.dataset.confirming = 'false';
        btn.innerText = '删除此入口';
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 3000);
      return;
    }

    try {
      const res = await fetch(`api.php?action=delete_link&id=${Number(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      }).then(r => r.json());

      if (res.success) {
        this.closeAllModals();
        await this.loadProjects();
        this.showToast('该直达入口已彻底删除！');
      } else {
        this.showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      this.showToast('请求异常: ' + e.message, 'error');
    }
  },

  async saveLink() {
    const id = document.getElementById('linkModalId').value;
    const projectId = document.getElementById('linkModalProjectId').value;
    const title = document.getElementById('linkModalTitle').value.trim();
    let url = document.getElementById('linkModalUrl').value.trim();
    const type = document.getElementById('linkModalType').value;
    const accountNote = document.getElementById('linkModalNote').value.trim();

    if (!title || !url) { alert('请输入标题和网址'); return; }
    url = this.formatUrl(url);

    const res = await fetch('api.php?action=save_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id ? Number(id) : 0, project_id: Number(projectId), title, url, type, account_note: accountNote })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      this.loadProjects();
    } else {
      alert(res.message);
    }
  },

  // 打开记一笔垫资弹窗
  openAddReimbModal() {
    document.getElementById('reimbModalId').value = '';
    document.getElementById('reimbModalTitle').value = '';
    document.getElementById('reimbModalAmount').value = '';
    document.getElementById('reimbModalDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('reimbModalMethod').value = '微信支付';
    document.getElementById('reimbModalInvoiceUrl').value = '';
    document.getElementById('reimbModalRemark').value = '';
    document.getElementById('reimbInvoicePreview').style.display = 'none';
    document.getElementById('reimbModal').style.display = 'flex';
  },

  async saveReimbursement() {
    const id = document.getElementById('reimbModalId').value;
    const title = document.getElementById('reimbModalTitle').value.trim();
    const amount = document.getElementById('reimbModalAmount').value;
    const payDate = document.getElementById('reimbModalDate').value;
    const payMethod = document.getElementById('reimbModalMethod').value;
    const invoiceImg = document.getElementById('reimbModalInvoiceUrl').value;
    const remark = document.getElementById('reimbModalRemark').value.trim();

    if (!title || !amount) { alert('请填写事项名称与金额'); return; }

    const res = await fetch('api.php?action=save_reimbursement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, amount, pay_date: payDate, pay_method: payMethod, invoice_img: invoiceImg, remark })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      this.loadReimbursements();
      if (this.state.currentTab === 'dashboard') this.loadDashboard();
    } else {
      alert(res.message);
    }
  },

  // 续费项弹窗 - 新增
  openAddRenewalModal() {
    document.getElementById('renewalEditId').value = '';
    document.getElementById('renewalEditName').value = '';
    document.getElementById('renewalEditCategory').value = 'domain';
    document.getElementById('renewalEditProvider').value = '';
    document.getElementById('renewalEditExpireDate').value = '';
    if (document.getElementById('renewalEditRemindDays')) document.getElementById('renewalEditRemindDays').value = '30';
    document.getElementById('renewalEditCost').value = '';
    document.getElementById('renewalEditUrl').value = '';
    document.getElementById('renewalEditNote').value = '';
    
    this.updateCompanyDropdowns();
    if (document.getElementById('renewalEditCompanyId')) document.getElementById('renewalEditCompanyId').value = '0';
    if (document.getElementById('renewalEditProjectId')) document.getElementById('renewalEditProjectId').value = '0';

    const titleText = document.getElementById('renewalModalTitleText');
    if (titleText) titleText.innerText = '新增续费资产 (Renewal Radar)';
    const delBtn = document.getElementById('renewalModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';

    document.getElementById('renewalModal').style.display = 'flex';
  },

  // 续费项弹窗 - 编辑
  openEditRenewalModal(id) {
    const r = this.state.renewals.find(x => x.id === id);
    if (!r) return;

    this.updateCompanyDropdowns();

    document.getElementById('renewalEditId').value = r.id;
    document.getElementById('renewalEditName').value = r.name || '';
    document.getElementById('renewalEditCategory').value = r.category || 'domain';
    document.getElementById('renewalEditProvider').value = r.provider || '';
    document.getElementById('renewalEditExpireDate').value = r.expire_date || '';
    if (document.getElementById('renewalEditRemindDays')) {
      document.getElementById('renewalEditRemindDays').value = String(r.remind_days || 30);
    }
    document.getElementById('renewalEditCost').value = r.cost || '';
    document.getElementById('renewalEditUrl').value = r.renew_url || '';
    document.getElementById('renewalEditNote').value = r.account_note || '';

    if (document.getElementById('renewalEditCompanyId')) {
      document.getElementById('renewalEditCompanyId').value = String(r.company_id || 0);
    }
    if (document.getElementById('renewalEditProjectId')) {
      document.getElementById('renewalEditProjectId').value = String(r.project_id || 0);
    }

    const titleText = document.getElementById('renewalModalTitleText');
    if (titleText) titleText.innerText = `维护续费资产 (${r.name})`;

    const delBtn = document.getElementById('renewalModalDeleteBtn');
    if (delBtn) {
      delBtn.style.display = 'inline-flex';
      delBtn.dataset.confirming = 'false';
      delBtn.innerText = '删除此资产';
      delBtn.style.backgroundColor = '';
      delBtn.style.color = '';
    }

    document.getElementById('renewalModal').style.display = 'flex';
  },

  // 保存资产
  async saveRenewalItem() {
    const id = document.getElementById('renewalEditId').value;
    const name = document.getElementById('renewalEditName').value.trim();
    const companyId = document.getElementById('renewalEditCompanyId') ? document.getElementById('renewalEditCompanyId').value : 0;
    const projectId = document.getElementById('renewalEditProjectId') ? document.getElementById('renewalEditProjectId').value : 0;
    const category = document.getElementById('renewalEditCategory').value;
    const provider = document.getElementById('renewalEditProvider').value.trim();
    const expireDate = document.getElementById('renewalEditExpireDate').value;
    const remindDays = document.getElementById('renewalEditRemindDays') ? document.getElementById('renewalEditRemindDays').value : 30;
    const cost = document.getElementById('renewalEditCost').value;
    let renewUrl = document.getElementById('renewalEditUrl').value.trim();
    if (renewUrl) renewUrl = this.formatUrl(renewUrl);
    const accountNote = document.getElementById('renewalEditNote').value.trim();

    if (!name || !expireDate) { 
      this.showToast('请填写资产名称与到期日期', 'error'); 
      return; 
    }

    const res = await fetch('api.php?action=save_renewal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: id ? Number(id) : 0, 
        company_id: Number(companyId),
        project_id: Number(projectId),
        name, 
        category, 
        provider, 
        expire_date: expireDate, 
        remind_days: Number(remindDays),
        cost, 
        renew_url: renewUrl, 
        account_note: accountNote 
      })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      await this.loadRenewals();
      if (this.state.currentTab === 'dashboard') this.loadDashboard();
      this.showToast('资产续费项已成功保存！');
    } else {
      this.showToast(res.message || '保存失败', 'error');
    }
  },

  // 弹窗内的删除资产 (带双击确认保护)
  async deleteRenewal(btnEl) {
    const id = document.getElementById('renewalEditId').value;
    if (!id) return;

    const btn = btnEl || document.getElementById('renewalModalDeleteBtn');
    if (btn && btn.dataset.confirming !== 'true') {
      btn.dataset.confirming = 'true';
      btn.dataset.originText = btn.innerText;
      btn.innerText = '⚠️ 再次点击确认彻底删除此资产！';
      btn.style.backgroundColor = '#BE3838';
      btn.style.color = '#FFF';
      clearTimeout(btn._timer);
      btn._timer = setTimeout(() => {
        btn.dataset.confirming = 'false';
        btn.innerText = btn.dataset.originText || '删除此资产';
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 3500);
      return;
    }

    try {
      const res = await fetch(`api.php?action=delete_renewal&id=${Number(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      }).then(r => r.json());

      if (res.success) {
        this.closeAllModals();
        await this.loadRenewals();
        if (this.state.currentTab === 'dashboard') this.loadDashboard();
        this.showToast('资产已成功删除！');
      } else {
        this.showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      this.showToast('请求异常: ' + e.message, 'error');
    }
  },

  // 表格行内的快速删除资产 (带双击确认保护)
  async quickDeleteRenewal(id, btnEl) {
    if (btnEl && btnEl.dataset.confirming !== 'true') {
      btnEl.dataset.confirming = 'true';
      btnEl.innerText = '⚠️ 确定删?';
      btnEl.style.backgroundColor = '#BE3838';
      btnEl.style.color = '#FFF';
      clearTimeout(btnEl._timer);
      btnEl._timer = setTimeout(() => {
        btnEl.dataset.confirming = 'false';
        btnEl.innerText = '🗑️';
        btnEl.style.backgroundColor = '';
        btnEl.style.color = '';
      }, 3000);
      return;
    }

    try {
      const res = await fetch(`api.php?action=delete_renewal&id=${Number(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      }).then(r => r.json());

      if (res.success) {
        const row = document.getElementById(`renewalRow_${id}`);
        if (row) row.remove();
        await this.loadRenewals();
        if (this.state.currentTab === 'dashboard') this.loadDashboard();
        this.showToast('资产已成功删除！');
      } else {
        this.showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      this.showToast('请求异常: ' + e.message, 'error');
    }
  },

  // 任务弹窗
  openAddTaskModal(category = 'daily') {
    document.getElementById('taskEditCategory').value = category;
    document.getElementById('taskEditTitle').value = '';
    document.getElementById('taskEditPriority').value = 'medium';
    document.getElementById('taskEditDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('taskEditNote').value = '';
    document.getElementById('taskModal').style.display = 'flex';
  },

  async saveTaskItem() {
    const category = document.getElementById('taskEditCategory').value;
    const title = document.getElementById('taskEditTitle').value.trim();
    const priority = document.getElementById('taskEditPriority').value;
    const dueDate = document.getElementById('taskEditDate').value;
    const note = document.getElementById('taskEditNote').value.trim();

    if (!title) { alert('请输入任务内容'); return; }

    const res = await fetch('api.php?action=save_task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title, priority, due_date: dueDate, note })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      this.loadTasks();
    } else {
      alert(res.message);
    }
  },

  // ---------------- 8. 公司主体管理 (Multi-Entity) ----------------
  async loadCompanies() {
    try {
      const res = await fetch('api.php?action=get_companies').then(r => r.json());
      if (!res.success) return;
      this.state.companies = res.data || [];
      this.renderCompanies();
      this.updateCompanyDropdowns();
    } catch (e) {
      console.error(e);
    }
  },

  renderCompanies() {
    const tbody = document.getElementById('companiesTableBody');
    if (!tbody) return;

    if (!this.state.companies || this.state.companies.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:36px;color:var(--text-muted)">暂无公司主体，点击右上角【+ 新增公司主体】录入营业执照开票信息。</td></tr>`;
      return;
    }

    tbody.innerHTML = this.state.companies.map(c => {
      const color = c.color || 'blue';
      return `
        <tr>
          <td>
            <span class="badge-company color-${color}">🏢 ${c.short_name}</span>
            ${c.remark ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px">${c.remark}</div>` : ''}
          </td>
          <td>
            <div style="font-weight:600;font-size:13.5px;color:var(--text-main)">${c.name}</div>
            <div style="font-size:11.5px;color:var(--text-secondary);margin-top:2px">${c.address_phone || '未填写地址电话'}</div>
          </td>
          <td>
            <code style="font-size:12px;user-select:all;cursor:copy" title="点击复制税号" onclick="App.copyText('${c.tax_number || ''}', '税号已复制')">${c.tax_number || '未登记'}</code>
          </td>
          <td>
            <div style="font-size:12.5px;font-weight:500">${c.bank_name || '未登记银行'}</div>
            <code style="font-size:11.5px;color:var(--text-muted);user-select:all;cursor:copy" title="点击复制账号" onclick="App.copyText('${c.bank_account || ''}', '银行账号已复制')">${c.bank_account || '-'}</code>
          </td>
          <td>
            <div style="font-size:12px">
              <span style="font-weight:600">${c.project_count || 0}</span> 个纳管网站
            </div>
            <div style="font-size:11.5px;color:var(--tag-orange-text);margin-top:2px">
              待报销: ￥${(c.pending_reimb_amount || 0).toFixed(2)}
            </div>
          </td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:6px">
              <button class="btn btn-sm btn-secondary" onclick="App.copyCompanyFullInvoice(${c.id})" title="复制全部开票信息">📋 复制抬头</button>
              <button class="btn btn-sm btn-primary" onclick="App.openEditCompanyModal(${c.id})">编辑</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddCompanyModal() {
    document.getElementById('companyModalId').value = '';
    document.getElementById('companyModalName').value = '';
    document.getElementById('companyModalShortName').value = '';
    document.getElementById('companyModalColor').value = 'blue';
    document.getElementById('companyModalTaxNumber').value = '';
    document.getElementById('companyModalBankName').value = '';
    document.getElementById('companyModalBankAccount').value = '';
    document.getElementById('companyModalAddressPhone').value = '';
    document.getElementById('companyModalRemark').value = '';
    const titleText = document.getElementById('companyModalTitleText');
    if (titleText) titleText.innerText = '新增公司主体';
    const delBtn = document.getElementById('companyModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';
    document.getElementById('companyModal').style.display = 'flex';
  },

  openEditCompanyModal(id) {
    const c = this.state.companies.find(x => String(x.id) === String(id));
    if (!c) return;

    document.getElementById('companyModalId').value = c.id;
    document.getElementById('companyModalName').value = c.name || '';
    document.getElementById('companyModalShortName').value = c.short_name || '';
    document.getElementById('companyModalColor').value = c.color || 'blue';
    document.getElementById('companyModalTaxNumber').value = c.tax_number || '';
    document.getElementById('companyModalBankName').value = c.bank_name || '';
    document.getElementById('companyModalBankAccount').value = c.bank_account || '';
    document.getElementById('companyModalAddressPhone').value = c.address_phone || '';
    document.getElementById('companyModalRemark').value = c.remark || '';
    const titleText = document.getElementById('companyModalTitleText');
    if (titleText) titleText.innerText = '维护公司主体 (' + c.short_name + ')';
    const delBtn = document.getElementById('companyModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'inline-flex';
    document.getElementById('companyModal').style.display = 'flex';
  },

  async saveCompany() {
    const id = document.getElementById('companyModalId').value;
    const name = document.getElementById('companyModalName').value.trim();
    const short_name = document.getElementById('companyModalShortName').value.trim();
    const color = document.getElementById('companyModalColor').value;
    const tax_number = document.getElementById('companyModalTaxNumber').value.trim();
    const bank_name = document.getElementById('companyModalBankName').value.trim();
    const bank_account = document.getElementById('companyModalBankAccount').value.trim();
    const address_phone = document.getElementById('companyModalAddressPhone').value.trim();
    const remark = document.getElementById('companyModalRemark').value.trim();

    if (!name) { this.showToast('公司全称不能为空', 'error'); return; }

    const res = await fetch('api.php?action=save_company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id ? Number(id) : 0, name, short_name, color, tax_number, bank_name, bank_account, address_phone, remark })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      await this.loadCompanies();
      if (this.state.currentTab === 'projects') await this.loadProjects();
      this.showToast('公司主体资料已成功保存！');
    } else {
      this.showToast(res.message || '保存失败', 'error');
    }
  },

  async deleteCompany(btnEl) {
    const id = document.getElementById('companyModalId').value;
    if (!id) return;

    const btn = btnEl || document.getElementById('companyModalDeleteBtn');
    if (btn && btn.dataset.confirming !== 'true') {
      btn.dataset.confirming = 'true';
      btn.dataset.originText = btn.innerText;
      btn.innerText = '⚠️ 再次点击确认删除该主体？';
      btn.style.backgroundColor = '#BE3838';
      btn.style.color = '#FFF';
      clearTimeout(btn._timer);
      btn._timer = setTimeout(() => {
        btn.dataset.confirming = 'false';
        btn.innerText = btn.dataset.originText || '删除此公司';
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 3500);
      return;
    }

    try {
      const res = await fetch(`api.php?action=delete_company&id=${Number(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      }).then(r => r.json());

      if (res.success) {
        this.closeAllModals();
        await this.loadCompanies();
        if (this.state.currentTab === 'projects') await this.loadProjects();
        this.showToast('公司主体已成功移除！');
      } else {
        this.showToast(res.message || '删除失败', 'error');
      }
    } catch (e) {
      this.showToast('请求异常: ' + e.message, 'error');
    }
  },

  // 1-Click 快捷复制公司开票完整信息 (可在项目通道直接点击)
  copyCurrentProjectCompanyInvoice() {
    const curP = this.state.projects.find(x => String(x.id) === String(this.state.currentChannelProjectId));
    if (!curP || !curP.company_name) {
      this.showToast('当前项目暂无绑定的公司主体', 'error');
      return;
    }
    const info = `【发票抬头】${curP.company_name}
【税号】${curP.company_tax_number || '无'}
【开户银行】${curP.company_bank_name || '无'}
【银行账号】${curP.company_bank_account || '无'}
【地址电话】${curP.company_address_phone || '无'}`;
    this.copyText(info, `已复制【${curP.company_short_name || curP.company_name}】开票信息！`);
  },

  copyCompanyFullInvoice(companyId) {
    const c = this.state.companies.find(x => String(x.id) === String(companyId));
    if (!c) return;
    const info = `【发票抬头】${c.name}
【税号】${c.tax_number || '无'}
【开户银行】${c.bank_name || '无'}
【银行账号】${c.bank_account || '无'}
【地址电话】${c.address_phone || '无'}`;
    this.copyText(info, `已复制【${c.short_name}】开票信息！`);
  },

  copyText(text, successMsg = '已复制到剪贴板') {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(successMsg);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast(successMsg);
    });
  },

  // ---------------- 9. 系统与配置 ----------------
  async loadConfigSettings() {
    const res = await fetch('api.php?action=get_config').then(r => r.json());
    if (res.success) {
      const cfg = res.data;
      document.getElementById('cfgAppTitle').value = cfg.app_title || '';
      document.getElementById('cfgAiBaseUrl').value = cfg.ai_base_url || '';
      document.getElementById('cfgAiModel').value = cfg.ai_model || '';
      document.getElementById('cfgAiPrompt').value = cfg.ai_system_prompt || '';
      document.getElementById('cfgAiKeyStatus').innerText = cfg.has_ai_key ? '✅ 已配置 API Key' : '⚠️ 尚未配置 API Key';
    }
  },

  async saveConfigSettings() {
    const appTitle = document.getElementById('cfgAppTitle').value.trim();
    const aiBaseUrl = document.getElementById('cfgAiBaseUrl').value.trim();
    const aiModel = document.getElementById('cfgAiModel').value.trim();
    const aiKey = document.getElementById('cfgAiKey').value.trim();
    const aiPrompt = document.getElementById('cfgAiPrompt').value.trim();
    const password = document.getElementById('cfgPassword').value.trim();

    const payload = {
      app_title: appTitle,
      ai_base_url: aiBaseUrl,
      ai_model: aiModel,
      ai_system_prompt: aiPrompt
    };
    if (aiKey) payload.ai_api_key = aiKey;
    if (password) payload.access_password = password;

    const res = await fetch('api.php?action=save_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      alert('系统设置已保存');
      document.getElementById('brandTitle').innerText = appTitle;
      this.loadConfigSettings();
    } else {
      alert(res.message);
    }
  },

  showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
  },

  async submitLogin() {
    const password = document.getElementById('loginPasswordInput').value;
    const res = await fetch('api.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    }).then(r => r.json());

    if (res.success) {
      document.getElementById('loginModal').style.display = 'none';
      this.init();
    } else {
      alert('密码错误');
    }
  }
};

// 页面加载就绪后启动
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
