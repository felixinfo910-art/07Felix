# Felix 管理者个人工作台 (Manager Workbench)

> 基于 Notion 极简纸面质感设计的高效管理者多维工作台，涵盖多网站项目通道、多公司主体统筹、资产续费预警、个人垫资报销与 AI 知识库。

## 🌟 核心特性

- **🚀 网站项目跳板 (Fleet Matrix & Project Channel)**：两层式高密度总控大矩阵 + 专属工作间，支持自编写项目说明书与运维手册。
- **🏢 公司主体统筹 (Multi-Entity Hub)**：多公司主体执照资料管理（统一税号、对公账户、开票地址），支持项目通道内一键复制完整开票抬头。
- **⏰ 资产续费雷达 (Renewal Radar)**：域名、云服务器、SSL证书生命周期监控，7天紧急倒计时预警，一键直达续费后台。
- **💳 个人垫资与发票报销 (Expense Tracker)**：手机端唤醒相机拍照上传发票凭证，续费资产一键联动生成垫资报销单。
- **📋 事务与待办协调 (GTD & Milestones)**：今日待办 + 长期里程碑进度条推进。
- **🧠 AI 知识库与幕僚智囊**：兼容 DeepSeek、Moonshot (Kimi)、OpenAI 等大模型 API。

## 🛠️ 技术架构

- **后端**：PHP 7.4+（纯原生轻量无复杂依赖，自带 SQLite 自动建表与平滑迁移）
- **数据库**：SQLite 3 (`data/workspace.db`)
- **前端**：原生 HTML5 + CSS3（Notion 纸面色彩体系，无 Node 编译依赖） + 原生 JavaScript

## 🚀 本地快速启动

1. 克隆本仓库：
   ```bash
   git clone <你的GitHub仓库链接>
   cd 07Felix
   ```

2. 启动本地服务：
   ```bash
   npm run dev
   # 或者直接使用 PHP 内置服务器：
   # php -S 0.0.0.0:8088 -t .
   ```

3. 浏览器访问：`http://127.0.0.1:8088`

## 🔒 隐私与安全
本地 SQLite 数据库文件（`data/*.db`）及上传的发票凭证（`uploads/*`）已默认配置在 `.gitignore` 中，不会被推送到公开仓库，保障商业与财务数据隐私安全。
