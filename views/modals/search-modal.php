<!-- 1. 全局快捷搜索 Command Palette (Ctrl+K) -->
<div id="searchModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeSearchModal()">
  <div class="modal-dialog">
    <div style="padding:14px 18px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:10px">
      <span style="font-size:16px">🔍</span>
      <input type="text" id="searchBoxInput" class="form-control" placeholder="输入关键字快速跳转任何网站后台、续费项、知识库..." style="border:none;background:transparent;font-size:15px" oninput="App.renderSearchResults(this.value)">
      <span class="kbd-shortcut">ESC</span>
    </div>
    <div id="searchResultsList" style="max-height:380px;overflow-y:auto;padding:8px"></div>
  </div>
</div>
