<!-- 5. 记一笔垫资弹窗 -->
<div id="reimbModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span>记一笔个人垫资与发票</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="reimbModalId">
      <div class="form-group">
        <label class="form-label">事项说明</label>
        <input type="text" id="reimbModalTitle" class="form-control" placeholder="如：自掏垫付腾讯云安全包续费 / 客户招待餐费">
      </div>
      <div class="form-group">
        <label class="form-label">垫付金额 (元)</label>
        <input type="number" step="0.01" id="reimbModalAmount" class="form-control" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">支付日期</label>
        <input type="date" id="reimbModalDate" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">垫资支付渠道</label>
        <select id="reimbModalMethod" class="form-control">
          <option value="微信支付">微信支付</option>
          <option value="支付宝">支付宝</option>
          <option value="个人信用卡">个人信用卡</option>
          <option value="银行卡转账">银行卡转账</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">拍照上传发票或截图凭证 (手机端点击可直接唤醒相机拍照)</label>
        <input type="file" accept="image/*" class="form-control" onchange="App.handleFileUpload(this, 'reimbModalInvoiceUrl', 'reimbInvoicePreview')">
        <input type="hidden" id="reimbModalInvoiceUrl">
        <img id="reimbInvoicePreview" style="display:none;width:120px;height:80px;object-fit:cover;margin-top:6px;border-radius:4px" alt="凭证预览">
      </div>
      <div class="form-group">
        <label class="form-label">备注说明</label>
        <input type="text" id="reimbModalRemark" class="form-control" placeholder="如：已开具专票，发票原件在抽屉">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
      <button class="btn btn-primary" onclick="App.saveReimbursement()">保存垫资单</button>
    </div>
  </div>
</div>
