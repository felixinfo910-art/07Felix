  <div class="dock-body">
    <!-- 账号复制行 -->
    <div class="dock-field-row" id="dockAccountRow" style="display:none">
      <div class="dock-field-label">账号</div>
      <div class="dock-field-value" id="dockAccountVal">--</div>
      <button class="btn btn-sm btn-secondary dock-btn" onclick="App.copyDockCredential('account')">📋 复制</button>
    </div>
    <!-- 密码复制行 -->
    <div class="dock-field-row" id="dockPasswordRow" style="display:none">
      <div class="dock-field-label">密码</div>
      <div class="dock-field-value dock-pass-val" id="dockPasswordVal">••••••••</div>
      <div style="display:flex;gap:4px">
        <button class="btn btn-sm btn-secondary dock-btn" onclick="App.toggleDockPassReveal()" title="查看/隐藏">👁️</button>
        <button class="btn btn-sm btn-primary dock-btn" onclick="App.copyDockCredential('password')">📋 复制密码</button>
      </div>
    </div>
    <!-- 提示与自动清空倒计时条 -->
    <div class="dock-countdown-bar" id="dockCountdownBar">
      <div class="dock-countdown-fill" id="dockCountdownFill"></div>
    </div>
    <div class="dock-footer-tip" id="dockFooterTip">
      ⏱️ 剪贴板安全保护中 · 15 秒后自动抹除剪贴板
    </div>
  </div>
</div>