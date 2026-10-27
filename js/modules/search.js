export const SearchModule = {
  openSearchModal() {
    this.state.searchOpen = true;
    document.getElementById('searchModal').style.display = 'flex';
    const input = document.getElementById('searchBoxInput');
    input.value = '';
    input.focus();
    this.renderSearchResults('');
  },

  closeSearchModal() {
    this.state.searchOpen = false;
    document.getElementById('searchModal').style.display = 'none';
  },

  renderSearchResults(query) {
    const resultsEl = document.getElementById('searchResultsList');
    if (!resultsEl) return;
    const q = query.toLowerCase().trim();

    // 收集各模块结果
    const results = [];

    // 搜索项目及链接
    (this.state.projects || []).forEach(p => {
      if (p.name.toLowerCase().includes(q) || (p.code && p.code.toLowerCase().includes(q))) {
        results.push({ type: '项目', title: p.name, desc: p.description, action: () => { App.switchTab('projects'); App.closeSearchModal(); } });
      }
      (p.links || []).forEach(l => {
        if (l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)) {
          results.push({ type: '快捷直达', title: `${p.name} ➔ ${l.title}`, desc: l.url, action: () => { window.open(this.formatUrl(l.url), '_blank'); App.closeSearchModal(); } });
        }
      });
    });

    // 搜索续费项
    (this.state.renewals || []).forEach(r => {
      if (r.name.toLowerCase().includes(q) || (r.provider && r.provider.toLowerCase().includes(q))) {
        results.push({ type: '资产续费', title: r.name, desc: `到期: ${r.expire_date} · 剩 ${r.days_left} 天`, action: () => { App.switchTab('renewals'); App.closeSearchModal(); } });
      }
    });

    // 搜索知识库
    (this.state.knowledgeDocs || []).forEach(k => {
      if (k.title.toLowerCase().includes(q) || (k.tags && k.tags.toLowerCase().includes(q))) {
        results.push({ type: '知识库', title: k.title, desc: k.category, action: () => { App.switchTab('knowledge'); App.selectKbDoc(k.id); App.closeSearchModal(); } });
      }
    });

    // 搜索快速通道 (如 1688、国际站、邮箱等直达)
    (this.state.quickPortals || []).forEach(p => {
      const title = p.title || '';
      const cat = p.category || '';
      const note = p.account_note || '';
      const url = p.url || '';
      if (title.toLowerCase().includes(q) || cat.toLowerCase().includes(q) || note.toLowerCase().includes(q) || url.toLowerCase().includes(q)) {
        results.push({
          type: '快速通道',
          title: `${p.icon || '⚡'} ${p.title} · ${cat}`,
          desc: note ? `${note} · ${url}` : url,
          action: () => { window.open(this.formatUrl(p.url), '_blank'); App.closeSearchModal(); }
        });
      }
    });

    if (results.length === 0) {
      resultsEl.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted)">无匹配结果</div>`;
      return;
    }

    resultsEl.innerHTML = results.slice(0, 8).map((item, idx) => `
      <div class="search-result-item" style="padding:10px 14px;border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-light)" onclick="App.triggerSearchResult(${idx})">
        <div>
          <div style="font-weight:600;font-size:13.5px">${item.title}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${item.desc || ''}</div>
        </div>
        <span class="badge-status normal">${item.type}</span>
      </div>
    `).join('');

    this.state.currentSearchResults = results;
  },

  triggerSearchResult(index) {
    if (this.state.currentSearchResults && this.state.currentSearchResults[index]) {
      this.state.currentSearchResults[index].action();
    }
  },

};
