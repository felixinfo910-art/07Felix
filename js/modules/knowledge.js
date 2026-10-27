export const KnowledgeModule = {
  async loadKnowledge() {
    try {
      const res = await fetch('api.php?action=get_knowledge').then(r => r.json());
      if (!res.success) return;
      this.state.knowledgeDocs = res.data;
      this.renderKnowledgeSidebar();
    } catch (e) {
      console.error(e);
    }
  },

  renderKnowledgeSidebar() {
    const listEl = document.getElementById('kbDocsList');
    if (!listEl) return;

    if (this.state.knowledgeDocs.length === 0) {
      listEl.innerHTML = `<div style="font-size:12px;color:var(--text-muted);padding:10px">知识库暂无文档</div>`;
      return;
    }

    listEl.innerHTML = this.state.knowledgeDocs.map((doc, idx) => `
      <div class="kb-doc-item ${this.state.selectedDoc && this.state.selectedDoc.id === doc.id ? 'active' : ''}" onclick="App.selectKbDoc(${doc.id})">
        <div>
          <div style="font-weight:500">${doc.title}</div>
          <div style="font-size:11px;color:var(--text-muted)">${doc.category}</div>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); App.deleteKbDoc(${doc.id})">✕</button>
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
  },

  resetKbForm() {
    this.state.selectedDoc = null;
    this.renderKnowledgeSidebar();
    document.getElementById('kbEditId').value = '';
    document.getElementById('kbEditTitle').value = '';
    document.getElementById('kbEditCategory').value = '业务SOP';
    document.getElementById('kbEditTags').value = '';
    document.getElementById('kbEditContent').value = '';
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
    aiBubble.innerText = '🤖 思考中...';
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
        aiBubble.innerText = res.data.reply;
        this.state.aiChatHistory.push({ role: 'user', content: prompt });
        this.state.aiChatHistory.push({ role: 'assistant', content: res.data.reply });

        // 如果是拆解任务模式，尝试自动解析 JSON 添加任务
        if (mode === 'parse_task') {
          this.handleAiTasksParse(res.data.reply);
        }
      } else {
        aiBubble.innerText = '❌ ' + res.message;
      }
    } catch (e) {
      aiBubble.innerText = '❌ 请求异常: ' + e.message;
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
