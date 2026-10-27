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

      <div class="kb-workbench-container">
        <!-- 左侧文档管理与编辑专区 -->
        <div class="kb-docs-column">
          <!-- 文档分类侧栏 / 列表 -->
          <div class="kb-sidebar-panel">
            <div class="kb-panel-header">
              <div style="display:flex;align-items:center;gap:6px">
                <span>📚</span>
                <span style="font-weight:600;font-size:13.5px">知识文档</span>
                <span id="kbDocCountBadge" class="brand-badge" style="margin-left:2px">0</span>
              </div>
              <button class="btn btn-sm btn-secondary" onclick="App.resetKbForm()">+ 写文档</button>
            </div>
            <div id="kbDocsList" class="kb-docs-scroll"></div>
          </div>

          <!-- 文档编辑/沉淀卡片 -->
          <div class="kb-editor-card">
            <div class="kb-editor-header">
              <span id="kbEditorModeTitle" style="font-weight:600;font-size:13px;color:var(--text-main)">📝 编辑知识文档</span>
              <button class="btn btn-primary btn-sm" onclick="App.saveKbDoc()">💾 保存至知识库</button>
            </div>
            <input type="hidden" id="kbEditId">
            <div class="kb-editor-meta-row">
              <input type="text" id="kbEditTitle" class="form-control" placeholder="文档标题 (如: 域名备案与续费规范)" style="flex:2">
              <input type="text" id="kbEditCategory" class="form-control" placeholder="分类 (如: 运维管理)" style="flex:1">
              <input type="text" id="kbEditTags" class="form-control" placeholder="标签 (逗号分隔)" style="flex:1">
            </div>
            <textarea id="kbEditContent" class="form-control kb-content-textarea" placeholder="在此沉淀工作经验、SOP规范、账号规则、合同备忘等...&#10;💡 AI 幕僚在回答时会自动学习此背景知识，为你提供贴合公司的专业分析。"></textarea>
          </div>
        </div>

        <!-- 右侧 AI 智囊大屏深度问答对话区 -->
        <div class="ai-chat-column">
          <div class="ai-chat-box">
            <div class="ai-chat-header">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:16px">🤖</span>
                <div>
                  <div style="font-weight:600;font-size:13.5px">24小时私人管理幕僚</div>
                  <div style="font-size:11px;color:var(--text-muted)">已深度融合左侧个人知识库背景</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:11.5px;color:var(--text-muted)" class="ai-model-tag">DeepSeek / OpenAI 强驱动</span>
                <button class="btn btn-sm btn-secondary" onclick="App.clearAiChatHistory()" title="清空当前对话气泡">🧹 清屏</button>
              </div>
            </div>

            <div id="aiMessagesList" class="ai-messages-list">
              <div class="chat-bubble ai">您好！我是您的私人管理智囊。我已经接入了您的个人工作台知识库背景，您可以随时向我咨询业务 SOP、公司制度，或者输入一段凌乱的想法让我为您拆解成任务清单！</div>
            </div>

            <div class="ai-input-area">
              <textarea id="aiPromptInput" class="ai-textarea" rows="3" placeholder="在此输入咨询问题，或粘贴会议速记/杂乱事务让 AI 整理 (Shift+Enter换行，Enter立即发送)..."></textarea>
              <div class="ai-send-bar">
                <div style="font-size:11.5px;color:var(--text-muted)">按 Enter 发送</div>
                <button class="btn btn-primary" onclick="App.sendAiMessage('chat')">
                  <span>发送咨询</span>
                  <span style="font-size:12px">🚀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
