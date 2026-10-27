    <!-- ==================== TAB 2: PROJECTS 网站项目大框架与通道 ==================== -->
    <section id="panel-projects" class="tab-panel">
      <!-- 第一层：全局大框架 (项目矩阵列表) -->
      <div id="projectsOverviewView">
        <div class="section-header">
          <div>
            <div class="section-title">网站项目总控矩阵</div>
            <div class="section-subtitle">高密度管理全量网站通道，点击任意项目进入专属工作间与自写说明书</div>
          </div>
          <button class="btn btn-primary" onclick="App.openAddProjectModal()">新增项目</button>
        </div>

        <!-- 顶部过滤与搜索条 -->
        <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:16px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
          <!-- 分类标签过滤器 -->
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <div id="projectCategoryFilter" style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-sm btn-primary proj-filter-btn" data-cat="all" onclick="App.filterProjectsByCategory('all')">全部 (<span id="catCountAll">0</span>)</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="核心官网" onclick="App.filterProjectsByCategory('核心官网')">核心官网</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="自研系统" onclick="App.filterProjectsByCategory('自研系统')">自研系统</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="外贸独立站" onclick="App.filterProjectsByCategory('外贸独立站')">外贸独立站</button>
              <button class="btn btn-sm btn-secondary proj-filter-btn" data-cat="服务器运维" onclick="App.filterProjectsByCategory('服务器运维')">服务器运维</button>
            </div>

            <!-- 按公司主体筛选 -->
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:12px;color:var(--text-muted)">🏢 公司:</span>
              <select id="projectCompanyFilterSelect" class="form-control" style="width:auto;padding:3px 8px;font-size:12px" onchange="App.filterProjectsByCompany(this.value)">
                <option value="all">全部公司主体</option>
              </select>
            </div>
          </div>

          <!-- 快速搜索过滤框 -->
          <div style="display:flex;align-items:center;gap:6px;min-width:240px">
            <span style="font-size:13px;color:var(--text-muted)">🔍</span>
            <input type="text" id="projectSearchInput" class="form-control" placeholder="按名称/代号/主域名快速筛选..." style="padding:4px 8px;font-size:12.5px" oninput="App.filterProjectsByQuery(this.value)">
          </div>
        </div>

        <!-- 高密度项目列表容器 -->
        <div class="notion-table-container">
          <table class="notion-table">
            <thead>
              <tr>
                <th style="width:23%">项目 / 站点名称</th>
                <th style="width:12%">所属公司</th>
                <th style="width:10%">业务分类</th>
                <th style="width:20%">主访问网址 (前台/后台)</th>
                <th style="width:12%">SSL 证书到期</th>
                <th style="width:8%">直达入口</th>
                <th style="width:7%">说明书</th>
                <th style="min-width:140px;text-align:right">操作</th>
              </tr>
            </thead>
            <tbody id="projectsTableBody">
              <tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 第二层：单项目专属工作通道 (Project Channel) -->
      <div id="projectChannelView" style="display:none">
        <!-- 顶部返回与项目标题栏 -->
        <div style="background:var(--bg-card);border:1px solid var(--border-light);border-radius:var(--radius-md);padding:14px 18px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;box-shadow:var(--shadow-notion);flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <button class="btn btn-sm btn-secondary" onclick="App.backToProjectsOverview()">返回项目列表</button>
            <div style="font-size:14px;color:var(--text-muted)">/</div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span id="channelProjectName" style="font-size:18px;font-weight:700"></span>
                <span id="channelProjectCompany" class="badge-status" style="display:none"></span>
                <span id="channelProjectCategory" class="badge-status normal"></span>
                <span id="channelProjectSsl" class="badge-status" style="display:none"></span>
                <code id="channelProjectCode" style="font-size:11px"></code>
              </div>
              <div id="channelProjectDesc" style="font-size:12.5px;color:var(--text-secondary);margin-top:2px"></div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <button id="btnCopyCompanyInvoice" class="btn btn-sm btn-secondary" style="display:none" onclick="App.copyCurrentProjectCompanyInvoice()" title="一键复制开票抬头、税号及银行账户">复制开票信息</button>
            <button class="btn btn-sm btn-secondary" onclick="App.openAddLinkModal(App.state.currentChannelProjectId)">添加入口</button>
            <button class="btn btn-sm btn-secondary" onclick="App.openEditProjectModal(App.state.currentChannelProjectId)">项目设置</button>
          </div>
        </div>

        <!-- 通道核心 1：快捷直达站台 Launchpad -->
        <div class="kpi-card" style="margin-bottom:18px">
          <div style="font-weight:600;font-size:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:6px">
              <span>🚀</span><span>直达跳转站台 (Launchpad)</span>
            </div>
            <span style="font-size:12px;color:var(--text-muted)">点击在新标签页直达，点击 ✎ 修改写错的网址</span>
          </div>
          <div id="channelLinksWrap" class="project-links-wrap" style="margin:6px 0"></div>
        </div>

        <!-- 通道核心 2：项目专属说明书 / 运维手册 (Project Readme) -->
        <div class="kpi-card" style="margin-bottom:18px;border-top:3px solid var(--accent-color)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border-light)">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px">📖</span>
              <span style="font-weight:600;font-size:15px">项目专属说明书 / 运维交付手册</span>
              <span style="font-size:11.5px;color:var(--text-muted)">记录技术栈、部署步骤、特殊注意事项与交接指南</span>
            </div>
            <div style="display:flex;gap:8px">
              <button id="btnTplReadme" class="btn btn-sm btn-secondary" style="display:none" onclick="App.applyReadmeTemplate()">套用规范模版</button>
              <button id="btnToggleEditReadme" class="btn btn-sm btn-primary" onclick="App.toggleEditChannelReadme()">编辑说明书</button>
            </div>
          </div>

          <!-- 说明书查看视图 -->
          <div id="channelReadmeView" style="min-height:120px;font-size:13.5px;line-height:1.7;color:var(--text-main);white-space:pre-wrap;background:var(--bg-subtle);padding:16px;border-radius:var(--radius-sm)"></div>

          <!-- 说明书编辑视图 (默认隐藏) -->
          <div id="channelReadmeEditWrap" style="display:none;flex-direction:column;gap:10px">
            <textarea id="channelReadmeTextarea" class="form-control" rows="12" style="font-family:monospace;font-size:13px;line-height:1.6" placeholder="在此编写该网站项目的专属说明书...
例如：
### 1. 业务概述与系统架构
- 网站类型：WordPress 外贸展示站 / 自研 CRM
- 服务器环境：PHP 7.4 + MySQL 5.7 (宝塔)
- 源码分支：git@gitlab.com:... (main 分支)

### 2. 核心运维与发布注意
- 发布新版本时必须手动重启 Redis 容器并清理缓存
- 上传目录已软链至共享存储 /data/uploads

### 3. 账号与权限规则
- 生产后台开启了 Google 动态二次验证 (2FA)
- 数据库端口仅开放给内部 VPN IP 访问"></textarea>
            <div style="display:flex;justify-content:flex-end;gap:8px">
              <button class="btn btn-secondary" onclick="App.cancelEditChannelReadme()">取消</button>
              <button class="btn btn-primary" onclick="App.saveChannelReadme()">保存说明书</button>
            </div>
          </div>
        </div>

        <!-- 通道核心 3：该项目绑定的到期资产与生命周期 -->
        <div class="kpi-card">
          <div style="font-weight:600;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <span>⏰</span><span>关联资产与续费生命周期</span>
          </div>
          <div id="channelRenewalsList"></div>
        </div>
      </div>
    </section>
