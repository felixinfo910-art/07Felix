<!-- 11. 移动端专属：资产轻量速览与快捷延期抽屉 (Detail Sheet) -->
<div id="renewalDetailSheet" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog renewal-sheet-dialog">
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:6px">
        <span id="sheetCatIcon" style="font-size:16px">🌐</span>
        <span id="sheetTitleText" style="font-weight:600;font-size:14.5px">资产详情速览</span>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body" style="padding:14px 16px">
      <!-- 倒计时横幅 -->
      <div id="sheetStatusBanner" style="padding:10px 12px;border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;background:var(--bg-subtle)">
        <div style="display:flex;flex-direction:column">
          <span style="font-size:11px;color:var(--text-muted)">当前生命周期</span>
          <span id="sheetStatusText" style="font-weight:600;font-size:13.5px"></span>
        </div>
        <div style="text-align:right">
          <span style="font-size:11px;color:var(--text-muted)">到期日期</span>
          <div id="sheetExpireDate" style="font-weight:600;font-size:13px;font-family:monospace"></div>
        </div>
      </div>

      <!-- 核心指标两列排布 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="sheet-info-cell">
          <span class="sheet-info-label">归属主体</span>
          <span id="sheetCompany" class="sheet-info-val">-</span>
        </div>
        <div class="sheet-info-cell">
          <span class="sheet-info-label">关联项目</span>
          <span id="sheetProject" class="sheet-info-val">-</span>
        </div>
        <div class="sheet-info-cell">
          <span class="sheet-info-label">托管服务商</span>
          <span id="sheetProvider" class="sheet-info-val">-</span>
        </div>
        <div class="sheet-info-cell">
          <span class="sheet-info-label">续费成本预估</span>
          <span id="sheetCost" class="sheet-info-val" style="color:var(--accent-color);font-weight:600">￥0.00</span>
        </div>
      </div>

      <!-- 账号与安全密保卡片 -->
      <div id="sheetCredentialSec" style="background:var(--bg-subtle);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px">
        <div style="font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;gap:4px;margin-bottom:4px">
          <span>🔑</span><span>登录账号 / 备忘说明</span>
        </div>
        <div id="sheetAccountVal" style="font-size:12.5px;font-weight:500;word-break:break-all">暂无备忘</div>
      </div>

      <!-- 一键快捷延期 (已在官网续期，手机上轻触快速同步更新) -->
      <div style="margin-bottom:6px;border:1px dashed var(--border-medium);border-radius:var(--radius-sm);padding:10px 12px">
        <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px">⚡ 快捷延期更新 (厂商已扣款续期，轻触快速同步):</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(1, 'year')">+1年</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(6, 'month')">+6个月</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(3, 'month')">+3个月</button>
          <button type="button" class="btn btn-sm btn-secondary" onclick="App.quickExtendCurrentRenewal(1, 'year', true)">今日起+1年</button>
        </div>
      </div>

      <input type="hidden" id="sheetRenewalId">
    </div>

    <div class="modal-footer" style="display:flex;justify-content:space-between;align-items:center">
      <button type="button" class="btn btn-secondary" onclick="App.editFromSheet()">
        ✏️ 完整编辑
      </button>
      <div style="display:flex;gap:8px">
        <button type="button" class="btn btn-secondary" onclick="App.closeAllModals()">关闭</button>
        <span id="sheetLaunchBtnWrap"></span>
      </div>
    </div>
  </div>
</div>
<div id="securityLoginDock" class="security-login-dock" style="display:none">
  <div class="dock-header">
    <div class="dock-title-wrap">
      <span class="dock-icon">🛡️</span>
      <div>
        <div class="dock-title" id="dockSiteTitle">已直达目标平台</div>
        <div class="dock-sub" id="dockSiteUrl">https://...</div>
      </div>
    </div>
    <button class="dock-close-btn" onclick="App.closeSecurityDock()" title="关闭助手">✕</button>
  </div>