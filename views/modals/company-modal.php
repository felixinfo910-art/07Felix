<!-- 8. 新增/编辑公司主体弹窗 -->
<div id="companyModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="companyModalTitleText">维护公司主体</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="companyModalId">
      <div class="form-group">
        <label class="form-label">公司法定全称 (开票完整抬头) *</label>
        <input type="text" id="companyModalName" class="form-control" placeholder="如：德泰进出口贸易(深圳)有限公司">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">展示简称 (用于标签徽章) *</label>
          <input type="text" id="companyModalShortName" class="form-control" placeholder="如：德泰外贸">
        </div>
        <div class="form-group">
          <label class="form-label">胶囊标识配色</label>
          <select id="companyModalColor" class="form-control">
            <option value="blue">🔵 科技深蓝</option>
            <option value="orange">🟠 商务活力橙</option>
            <option value="green">🟢 稳健清绿</option>
            <option value="purple">🟣 典雅雅紫</option>
            <option value="red">🔴 热情绯红</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">统一社会信用代码 (纳税人识别号/税号)</label>
        <input type="text" id="companyModalTaxNumber" class="form-control" placeholder="91440300XXXXXXXXXX">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">开户银行全称</label>
          <input type="text" id="companyModalBankName" class="form-control" placeholder="如：招商银行深圳高新园支行">
        </div>
        <div class="form-group">
          <label class="form-label">银行对公账号</label>
          <input type="text" id="companyModalBankAccount" class="form-control" placeholder="7559 1234 5678 901">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">开票注册地址及联系电话</label>
        <input type="text" id="companyModalAddressPhone" class="form-control" placeholder="如：深圳市南山区高新南道某大厦 0755-88888888">
      </div>
      <div class="form-group">
        <label class="form-label">备注备忘 (主营范围、业务定位)</label>
        <textarea id="companyModalRemark" class="form-control" rows="2" placeholder="简述该主体的定位与经营方向"></textarea>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="companyModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteCompany()">删除此公司</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveCompany()">保存公司主体</button>
      </div>
    </div>
  </div>
</div>
