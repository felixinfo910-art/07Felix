    <!-- ==================== TAB 6: KNOWLEDGE AI 知识库与智能幕僚 ==================== -->
    <section id="panel-knowledge" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">个人知识库与 AI 智能幕僚</div>
          <div class="section-subtitle">沉淀公司规章、业务 SOP、技术运维要点；支持 AI 智能问答、一键拆解杂乱想法、自动起草管理周报</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" onclick="App.sendAiMessage('parse_task')">AI 拆解任务</button>
          <button class="btn btn-secondary" onclick="App.sendAiMessage('weekly_report')">生成管理周报</button>
        </div>
      </div>

      <div class="kb-layout">
        <!-- 左侧文档列表 -->
        <div class="kb-sidebar">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span style="font-weight:600;font-size:13px">知识文档分类</span>
            <button class="btn btn-sm btn-secondary" onclick="App.resetKbForm()">写文档</button>
          </div>
          <div id="kbDocsList" style="flex:1;overflow-y:auto"></div>
        </div>

        <!-- 右侧：上部知识编辑 / 下部 AI 对话 -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- 文档详情/编辑卡片 -->
          <div class="kpi-card" style="padding:16px">
            <input type="hidden" id="kbEditId">
            <div style="display:flex;gap:10px;margin-bottom:10px">
              <input type="text" id="kbEditTitle" class="form-control" placeholder="文档标题 (如: 域名备案与续费规范)" style="flex:2">
              <input type="text" id="kbEditCategory" class="form-control" placeholder="分类 (如: 运维管理)" style="flex:1">
              <input type="text" id="kbEditTags" class="form-control" placeholder="标签 (逗号分隔)" style="flex:1">
              <button class="btn btn-primary" onclick="App.saveKbDoc()">保存文档</button>
            </div>
            <textarea id="kbEditContent" class="form-control" rows="5" placeholder="在此沉淀你的工作经验、SOP规范、账号规则、合同备忘等... AI 回答时将自动参考此背景知识"></textarea>
          </div>

          <!-- AI 智能问答交互窗 -->
          <div class="ai-chat-box" style="height:380px">
            <div style="padding:10px 16px;background:var(--bg-subtle);border-bottom:1px solid var(--border-light);font-size:12.5px;font-weight:600;display:flex;justify-content:space-between">
              <span>🤖 24小时私人管理幕僚 (基于你的知识库深度协同)</span>
              <span style="font-size:11px;color:var(--text-muted)">兼容 DeepSeek / Kimi / OpenAI</span>
            </div>
            <div id="aiMessagesList" class="ai-messages-list">
              <div class="chat-bubble ai">您好！我是您的私人管理智囊。我已经接入了您的个人工作台知识库背景，您可以随时向我咨询业务 SOP、公司制度，或者输入一段凌乱的想法让我为您拆解成任务清单！</div>
            </div>
            <div class="ai-input-area">
              <textarea id="aiPromptInput" class="ai-textarea" rows="2" placeholder="在此输入问题，或粘贴一段会议速记/杂乱事务让 AI 处理 (Enter发送)..."></textarea>
              <button class="btn btn-primary" onclick="App.sendAiMessage('chat')">发送咨询</button>
            </div>
          </div>
        </div>
      </div>
    </section>
