    <!-- ==================== TAB 1: DASHBOARD 总览 ==================== -->
    <section id="panel-dashboard" class="tab-panel active">
      <!-- 紧急临期预警条 (动态显隐) -->
      <div id="urgentBanner" class="urgent-banner" style="display: none;">
        <div class="urgent-banner-content">
          <span style="font-size:18px">🚨</span>
          <span id="urgentBannerText"><strong>急迫提醒：</strong>有核心资产将在 7 天内到期！</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="App.switchTab('renewals')">立刻查看</button>
      </div>

      <!-- 核心指标卡片 -->
      <div class="kpi-grid">
        <div class="kpi-card" style="border-left: 3px solid var(--tag-orange-text)">
          <div class="kpi-header">
            <span class="kpi-title">个人垫资待报销</span>
            <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-value" id="kpiReimbAmount">￥0.00</div>
          <div class="kpi-footer">自掏腰包待财务回血总额</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--danger-color)">
          <div class="kpi-header">
            <span class="kpi-title">7天内紧急到期</span>
            <span class="kpi-icon">⏰</span>
          </div>
          <div class="kpi-value"><span id="kpiUrgentRenewals">0</span><span class="kpi-unit">个资产</span></div>
          <div class="kpi-footer">域名/服务器/证书防停摆</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--success-color)">
          <div class="kpi-header">
            <span class="kpi-title">今日待办完成度</span>
            <span class="kpi-icon">✅</span>
          </div>
          <div class="kpi-value"><span id="kpiDailyTasks">0 / 0</span></div>
          <div class="kpi-footer">聚焦今日关键推进事项</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--accent-color)">
          <div class="kpi-header">
            <span class="kpi-title">纳管网站矩阵</span>
            <span class="kpi-icon">🌐</span>
          </div>
          <div class="kpi-value" id="kpiProjectCount">0 项目</div>
          <div class="kpi-footer">前台/后台/宝塔全景直达</div>
        </div>
      </div>

      <!-- 下方双列面板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <!-- 待续费资产速查 -->
        <div class="kpi-card">
          <div class="section-header" style="margin-bottom: 12px;">
            <div class="section-title-wrap">
              <span>🚨</span>
              <span class="section-title" style="font-size: 15px;">近期急迫到期资产</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.switchTab('renewals')">全部资产</button>
          </div>
          <div id="dashUrgentList">
            <div style="color:var(--text-muted);font-size:13px;padding:8px 0;">加载中...</div>
          </div>
        </div>

        <!-- 今日待办事项 -->
        <div class="kpi-card">
          <div class="section-header" style="margin-bottom: 12px;">
            <div class="section-title-wrap">
              <span>📝</span>
              <span class="section-title" style="font-size: 15px;">今日行动清单</span>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.openAddTaskModal('daily')">记待办</button>
          </div>
          <div id="dashTodayTasks">
            <div style="color:var(--text-muted);font-size:13px;padding:8px 0;">加载中...</div>
          </div>
        </div>
      </div>
    </section>
