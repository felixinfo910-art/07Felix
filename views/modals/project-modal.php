<!-- 2. 新增/编辑项目弹窗 -->
<div id="projectModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="projModalTitleText">网站项目维护</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="projModalId">
      <div class="form-group">
        <label class="form-label">项目名称</label>
        <input type="text" id="projModalName" class="form-control" placeholder="如：品牌核心官网与分站矩阵">
      </div>
      <div class="form-group">
        <label class="form-label">业务代号 (Code)</label>
        <input type="text" id="projModalCode" class="form-control" placeholder="如：WEB-MAIN">
      </div>
      <div class="form-group">
        <label class="form-label">所属公司主体 (用于多实体资产开票与发票归集)</label>
        <select id="projModalCompanyId" class="form-control">
          <option value="0">-- 暂不归属特定公司 (公共/通用) --</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">业务分组/分类</label>
        <select id="projModalCategory" class="form-control">
          <option value="核心官网">🌐 核心官网与品牌矩阵</option>
          <option value="自研系统">⚙️ 自研业务系统/后台</option>
          <option value="外贸独立站">📦 外贸独立站/海外商城</option>
          <option value="服务器运维">🖥️ 云主机与运维设施</option>
          <option value="综合项目">📁 综合业务/其他</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">项目概要与说明</label>
        <textarea id="projModalDesc" class="form-control" rows="2" placeholder="简述该项目的主要职能与服务对象"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
          <span>🔒 SSL 证书到期时间 (可选)</span>
          <span style="font-size:11px;color:var(--text-muted);font-weight:normal">手写/选择到期日后自动倒计时，留空则不监控</span>
        </label>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="date" id="projModalSslDate" class="form-control">
          <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('projModalSslDate').value=''" title="清空并关闭此项倒计时">清空</button>
        </div>
      </div>

      <!-- 网站设置内的入口列表管理区 (支持直接编辑和删除写错的入口) -->
      <div id="projModalLinksSection" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-light)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <label class="form-label" style="font-weight:600;margin-bottom:0">已纳管的直达入口 (<span id="projModalLinksCount">0</span> 个)</label>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.openAddLinkModal(document.getElementById('projModalId').value)">添加入口</button>
        </div>
        <div id="projModalLinksList" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto"></div>
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="projModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteProject()">删除此项目</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveProject()">保存项目</button>
      </div>
    </div>
  </div>
</div>
