<!-- 6. 续费项弹窗 -->
<div id="renewalModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span id="renewalModalTitleText">资产与续费维护</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="renewalEditId">
      <div class="form-group">
        <label class="form-label">资产名称 <span style="color:var(--danger-color)">*</span></label>
        <input type="text" id="renewalEditName" class="form-control" placeholder="如：主域名 (example.com) 或 核心生产服务器">
      </div>
      <div class="form-group">
        <label class="form-label">所属公司主体 (用于多实体资产核算与发票归集)</label>
        <select id="renewalEditCompanyId" class="form-control">
          <option value="0">-- 暂不归属特定主体 (公共/通用) --</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">关联网站项目 (可选，在项目工作台通道中将自动展示联动)</label>
        <select id="renewalEditProjectId" class="form-control">
          <option value="0">-- 暂不关联特定网站项目 (独立资产) --</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">资产分类</label>
        <select id="renewalEditCategory" class="form-control">
          <option value="domain">🌐 域名 (Domain)</option>
          <option value="server">🖥️ 云服务器 (ECS/CVM)</option>
          <option value="ssl">🔒 SSL 证书</option>
          <option value="saas">💼 软件订阅 (SaaS)</option>
          <option value="other">📦 其他重要到期项</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">注册 / 托管服务商</label>
        <input type="text" id="renewalEditProvider" class="form-control" placeholder="如：阿里云、腾讯云、Godaddy、Notion、AWS、Cloudflare">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="form-group">
          <label class="form-label">到期日期 <span style="color:var(--danger-color)">*</span></label>
          <input type="date" id="renewalEditExpireDate" class="form-control">
          <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap">
            <span style="font-size:11px;color:var(--text-muted);display:flex;align-items:center">快捷延期:</span>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(1, 'year')">+1年</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(6, 'month')">+6个月</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(3, 'month')">+3个月</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(1, 'month')">+1个月</button>
            <button type="button" class="btn btn-sm btn-secondary" style="font-size:11px;padding:1px 6px" onclick="App.adjustRenewalExpireDate(1, 'year', true)">今日起+1年</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">提前预警阈值</label>
          <select id="renewalEditRemindDays" class="form-control">
            <option value="7">提前 7 天紧急预警</option>
            <option value="15">提前 15 天预警</option>
            <option value="30" selected>提前 30 天常规预警</option>
            <option value="60">提前 60 天长周期预警</option>
            <option value="90">提前 90 天远期预警</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">预计续费成本 (元)</label>
        <input type="number" step="0.01" id="renewalEditCost" class="form-control" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">官方续费后台直达链接 (点击可直接跳转缴费)</label>
        <input type="url" id="renewalEditUrl" class="form-control" placeholder="https://...">
      </div>

      <!-- 登录凭据与账号密码安全管理 (AES-256 加密) -->
      <div style="margin:14px 0 10px 0;border:1px solid var(--border-light);border-radius:var(--radius-sm);background:var(--bg-card);overflow:hidden">
        <div style="padding:10px 12px;background:var(--bg-subtle);display:flex;justify-content:space-between;align-items:center;cursor:pointer" onclick="document.getElementById('renewalCredentialSec').style.display = document.getElementById('renewalCredentialSec').style.display === 'none' ? 'block' : 'none'">
          <div style="font-size:12.5px;font-weight:600;display:flex;align-items:center;gap:6px">
            <span>🔑</span><span>控制台登录安全凭据 (可选，AES-256 加密存储)</span>
          </div>
          <span style="font-size:11px;color:var(--text-muted)">展开 / 折叠 ▾</span>
        </div>
        <div id="renewalCredentialSec" style="padding:12px;display:none">
          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between">
              <span>登录账号 / 手机 / 邮箱</span>
              <span id="renewalCurrentPassStatus" style="font-size:11px"></span>
            </label>
            <input type="text" id="renewalLoginAccount" class="form-control" placeholder="如：admin@company.com 或 13800138000">
          </div>
          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between">
              <span>登录密码 (AES-256 加密存管)</span>
              <div style="display:flex;gap:8px">
                <a href="javascript:void(0)" onclick="App.generateRandomPassword('renewalLoginPassword')" style="font-size:11.5px;color:var(--accent-color)">🎲 随机生成强密码</a>
                <a href="javascript:void(0)" onclick="App.togglePasswordVisibility('renewalLoginPassword')" style="font-size:11.5px;color:var(--text-secondary)">👁️ 显示/隐藏</a>
              </div>
            </label>
            <input type="password" id="renewalLoginPassword" class="form-control" placeholder="留空则保持原密码不变；如需修改输入新密码">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);margin-top:6px;cursor:pointer">
              <input type="checkbox" id="renewalClearPassword"> 清除已保存的密码
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">直达自动化模式</label>
            <select id="renewalAutoLoginType" class="form-control" onchange="document.getElementById('renewalPostTargetGroup').style.display = this.value === 'post_submit' ? 'block' : 'none'">
              <option value="copy_and_jump">🚀 安全浮窗倒计时与一键快填 (推荐: 打开官网+浮窗倒计时)</option>
              <option value="post_submit">⚡ 表单模拟自动提交 (内部系统/需目标支持)</option>
              <option value="none">仅记录，普通跳转</option>
            </select>
          </div>
          <div class="form-group" id="renewalPostTargetGroup" style="display:none">
            <label class="form-label">自定义 POST 目标 Action URL</label>
            <input type="url" id="renewalPostTargetUrl" class="form-control" placeholder="https://...">
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:0">
        <label class="form-label">备忘 / 账号说明</label>
        <input type="text" id="renewalEditNote" class="form-control" placeholder="如：账号 admin@corp.com / 见密码本">
      </div>
    </div>
    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" id="renewalModalDeleteBtn" class="btn btn-danger" style="display:none" onclick="App.deleteRenewal(this)">删除此资产</button>
      <div style="display:flex;gap:8px;margin-left:auto">
        <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
        <button class="btn btn-primary" onclick="App.saveRenewalItem()">保存资产修改</button>
      </div>
    </div>
  </div>
</div>
