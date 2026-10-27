export const SecurityModule = {
  togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  generateRandomPassword(targetId) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+';
    let pass = '';
    const arr = new Uint32Array(16);
    window.crypto.getRandomValues(arr);
    for (let i = 0; i < 16; i++) {
      pass += chars[arr[i] % chars.length];
    }
    const input = document.getElementById(targetId);
    if (input) {
      input.value = pass;
      input.type = 'text'; // 生成后临时明文展示给用户
      this.showToast('已生成高强度随机密码！');
    }
  },

  handleAutoLoginTypeChange(selectEl, postGroupId) {
    const grp = document.getElementById(postGroupId);
    if (grp) {
      grp.style.display = selectEl.value === 'post_submit' ? 'block' : 'none';
    }
  },

  async launchTarget(type, id, fallbackUrl) {
    try {
      const res = await fetch(`api.php?action=get_credential&type=${type}&id=${id}`).then(r => r.json());
      if (!res.success || !res.data) {
        window.open(fallbackUrl, '_blank');
        return;
      }

      const cred = res.data;
      const targetUrl = this.formatUrl(cred.url || fallbackUrl);

      // 若未配置任何凭据或策略为 none，直接打开
      if (!cred.has_password && !cred.login_account) {
        window.open(targetUrl, '_blank');
        return;
      }

      // 策略 1: 内部系统自动 POST 免密登录
      if (cred.auto_login_type === 'post_submit') {
        const actionUrl = this.formatUrl(cred.post_target_url || targetUrl);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = actionUrl;
        form.target = '_blank';
        form.style.display = 'none';

        const userInput = document.createElement('input');
        userInput.type = 'hidden';
        userInput.name = 'username';
        userInput.value = cred.login_account || '';
        form.appendChild(userInput);

        const passInput = document.createElement('input');
        passInput.type = 'hidden';
        passInput.name = 'password';
        passInput.value = cred.login_password || '';
        form.appendChild(passInput);

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => form.remove(), 1000);
        this.showToast(`🚀 已为您向【${cred.title}】发起免密登录！`);
        return;
      }

      // 策略 2: 一键直达 + 剪贴板安全速填 / 浮动小助手
      window.open(targetUrl, '_blank');
      this._activeDockCred = cred;
      this._dockPassRevealed = false;

      const dock = document.getElementById('securityLoginDock');
      if (dock) {
        document.getElementById('dockSiteTitle').innerText = cred.title;
        document.getElementById('dockSiteUrl').innerText = targetUrl;

        const accRow = document.getElementById('dockAccountRow');
        if (cred.login_account) {
          accRow.style.display = 'flex';
          document.getElementById('dockAccountVal').innerText = cred.login_account;
        } else {
          accRow.style.display = 'none';
        }

        const passRow = document.getElementById('dockPasswordRow');
        if (cred.has_password) {
          passRow.style.display = 'flex';
          document.getElementById('dockPasswordVal').innerText = '••••••••';
          document.getElementById('dockPasswordVal').classList.add('dock-pass-val');
          
          // 自动秒级放入剪贴板，并开启 15 秒安全清空倒计时
          this.copyDockCredential('password', true);
        } else {
          passRow.style.display = 'none';
        }

        dock.style.display = 'block';
      }
    } catch (e) {
      console.error(e);
      window.open(fallbackUrl, '_blank');
    }
  },

  closeSecurityDock() {
    const dock = document.getElementById('securityLoginDock');
    if (dock) dock.style.display = 'none';
    this._activeDockCred = null;
    clearTimeout(this._dockClearTimer);
    clearInterval(this._dockInterval);
  },

  toggleDockPassReveal() {
    if (!this._activeDockCred || !this._activeDockCred.login_password) return;
    const passEl = document.getElementById('dockPasswordVal');
    this._dockPassRevealed = !this._dockPassRevealed;
    if (this._dockPassRevealed) {
      passEl.innerText = this._activeDockCred.login_password;
      passEl.classList.remove('dock-pass-val');
    } else {
      passEl.innerText = '••••••••';
      passEl.classList.add('dock-pass-val');
    }
  },

  copyDockCredential(field, isAuto = false) {
    if (!this._activeDockCred) return;
    const text = field === 'account' ? this._activeDockCred.login_account : this._activeDockCred.login_password;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      if (field === 'password') {
        this.startClipboardAutoClearCountdown(15);
        this.showToast(isAuto ? `🔑 密码已就绪，15秒后自动清除剪贴板` : `🔑 密码已复制，15秒后自动清除剪贴板`);
      } else {
        this.showToast(`已复制账号: ${text}`);
      }
    }).catch(() => {
      this.copyText(text, field === 'password' ? '密码已复制到剪贴板' : '账号已复制');
      if (field === 'password') this.startClipboardAutoClearCountdown(15);
    });
  },

  startClipboardAutoClearCountdown(seconds = 15) {
    clearTimeout(this._dockClearTimer);
    clearInterval(this._dockInterval);

    let remain = seconds;
    const fill = document.getElementById('dockCountdownFill');
    const tip = document.getElementById('dockFooterTip');
    if (fill) fill.style.width = '100%';
    if (tip) tip.innerText = `⏱️ 剪贴板安全保护中 · ${remain} 秒后自动清除密码`;

    this._dockInterval = setInterval(() => {
      remain--;
      if (fill) fill.style.width = `${(remain / seconds) * 100}%`;
      if (tip && remain > 0) {
        tip.innerText = `⏱️ 剪贴板安全保护中 · ${remain} 秒后自动清除密码`;
      }
      if (remain <= 0) {
        clearInterval(this._dockInterval);
        try {
          navigator.clipboard.writeText('');
        } catch (e) {}
        if (tip) tip.innerText = '🔒 剪贴板密码已自动安全抹除，杜绝泄露！';
        if (fill) fill.style.width = '0%';
      }
    }, 1000);
  }
};
