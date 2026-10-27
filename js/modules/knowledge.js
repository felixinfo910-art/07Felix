export const KnowledgeModule = {
  // 极简高性能纯原生 Markdown 渲染解析器 (无需第三方网络依赖，开箱即用)
  renderMarkdown(text) {
    if (!text) return '';
    let html = String(text);

    // 1. 转义基础 HTML 字符防止 XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. 多行代码块 ```lang\ncode\n```
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="md-code-block"><div class="md-code-lang">${lang || 'code'}</div><code>${code.trim()}</code></pre>`;
    });

    // 3. 行内代码 `code`
    html = html.replace(/`([^`\n]+)`/g, '<code class="md-inline-code">$1</code>');

    // 4. 标题 # ~ ####
    html = html.replace(/^#### (.*?)$/gm, '<h5 class="md-h5">$1</h5>');
    html = html.replace(/^### (.*?)$/gm, '<h4 class="md-h4">$1</h4>');
    html = html.replace(/^## (.*?)$/gm, '<h3 class="md-h3">$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h2 class="md-h2">$1</h2>');

    // 5. 强调与加粗 **bold** 或 __bold__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // 6. 斜体 *italic*
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // 7. 引用块 > text
    html = html.replace(/^\> (.*?)$/gm, '<blockquote class="md-quote">$1</blockquote>');

    // 8. 无序列表 - item 或 * item
    html = html.replace(/^[\-\*] (.*?)$/gm, '<div class="md-list-item"><span class="md-bullet">•</span><span>$1</span></div>');

    // 9. 有序列表 1. item
    html = html.replace(/^(\d+)\. (.*?)$/gm, '<div class="md-list-item"><span class="md-number">$1.</span><span>$2</span></div>');

    // 10. 分割线 ---
    html = html.replace(/^---$/gm, '<hr class="md-divider" />');

    // 11. 普通段落与换行处理
    // 连续两个以上换行切为段落间距
    html = html.replace(/\n\n+/g, '<div class="md-paragraph-break"></div>');
    // 单换行转为 <br> (注意代码块与列表除外)
    html = html.replace(/\n/g, '<br>');

    return html;
  },

  async loadKnowledge() {
    try {
      const res = await fetch('api.php?action=get_knowledge').then(r => r.json());
      if (!res.success) return;
      this.state.knowledgeDocs = res.data;
      this.renderKnowledgeSidebar();
      this.bindAiInputEvents();
      // 移动端默认展示 AI 对话界面
      this.switchKbMobileView('chat');
    } catch (e) {
      console.error(e);
    }
  },

  switchKbMobileView(view) {
    const container = document.querySelector('.kb-workbench-container');
    const btnChat = document.getElementById('btnKbMobileChat');
    const btnDocs = document.getElementById('btnKbMobileDocs');
    if (!container) return;

    if (view === 'docs') {
      container.classList.remove('show-chat');
      container.classList.add('show-docs');
      if (btnDocs) btnDocs.classList.add('active');
      if (btnChat) btnChat.classList.remove('active');
    } else {
      container.classList.remove('show-docs');
      container.classList.add('show-chat');
      if (btnChat) btnChat.classList.add('active');
      if (btnDocs) btnDocs.classList.remove('active');
    }
  },

  renderKnowledgeSidebar() {
    const listEl = document.getElementById('kbDocsList');
    const badgeEl = document.getElementById('kbDocCountBadge');
    if (badgeEl) {
      badgeEl.innerText = this.state.knowledgeDocs.length;
    }
    if (!listEl) return;

    if (this.state.knowledgeDocs.length === 0) {
      listEl.innerHTML = `<div style="font-size:12px;color:var(--text-muted);padding:14px;text-align:center">暂无文档，点击右上角写文档</div>`;
      return;
    }

    listEl.innerHTML = this.state.knowledgeDocs.map((doc, idx) => `
      <div class="kb-doc-item ${this.state.selectedDoc && this.state.selectedDoc.id === doc.id ? 'active' : ''}" onclick="App.selectKbDoc(${doc.id})">
        <div style="min-width:0;flex:1">
          <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${doc.title}</div>
          <div style="font-size:11px;color:var(--text-muted)">${doc.category || '未分类'}</div>
        </div>
        <button class="btn btn-sm btn-secondary" style="padding:2px 6px;margin-left:6px" onclick="event.stopPropagation(); App.deleteKbDoc(${doc.id})">✕</button>
      </div>
    `).join('');
  },

  selectKbDoc(id) {
    const doc = this.state.knowledgeDocs.find(d => d.id === id);
    if (!doc) return;
    this.state.selectedDoc = doc;
    this.renderKnowledgeSidebar();

    // 填充到编辑器
    document.getElementById('kbEditId').value = doc.id;
    document.getElementById('kbEditTitle').value = doc.title;
    document.getElementById('kbEditCategory').value = doc.category;
    document.getElementById('kbEditTags').value = doc.tags || '';
    document.getElementById('kbEditContent').value = doc.content || '';
    const titleEl = document.getElementById('kbEditorModeTitle');
    if (titleEl) titleEl.innerText = '📝 编辑文档: ' + doc.title;
  },

  resetKbForm() {
    this.state.selectedDoc = null;
    this.renderKnowledgeSidebar();
    document.getElementById('kbEditId').value = '';
    document.getElementById('kbEditTitle').value = '';
    document.getElementById('kbEditCategory').value = '业务SOP';
    document.getElementById('kbEditTags').value = '';
    document.getElementById('kbEditContent').value = '';
    const titleEl = document.getElementById('kbEditorModeTitle');
    if (titleEl) titleEl.innerText = '📝 起草新知识文档';
    const titleInput = document.getElementById('kbEditTitle');
    if (titleInput) titleInput.focus();
  },

  clearAiChatHistory() {
    this.state.aiChatHistory = [];
    const messagesList = document.getElementById('aiMessagesList');
    if (messagesList) {
      messagesList.innerHTML = `
        <div class="chat-bubble ai">
          对话已清屏。您可以随时提问，我将继续结合左侧知识库与工作台为您深度解答！
        </div>
      `;
    }
  },

  bindAiInputEvents() {
    const textarea = document.getElementById('aiPromptInput');
    if (!textarea || textarea.dataset.bound === 'true') return;
    textarea.dataset.bound = 'true';

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendAiMessage('chat');
      }
    });
  },

  async saveKbDoc() {
    const id = document.getElementById('kbEditId').value;
    const title = document.getElementById('kbEditTitle').value.trim();
    const category = document.getElementById('kbEditCategory').value.trim();
    const tags = document.getElementById('kbEditTags').value.trim();
    const content = document.getElementById('kbEditContent').value.trim();

    if (!title) {
      alert('请输入文档标题');
      return;
    }

    const res = await fetch('api.php?action=save_knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title, category, tags, content })
    }).then(r => r.json());

    if (res.success) {
      alert('文档已保存到知识库');
      this.loadKnowledge();
    } else {
      alert(res.message);
    }
  },

  async deleteKbDoc(id) {
    if (!confirm('确认删除该篇知识库文档？')) return;
    await fetch('api.php?action=delete_knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    this.resetKbForm();
    this.loadKnowledge();
  },

  // AI 发送指令/提问
  async sendAiMessage(mode = 'chat') {
    const inputEl = document.getElementById('aiPromptInput');
    const prompt = inputEl.value.trim();
    if (!prompt && mode === 'chat') {
      alert('请输入要咨询或让 AI 处理的内容');
      return;
    }

    const messagesList = document.getElementById('aiMessagesList');
    
    // 显示用户提问气泡
    if (prompt) {
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.innerText = prompt;
      messagesList.appendChild(userBubble);
      inputEl.value = '';
    }

    // AI 思考中占位气泡
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    aiBubble.innerText = '🤖 幕僚思考中，请稍候...';
    messagesList.appendChild(aiBubble);
    messagesList.scrollTop = messagesList.scrollHeight;

    try {
      const res = await fetch('ai.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode,
          prompt: prompt,
          history: this.state.aiChatHistory
        })
      }).then(r => r.json());

      if (res.success) {
        aiBubble.innerHTML = this.renderMarkdown(res.data.reply);
        this.state.aiChatHistory.push({ role: 'user', content: prompt });
        this.state.aiChatHistory.push({ role: 'assistant', content: res.data.reply });

        // 如果是拆解任务模式，尝试自动解析 JSON 添加任务
        if (mode === 'parse_task') {
          this.handleAiTasksParse(res.data.reply);
        }
      } else {
        aiBubble.innerHTML = `<span style="color:var(--danger-color)">❌ ${this.renderMarkdown(res.message || '回复失败')}</span>`;
      }
    } catch (e) {
      aiBubble.innerHTML = `<span style="color:var(--danger-color)">❌ 请求异常: ${e.message}</span>`;
    }
    messagesList.scrollTop = messagesList.scrollHeight;
  },

  // 处理 AI 自动拆解任务的响应
  async handleAiTasksParse(replyText) {
    try {
      const jsonMatch = replyText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tasks = JSON.parse(jsonMatch[0]);
        for (const t of tasks) {
          await fetch('api.php?action=save_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(t)
          });
        }
        alert(`已成功由 AI 提炼并创建了 ${tasks.length} 项待办任务！`);
      }
    } catch (e) {
      console.log('AI 未返回标准 JSON 数组，已直接呈现文本供参考');
    }
  },

};
