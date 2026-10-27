<!-- 8.5. 新增/编辑快速通道弹窗 -->
<div id="portalModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog" style="max-width:460px">
    <div class="modal-header">
      <span id="portalModalTitleText">新增快速业务通道</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="portalModalId">
      <div style="display:grid;grid-template-columns:84px 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">图标/Emoji</label>
          <input type="text" id="portalModalIcon" class="form-control" style="text-align:center;font-size:18px" placeholder="⚡" maxlength="4">
        </div>
        <div class="form-group">
          <label class="form-label">平台/通道名称 *</label>
          <input type="text" id="portalModalTitle" class="form-control" placeholder="如：阿里巴巴国际站">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">跳转网址 (URL) *</label>
        <input type="text" id="portalModalUrl" class="form-control" placeholder="https://seller.alibaba.com">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">业务分类</label>
          <input type="text" id="portalModalCategory" list="portalCategoryDatalist" class="form-control" placeholder="如: 外贸拓客 / 采购供应链">
          <datalist id="portalCategoryDatalist">
            <option value="外贸拓客">
            <option value="采购供应链">
            <option value="协同通信">
            <option value="实用工具">
          </datalist>
        </div>
        <div class="form-group">
          <label class="form-label">排序权重</label>
          <input type="number" id="portalModalSort" class="form-control" placeholder="0 (越小越靠前)">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">常用账号提示 / 备忘说明 (非密码)</label>
        <input type="text" id="portalModalNote" class="form-control" placeholder="如：主店铺后台 / 邮箱 sales@corp.com">
      </div>

      <!-- 凭据安全配置区域 (可选) -->
      <div class="credential-box" style="margin-top:14px;padding:12px;background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:var(--radius-sm)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:12px;font-weight:600;color:var(--text-main);display:flex;align-items:center;gap:5px">
            🔑 登录凭据配置 <span style="font-size:11px;font-weight:normal;color:var(--text-muted)">(可选 · AES-256-GCM 加密存储)</span>
          </span>
          <span id="portalModalPassStatusBadge" class="badge" style="display:none;background:rgba(46,160,67,0.15);color:var(--success-color);font-size:10px">已存密保</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录账号 (选填)</label>
            <input type="text" id="portalModalLoginAccount" class="form-control" placeholder="用户名/邮箱/手机" style="font-size:12px">
          </div>
          <div class="form-group" style="margin-bottom:8px">
            <label class="form-label" style="font-size:11px">登录密码 (选填)</label>
            <div style="position:relative">
              <input type="password" id="portalModalLoginPassword" class="form-control" placeholder="留空则不修改" style="font-size:12px;padding-right:30px">
              <span onclick="App.togglePasswordVisibility('portalModalLoginPassword')" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:13px;opacity:0.6" title="显示/隐藏">👁️</span>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label" style="font-size:11px">自动跳板策略</label>
            <select id="portalModalAutoLoginType" class="form-control" style="font-size:12px" onchange="App.handleAutoLoginTypeChange(this, 'portalModalPostTargetGroup')">
              <option value="copy_and_jump">🚀 一键直达 + 剪贴板安全速填 (推荐)</option>
              <option value="post_submit">⚡ 内部系统自动 POST 免密登录</option>
              <option value="none">🔒 仅加密备忘 (不自动填充)</option>
            </select>
          </div>
          <div style="padding-top:16px">
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:4px 8px" onclick="App.generateRandomPassword('portalModalLoginPassword')" title="生成高强度随机密码">🎲 随机强密码</button>
          </div>
        </div>
        <div id="portalModalPostTargetGroup" class="form-group" style="display:none;margin-top:8px;margin-bottom:0">
          <label class="form-label" style="font-size:11px">自动 POST 提交地址 (若不填则默认提交到上方跳转网址)</label>
          <input type="text" id="portalModalPostTargetUrl" class="form-control" placeholder="如: https://example.com/api/login" style="font-size:12px">
        </div>
        <div id="portalModalClearPassWrap" style="display:none;margin-top:6px;text-align:right">
          <label style="font-size:11px;color:var(--danger-color);cursor:pointer;display:inline-flex;align-items:center;gap:4px">
            <input type="checkbox" id="portalModalClearPass"> 清除并移除已保存的加密密码
          </label>
        </div>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="portalModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deletePortalFromModal()">删除通道</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.savePortalItem()">保存通道</button>
      </div>
    </div>
  </div>
</div>
