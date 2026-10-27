<!-- 4. 添加入口链接弹窗 -->
<div id="linkModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="linkModalTitleText">添加直达跳转入口</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="linkModalId">
      <input type="hidden" id="linkModalProjectId">
      <div class="form-group">
        <label class="form-label">入口名称</label>
        <input type="text" id="linkModalTitle" class="form-control" placeholder="如：管理后台 / 宝塔面板 / 生产服务器">
      </div>
      <div class="form-group">
        <label class="form-label">直达跳转网址 (URL)</label>
        <input type="url" id="linkModalUrl" class="form-control" placeholder="https://...">
      </div>
      <div class="form-group">
        <label class="form-label">类型分类 (不同分类有专属配色高亮)</label>
        <select id="linkModalType" class="form-control">
          <option value="admin">⚙️ 业务后台 (Admin)</option>
          <option value="site">🌐 前台页面 (Website)</option>
          <option value="server">🖥️ 服务器/宝塔 (Server)</option>
          <option value="repo">📦 代码仓库 (Git)</option>
          <option value="analytics">📊 流量与统计 (Analytics)</option>
          <option value="other">🔗 其他快捷链接</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">关联账号备忘 (鼠标悬停即见，防止遗忘)</label>
        <input type="text" id="linkModalNote" class="form-control" placeholder="如：admin / 密码见密码本">
      </div>

      <!-- 凭据安全配置区域 (可选) -->
      <div class="credential-box" style="margin-top:14px;padding:12px;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;font-weight:600;color:var(--text-main);display:flex;align-items:center;gap:5px">
            🔑 登录凭据配置 <span style="font-size:11px;font-weight:normal;color:var(--text-muted)">(可选 · AES-256-GCM 加密存储)</span>
          </span>
          <span id="linkModalPassStatusBadge" class="badge" style="display:none;background:rgba(46,160,67,0.15);color:var(--success-color);font-size:10px">已存密保</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录账号 (选填)</label>
            <input type="text" id="linkModalLoginAccount" class="form-control" placeholder="用户名/邮箱/手机" style="font-size:12px">
          </div>
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录密码 (选填)</label>
            <div style="position:relative">
              <input type="password" id="linkModalLoginPassword" class="form-control" placeholder="留空则不修改" style="font-size:12px;padding-right:30px">
              <span onclick="App.togglePasswordVisibility('linkModalLoginPassword')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:13px;opacity:0.6" title="显示/隐藏">👁️</span>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:11px">自动跳板策略</label>
            <select id="linkModalAutoLoginType" class="form-control" style="font-size:12px" onchange="App.handleAutoLoginTypeChange(this, 'linkModalPostTargetGroup')">
              <option value="copy_and_jump">🚀 一键直达 + 剪贴板安全速填 (推荐)</option>
              <option value="post_submit">⚡ 内部系统自动 POST 免密登录</option>
              <option value="none">🔒 仅加密备忘 (不自动填充)</option>
            </select>
          </div>
          <div style="padding-top:16px">
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 8px" onclick="App.generateRandomPassword('linkModalLoginPassword')" title="生成高强度随机密码">🎲 随机强密码</button>
          </div>
        </div>
        <div id="linkModalPostTargetGroup" class="form-group" style="display:none;margin-top:8px;margin-bottom:0">
          <label class="form-label" style="font-size:11px">自动 POST 提交地址 (若不填则默认提交到上方跳转网址)</label>
          <input type="text" id="linkModalPostTargetUrl" class="form-control" placeholder="如: https://example.com/api/login" style="font-size:12px">
        </div>
        <div id="linkModalClearPassWrap" style="display:none;margin-top:6px;text-align:right">
          <label style="font-size:11px;color:var(--danger-color);cursor:pointer;display:inline-flex;align-items:center;gap:4px">
            <input type="checkbox" id="linkModalClearPass"> 清除并移除已保存的加密密码
          </label>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="linkModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteLink()">删除此入口</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveLink()">保存入口</button>
      </div>
    </div>
  </div>
</div>
