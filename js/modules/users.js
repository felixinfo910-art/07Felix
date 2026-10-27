export const UsersModule = {
  async loadUsers() {
    try {
      const res = await fetch('api.php?action=get_users').then(r => r.json());
      if (!res.success) return;
      this.state.users = res.data || [];
      this.renderUsers();
    } catch (e) {
      console.error(e);
    }
  },

  renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!this.state.users || this.state.users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted)">暂无账号</td></tr>`;
      return;
    }

    tbody.innerHTML = this.state.users.map(u => {
      const isSelf = this.state.currentUser && String(this.state.currentUser.id) === String(u.id);
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-weight:600;font-size:13.5px;color:var(--text-main)">${u.username}</span>
              ${isSelf ? '<span class="badge-status normal" style="font-size:10px;padding:0 5px">当前登录</span>' : ''}
            </div>
          </td>
          <td>
            <span style="font-size:13px;color:var(--text-secondary)">${u.display_name || '管理者'}</span>
          </td>
          <td>
            <span style="font-size:12px;color:var(--text-muted)">${u.last_login || '尚未登录记录'}</span>
          </td>
          <td style="text-align:right">
            <div style="display:inline-flex;gap:6px">
              <button class="btn btn-sm btn-secondary" onclick="App.openEditUserModal(${u.id})">编辑资料/密码</button>
              ${this.state.users.length > 1 && !isSelf ? `
                <button class="btn btn-sm btn-danger" onclick="App.deleteUser(${u.id})">删除</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openAddUserModal() {
    document.getElementById('userModalId').value = '';
    document.getElementById('userModalUsername').value = '';
    document.getElementById('userModalDisplayName').value = '';
    document.getElementById('userModalPassword').value = '';
    document.getElementById('userModalPassLabel').innerText = '登录密码 * (必填)';
    document.getElementById('userModalPassword').placeholder = '输入初始登录密码';
    document.getElementById('userModalTitleText').innerText = '新增管理者账号';
    const delBtn = document.getElementById('userModalDeleteBtn');
    if (delBtn) delBtn.style.display = 'none';
    document.getElementById('userModal').style.display = 'flex';
  },

  openEditUserModal(id) {
    const u = this.state.users.find(x => String(x.id) === String(id));
    if (!u) return;

    document.getElementById('userModalId').value = u.id;
    document.getElementById('userModalUsername').value = u.username || '';
    document.getElementById('userModalDisplayName').value = u.display_name || '';
    document.getElementById('userModalPassword').value = '';
    document.getElementById('userModalPassLabel').innerText = '修改新密码 (留空则不修改)';
    document.getElementById('userModalPassword').placeholder = '留空则保持原密码不变';
    document.getElementById('userModalTitleText').innerText = '编辑账号 (' + u.username + ')';
    const delBtn = document.getElementById('userModalDeleteBtn');
    const isSelf = this.state.currentUser && String(this.state.currentUser.id) === String(u.id);
    if (delBtn) {
      delBtn.style.display = (this.state.users.length > 1 && !isSelf) ? 'inline-flex' : 'none';
    }
    document.getElementById('userModal').style.display = 'flex';
  },

  async saveUserItem() {
    const id = document.getElementById('userModalId').value;
    const username = document.getElementById('userModalUsername').value.trim();
    const displayName = document.getElementById('userModalDisplayName').value.trim();
    const password = document.getElementById('userModalPassword').value.trim();

    if (!username) { alert('登录账号为必填项'); return; }
    if (!id && !password) { alert('新建账号时初始密码不能为空'); return; }

    const res = await fetch('api.php?action=save_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        username,
        display_name: displayName,
        password
      })
    }).then(r => r.json());

    if (res.success) {
      this.closeAllModals();
      this.loadUsers();
      if (this.state.currentUser && (!id || String(this.state.currentUser.id) === String(id))) {
        this.checkStatusAndLoadConfig();
      }
    } else {
      alert(res.message);
    }
  },

  async deleteUser(id) {
    if (!confirm('确定要移除此管理员账号吗？此操作不可撤销。')) return;
    const res = await fetch('api.php?action=delete_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).then(r => r.json());

    if (res.success) {
      this.loadUsers();
    } else {
      alert(res.message);
    }
  },

  deleteUserFromModal() {
    const id = document.getElementById('userModalId').value;
    if (!id) return;
    this.closeAllModals();
    this.deleteUser(id);
  },

};
