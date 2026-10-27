export const ReimbursementsModule = {
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

};
