// js/app.js - 模块聚合与全局总控入口 (ES Module 集成驱动)
import { state } from './state.js';
import { CoreModule } from './modules/core.js';
import { DashboardModule } from './modules/dashboard.js';
import { ProjectsModule } from './modules/projects.js';
import { RenewalsModule } from './modules/renewals.js';
import { ReimbursementsModule } from './modules/reimbursements.js';
import { TasksModule } from './modules/tasks.js';
import { PortalsModule } from './modules/portals.js';
import { KnowledgeModule } from './modules/knowledge.js';
import { SearchModule } from './modules/search.js';
import { ModalsModule } from './modules/modals.js';
import { CompaniesModule } from './modules/companies.js';
import { SettingsModule } from './modules/settings.js';
import { UsersModule } from './modules/users.js';
import { SecurityModule } from './modules/security.js';

// 将所有业务模块解构合并至统一的 App 对象
const App = {
  state,
  ...CoreModule,
  ...DashboardModule,
  ...ProjectsModule,
  ...RenewalsModule,
  ...ReimbursementsModule,
  ...TasksModule,
  ...PortalsModule,
  ...KnowledgeModule,
  ...SearchModule,
  ...ModalsModule,
  ...CompaniesModule,
  ...SettingsModule,
  ...UsersModule,
  ...SecurityModule
};

// 确保关键事件直达函数优先稳固绑定至 window.App
App.switchSettingsSubTab = SettingsModule.switchSettingsSubTab.bind(App);
App.saveCardProfile = SettingsModule.saveCardProfile.bind(App);
App.onCardStyleChange = SettingsModule.onCardStyleChange.bind(App);
App.syncCardPreview = SettingsModule.syncCardPreview.bind(App);

// 挂载至全局 window 对象，保持与 HTML 内联 onclick="App.xxx()" 100% 完美兼容
window.App = App;

// DOM 加载就绪后自动启动生命周期
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

export default App;
