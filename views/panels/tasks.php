    <!-- ==================== TAB 5: TASKS 事务统筹 ==================== -->
    <section id="panel-tasks" class="tab-panel">
      <!-- 极简高频业务直达 -->
      <div class="quick-portals-bar">
        <div class="quick-portals-bar-head">
          <div class="quick-portals-bar-title">
            <span>⚡</span>
            <span>常用直达</span>
          </div>
          <div class="quick-portals-bar-actions">
            <div id="portalCategoryFilter" class="portal-filter-bar"></div>
            <button class="btn btn-sm btn-secondary" onclick="App.openManagePortalsModal()" style="font-size:12px;padding:3px 8px" title="批量设置与修改常用直达通道">⚙️ 管理直达</button>
            <button class="btn btn-sm btn-primary" onclick="App.openAddPortalModal()" style="font-size:12px;padding:3px 8px">+ 添加</button>
          </div>
        </div>
        <div id="quickPortalsGrid" class="quick-portals-chips">
          <div style="color:var(--text-muted);font-size:12px;padding:8px 0;">加载中...</div>
        </div>
      </div>

      <div class="section-header" style="margin-top:24px">
        <div>
          <div class="section-title">事务与长远任务统筹</div>
          <div class="section-subtitle">兼顾今日日常琐事（勾选归档）与跨周期战略项目（百分比进度推进）</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" onclick="App.openAddTaskModal('daily')">记待办</button>
          <button class="btn btn-primary" onclick="App.openAddTaskModal('milestone')">新建里程碑</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <div class="kpi-card">
          <div style="font-weight:600;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">
            <span>📝</span><span>今日日常任务</span>
          </div>
          <div id="tasksDailyList"></div>
        </div>

        <div class="kpi-card">
          <div style="font-weight:600;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px">
            <span>🎯</span><span>长期项目与跨期里程碑</span>
          </div>
          <div id="tasksMilestoneList"></div>
        </div>
      </div>
    </section>
