<!-- 10. 管理者账号维护弹窗 -->
<div id="userModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog" style="max-width:420px">
    <div class="modal-header">
      <span id="userModalTitleText">维护管理者账号</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="userModalId">
      <div class="form-group">
        <label class="form-label">登录账号 (用户名) *</label>
        <input type="text" id="userModalUsername" class="form-control" placeholder="如: admin 或 felix">
      </div>
      <div class="form-group">
        <label class="form-label">展示姓名 / 昵称 *</label>
        <input type="text" id="userModalDisplayName" class="form-control" placeholder="如: 何志忠">
      </div>
      <div class="form-group">
        <label class="form-label">联系电话 / 手机</label>
        <input type="text" id="userModalPhone" class="form-control" placeholder="如: +86 13925521330">
      </div>
      <div class="form-group">
        <label class="form-label" id="userModalPassLabel">登录密码</label>
        <input type="password" id="userModalPassword" class="form-control" placeholder="留空则保持原密码不变">
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="userModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteUserFromModal()">删除账号</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveUserItem()">保存账号</button>
      </div>
    </div>
  </div>
</div>
