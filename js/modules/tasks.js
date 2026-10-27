export const TasksModule = {
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

};
