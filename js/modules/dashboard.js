export const DashboardModule = {
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
                <span class="renewal-title-link" onclick="App.openEditRenewalModal('${r.id}')" style="font-weight:600;cursor:pointer" title="点击编辑此资产">${r.name}</span>
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">${r.provider || ''}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span class="badge-status danger">剩 ${r.days_left} 天到期</span>
                ${r.renew_url ? `<a href="${this.formatUrl(r.renew_url)}" target="_blank" class="btn btn-sm btn-secondary" title="官网控制台直达">直达 ↗</a>` : ''}
                <button class="btn btn-sm btn-primary" onclick="App.openEditRenewalModal('${r.id}')" title="编辑维护此资产">✏️ 编辑</button>
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

};
