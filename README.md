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

1. 本地启动服务：
   ```bash
   npm run dev
   # 或者直接运行 start.bat / 或使用原生 PHP:
   # php -S 0.0.0.0:8088 -t .
   ```
2. 浏览器访问：`http://127.0.0.1:8088`

## 🌐 线上/本地模式切换

系统内建双运行模式，**零配置自动识别**，也可通过 `.env` 手动控制：

1. **自动识别（推荐）**：
   - 访问域名为 `localhost`、`127.0.0.1` 或局域网内网 IP 时，自动进入 **本地开发模式 (Local)**：开启全部报错回显、静态资源实时重载。
   - 访问绑定公网域名或服务器公网 IP 时，自动切换为 **线上生产模式 (Production)**：自动屏蔽详细报错防路径泄露、开启静态资源长缓存、启用 HTTP 安全防护响应头。

2. **手动强制指定**：
   - 复制根目录 [.env.example](file:///d:/phpstudy_pro2/07Felix/.env.example) 为 `.env`；
   - 设定 `APP_ENV=production`（生产模式）或 `APP_ENV=local`（本地开发模式）。

## 🏰 部署到宝塔面板 (BT Panel) 完整指南

### 1. 新建站点与部署代码
1. 登录宝塔面板，进入 **【网站】➔【添加站点】**，输入你的公网域名，PHP 版本选择 **PHP 7.4 或 PHP 8.x**（需已启用 `pdo_sqlite` 扩展，宝塔默认自带）；
2. 将代码上传或使用宝塔自带的 **【WebHook / Git 仓库】** 直接克隆到网站根目录（如 `/www/wwwroot/你的域名`）。

### 2. 目录权限配置（极关键）
在宝塔终端执行以下命令（或在宝塔文件管理中将 `data` 和 `uploads` 设为 `777` 或所有者 `www`）：
```bash
chmod -R 755 /www/wwwroot/你的域名
chmod -R 777 /www/wwwroot/你的域名/data
chmod -R 777 /www/wwwroot/你的域名/uploads
```

### 3. Nginx 安全防御规则配置（防止数据库被下载）
进入宝塔面板 ➔ 点击网站名称 ➔ **【配置文件】**，在 `server { ... }` 内部加入以下安全防护规则：
```nginx
# 严禁任何外部请求下载数据文件、发票目录执行脚本及配置
location ~ ^/(data|uploads/.*\.php|\.git|\.env|.*\.sh|.*\.bat) {
    deny all;
    return 404;
}
```

## 🔄 以后如何方便更新？

由于系统的数据文件（`data/*.db`）、上传发票（`uploads/*`）和环境文件（`.env`）已被 `.gitignore` 彻底隔离，**更新代码绝不会覆盖任何已有数据**：

### 方式 A：宝塔终端一键命令（最推荐）
在宝塔终端进入网站根目录，直接运行：
```bash
bash update.sh
# 或者：git pull
```

### 方式 B：宝塔定时任务 / WebHook（全自动无感更新）
在宝塔面板 **【计划任务】** 或 **【WebHook】** 中添加 Shell 任务：
```bash
cd /www/wwwroot/你的域名 && bash update.sh
```
以后你在本地写好代码 `git push` 到 GitHub / Gitee，服务器就会全自动拉取更新，数据库内建平滑迁移机制会自动适配升级，完全不用人工干预！

