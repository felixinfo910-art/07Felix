    <!-- ==================== TAB 3: RENEWALS 资产续费雷达 ==================== -->
    <section id="panel-renewals" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">资产与到期续费雷达 (Renewal Radar)</div>
          <div class="section-subtitle">域名、云服务器、SSL证书、SaaS订阅全生命周期监控；官网控制台一键直达，到期预警与资产台账统筹管理</div>
        </div>
        <button class="btn btn-primary" onclick="App.openAddRenewalModal()">新增资产</button>
      </div>

      <!-- 移动端专属纯净统计条 (替代臃肿的4色大盘栅格) -->
      <div id="renewalsMobileSummary" class="renewals-mobile-summary" style="display:none">
        <span>全部资产 (<span id="renewalsMobileTotalCount">0</span>)</span>
        <span id="renewalsMobileUrgentNotice"></span>
      </div>

      <!-- 核心雷达指标看板 KPI Grid -->
      <div class="kpi-grid" style="margin-bottom: 18px;">
        <div class="kpi-card" style="border-left: 3px solid var(--danger-color); cursor: pointer;" onclick="App.filterRenewalsByStatus('danger')" title="点击筛选7天内紧急资产">
          <div class="kpi-header">
            <span class="kpi-title">7天内紧急临期</span>
            <span class="kpi-icon">🚨</span>
          </div>
          <div class="kpi-value"><span id="radarUrgentCount">0</span><span class="kpi-unit">个资产</span></div>
          <div class="kpi-footer">面临断服/赎回风险，需即刻处理</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--tag-orange-text); cursor: pointer;" onclick="App.filterRenewalsByStatus('warning')" title="点击筛选30天内预警资产">
          <div class="kpi-header">
            <span class="kpi-title">30天内预警</span>
            <span class="kpi-icon">⚠️</span>
          </div>
          <div class="kpi-value"><span id="radarWarningCount">0</span><span class="kpi-unit">个资产</span></div>
          <div class="kpi-footer">建议本月提上日程安排续约</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--accent-color); cursor: pointer;" onclick="App.filterRenewalsByStatus('all')" title="点击查看纳管全量资产">
          <div class="kpi-header">
            <span class="kpi-title">纳管资产总项</span>
            <span class="kpi-icon">🌐</span>
          </div>
          <div class="kpi-value"><span id="radarTotalCount">0</span><span class="kpi-unit">项资产</span></div>
          <div class="kpi-footer">域名/服务器/证书/SaaS全量</div>
        </div>

        <div class="kpi-card" style="border-left: 3px solid var(--success-color)">
          <div class="kpi-header">
            <span class="kpi-title">预估年化续费预算</span>
            <span class="kpi-icon">💰</span>
          </div>
          <div class="kpi-value"><span id="radarTotalCost">￥0.00</span></div>
          <div class="kpi-footer">纳管资产周期性年支出总计</div>
        </div>
      </div>

      <!-- 顶部多维筛选与搜索工具条 (移动端隐藏，免除筛选展示全部) -->
      <div id="renewalFilterToolbar" style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:16px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <!-- 分类药丸按钮组 -->
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <div id="renewalCategoryFilter" style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-sm btn-primary renewal-cat-btn" data-cat="all" onclick="App.filterRenewalsByCategory('all')">全部 (<span id="radarCatCountAll">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="domain" onclick="App.filterRenewalsByCategory('domain')">域名 (<span id="radarCatCountDomain">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="server" onclick="App.filterRenewalsByCategory('server')">云服务器 (<span id="radarCatCountServer">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="ssl" onclick="App.filterRenewalsByCategory('ssl')">SSL证书 (<span id="radarCatCountSsl">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="saas" onclick="App.filterRenewalsByCategory('saas')">软件订阅 (<span id="radarCatCountSaas">0</span>)</button>
            <button class="btn btn-sm btn-secondary renewal-cat-btn" data-cat="other" onclick="App.filterRenewalsByCategory('other')">其他 (<span id="radarCatCountOther">0</span>)</button>
          </div>

          <!-- 紧急度状态筛选下拉 -->
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:12px;color:var(--text-muted)">⚡ 紧急度:</span>
            <select id="renewalStatusFilterSelect" class="form-control" style="width:auto;padding:3px 8px;font-size:12px" onchange="App.filterRenewalsByStatus(this.value)">
              <option value="all">全部生命周期</option>
              <option value="danger">🚨 7天内紧急</option>
              <option value="warning">⚠️ 30天内预警</option>
              <option value="normal">🟢 充裕正常</option>
              <option value="expired">⚫ 已逾期</option>
            </select>
          </div>

          <!-- 按公司主体筛选下拉 -->
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:12px;color:var(--text-muted)">🏢 归属主体:</span>
            <select id="renewalCompanyFilterSelect" class="form-control" style="width:auto;padding:3px 8px;font-size:12px" onchange="App.filterRenewalsByCompany(this.value)">
              <option value="all">全部公司主体</option>
            </select>
          </div>
        </div>

        <!-- 实时快速搜索框 -->
        <div style="display:flex;align-items:center;gap:6px;min-width:240px">
          <span style="font-size:13px;color:var(--text-muted)">🔍</span>
          <input type="text" id="renewalSearchInput" class="form-control" placeholder="按资产名称/服务商/账号备忘筛选..." style="padding:4px 8px;font-size:12.5px" oninput="App.filterRenewalsByQuery(this.value)">
        </div>
      </div>

      <!-- 高密度资产表格 (桌面端) -->
      <div class="notion-table-container">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width:20%">资产 / 域名名称</th>
              <th style="width:14%">归属主体 / 关联项目</th>
              <th style="width:9%">类型分类</th>
              <th style="width:10%">注册 / 托管商</th>
              <th style="width:11%">到期日期</th>
              <th style="width:12%">生命周期雷达</th>
              <th style="width:8%">续费预估</th>
              <th style="min-width:260px;text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="renewalsTableBody">
            <tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 移动端专属高密度轻量卡片流 (手机端以查看速览为主，操作精简，安全防误触) -->
      <div id="renewalsCardsMobile" class="renewals-cards-mobile">
        <div style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</div>
      </div>
    </section>
