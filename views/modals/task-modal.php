<!-- 7. 任务新建弹窗 -->
<div id="taskModal" class="modal-overlay" style="display:none" onclick="if(event.target===this) App.closeAllModals()">
  <div class="modal-dialog">
    <div class="modal-header">
      <span>记一笔待办 / 里程碑</span>
      <button class="btn btn-sm btn-secondary" onclick="App.closeAllModals()">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">事务类型</label>
        <select id="taskEditCategory" class="form-control">
          <option value="daily">📝 今日/日常待办事项</option>
          <option value="milestone">🎯 长期项目与跨周期里程碑</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">任务内容</label>
        <input type="text" id="taskEditTitle" class="form-control" placeholder="如：核对下半年服务器预算规划">
      </div>
      <div class="form-group">
        <label class="form-label">优先级</label>
        <select id="taskEditPriority" class="form-control">
          <option value="high">🚨 紧急高优</option>
          <option value="medium">⚖️ 常规推进</option>
          <option value="low">🌱 低优先级/备忘</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">截止/目标日期</label>
        <input type="date" id="taskEditDate" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">细节补充与备忘</label>
        <textarea id="taskEditNote" class="form-control" rows="2" placeholder="补充上下文或要点"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="App.closeAllModals()">取消</button>
      <button class="btn btn-primary" onclick="App.saveTaskItem()">确认创建</button>
    </div>
  </div>
</div>
