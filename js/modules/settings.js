export const SettingsModule = {
  async loadConfigSettings() {
    this.loadCardProfile();
    const res = await fetch('api.php?action=get_config').then(r => r.json());
    if (res.success) {
      const cfg = res.data;
      if (document.getElementById('cfgAppTitle')) document.getElementById('cfgAppTitle').value = cfg.app_title || '';
      if (document.getElementById('cfgAiBaseUrl')) document.getElementById('cfgAiBaseUrl').value = cfg.ai_base_url || '';
      if (document.getElementById('cfgAiModel')) document.getElementById('cfgAiModel').value = cfg.ai_model || '';
      if (document.getElementById('cfgAiPrompt')) document.getElementById('cfgAiPrompt').value = cfg.ai_system_prompt || '';
      if (document.getElementById('cfgAiKeyStatus')) {
        document.getElementById('cfgAiKeyStatus').innerText = cfg.has_ai_key ? '✅ 已配置 API Key' : '⚠️ 尚未配置 API Key';
      }
    }
  },

  // 切换设置左侧子导航
  switchSettingsSubTab(subTabName) {
    document.querySelectorAll('.settings-sub-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sub === subTabName);
    });
    document.querySelectorAll('.settings-sub-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    const targetPanel = document.getElementById(`settings-sub-${subTabName}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
    if (subTabName === 'account') {
      this.loadUsers();
    } else if (subTabName === 'card') {
      this.loadCardProfile();
    }
  },

  // 加载我的名片数据
  async loadCardProfile() {
    try {
      const res = await fetch('api.php?action=get_card_profile').then(r => r.json());
      if (res.success && res.data) {
        const d = res.data;
        if (document.getElementById('cardFormName')) document.getElementById('cardFormName').value = d.display_name || d.username || '何志忠';
        if (document.getElementById('cardFormCompany')) document.getElementById('cardFormCompany').value = d.company || '拾贝管家演示企业';
        if (document.getElementById('cardFormPhone')) document.getElementById('cardFormPhone').value = d.phone || '+86 13925521330';
        if (document.getElementById('cardFormEmail')) document.getElementById('cardFormEmail').value = d.email || '478244551@qq.com';
        if (document.getElementById('cardFormWhatsapp')) document.getElementById('cardFormWhatsapp').value = d.whatsapp || '+86 13925521330';
        if (document.getElementById('cardFormTitle')) document.getElementById('cardFormTitle').value = d.title || '';
        
        const style = d.card_style || 'business';
        if (document.getElementById('cardStyleSelect')) document.getElementById('cardStyleSelect').value = style;
        this.onCardStyleChange(style);
        this.syncCardPreview();
      }
    } catch (e) {
      console.error('加载名片数据异常', e);
    }
  },

  // 风格切换 (商务风格 / 标准风格)
  onCardStyleChange(style) {
    const pvBusiness = document.getElementById('cardPreviewBusiness');
    const pvStandard = document.getElementById('cardPreviewStandard');
    if (style === 'standard') {
      if (pvBusiness) pvBusiness.style.display = 'none';
      if (pvStandard) pvStandard.style.display = 'flex';
    } else {
      if (pvBusiness) pvBusiness.style.display = 'flex';
      if (pvStandard) pvStandard.style.display = 'none';
    }
  },

  // 实时同步表单输入到名片预览
  syncCardPreview() {
    const name = document.getElementById('cardFormName')?.value.trim() || '何志忠';
    const company = document.getElementById('cardFormCompany')?.value.trim() || '拾贝管家演示企业';
    const phone = document.getElementById('cardFormPhone')?.value.trim() || '+86 13925521330';
    const email = document.getElementById('cardFormEmail')?.value.trim() || '478244551@qq.com';
    const whatsapp = document.getElementById('cardFormWhatsapp')?.value.trim() || '+86 13925521330';
    const title = document.getElementById('cardFormTitle')?.value.trim() || '';

    // 商务风格渲染
    if (document.getElementById('pvBusinessName')) document.getElementById('pvBusinessName').innerText = name;
    if (document.getElementById('pvBusinessCompany')) document.getElementById('pvBusinessCompany').innerText = company;
    if (document.getElementById('pvBusinessPhone')) document.getElementById('pvBusinessPhone').innerText = phone;
    if (document.getElementById('pvBusinessEmail')) document.getElementById('pvBusinessEmail').innerText = email;
    if (document.getElementById('pvBusinessWhatsapp')) document.getElementById('pvBusinessWhatsapp').innerText = whatsapp;
    const bTitleEl = document.getElementById('pvBusinessTitle');
    if (bTitleEl) {
      if (title) {
        bTitleEl.innerText = title;
        bTitleEl.style.display = 'block';
      } else {
        bTitleEl.style.display = 'none';
      }
    }

    // 标准风格渲染
    if (document.getElementById('pvStandardName')) document.getElementById('pvStandardName').innerText = name;
    if (document.getElementById('pvStandardCompany')) document.getElementById('pvStandardCompany').innerText = company;
    if (document.getElementById('pvStandardPhone')) document.getElementById('pvStandardPhone').innerText = phone;
    if (document.getElementById('pvStandardWhatsapp')) document.getElementById('pvStandardWhatsapp').innerText = whatsapp;
    if (document.getElementById('pvStandardEmail')) document.getElementById('pvStandardEmail').innerText = email;
  },

  // 保存名片
  async saveCardProfile() {
    const payload = {
      display_name: document.getElementById('cardFormName')?.value.trim() || '',
      company: document.getElementById('cardFormCompany')?.value.trim() || '',
      phone: document.getElementById('cardFormPhone')?.value.trim() || '',
      email: document.getElementById('cardFormEmail')?.value.trim() || '',
      whatsapp: document.getElementById('cardFormWhatsapp')?.value.trim() || '',
      title: document.getElementById('cardFormTitle')?.value.trim() || '',
      card_style: document.getElementById('cardStyleSelect')?.value || 'business'
    };

    try {
      const res = await fetch('api.php?action=save_card_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        this.showToast('✅ 我的名片已成功保存！');
        const userEl = document.getElementById('headerUserDisplayName');
        if (userEl && payload.display_name) userEl.innerText = payload.display_name;
        this.loadUsers();
      } else {
        this.showToast(res.message || '保存失败', 'error');
      }
    } catch (e) {
      this.showToast('网络异常: ' + e.message, 'error');
    }
  },

  async saveConfigSettings() {
    const appTitle = document.getElementById('cfgAppTitle')?.value.trim() || '';
    const aiBaseUrl = document.getElementById('cfgAiBaseUrl')?.value.trim() || '';
    const aiModel = document.getElementById('cfgAiModel')?.value.trim() || '';
    const aiKey = document.getElementById('cfgAiKey')?.value.trim() || '';
    const aiPrompt = document.getElementById('cfgAiPrompt')?.value.trim() || '';
    const passEl = document.getElementById('cfgPassword');
    const password = passEl ? passEl.value.trim() : '';

    const payload = {
      app_title: appTitle,
      ai_base_url: aiBaseUrl,
      ai_model: aiModel,
      ai_system_prompt: aiPrompt
    };
    if (aiKey) payload.ai_api_key = aiKey;
    if (password) payload.access_password = password;

    const res = await fetch('api.php?action=save_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      this.showToast('系统与 AI 配置已成功保存！');
      const brandEl = document.getElementById('brandTitle');
      if (brandEl && appTitle) brandEl.innerText = appTitle;
      // 清空当前密码框输入
      const keyInput = document.getElementById('cfgAiKey');
      if (keyInput) keyInput.value = '';
      this.loadConfigSettings();
    } else {
      this.showToast(res.message || '保存失败', 'error');
    }
  },

  // 测试 AI 大模型连通性
  async testAiConnection() {
    const btn = document.getElementById('btnTestAiConnection');
    const statusEl = document.getElementById('aiTestResultStatus');
    const aiBaseUrl = document.getElementById('cfgAiBaseUrl')?.value.trim() || '';
    const aiModel = document.getElementById('cfgAiModel')?.value.trim() || '';
    const aiKey = document.getElementById('cfgAiKey')?.value.trim() || '';

    if (btn) {
      btn.disabled = true;
      btn.innerText = '⏳ 正在测试连接...';
    }
    if (statusEl) {
      statusEl.style.color = 'var(--text-muted)';
      statusEl.innerText = '正在向模型端点发送探测握手包...';
    }

    try {
      const res = await fetch('api.php?action=test_ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_base_url: aiBaseUrl,
          ai_model: aiModel,
          ai_api_key: aiKey
        })
      }).then(r => r.json());

      if (res.success) {
        if (statusEl) {
          statusEl.style.color = 'var(--success-color)';
          statusEl.innerHTML = `✅ 连通成功！模型响应: <strong>${res.data.reply}</strong> (模型: ${res.data.model})`;
        }
        this.showToast('AI 模型连通正常！');
      } else {
        if (statusEl) {
          statusEl.style.color = 'var(--danger-color)';
          statusEl.innerHTML = `❌ 连接失败: ${res.message}`;
        }
        this.showToast('AI 连通失败：' + res.message, 'error');
      }
    } catch (e) {
      if (statusEl) {
        statusEl.style.color = 'var(--danger-color)';
        statusEl.innerText = '❌ 请求异常: ' + e.message;
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '🔌 测试 AI 连通性';
      }
    }
  },

  showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.style.display = 'flex';
      const userInput = document.getElementById('loginUsernameInput');
      if (userInput) {
        userInput.value = '';
        userInput.focus();
      }
      const passInput = document.getElementById('loginPasswordInput');
      if (passInput) passInput.value = '';
      const errEl = document.getElementById('loginErrorMsg');
      if (errEl) errEl.style.display = 'none';
    }
  },

  async submitLogin() {
    const username = document.getElementById('loginUsernameInput').value.trim();
    const password = document.getElementById('loginPasswordInput').value;
    const errEl = document.getElementById('loginErrorMsg');

    if (!username || !password) {
      if (errEl) {
        errEl.innerText = '请输入账号与密码';
        errEl.style.display = 'block';
      }
      return;
    }

    try {
      const res = await fetch('api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).then(r => r.json());

      if (res.success) {
        document.getElementById('loginModal').style.display = 'none';
        this.state.currentUser = res.data;
        const userEl = document.getElementById('headerUserDisplayName');
        if (userEl) userEl.innerText = res.data.display_name || res.data.username;
        this.init();
      } else {
        if (errEl) {
          errEl.innerText = res.message || '账号或密码错误';
          errEl.style.display = 'block';
        }
      }
    } catch (e) {
      if (errEl) {
        errEl.innerText = '登录失败: ' + e.message;
        errEl.style.display = 'block';
      }
    }
  },

  async logout() {
    if (!confirm('确定要退出当前工作台登录吗？')) return;
    try {
      await fetch('api.php?action=logout');
      this.state.currentUser = null;
      this.showLoginModal();
    } catch (e) {
      location.reload();
    }
  },

};
