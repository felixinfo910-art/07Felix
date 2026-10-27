    <!-- ==================== TAB 7: SETTINGS 系统设置 ==================== -->
    <section id="panel-settings" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">系统与参数设置</div>
          <div class="section-subtitle">配置线上访问密码锁、AI 大模型 API Key 与工作台名称</div>
        </div>
        <button class="btn btn-primary" onclick="App.saveConfigSettings()">保存配置</button>
      </div>

      <div class="kpi-card" style="max-width:720px">
        <div class="form-group">
          <label class="form-label">工作台展示名称</label>
          <input type="text" id="cfgAppTitle" class="form-control">
        </div>

        <!-- 管理者账号管理 -->
        <div style="margin:16px 0 20px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <div>
              <div style="font-weight:600;font-size:14px;color:var(--text-main)">👤 管理者账号管理</div>
              <div style="font-size:12px;color:var(--text-muted)">统一管理管理者与协同账号，支持修改账号密码</div>
            </div>
            <button class="btn btn-sm btn-secondary" onclick="App.openAddUserModal()">+ 新增账号</button>
          </div>

          <div class="notion-table-container" style="margin-bottom:0">
            <table class="notion-table">
              <thead>
                <tr>
                  <th style="width:28%">登录账号 (用户名)</th>
                  <th style="width:28%">展示昵称</th>
                  <th style="width:26%">上次登录</th>
                  <th style="text-align:right">操作</th>
                </tr>
              </thead>
              <tbody id="usersTableBody">
                <tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-muted)">加载中...</td></tr>
              </tbody>
            </table>
          </div>
        </div>



        <div style="font-weight:600;font-size:14px;margin-bottom:12px">🤖 AI 大模型服务配置</div>

        <div class="form-group">
          <label class="form-label">API 接口地址 (Base URL)</label>
          <input type="text" id="cfgAiBaseUrl" class="form-control" placeholder="如 https://api.deepseek.com 或 https://api.moonshot.cn/v1">
        </div>

        <div class="form-group">
          <label class="form-label">模型名称 (Model)</label>
          <input type="text" id="cfgAiModel" class="form-control" placeholder="如 deepseek-chat, moonshot-v1-8k, gpt-4o">
        </div>

        <div class="form-group">
          <label class="form-label">API Key 密匙 (<span id="cfgAiKeyStatus">检查中...</span>)</label>
          <input type="password" id="cfgAiKey" class="form-control" placeholder="填入以 sk- 开头的 API Key (为空则保留当前已保存的 Key)">
        </div>

        <div class="form-group">
          <label class="form-label">AI 幕僚系统人设提示词 (System Prompt)</label>
          <textarea id="cfgAiPrompt" class="form-control" rows="3"></textarea>
        </div>

        <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
          <button type="button" class="btn btn-secondary btn-sm" id="btnTestAiConnection" onclick="App.testAiConnection()">
            🔌 测试 AI 连通性
          </button>
          <span id="aiTestResultStatus" style="font-size:12px;color:var(--text-muted)"></span>
        </div>

        <hr style="margin:20px 0;border:none;border-top:1px solid var(--border-light)">

        <div style="font-weight:600;font-size:14px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:6px">
            <span>🖥️</span><span>运行环境与宝塔部署</span>
          </div>
          <span class="badge-status <?php echo IS_PRODUCTION ? 'normal' : 'warning'; ?>">
            <?php echo IS_PRODUCTION ? '🟢 线上生产模式' : '🟡 本地开发模式'; ?>
          </span>
        </div>

        <div style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:12px 14px;font-size:12.5px;line-height:1.6;color:var(--text-secondary);margin-bottom:14px">
          <div>• <strong>宝塔项目根路径</strong>：<code>/www/wwwroot/07Felix</code></div>
          <div>• <strong>当前运行模式</strong>：<code><?php echo htmlspecialchars(APP_ENV); ?></code> (可在根目录 <code>.env</code> 中指定 <code>APP_ENV=production</code> 或 <code>local</code>)</div>
          <div>• <strong>数据库引擎</strong>：SQLite 3 (WAL 极速并发读写已就绪，版本: <?php echo Database::SCHEMA_VERSION; ?>)</div>
          <div>• <strong>一键热更新命令</strong>：宝塔终端进入 <code>cd /www/wwwroot/07Felix && bash update.sh</code> 即可平滑升级</div>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label" style="display:flex;justify-content:space-between">
            <span>宝塔 Nginx 关键安全防护规则 (在宝塔面板-网站设置-配置文件中添加)</span>
            <span style="font-size:11px;color:var(--text-muted)">防数据库被外部恶意下载</span>
          </label>
          <pre style="background:var(--bg-page);border:1px solid var(--border-light);padding:10px 12px;border-radius:var(--radius-sm);font-size:11.5px;color:var(--text-main);overflow-x:auto;user-select:all;margin:0">location ~ ^/(data|uploads/.*\.php|\.git|\.env|.*\.sh|.*\.bat) {
    deny all;
    return 404;
}</pre>
        </div>
      </div>
    </section>
