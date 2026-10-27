<!-- 8.6. 常用直达综合设置与管理弹窗 -->
<div id="managePortalsModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog" style="max-width:700px">
    <div class="modal-header">
      <span style="display:flex;align-items:center;gap:6px">⚡ 常用直达综合设置与管理</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body" style="padding:16px 20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:12.5px;color:var(--text-muted)">集中设置、修改与管理首页及事务顶部的各常用业务直达平台</div>
        <button class="btn btn-sm btn-primary" onclick="App.openAddPortalModal()">+ 新增通道</button>
      </div>
      <div class="notion-table-container" style="max-height:420px;overflow-y:auto;margin-bottom:0">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width:24%">平台名称</th>
              <th style="width:16%">业务分类</th>
              <th style="width:34%">跳转网址</th>
              <th style="width:12%">安全密保</th>
              <th style="text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="managePortalsTableBody">
            <tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-muted)">加载中...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="App.closeAllModals()">关闭</button>
    </div>
  </div>
</div>
