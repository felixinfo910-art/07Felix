export const PortalsModule = {
  async loadQuickPortals() {
    try {
      const res = await fetch('api.php?action=get_quick_portals').then(r => r.json());
      if (!res.success) return;
      this.state.quickPortals = res.data || [];
      this.renderQuickPortals();
      this.renderPortalsTable('settingsPortalsTableBody');
      this.renderPortalsTable('managePortalsTableBody');
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
      const hasCred = p.has_password || p.login_account;
      const keyBadge = hasCred ? `<span class="credential-key-badge" title="已配置加密安全凭据">🔑</span>` : '';

      return `
        <div class="portal-chip-item">
          <a href="${url}" class="portal-chip-link" onclick="event.preventDefault(); App.launchTarget('portal', ${p.id}, '${url}')" title="${p.title}${note ? ' · ' + note : ''}">
            <span class="portal-chip-icon">${icon}</span>
            <div class="portal-chip-text">
              <span class="portal-chip-name" style="display:flex;align-items:center">${p.title} ${keyBadge}</span>
              ${note ? `<span class="portal-chip-hint">${note}</span>` : ''}
            </div>
          </a>
          <button class="portal-chip-edit-btn" onclick="event.preventDefault(); event.stopPropagation(); App.openEditPortalModal('${p.id}')" title="设置/修改此通道与凭据">⚙️</button>
        </div>
      `;
    }).join('');
  },

  // 渲染设置面板及综合管理弹窗中的直达表格
  renderPortalsTable(tbodyId = 'settingsPortalsTableBody') {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const portals = this.state.quickPortals || [];
    if (portals.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">暂无常用直达通道，点击右上角【+ 新增直达通道】快速创建。</td></tr>`;
      return;
    }

    tbody.innerHTML = portals.map(p => {
      const icon = p.icon || '⚡';
      const url = this.formatUrl(p.url);
      const hasCred = p.has_password || p.login_account;
      const credTag = hasCred 
        ? `<span class="badge-status normal" style="font-size:11px">🔑 已加密</span>` 
        : `<span style="font-size:11px;color:var(--text-muted)">无凭据</span>`;

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:16px">${icon}</span>
              <span style="font-weight:600;font-size:13px">${p.title}</span>
            </div>
            ${p.account_note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px">${p.account_note}</div>` : ''}
          </td>
          <td>
            <span class="badge" style="background:var(--bg-subtle);font-size:11px;border:1px solid var(--border-light)">${p.category || '常用业务'}</span>
          </td>
          <td>
            <a href="${url}" target="_blank" style="font-size:12px;color:var(--primary-color);word-break:break-all">${url} ↗</a>
          </td>
          <td>${credTag}</td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:6px">
              <button class="btn btn-sm btn-secondary" style="font-size:11px;padding:2px 7px" onclick="App.openEditPortalModal('${p.id}')">✎ 修改</button>
              <button class="btn btn-sm btn-danger" style="font-size:11px;padding:2px 7px" onclick="App.deletePortal('${p.id}')">🗑️ 删除</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openManagePortalsModal() {
    this.renderPortalsTable('managePortalsTableBody');
    document.getElementById('managePortalsModal').style.display = 'flex';
  },

  openAddPortalModal() {
    document.getElementById('portalModalId').value = '';
    document.getElementById('portalModalTitleText').innerText = '新增常用直达通道';
    document.getElementById('portalModalIcon').value = '⚡';
    document.getElementById('portalModalTitle').value = '';
    document.getElementById('portalModalUrl').value = '';
    document.getElementById('portalModalCategory').value = '常用业务';
    document.getElementById('portalModalSort').value = '0';
    document.getElementById('portalModalNote').value = '';

    // 重置凭据区域
    document.getElementById('portalModalLoginAccount').value = '';
    document.getElementById('portalModalLoginPassword').value = '';
    document.getElementById('portalModalAutoLoginType').value = 'copy_and_jump';
    document.getElementById('portalModalPostTargetUrl').value = '';
    document.getElementById('portalModalPostTargetGroup').style.display = 'none';
    document.getElementById('portalModalPassStatusBadge').style.display = 'none';
    document.getElementById('portalModalClearPassWrap').style.display = 'none';
    document.getElementById('portalModalClearPass').checked = false;

    const delBtn = document.getElementById('portalModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';

    document.getElementById('portalModal').style.display = 'flex';
  },

  openEditPortalModal(id) {
    const p = (this.state.quickPortals || []).find(x => String(x.id) === String(id));
    if (!p) {
      console.warn('未找到指定快速通道，ID:', id);
      return;
    }

    document.getElementById('portalModalId').value = p.id;
    document.getElementById('portalModalTitleText').innerText = '设置修改直达通道 (' + p.title + ')';
    document.getElementById('portalModalIcon').value = p.icon || '⚡';
    document.getElementById('portalModalTitle').value = p.title || '';
    document.getElementById('portalModalUrl').value = p.url || '';
    document.getElementById('portalModalCategory').value = p.category || '常用业务';
    document.getElementById('portalModalSort').value = p.sort_order || 0;
    document.getElementById('portalModalNote').value = p.account_note || '';

    // 填充凭据区域
    document.getElementById('portalModalLoginAccount').value = p.login_account || '';
    document.getElementById('portalModalLoginPassword').value = '';
    document.getElementById('portalModalAutoLoginType').value = p.auto_login_type || 'copy_and_jump';
    document.getElementById('portalModalPostTargetUrl').value = p.post_target_url || '';
    document.getElementById('portalModalPostTargetGroup').style.display = (p.auto_login_type === 'post_submit' ? 'block' : 'none');
    document.getElementById('portalModalPassStatusBadge').style.display = (p.has_password ? 'inline-block' : 'none');
    document.getElementById('portalModalClearPassWrap').style.display = (p.has_password ? 'block' : 'none');
    document.getElementById('portalModalClearPass').checked = false;

    const delBtn = document.getElementById('portalModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'inline-flex';

    document.getElementById('portalModal').style.display = 'flex';
  },

  async savePortalItem() {
    const id = document.getElementById('portalModalId').value;
    const title = document.getElementById('portalModalTitle').value.trim();
    let url = document.getElementById('portalModalUrl').value.trim();
    const icon = document.getElementById('portalModalIcon').value.trim() || '⚡';
    const category = document.getElementById('portalModalCategory').value.trim() || '常用业务';
    const sortOrder = parseInt(document.getElementById('portalModalSort').value, 10) || 0;
    const accountNote = document.getElementById('portalModalNote').value.trim();

    const loginAccount = document.getElementById('portalModalLoginAccount').value.trim();
    const loginPassword = document.getElementById('portalModalLoginPassword').value;
    const autoLoginType = document.getElementById('portalModalAutoLoginType').value;
    const postTargetUrl = document.getElementById('portalModalPostTargetUrl').value.trim();
    const clearPassword = document.getElementById('portalModalClearPass').checked;

    if (!title || !url) {
      alert('请填写通道名称与跳转网址！');
      return;
    }
    url = this.formatUrl(url);

    try {
      const payload = {
        id: id ? Number(id) : 0,
        title,
        url,
        icon,
        category,
        sort_order: sortOrder,
        account_note: accountNote,
        login_account: loginAccount,
        auto_login_type: autoLoginType,
        post_target_url: postTargetUrl,
        clear_password: clearPassword ? 1 : 0
      };
      if (loginPassword) {
        payload.login_password = loginPassword;
      }

      const res = await fetch('api.php?action=save_quick_portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        const pModal = document.getElementById('portalModal');
        if (pModal) pModal.style.display = 'none';

        await this.loadQuickPortals();
        this.showToast('常用直达已保存成功！');
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert('保存失败: ' + e.message);
    }
  },

  async deletePortal(id) {
    if (!confirm('确定要移除此快速直达通道吗？')) return;
    try {
      const res = await fetch('api.php?action=delete_quick_portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(id) })
      }).then(r => r.json());

      if (res.success) {
        await this.loadQuickPortals();
        this.showToast('该直达通道已成功移除！');
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
    await this.deletePortal(Number(id));
    const pModal = document.getElementById('portalModal');
    if (pModal) pModal.style.display = 'none';
  },

};
