<!-- 9. 简洁账号登录弹窗 -->
<div id="loginModal" class="modal-overlay" style="display:none;z-index:9999;backdrop-filter:blur(6px);background:rgba(0,0,0,0.45)">
  <div class="modal-dialog" style="max-width:360px;box-shadow:var(--shadow-modal);border-radius:var(--radius-md)">
    <div class="modal-header" style="justify-content:center;border-bottom:none;padding-top:24px;padding-bottom:6px">
      <div style="text-align:center">
        <div style="font-size:32px;margin-bottom:6px">📁</div>
        <div style="font-size:16px;font-weight:700;color:var(--text-main)" id="loginAppTitle"><?php echo htmlspecialchars($appTitle); ?></div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px">管理者工作台 · 安全验证</div>
      </div>
    </div>
    <div class="modal-body" style="padding:16px 24px">
      <div class="form-group">
        <label class="form-label">登录账号</label>
        <input type="text" id="loginUsernameInput" class="form-control" placeholder="输入账号 (默认: admin)" autocomplete="username" onkeydown="if(event.key==='Enter') document.getElementById('loginPasswordInput').focus()">
      </div>
      <div class="form-group">
        <label class="form-label">登录密码</label>
        <input type="password" id="loginPasswordInput" class="form-control" placeholder="输入密码 (默认: felix123)" autocomplete="current-password" onkeydown="if(event.key==='Enter') App.submitLogin()">
      </div>
      <div id="loginErrorMsg" style="color:var(--danger-color);font-size:12px;display:none;margin-top:-6px;margin-bottom:10px;text-align:center"></div>
    </div>
    <div class="modal-footer" style="padding:0 24px 24px 24px;border-top:none;flex-direction:column;gap:8px">
      <button class="btn btn-primary" style="width:100%;height:38px;font-size:14px" onclick="App.submitLogin()">登 录 ➔</button>
      <div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:4px;width:100%">
        首次使用默认账号 <code>admin</code> 密码 <code>felix123</code>
      </div>
    </div>
  </div>
</div>
