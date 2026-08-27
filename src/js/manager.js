/**
 * ASK EOD Manager - Manager Workspace Module
 */

function renderManagerHome() {
  const user = getCurrentUser();
  if (!user || user.role !== 'manager') return;

  const stats = calculateManagerStats(user.name);
  document.getElementById('mgrKpiActiveOps').textContent = stats.activeOperatorsCount;

  const eodCard = document.getElementById('mgrKpiEodCard');
  const eodStatusElem = document.getElementById('mgrKpiEodStatus');
  const eodSubtextElem = document.getElementById('mgrKpiEodSubtext');

  if (stats.submittedToday && stats.todaySubmission) {
    eodStatusElem.textContent = "Submitted";
    eodSubtextElem.textContent = `Report ID: ${stats.todaySubmission.submissionId}`;
    eodCard.className = "stat-card success";
  } else {
    eodStatusElem.textContent = "Not Submitted";
    eodSubtextElem.textContent = "Submission required by EOD";
    eodCard.className = "stat-card danger";
  }

  document.getElementById('mgrKpiTransactions').textContent = stats.totalVolume;
  document.getElementById('mgrKpiEnrolUpdates').textContent = `${stats.totalEnrolments} Enrolments • ${stats.totalUpdates} Updates`;

  // Render home tasks mini-table
  const allTasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const myTasks = allTasks.filter(t => t.assignedTo === user.name).slice(0, 5);
  const tbody = document.getElementById('mgrHomeTasksTableBody');
  
  if (myTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No assigned tasks pending.</td></tr>`;
  } else {
    tbody.innerHTML = myTasks.map(t => `
      <tr>
        <td><b>${escapeHtml(t.title)}</b></td>
        <td><span class="badge ${getPriorityBadgeClass(t.priority)}">${t.priority}</span></td>
        <td>${t.dueDate || 'N/A'}</td>
        <td><span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
      </tr>
    `).join('');
  }
}

function renderManagerAssignedWork() {
  const user = getCurrentUser();
  const allTasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const myTasks = allTasks.filter(t => t.assignedTo === user.name);
  const tbody = document.getElementById('mgrAssignedWorkTableBody');

  if (myTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">No tasks assigned by Admin.</td></tr>`;
    return;
  }

  tbody.innerHTML = myTasks.map(t => `
    <tr>
      <td><code>${t.workId}</code></td>
      <td>
        <div style="font-weight:700;">${escapeHtml(t.title)}</div>
        <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(t.description || '')}</div>
      </td>
      <td><span class="badge ${getPriorityBadgeClass(t.priority)}">${t.priority}</span></td>
      <td>${t.assignedDate || 'N/A'}</td>
      <td><b>${t.dueDate || 'N/A'}</b></td>
      <td style="font-size:12px;">${escapeHtml(t.instructions || 'None')}</td>
      <td><span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openUpdateTaskStatusModal('${t.workId}')">
          Update Status
        </button>
      </td>
    </tr>
  `).join('');
}

function openUpdateTaskStatusModal(workId) {
  const allTasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const task = allTasks.find(t => t.workId === workId);
  if (!task) return;

  document.getElementById('statusModalWorkId').value = task.workId;
  document.getElementById('statusModalTitle').value = task.title;
  document.getElementById('statusModalSelect').value = task.status;
  document.getElementById('statusModalComment').value = "";
  openModal('taskStatusModal');
}

function handleSaveTaskStatus(event) {
  event.preventDefault();
  const workId = document.getElementById('statusModalWorkId').value;
  const newStatus = document.getElementById('statusModalSelect').value;
  const comment = document.getElementById('statusModalComment').value.trim();

  const allTasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const taskIndex = allTasks.findIndex(t => t.workId === workId);
  if (taskIndex > -1) {
    allTasks[taskIndex].status = newStatus;
    if (comment) {
      if (!allTasks[taskIndex].comments) allTasks[taskIndex].comments = [];
      allTasks[taskIndex].comments.push(`[${new Date().toLocaleTimeString()}]: ${comment}`);
    }
    setStoredData(STORAGE_KEYS.ASSIGNED_WORK, allTasks);
  }

  closeModal('taskStatusModal');
  alert("Task status updated successfully!");
  renderManagerAssignedWork();
  renderManagerHome();
}

function handleWorkDoneFileUpload(input) {
  if (input.files && input.files[0]) {
    document.getElementById('wdAttachmentName').value = input.files[0].name;
  }
}

function handleAddWorkDone(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const title = document.getElementById('wdTitle').value.trim();
  const category = document.getElementById('wdCategory').value;
  const description = document.getElementById('wdDescription').value.trim();
  const startTime = document.getElementById('wdStartTime').value;
  const endTime = document.getElementById('wdEndTime').value;
  const status = document.getElementById('wdStatus').value;
  const remarks = document.getElementById('wdRemarks').value.trim();
  const attachment = document.getElementById('wdAttachmentName').value || (document.getElementById('wdAttachmentFile').files[0] ? document.getElementById('wdAttachmentFile').files[0].name : "None");

  const newLog = {
    workId: `LOG-${Date.now().toString().slice(-4)}`,
    managerName: user.name,
    center: user.center,
    title,
    category,
    description,
    startTime,
    endTime,
    status,
    remarks,
    attachment,
    date: getTodayString(),
    timestamp: new Date().toISOString()
  };

  const logs = getStoredData(STORAGE_KEYS.WORK_DONE, []);
  logs.unshift(newLog);
  setStoredData(STORAGE_KEYS.WORK_DONE, logs);

  document.getElementById('addWorkDoneForm').reset();
  document.getElementById('wdAttachmentName').value = "";
  alert("Daily work log saved successfully!");
  renderManagerWorkDone();
}

function renderManagerWorkDone() {
  const user = getCurrentUser();
  const allLogs = getStoredData(STORAGE_KEYS.WORK_DONE, []);
  const myLogs = allLogs.filter(l => l.managerName === user.name);
  const tbody = document.getElementById('mgrWorkDoneTableBody');

  if (myLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No daily work entries submitted for today.</td></tr>`;
    return;
  }

  tbody.innerHTML = myLogs.map(l => `
    <tr>
      <td>
        <div style="font-weight:600;">${l.date}</div>
        <div style="font-size:11px; color:var(--text-muted);">${new Date(l.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
      </td>
      <td>
        <div style="font-weight:700;">${escapeHtml(l.title)}</div>
        <div style="font-size:12px; color:var(--primary);">${l.category}</div>
        <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(l.description)}</div>
      </td>
      <td><code>${l.startTime || '--'}</code> to <code>${l.endTime || '--'}</code></td>
      <td><span class="badge ${getStatusBadgeClass(l.status)}">${l.status}</span></td>
      <td>
        ${l.attachment && l.attachment !== 'None' ? `
          <span class="badge badge-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
            ${escapeHtml(l.attachment)}
          </span>
        ` : '<span style="color:var(--text-muted); font-size:12px;">No file</span>'}
      </td>
      <td style="font-size:12px;">${escapeHtml(l.remarks || '')}</td>
    </tr>
  `).join('');
}
