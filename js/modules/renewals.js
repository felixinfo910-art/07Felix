export const RenewalsModule = {
  async loadRenewals() {
    try {
      const [resRen, resComp, resProj] = await Promise.all([
        fetch('api.php?action=get_renewals').then(r => r.json()),
        this.state.companies.length === 0 ? fetch('api.php?action=get_companies').then(r => r.json()) : Promise.resolve({ success: true, data: this.state.companies }),
        this.state.projects.length === 0 ? fetch('api.php?action=get_projects').then(r => r.json()) : Promise.resolve({ success: true, data: this.state.projects })
      ]);
      if (resComp && resComp.success && resComp.data) {
        this.state.companies = resComp.data;
      }
      if (resProj && resProj.success && resProj.data) {
        this.state.projects = resProj.data;
      }
      this.updateCompanyDropdowns();

      if (!resRen.success) return;
      this.state.renewals = resRen.data || [];
      this.renderRenewals();
    } catch (e) {
      console.error(e);
    }
  },

  // 筛选：按资产类型
  filterRenewalsByCategory(cat) {
    this.state.selectedRenewalCategory = cat;
    document.querySelectorAll('.renewal-cat-btn').forEach(btn => {
      btn.className = (btn.dataset.cat === cat) ? 'btn btn-sm btn-primary renewal-cat-btn' : 'btn btn-sm btn-secondary renewal-cat-btn';
    });
    this.renderRenewals();
  },

  // 筛选：按生命周期状态 (全部/紧急/预警/正常/已逾期)
  filterRenewalsByStatus(status) {
    this.state.selectedRenewalStatus = status;
    const select = document.getElementById('renewalStatusFilterSelect');
    if (select) select.value = status;
    this.renderRenewals();
  },

  // 筛选：按归属公司主体
  filterRenewalsByCompany(companyId) {
    this.state.selectedRenewalCompany = companyId;
    this.renderRenewals();
  },

  // 筛选：按关键词搜索
  filterRenewalsByQuery(q) {
    this.state.renewalSearchQuery = (q || '').trim().toLowerCase();
    this.renderRenewals();
  },

  renderRenewals() {
    const tbody = document.getElementById('renewalsTableBody');
    if (!tbody) return;

    const allRenewals = this.state.renewals || [];

    // 1. 统计大盘核心 KPI 指标
    const urgentCount = allRenewals.filter(r => r.status_level === 'danger' || (r.days_left >= 0 && r.days_left <= 7)).length;
    const warningCount = allRenewals.filter(r => r.status_level === 'warning' || (r.days_left > 7 && r.days_left <= 30)).length;
    const totalCount = allRenewals.length;
    const totalCost = allRenewals.reduce((sum, r) => sum + parseFloat(r.cost || 0), 0);

    const urgentEl = document.getElementById('radarUrgentCount');
    if (urgentEl) urgentEl.innerText = urgentCount;
    const warningEl = document.getElementById('radarWarningCount');
    if (warningEl) warningEl.innerText = warningCount;
    const totalEl = document.getElementById('radarTotalCount');
    if (totalEl) totalEl.innerText = totalCount;
    const costEl = document.getElementById('radarTotalCost');
    if (costEl) costEl.innerText = '￥' + totalCost.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // 移动端专属纯净统计条更新 (共 X 项资产 · Y 项紧急临期)
    const mobileTotalEl = document.getElementById('renewalsMobileTotalCount');
    if (mobileTotalEl) mobileTotalEl.innerText = totalCount;
    const mobileUrgentEl = document.getElementById('renewalsMobileUrgentNotice');
    if (mobileUrgentEl) {
      if (urgentCount > 0) {
        mobileUrgentEl.innerHTML = `<span style="color:var(--danger-color);font-weight:600">🚨 ${urgentCount} 项紧急临期</span>`;
      } else if (warningCount > 0) {
        mobileUrgentEl.innerHTML = `<span style="color:var(--tag-orange-text)">⚠️ ${warningCount} 项预警</span>`;
      } else {
        mobileUrgentEl.innerHTML = `<span style="color:var(--success-color)">🟢 全部充裕正常</span>`;
      }
    }

    // 2. 统计各分类按钮数量 (桌面端)
    const catCounts = { all: allRenewals.length, domain: 0, server: 0, ssl: 0, saas: 0, other: 0 };
    allRenewals.forEach(r => {
      const c = r.category || 'other';
      if (catCounts[c] !== undefined) catCounts[c]++;
      else catCounts.other++;
    });
    const setCatText = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.innerText = count;
    };
    setCatText('radarCatCountAll', catCounts.all);
    setCatText('radarCatCountDomain', catCounts.domain);
    setCatText('radarCatCountServer', catCounts.server);
    setCatText('radarCatCountSsl', catCounts.ssl);
    setCatText('radarCatCountSaas', catCounts.saas);
    setCatText('radarCatCountOther', catCounts.other);

    // 3. 移动端专属极简卡片流渲染 (手机端不用筛选，全量平铺展示；按紧迫度智能置顶，极简纯净两行排布)
    const mobileContainer = document.getElementById('renewalsCardsMobile');
    if (mobileContainer) {
      if (allRenewals.length === 0) {
        mobileContainer.innerHTML = `<div style="text-align:center;padding:36px;color:var(--text-muted);font-size:13px">暂无纳管资产，点击右上角【+ 新增资产】开始录入。</div>`;
      } else {
        // 手机端展示全部资产，无需筛选；按紧迫度智能置顶 (紧急/过期 -> 预警 -> 充裕正常)
        const mobileList = [...allRenewals].sort((a, b) => {
          const aLevel = (a.days_left <= 7 || a.status_level === 'danger' || a.days_left < 0) ? 1 : ((a.days_left <= 30 || a.status_level === 'warning') ? 2 : 3);
          const bLevel = (b.days_left <= 7 || b.status_level === 'danger' || b.days_left < 0) ? 1 : ((b.days_left <= 30 || b.status_level === 'warning') ? 2 : 3);
          if (aLevel !== bLevel) return aLevel - bLevel;
          return (a.days_left ?? 9999) - (b.days_left ?? 9999);
        });

        mobileContainer.innerHTML = mobileList.map(r => {
          let statusText = '';
          let statusColor = 'var(--text-muted)';
          let isUrgent = false;

          if (r.days_left < 0 || r.status_level === 'expired') {
            statusText = `已过期 ${Math.abs(r.days_left)}天`;
            statusColor = 'var(--danger-color)';
            isUrgent = true;
          } else if (r.days_left <= 7 || r.status_level === 'danger') {
            statusText = `🚨 剩 ${r.days_left} 天`;
            statusColor = 'var(--danger-color)';
            isUrgent = true;
          } else if (r.days_left <= 30 || r.status_level === 'warning') {
            statusText = `⚠️ 剩 ${r.days_left} 天`;
            statusColor = 'var(--tag-orange-text)';
          } else {
            statusText = `${r.days_left}天后到期`;
            statusColor = 'var(--text-muted)';
          }

          // 服务商与主体，中圆点优雅连接，纯文本极简展示
          const metaParts = [];
          if (r.provider) metaParts.push(r.provider);
          if (r.company_short_name) metaParts.push(r.company_short_name);
          else if (r.company_name) metaParts.push(r.company_name);
          const metaStr = metaParts.length > 0 ? metaParts.join(' · ') : '通用资产';

          // 金额与到期日
          const costVal = parseFloat(r.cost || 0);
          const costStr = costVal > 0 ? ` · ￥${costVal.toFixed(2)}` : '';
          const dateStr = `${r.expire_date || '-'}${costStr}`;

          return `
            <div class="renewal-mobile-card-simple ${isUrgent ? 'urgent' : ''}" onclick="App.openRenewalDetailSheet('${r.id}')" title="轻触查看详情与快捷延期">
              <div class="renewal-card-row-top">
                <div class="renewal-card-name-wrap">
                  <span class="renewal-card-name">${r.name}</span>
                  ${r.has_password ? '<span class="renewal-card-key" title="已设安全凭据">🔑</span>' : ''}
                </div>
                <div class="renewal-card-status" style="color:${statusColor}">${statusText}</div>
              </div>
              <div class="renewal-card-row-bottom">
                <div class="renewal-card-meta">${metaStr}</div>
                <div class="renewal-card-date">${dateStr}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 4. 桌面端多维筛选过滤 (分类 + 紧急度 + 公司 + 搜索)
    let filtered = allRenewals;
    if (this.state.selectedRenewalCategory && this.state.selectedRenewalCategory !== 'all') {
      filtered = filtered.filter(r => (r.category || 'other') === this.state.selectedRenewalCategory);
    }
    if (this.state.selectedRenewalStatus && this.state.selectedRenewalStatus !== 'all') {
      const st = this.state.selectedRenewalStatus;
      if (st === 'danger') {
        filtered = filtered.filter(r => r.status_level === 'danger' || (r.days_left >= 0 && r.days_left <= 7));
      } else if (st === 'warning') {
        filtered = filtered.filter(r => r.status_level === 'warning' || (r.days_left > 7 && r.days_left <= 30));
      } else if (st === 'normal') {
        filtered = filtered.filter(r => r.status_level === 'normal' || r.days_left > 30);
      } else if (st === 'expired') {
        filtered = filtered.filter(r => r.status_level === 'expired' || r.days_left < 0);
      }
    }
    if (this.state.selectedRenewalCompany && this.state.selectedRenewalCompany !== 'all') {
      filtered = filtered.filter(r => String(r.company_id) === String(this.state.selectedRenewalCompany));
    }
    if (this.state.renewalSearchQuery) {
      const q = this.state.renewalSearchQuery;
      filtered = filtered.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) || 
        (r.provider && r.provider.toLowerCase().includes(q)) ||
        (r.account_note && r.account_note.toLowerCase().includes(q)) ||
        (r.company_name && r.company_name.toLowerCase().includes(q)) ||
        (r.project_name && r.project_name.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:36px;color:var(--text-muted)">未找到符合条件的资产记录，可尝试切换筛选条件或点击【+ 新增续费资产】。</td></tr>`;
      return;
    }

    // 类别映射
    const categoryMap = {
      domain: { label: '域名', icon: '🌐', badge: 'normal' },
      server: { label: '云服务器', icon: '🖥️', badge: 'warning' },
      ssl: { label: 'SSL证书', icon: '🔒', badge: 'normal' },
      saas: { label: 'SaaS软件', icon: '💼', badge: 'normal' },
      other: { label: '其他到期', icon: '📦', badge: 'normal' }
    };

    // 桌面端表格渲染 (8列完整信息)
    if (tbody) {
      tbody.innerHTML = filtered.map(r => {
        let badgeClass = 'normal';
        let statusText = `🟢 剩 ${r.days_left} 天`;
        if (r.days_left < 0 || r.status_level === 'expired') {
          badgeClass = 'danger';
          statusText = `⚫ 已过期 (${Math.abs(r.days_left)}天前)`;
        } else if (r.days_left <= 7 || r.status_level === 'danger') {
          badgeClass = 'danger';
          statusText = `🚨 仅剩 ${r.days_left} 天 (急迫)`;
        } else if (r.days_left <= 30 || r.status_level === 'warning') {
          badgeClass = 'warning';
          statusText = `⚠️ 剩 ${r.days_left} 天 (临期)`;
        }

        const catMeta = categoryMap[r.category] || categoryMap.other;

        // 归属主体与关联项目
        let compHtml = '';
        if (r.company_short_name) {
          compHtml = `<span class="badge-company color-${r.company_color || 'blue'}" title="${r.company_name}">🏢 ${r.company_short_name}</span>`;
        }
        let projHtml = '';
        if (r.project_name) {
          projHtml = `<span class="badge-status normal" style="font-size:11px;padding:2px 6px" title="关联网站: ${r.project_name}">🌐 ${r.project_name}</span>`;
        }
        const ownerHtml = (compHtml || projHtml) 
          ? `<div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start">${compHtml}${projHtml}</div>`
          : `<span style="font-size:11.5px;color:var(--text-muted)">通用/未绑定</span>`;

        return `
          <tr id="renewalRow_${r.id}">
            <td>
              <div style="display:flex;align-items:center;gap:6px">
                <span class="renewal-title-link" onclick="App.openEditRenewalModal('${r.id}')" title="点击编辑修改此资产" style="font-weight:600;font-size:13.5px;color:var(--text-main);cursor:pointer">
                  ${r.name} <span class="edit-hint-icon" style="font-size:11px">✏️</span>
                </span>
                ${r.has_password ? `<span class="credential-key-badge" title="已配置加密安全凭据">🔑</span>` : ''}
              </div>
              ${r.account_note ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;display:flex;align-items:center;gap:3px"><span>📝</span><span>${r.account_note}</span></div>` : ''}
            </td>
            <td>${ownerHtml}</td>
            <td>
              <span class="badge-status normal" style="font-size:11.5px">${catMeta.icon} ${catMeta.label}</span>
            </td>
            <td>
              <span style="font-size:12.5px;font-weight:500;color:var(--text-main)">${r.provider || '-'}</span>
            </td>
            <td>
              <div style="font-size:12.5px;font-family:monospace">${r.expire_date}</div>
            </td>
            <td>
              <span class="badge-status ${badgeClass}" style="font-weight:600">${statusText}</span>
            </td>
            <td>
              <strong style="font-size:13px;color:var(--text-main)">￥${parseFloat(r.cost || 0).toFixed(2)}</strong>
            </td>
            <td style="text-align:right">
              <div style="display:inline-flex;gap:4px;align-items:center">
                ${r.renew_url ? (
                  r.has_password 
                    ? `<button class="btn btn-sm btn-secondary" onclick="App.launchTarget('renewal', '${r.id}', '${this.formatUrl(r.renew_url)}')" title="控制台直达并调起安全快填浮窗">直达 ↗</button>`
                    : `<a href="${this.formatUrl(r.renew_url)}" target="_blank" class="btn btn-sm btn-secondary" title="官网控制台直达缴费">直达 ↗</a>`
                ) : ''}
                <button class="btn btn-sm btn-primary" onclick="App.openEditRenewalModal('${r.id}')" title="编辑修改此资产"><span style="margin-right:2px">✏️</span>编辑修改</button>
                <button type="button" class="btn btn-sm btn-danger renewal-del-btn" onclick="App.quickDeleteRenewal('${r.id}', this)" title="双击确认快速删除">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  },

};
