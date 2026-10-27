export const CompaniesModule = {
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

};
