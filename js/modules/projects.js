export const ProjectsModule = {
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
      linksWrap.innerHTML = links.map(link => {
        const url = this.formatUrl(link.url);
        const hasCred = link.has_password || link.login_account;
        const keyBadge = hasCred ? `<span class="credential-key-badge" title="已配置加密安全凭据">🔑</span>` : '';

        return `
          <div class="launcher-item-wrap">
            <a href="${url}" class="launcher-btn type-${link.type}" onclick="event.preventDefault(); App.launchTarget('link', ${link.id}, '${url}')" title="${link.account_note ? '账号备忘: ' + link.account_note : '点击直达'}">
              <span>${this.getLinkTypeIcon(link.type)}</span>
              <span>${link.title}</span>
              ${keyBadge}
              <span style="font-size:10px;opacity:0.6">↗</span>
            </a>
            <button type="button" class="launcher-edit-btn" onclick="event.preventDefault(); event.stopPropagation(); App.openEditLinkModal(${link.id}, ${p.id})" title="修改此入口网址或凭据">✎</button>
          </div>
        `;
      }).join('');
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
          <span class="renewal-title-link" onclick="App.openEditRenewalModal('${r.id}')" style="font-weight:600;cursor:pointer" title="点击编辑此资产">${r.name}</span>
          <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${r.provider || ''} · 到期日: ${r.expire_date}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span class="badge-status ${r.status_level === 'danger' ? 'danger' : (r.status_level === 'warning' ? 'warning' : 'normal')}">剩 ${r.days_left} 天</span>
          ${r.renew_url ? `<a href="${this.formatUrl(r.renew_url)}" target="_blank" class="btn btn-sm btn-secondary">去官网续费 ↗</a>` : ''}
          <button class="btn btn-sm btn-primary" onclick="App.openEditRenewalModal('${r.id}')" title="编辑修改此资产">✏️ 编辑</button>
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

};
