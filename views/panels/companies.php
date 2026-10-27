    <!-- ==================== TAB: COMPANIES 公司主体管理 ==================== -->
    <section id="panel-companies" class="tab-panel">
      <div class="section-header">
        <div>
          <div class="section-title">公司主体与实体统筹</div>
          <div class="section-subtitle">维护各公司主体执照信息、开票抬头、税号与对公账户；网站、资产与垫资报销按公司归类统筹</div>
        </div>
        <button class="btn btn-primary" onclick="App.openAddCompanyModal()">新增公司主体</button>
      </div>

      <div class="notion-table-container">
        <table class="notion-table">
          <thead>
            <tr>
              <th style="width:14%">主体简称 / 标识</th>
              <th style="width:24%">公司法定全称 (开票抬头)</th>
              <th style="width:18%">纳税人识别号 (税号)</th>
              <th style="width:20%">开户银行及账号</th>
              <th style="width:12%">统筹纳管统计</th>
              <th style="min-width:140px;text-align:right">操作</th>
            </tr>
          </thead>
          <tbody id="companiesTableBody">
            <tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted)">加载中...</td></tr>
          </tbody>
        </table>
      </div>
    </section>
