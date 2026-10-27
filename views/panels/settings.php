    <!-- ==================== TAB 7: SETTINGS 系统设置与账号中心 ==================== -->
    <section id="panel-settings" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">系统设置与个人中心</div>
          <div class="section-subtitle">管理登录账号、配置个人对外数字名片、AI 大模型端点与服务器部署环境</div>
        </div>
      </div>

      <div class="settings-workbench-layout">
        <!-- 左侧设置子导航 (Sub-Navigation) -->
        <div class="settings-sub-nav">
          <div class="settings-nav-group">
            <button class="settings-sub-item active" data-sub="account" onclick="App.switchSettingsSubTab('account')">
              <span class="settings-sub-icon">👤</span>
              <span>账号信息</span>
            </button>
            <button class="settings-sub-item" data-sub="card" onclick="App.switchSettingsSubTab('card')">
              <span class="settings-sub-icon">🪪</span>
              <span>我的名片</span>
            </button>
            <button class="settings-sub-item" data-sub="ai" onclick="App.switchSettingsSubTab('ai')">
              <span class="settings-sub-icon">🤖</span>
              <span>AI 大模型设置</span>
            </button>
            <button class="settings-sub-item" data-sub="system" onclick="App.switchSettingsSubTab('system')">
              <span class="settings-sub-icon">🖥️</span>
              <span>首页与环境</span>
            </button>
          </div>
        </div>

        <!-- 右侧主内容展示区 -->
        <div class="settings-content-area">

          <!-- 子面板 1: 账号管理 -->
          <div id="settings-sub-account" class="settings-sub-panel active">
            <div class="kpi-card" style="margin-bottom:0">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
                <div>
                  <div style="font-weight:600;font-size:15px;color:var(--text-main)">👤 登录与协同账号管理</div>
                  <div style="font-size:12px;color:var(--text-muted)">统一管理工作台管理员与协同成员，支持修改登录密码与展示名称</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="App.openAddUserModal()">+ 新增账号</button>
              </div>

              <div class="notion-table-container" style="margin-bottom:0">
                <table class="notion-table">
                  <thead>
                    <tr>
                      <th style="width:25%">登录账号</th>
                      <th style="width:25%">展示姓名 / 昵称</th>
                      <th style="width:25%">联系电话</th>
                      <th style="width:25%;text-align:right">操作</th>
                    </tr>
                  </thead>
                  <tbody id="usersTableBody">
                    <tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted)">加载账号列表中...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 子面板 2: 我的名片 (Business & Standard 风格选择与实时预览) -->
          <div id="settings-sub-card" class="settings-sub-panel">
            <div class="kpi-card" style="margin-bottom:0">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <div>
                  <div style="font-weight:600;font-size:15px;color:var(--text-main)">🪪 我的对外数字名片</div>
                  <div style="font-size:12px;color:var(--text-muted)">随时展示并一键复制您的对外名片，支持商务蓝与极简标准金两种高品质视觉风格</div>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                  <span style="font-size:13px;font-weight:500">名片风格：</span>
                  <select id="cardStyleSelect" class="form-control" style="width:auto;padding:5px 12px;font-weight:500" onchange="App.onCardStyleChange(this.value)">
                    <option value="business">商务风格 (经典深蓝)</option>
                    <option value="standard">标准风格 (极简波纹)</option>
                  </select>
                  <button class="btn btn-primary btn-sm" onclick="App.saveCardProfile()">💾 保存名片</button>
                </div>
              </div>

              <!-- 名片预览舞台 (Card Stage) -->
              <div class="business-card-stage">
                <!-- 风格 1: 商务风格 (Business Blue) -->
                <div id="cardPreviewBusiness" class="bcard-container bcard-business">
                  <div class="bcard-left-shape">
                    <div class="bcard-avatar-wrap">
                      <div class="bcard-avatar-icon">👤</div>
                    </div>
                    <div class="bcard-left-contacts">
                      <div class="bcard-contact-row">
                        <span class="bcard-icon">💬</span>
                        <span id="pvBusinessWhatsapp">+86 13925521330</span>
                      </div>
                      <div class="bcard-contact-row">
                        <span class="bcard-icon">✉️</span>
                        <span id="pvBusinessEmail">478244551@qq.com</span>
                      </div>
                    </div>
                  </div>
                  <div class="bcard-right-content">
                    <div class="bcard-right-top">
                      <div class="bcard-name" id="pvBusinessName">何志忠</div>
                      <div class="bcard-company" id="pvBusinessCompany">拾贝管家演示企业</div>
                      <div class="bcard-title" id="pvBusinessTitle" style="display:none"></div>
                    </div>
                    <div class="bcard-right-phone">
                      <span class="bcard-phone-icon">📞</span>
                      <span id="pvBusinessPhone">+86 13925521330</span>
                    </div>
                    <div class="bcard-dark-ribbon"></div>
                  </div>
                </div>

                <!-- 风格 2: 标准风格 (Standard Minimal) -->
                <div id="cardPreviewStandard" class="bcard-container bcard-standard" style="display:none">
                  <div class="bcard-std-topo-bg"></div>
                  <div class="bcard-std-left">
                    <div class="bcard-std-avatar">
                      <div class="bcard-avatar-icon">👤</div>
                    </div>
                    <div class="bcard-std-name" id="pvStandardName">何志忠</div>
                    <div class="bcard-std-company" id="pvStandardCompany">拾贝管家演示企业</div>
                  </div>
                  <div class="bcard-std-right">
                    <div class="bcard-std-row">
                      <span class="bcard-std-icon">📞</span>
                      <span id="pvStandardPhone">+86 13925521330</span>
                    </div>
                    <div class="bcard-std-row">
                      <span class="bcard-std-icon">💬</span>
                      <span id="pvStandardWhatsapp">+8613925521330</span>
                    </div>
                    <div class="bcard-std-row">
                      <span class="bcard-std-icon">✉️</span>
                      <span id="pvStandardEmail">478244551@qq.com</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 名片信息表单编辑 -->
              <div style="background:var(--bg-subtle);border-radius:var(--radius-md);padding:18px;margin-top:20px">
                <div style="font-weight:600;font-size:13.5px;margin-bottom:12px;color:var(--text-main)">✏️ 名片资料编辑（修改将实时在上方预览）</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px">
                  <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">姓名 *</label>
                    <input type="text" id="cardFormName" class="form-control" placeholder="姓名 (如: 何志忠)" oninput="App.syncCardPreview()">
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">公司 / 组织主体</label>
                    <input type="text" id="cardFormCompany" class="form-control" placeholder="公司名 (如: 拾贝管家演示企业)" oninput="App.syncCardPreview()">
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">联系电话 / 手机</label>
                    <input type="text" id="cardFormPhone" class="form-control" placeholder="如: +86 13925521330" oninput="App.syncCardPreview()">
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">电子邮箱 (Email)</label>
                    <input type="text" id="cardFormEmail" class="form-control" placeholder="如: 478244551@qq.com" oninput="App.syncCardPreview()">
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">WhatsApp / 微信号</label>
                    <input type="text" id="cardFormWhatsapp" class="form-control" placeholder="如: +86 13925521330" oninput="App.syncCardPreview()">
                  </div>
                  <div class="form-group" style="margin-bottom:0">
                    <label class="form-label">职务头衔 (选填)</label>
                    <input type="text" id="cardFormTitle" class="form-control" placeholder="如: 创始人 / 商务总监" oninput="App.syncCardPreview()">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 子面板 3: AI 大模型设置 -->
          <div id="settings-sub-ai" class="settings-sub-panel">
            <div class="kpi-card" style="margin-bottom:0">
              <div style="font-weight:600;font-size:15px;margin-bottom:14px">🤖 AI 大模型服务配置</div>
              
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

              <div style="display:flex;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap">
                <button type="button" class="btn btn-secondary btn-sm" id="btnTestAiConnection" onclick="App.testAiConnection()">
                  🔌 测试 AI 连通性
                </button>
                <button type="button" class="btn btn-primary btn-sm" onclick="App.saveConfigSettings()">
                  💾 保存配置
                </button>
                <span id="aiTestResultStatus" style="font-size:12px;color:var(--text-muted)"></span>
              </div>
            </div>
          </div>

          <!-- 子面板 4: 首页与环境设置 -->
          <div id="settings-sub-system" class="settings-sub-panel">
            <div class="kpi-card" style="margin-bottom:0">
              <div style="font-weight:600;font-size:15px;margin-bottom:14px">🖥️ 工作台首页与部署环境</div>

              <div class="form-group">
                <label class="form-label">工作台展示名称</label>
                <input type="text" id="cfgAppTitle" class="form-control" placeholder="如: Felix 管理者工作台">
              </div>

              <div style="margin-bottom:16px">
                <button class="btn btn-primary btn-sm" onclick="App.saveConfigSettings()">💾 保存名称设置</button>
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
                <div>• <strong>当前运行模式</strong>：<code><?php echo htmlspecialchars(APP_ENV); ?></code></div>
                <div>• <strong>数据库引擎</strong>：SQLite 3 (WAL 并发读写与 mmap 内存映射已就绪，版本: <?php echo Database::SCHEMA_VERSION; ?>)</div>
                <div>• <strong>一键热更新命令</strong>：宝塔终端执行 <code>cd /www/wwwroot/07Felix && bash update.sh</code> 即可平滑升级</div>
              </div>

              <div class="form-group" style="margin-bottom:0">
                <label class="form-label" style="display:flex;justify-content:space-between">
                  <span>宝塔 Nginx 关键安全防护规则</span>
                  <span style="font-size:11px;color:var(--text-muted)">防数据库被外部恶意下载</span>
                </label>
                <pre style="background:var(--bg-page);border:1px solid var(--border-light);padding:10px 12px;border-radius:var(--radius-sm);font-size:11.5px;color:var(--text-main);overflow-x:auto;user-select:all;margin:0">location ~ ^/(data|uploads/.*\.php|\.git|\.env|.*\.sh|.*\.bat) {
    deny all;
    return 404;
}</pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
