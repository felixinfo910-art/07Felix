export const ModalsModule = {
  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
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

    // 重置凭据区域
    document.getElementById('linkModalLoginAccount').value = '';
    document.getElementById('linkModalLoginPassword').value = '';
    document.getElementById('linkModalAutoLoginType').value = 'copy_and_jump';
    document.getElementById('linkModalPostTargetUrl').value = '';
    document.getElementById('linkModalPostTargetGroup').style.display = 'none';
    document.getElementById('linkModalPassStatusBadge').style.display = 'none';
    document.getElementById('linkModalClearPassWrap').style.display = 'none';
    document.getElementById('linkModalClearPass').checked = false;

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

    // 填充凭据区域
    document.getElementById('linkModalLoginAccount').value = link.login_account || '';
    document.getElementById('linkModalLoginPassword').value = '';
    document.getElementById('linkModalAutoLoginType').value = link.auto_login_type || 'copy_and_jump';
    document.getElementById('linkModalPostTargetUrl').value = link.post_target_url || '';
    document.getElementById('linkModalPostTargetGroup').style.display = (link.auto_login_type === 'post_submit' ? 'block' : 'none');
    document.getElementById('linkModalPassStatusBadge').style.display = (link.has_password ? 'inline-block' : 'none');
    document.getElementById('linkModalClearPassWrap').style.display = (link.has_password ? 'block' : 'none');
    document.getElementById('linkModalClearPass').checked = false;

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

    const loginAccount = document.getElementById('linkModalLoginAccount').value.trim();
    const loginPassword = document.getElementById('linkModalLoginPassword').value;
    const autoLoginType = document.getElementById('linkModalAutoLoginType').value;
    const postTargetUrl = document.getElementById('linkModalPostTargetUrl').value.trim();
    const clearPassword = document.getElementById('linkModalClearPass').checked;

    if (!title || !url) { alert('请输入标题和网址'); return; }
    url = this.formatUrl(url);

    const payload = {
      id: id ? Number(id) : 0,
      project_id: Number(projectId),
      title,
      url,
      type,
      account_note: accountNote,
      login_account: loginAccount,
      auto_login_type: autoLoginType,
      post_target_url: postTargetUrl,
      clear_password: clearPassword ? 1 : 0
    };
    if (loginPassword) {
      payload.login_password = loginPassword;
    }

    const res = await fetch('api.php?action=save_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      this.loadProjects();
      this.showToast('直达入口已安全保存');
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
    
    // 默认到期日设为明年今日
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    document.getElementById('renewalEditExpireDate').value = nextYear.toISOString().split('T')[0];
    
    if (document.getElementById('renewalEditRemindDays')) document.getElementById('renewalEditRemindDays').value = '30';
    document.getElementById('renewalEditCost').value = '';
    document.getElementById('renewalEditUrl').value = '';
    document.getElementById('renewalEditNote').value = '';
    
    this.updateCompanyDropdowns();
    if (document.getElementById('renewalEditCompanyId')) document.getElementById('renewalEditCompanyId').value = '0';
    if (document.getElementById('renewalEditProjectId')) document.getElementById('renewalEditProjectId').value = '0';

    if (document.getElementById('renewalLoginAccount')) document.getElementById('renewalLoginAccount').value = '';
    if (document.getElementById('renewalLoginPassword')) document.getElementById('renewalLoginPassword').value = '';
    if (document.getElementById('renewalClearPassword')) document.getElementById('renewalClearPassword').checked = false;
    if (document.getElementById('renewalAutoLoginType')) document.getElementById('renewalAutoLoginType').value = 'copy_and_jump';
    if (document.getElementById('renewalPostTargetUrl')) document.getElementById('renewalPostTargetUrl').value = '';
    if (document.getElementById('renewalPostTargetGroup')) document.getElementById('renewalPostTargetGroup').style.display = 'none';
    if (document.getElementById('renewalCurrentPassStatus')) {
      document.getElementById('renewalCurrentPassStatus').innerHTML = '<span style="color:var(--text-muted)">未设置安全密保</span>';
    }

    const titleText = document.getElementById('renewalModalTitleText');
    if (titleText) titleText.innerText = '➕ 新增续费资产 (Renewal Radar)';
    const delBtn = document.getElementById('renewalModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';

    document.getElementById('renewalModal').style.display = 'flex';
  },

  // 续费项快捷延期辅助函数 (+1年, +6个月, +3个月, +1个月, 今日起算+1年)
  adjustRenewalExpireDate(num, unit, fromToday = false) {
    const input = document.getElementById('renewalEditExpireDate');
    if (!input) return;
    let base = (fromToday || !input.value) ? new Date() : new Date(input.value);
    if (isNaN(base.getTime())) base = new Date();
    if (unit === 'year') {
      base.setFullYear(base.getFullYear() + num);
    } else if (unit === 'month') {
      base.setMonth(base.getMonth() + num);
    }
    input.value = base.toISOString().split('T')[0];
    this.showToast(`到期日已快速更新为: ${input.value}`);
  },

  // 移动端资产速览抽屉 (Detail Sheet: 查看为主，带快捷延期与控制台直达)
  openRenewalDetailSheet(id) {
    const r = (this.state.renewals || []).find(x => String(x.id) === String(id));
    if (!r) {
      this.showToast('未找到该资产数据，请刷新重试', 'error');
      return;
    }

    const categoryMap = {
      domain: { label: '域名', icon: '🌐' },
      server: { label: '云服务器', icon: '🖥️' },
      ssl: { label: 'SSL证书', icon: '🔒' },
      saas: { label: 'SaaS软件', icon: '💼' },
      other: { label: '其他到期', icon: '📦' }
    };
    const catMeta = categoryMap[r.category] || categoryMap.other;

    let badgeClass = 'normal';
    let statusText = `🟢 正常使用 (剩 ${r.days_left} 天)`;
    let bannerBg = 'var(--bg-subtle)';
    let bannerBorder = '1px solid var(--border-light)';

    if (r.days_left < 0 || r.status_level === 'expired') {
      badgeClass = 'danger';
      statusText = `⚫ 已过期 (${Math.abs(r.days_left)}天前)`;
      bannerBg = 'rgba(51, 51, 51, 0.08)';
      bannerBorder = '1px solid rgba(51, 51, 51, 0.2)';
    } else if (r.days_left <= 7 || r.status_level === 'danger') {
      badgeClass = 'danger';
      statusText = `🚨 紧急到期 (仅剩 ${r.days_left} 天)`;
      bannerBg = 'rgba(235, 87, 87, 0.1)';
      bannerBorder = '1px solid rgba(235, 87, 87, 0.3)';
    } else if (r.days_left <= 30 || r.status_level === 'warning') {
      badgeClass = 'warning';
      statusText = `⚠️ 临期预警 (剩 ${r.days_left} 天)`;
      bannerBg = 'rgba(242, 153, 74, 0.1)';
      bannerBorder = '1px solid rgba(242, 153, 74, 0.3)';
    }

    const catIconEl = document.getElementById('sheetCatIcon');
    if (catIconEl) catIconEl.innerText = catMeta.icon;

    const titleEl = document.getElementById('sheetTitleText');
    if (titleEl) titleEl.innerText = r.name || '资产详情';

    const bannerEl = document.getElementById('sheetStatusBanner');
    if (bannerEl) {
      bannerEl.style.background = bannerBg;
      bannerEl.style.border = bannerBorder;
    }

    const statusEl = document.getElementById('sheetStatusText');
    if (statusEl) statusEl.innerHTML = `<span class="badge-status ${badgeClass}" style="font-size:12px;padding:2px 8px">${statusText}</span>`;

    const expireEl = document.getElementById('sheetExpireDate');
    if (expireEl) expireEl.innerText = r.expire_date || '-';

    const compEl = document.getElementById('sheetCompany');
    if (compEl) {
      compEl.innerText = r.company_short_name 
        ? `${r.company_short_name}` 
        : (r.company_name || '通用/未指定');
      compEl.title = r.company_name || '';
    }

    const projEl = document.getElementById('sheetProject');
    if (projEl) projEl.innerText = r.project_name || '通用/未绑定';

    const provEl = document.getElementById('sheetProvider');
    if (provEl) provEl.innerText = r.provider || '未填写服务商';

    const costEl = document.getElementById('sheetCost');
    if (costEl) costEl.innerText = `￥${parseFloat(r.cost || 0).toFixed(2)}`;

    // 账号与安全密保展示
    const accValEl = document.getElementById('sheetAccountVal');
    if (accValEl) {
      const parts = [];
      if (r.login_account) parts.push(`<div><strong>登录账号:</strong> ${r.login_account}</div>`);
      if (r.has_password) parts.push(`<div style="color:var(--success-color)"><strong>安全密保:</strong> 🔒 已配置加密密保凭据</div>`);
      if (r.account_note) parts.push(`<div><strong>备忘说明:</strong> ${r.account_note}</div>`);
      accValEl.innerHTML = parts.length > 0 ? parts.join('') : '<span style="color:var(--text-muted)">暂无登录账号或备忘说明</span>';
    }

    const idInput = document.getElementById('sheetRenewalId');
    if (idInput) idInput.value = r.id;

    // 控制台直达按钮
    const launchWrap = document.getElementById('sheetLaunchBtnWrap');
    if (launchWrap) {
      if (r.renew_url) {
        if (r.has_password) {
          launchWrap.innerHTML = `<button type="button" class="btn btn-primary" onclick="App.launchTarget('renewal', '${r.id}', '${this.formatUrl(r.renew_url)}')">直达并快填 ↗</button>`;
        } else {
          launchWrap.innerHTML = `<a href="${this.formatUrl(r.renew_url)}" target="_blank" class="btn btn-primary">控制台直达 ↗</a>`;
        }
      } else {
        launchWrap.innerHTML = '';
      }
    }

    const sheet = document.getElementById('renewalDetailSheet');
    if (sheet) sheet.style.display = 'flex';
  },

  // 移动端抽屉快捷延期 (+1年, +6个月, +3个月, 今日起算+1年)
  async quickExtendCurrentRenewal(num, unit, fromToday = false) {
    const id = document.getElementById('sheetRenewalId') ? document.getElementById('sheetRenewalId').value : null;
    if (!id) return;
    const r = (this.state.renewals || []).find(x => String(x.id) === String(id));
    if (!r) {
      this.showToast('未找到该资产数据', 'error');
      return;
    }

    let base = (fromToday || !r.expire_date) ? new Date() : new Date(r.expire_date);
    if (isNaN(base.getTime())) base = new Date();
    if (unit === 'year') {
      base.setFullYear(base.getFullYear() + num);
    } else if (unit === 'month') {
      base.setMonth(base.getMonth() + num);
    }
    const newDate = base.toISOString().split('T')[0];

    try {
      const res = await fetch('api.php?action=save_renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Number(r.id),
          company_id: Number(r.company_id || 0),
          project_id: Number(r.project_id || 0),
          name: r.name,
          category: r.category || 'domain',
          provider: r.provider || '',
          expire_date: newDate,
          remind_days: Number(r.remind_days || 30),
          cost: parseFloat(r.cost || 0),
          renew_url: r.renew_url || '',
          account_note: r.account_note || '',
          login_account: r.login_account || '',
          clear_password: false,
          auto_login_type: r.auto_login_type || 'copy_and_jump',
          post_target_url: r.post_target_url || ''
        })
      }).then(res => res.json());

      if (res.success) {
        this.showToast(`⚡ 资产已成功延期至: ${newDate}`);
        await this.loadRenewals();
        if (this.state.currentTab === 'dashboard') this.loadDashboard();
        if (this.state.currentProjectId) this.loadProjectDetail(this.state.currentProjectId);
        this.openRenewalDetailSheet(r.id);
      } else {
        this.showToast(res.message || '延期更新失败', 'error');
      }
    } catch (e) {
      this.showToast('请求异常: ' + e.message, 'error');
    }
  },

  // 从抽屉进入完整编辑模态框
  editFromSheet() {
    const id = document.getElementById('sheetRenewalId') ? document.getElementById('sheetRenewalId').value : null;
    this.closeAllModals();
    if (id) {
      this.openEditRenewalModal(id);
    }
  },

  // 续费项弹窗 - 编辑修改
  openEditRenewalModal(id) {
    const r = (this.state.renewals || []).find(x => String(x.id) === String(id));
    if (!r) {
      this.showToast('未找到该资产数据，请刷新重试', 'error');
      return;
    }

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

    // 凭据配置
    if (document.getElementById('renewalLoginAccount')) {
      document.getElementById('renewalLoginAccount').value = r.login_account || '';
    }
    if (document.getElementById('renewalLoginPassword')) {
      document.getElementById('renewalLoginPassword').value = '';
    }
    if (document.getElementById('renewalClearPassword')) {
      document.getElementById('renewalClearPassword').checked = false;
    }
    if (document.getElementById('renewalAutoLoginType')) {
      document.getElementById('renewalAutoLoginType').value = r.auto_login_type || 'copy_and_jump';
    }
    if (document.getElementById('renewalPostTargetUrl')) {
      document.getElementById('renewalPostTargetUrl').value = r.post_target_url || '';
    }
    if (document.getElementById('renewalPostTargetGroup')) {
      document.getElementById('renewalPostTargetGroup').style.display = (r.auto_login_type === 'post_submit') ? 'block' : 'none';
    }
    if (document.getElementById('renewalCurrentPassStatus')) {
      document.getElementById('renewalCurrentPassStatus').innerHTML = r.has_password 
        ? '<span style="color:var(--success-color);font-weight:600">🔒 已配置加密密保 (留空不改)</span>' 
        : '<span style="color:var(--text-muted)">未设置安全密保</span>';
    }

    const titleText = document.getElementById('renewalModalTitleText');
    if (titleText) titleText.innerText = `✏️ 编辑维护资产: ${r.name}`;

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

  // 保存资产修改
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

    const loginAccount = document.getElementById('renewalLoginAccount') ? document.getElementById('renewalLoginAccount').value.trim() : '';
    const loginPassword = document.getElementById('renewalLoginPassword') ? document.getElementById('renewalLoginPassword').value : '';
    const clearPassword = document.getElementById('renewalClearPassword') ? document.getElementById('renewalClearPassword').checked : false;
    const autoLoginType = document.getElementById('renewalAutoLoginType') ? document.getElementById('renewalAutoLoginType').value : 'copy_and_jump';
    let postTargetUrl = document.getElementById('renewalPostTargetUrl') ? document.getElementById('renewalPostTargetUrl').value.trim() : '';
    if (postTargetUrl) postTargetUrl = this.formatUrl(postTargetUrl);

    if (!name || !expireDate) { 
      this.showToast('请填写资产名称与到期日期', 'error'); 
      return; 
    }

    try {
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
          cost: cost ? parseFloat(cost) : 0, 
          renew_url: renewUrl, 
          account_note: accountNote,
          login_account: loginAccount,
          login_password: loginPassword,
          clear_password: clearPassword,
          auto_login_type: autoLoginType,
          post_target_url: postTargetUrl
        })
      }).then(r => r.json());

      if (res.success) {
        this.closeAllModals();
        await this.loadRenewals();
        if (this.state.currentTab === 'dashboard') this.loadDashboard();
        if (this.state.currentProjectId) this.loadProjectDetail(this.state.currentProjectId);
        this.showToast(id ? '✅ 资产信息已成功更新！' : '✅ 新增资产成功！');
      } else {
        this.showToast(res.message || '保存失败', 'error');
      }
    } catch (e) {
      this.showToast('网络请求异常: ' + e.message, 'error');
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
        if (this.state.currentProjectId) this.loadProjectDetail(this.state.currentProjectId);
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
        if (this.state.currentProjectId) this.loadProjectDetail(this.state.currentProjectId);
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

};
