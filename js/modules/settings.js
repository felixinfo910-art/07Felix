export const SettingsModule = {
  async loadConfigSettings() {
    const res = await fetch('api.php?action=get_config').then(r => r.json());
    if (res.success) {
      const cfg = res.data;
      document.getElementById('cfgAppTitle').value = cfg.app_title || '';
      document.getElementById('cfgAiBaseUrl').value = cfg.ai_base_url || '';
      document.getElementById('cfgAiModel').value = cfg.ai_model || '';
      document.getElementById('cfgAiPrompt').value = cfg.ai_system_prompt || '';
      document.getElementById('cfgAiKeyStatus').innerText = cfg.has_ai_key ? '✅ 已配置 API Key' : '⚠️ 尚未配置 API Key';
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
        statusEl.innerText = '❌ 请求异常: ' . e.message;
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
