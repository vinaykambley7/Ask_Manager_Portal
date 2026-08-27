/**
 * ASK EOD Manager - HOD / Administrator Module
 */

function renderAdminHome() {
  const stats = calculateTodayStats();
  const allOps = getOperators();
  const allSubs = getSubmissions();

  document.getElementById('adminKpiSubmitted').textContent = stats.submittedCount;
  document.getElementById('adminKpiPending').textContent = stats.pendingCount;
  document.getElementById('adminKpiTotalTx').textContent = stats.total;
  document.getElementById('adminKpiEnrolUpdates').textContent = `${stats.enrolments} Enrol • ${stats.updates} Update`;
  document.getElementById('adminKpiActiveOps').textContent = allOps.length;

  let totalIssues = 0;
  stats.submissions.forEach(s => {
    if (s.issues && s.issues !== 'None' && s.issues.trim() !== '') totalIssues++;
  });
  document.getElementById('adminKpiIssues').textContent = totalIssues;

  // Render 5 Fixed Center Performance Cards
  const grid = document.getElementById('adminCenterPerformanceGrid');
  grid.innerHTML = FIXED_MANAGERS.map(m => {
    const cStats = calculateCenterStats(m.center);
    const ops = getCenterOperators(m.center);
    const isSubmitted = cStats.submittedToday;

    return `
      <div class="card" style="border-top: 4px solid ${isSubmitted ? 'var(--success)' : 'var(--danger)'};">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h4 style="font-size:15px; font-weight:700; color:var(--primary-dark);">${m.center}</h4>
              <div style="font-size:12px; color:var(--text-muted);">Manager: <b>${m.name}</b></div>
            </div>
            <span class="badge ${isSubmitted ? 'badge-success' : 'badge-danger'}">
              ${isSubmitted ? 'SUBMITTED' : 'PENDING'}
            </span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; background:#fafbfc; padding:12px; border-radius:var(--radius); border:1px solid var(--border-light); margin-bottom:12px;">
            <div>
              <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Volume Today</div>
              <div style="font-size:18px; font-weight:800; color:var(--primary-dark);">
                ${cStats.todaySubmission ? cStats.todaySubmission.summary.total : 0}
              </div>
            </div>
            <div>
              <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">Operators</div>
              <div style="font-size:18px; font-weight:800; color:var(--text-main);">${ops.length}</div>
            </div>
          </div>

          <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
            ${cStats.todaySubmission ? `
              <b>Breakdown:</b> ${cStats.todaySubmission.summary.enrolments} Enrolments • ${cStats.todaySubmission.summary.updates} Updates
            ` : 'No EOD submission registered for today.'}
          </div>

          <div style="display:flex; gap:8px;">
            ${cStats.todaySubmission ? `
              <button class="btn btn-secondary btn-sm btn-block" onclick="viewEODDetail('${cStats.todaySubmission.submissionId}')">
                Inspect Report
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm btn-block" disabled style="opacity:0.6;">
                Pending Submission
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initAdminAssignWork() {
  const select = document.getElementById('assignManagerSelect');
  select.innerHTML = FIXED_MANAGERS.map(m => `
    <option value="${m.name}">${m.name} (${m.center})</option>
  `).join('');

  if (FIXED_MANAGERS.length > 0) {
    document.getElementById('assignCenter').value = FIXED_MANAGERS[0].center;
  }

  document.getElementById('assignDueDate').value = getTodayString();

  const allTasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const tbody = document.getElementById('adminAssignedWorkTableBody');

  if (allTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No assigned tasks created.</td></tr>`;
    return;
  }

  tbody.innerHTML = allTasks.map(t => `
    <tr>
      <td><code>${t.workId}</code></td>
      <td><b>${t.assignedTo}</b></td>
      <td>${t.center}</td>
      <td>
        <div><b>${escapeHtml(t.title)}</b></div>
        <span class="badge ${getPriorityBadgeClass(t.priority)}">${t.priority}</span>
      </td>
      <td>${t.dueDate || 'N/A'}</td>
      <td><span class="badge ${getStatusBadgeClass(t.status)}">${t.status}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteAssignedWork('${t.workId}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function handleAssignManagerChange(selectElem) {
  const selectedManager = selectElem.value;
  const mgr = FIXED_MANAGERS.find(m => m.name === selectedManager);
  document.getElementById('assignCenter').value = mgr ? mgr.center : "";
}

function handleAdminAssignWork(event) {
  event.preventDefault();
  const assignedTo = document.getElementById('assignManagerSelect').value;
  const center = document.getElementById('assignCenter').value;
  const title = document.getElementById('assignTitle').value.trim();
  const description = document.getElementById('assignDescription').value.trim();
  const priority = document.getElementById('assignPriority').value;
  const dueDate = document.getElementById('assignDueDate').value;
  const instructions = document.getElementById('assignInstructions').value.trim();

  const newTask = {
    workId: generateWorkId(),
    assignedTo,
    center,
    title,
    description,
    priority,
    assignedDate: getTodayString(),
    dueDate,
    status: "Not Started",
    instructions: instructions || "Follow standard procedure",
    comments: [],
    createdAt: new Date().toISOString()
  };

  const tasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  tasks.unshift(newTask);
  setStoredData(STORAGE_KEYS.ASSIGNED_WORK, tasks);

  document.getElementById('adminAssignWorkForm').reset();
  initAdminAssignWork();
  alert(`Task ${newTask.workId} assigned successfully to ${assignedTo}!`);
}

function handleDeleteAssignedWork(workId) {
  if (confirm(`Delete assigned task ${workId}?`)) {
    let tasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
    tasks = tasks.filter(t => t.workId !== workId);
    setStoredData(STORAGE_KEYS.ASSIGNED_WORK, tasks);
    initAdminAssignWork();
  }
}

function renderAdminMonitoring() {
  const allTasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const tbody = document.getElementById('adminTeamMatrixTableBody');
  const today = getTodayString();

  tbody.innerHTML = FIXED_MANAGERS.map(m => {
    const mgrTasks = allTasks.filter(t => t.assignedTo === m.name);
    const assignedCount = mgrTasks.length;
    const completedCount = mgrTasks.filter(t => t.status === 'Completed').length;
    const inProgressCount = mgrTasks.filter(t => t.status === 'In Progress').length;
    const pendingCount = mgrTasks.filter(t => t.status === 'Not Started' || t.status === 'On Hold').length;
    const overdueCount = mgrTasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'Completed').length;

    return `
      <tr>
        <td><b>${m.name}</b></td>
        <td>${m.center}</td>
        <td><b>${assignedCount}</b></td>
        <td><span class="badge badge-success">${completedCount}</span></td>
        <td><span class="badge badge-warning">${inProgressCount}</span></td>
        <td><span class="badge badge-purple">${pendingCount}</span></td>
        <td><span class="badge ${overdueCount > 0 ? 'badge-danger' : 'badge-gray'}">${overdueCount}</span></td>
      </tr>
    `;
  }).join('');

  // 2. Team Work Done logs
  const allWorkDone = getStoredData(STORAGE_KEYS.WORK_DONE, []);
  const wdBody = document.getElementById('adminTeamWorkDoneTableBody');

  if (allWorkDone.length === 0) {
    wdBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No work logs uploaded yet.</td></tr>`;
    return;
  }

  wdBody.innerHTML = allWorkDone.map(l => `
    <tr>
      <td style="font-size:12px;">${l.date} ${new Date(l.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td><b>${l.managerName}</b></td>
      <td>${l.center}</td>
      <td>
        <div style="font-weight:700;">${escapeHtml(l.title)}</div>
        <div style="font-size:11px; color:var(--primary);">${l.category}</div>
        <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(l.description)}</div>
      </td>
      <td><code>${l.startTime} - ${l.endTime}</code></td>
      <td>
        ${l.attachment && l.attachment !== 'None' ? `
          <span class="badge badge-primary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg>
            ${escapeHtml(l.attachment)}
          </span>
        ` : '<span style="color:var(--text-muted); font-size:12px;">No proof</span>'}
      </td>
      <td style="font-size:12px;">${escapeHtml(l.remarks || '')}</td>
    </tr>
  `).join('');
}

function renderAdminOperatorsTable() {
  let ops = getOperators();
  const search = (document.getElementById('adminOpSearch').value || '').toLowerCase();
  const centerFilter = document.getElementById('adminOpCenterFilter').value;
  const certFilter = document.getElementById('adminOpCertFilter').value;
  const qualFilter = document.getElementById('adminOpQualFilter').value;

  if (centerFilter !== 'ALL') ops = ops.filter(o => o.center === centerFilter);
  if (certFilter !== 'ALL') ops = ops.filter(o => o.certification === certFilter);
  if (qualFilter !== 'ALL') ops = ops.filter(o => o.qualification === qualFilter);
  if (search) {
    ops = ops.filter(o => o.operatorName.toLowerCase().includes(search) || o.operatorId.toLowerCase().includes(search));
  }

  const tbody = document.getElementById('adminOperatorsTableBody');
  if (ops.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:var(--text-muted);">No matching operators found.</td></tr>`;
    return;
  }

  tbody.innerHTML = ops.map(o => {
    const hasCert = o.certificateFile && o.certificateFile.trim() !== "";
    return `
      <tr>
        <td><code>${o.operatorId}</code></td>
        <td><b>${escapeHtml(o.operatorName)}</b></td>
        <td>${o.managerName}</td>
        <td>${o.center}</td>
        <td><span class="badge ${getCertBadgeClass(o.certification)}">${o.certification}</span></td>
        <td>${o.qualification}</td>
        <td>
          ${hasCert ? `
            <button class="btn btn-secondary btn-sm" onclick="viewCertModal('${o.operatorId}')" style="gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              ${escapeHtml(o.certificateFile)}
            </button>
          ` : '<span style="color:var(--text-muted); font-size:12px;">No document</span>'}
        </td>
        <td>${o.createdAt ? o.createdAt.split('T')[0] : 'N/A'}</td>
      </tr>
    `;
  }).join('');
}

function renderAdminEODHistoryTable() {
  let subs = getSubmissions();
  const dateFilter = document.getElementById('adminEodDateFilter').value;
  const centerFilter = document.getElementById('adminEodCenterFilter').value;
  const mgrFilter = document.getElementById('adminEodManagerFilter').value;

  if (dateFilter) subs = subs.filter(s => s.date === dateFilter);
  if (centerFilter !== 'ALL') subs = subs.filter(s => s.center === centerFilter);
  if (mgrFilter !== 'ALL') subs = subs.filter(s => s.managerName === mgrFilter);

  const tbody = document.getElementById('adminEodHistoryTableBody');
  if (subs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:24px; color:var(--text-muted);">No EOD reports match selected filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = subs.map(s => `
    <tr>
      <td><b style="color:var(--primary);">${s.submissionId}</b></td>
      <td><b>${s.date}</b></td>
      <td><b>${s.center}</b></td>
      <td>${s.managerName}</td>
      <td><code>${s.reportInfo ? s.reportInfo.stationId : 'N/A'}</code></td>
      <td>${s.summary ? s.summary.enrolments : 0}</td>
      <td>${s.summary ? s.summary.updates : 0}</td>
      <td><b>${s.summary ? s.summary.total : 0}</b></td>
      <td><span class="badge ${s.issues && s.issues !== 'None' ? 'badge-danger' : 'badge-success'}">${s.issues && s.issues !== 'None' ? 'Issue' : 'Clean'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewEODDetail('${s.submissionId}')">
          View Detail
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAdminCenterReports() {
  const tbody = document.getElementById('adminCenterReportsTableBody');
  tbody.innerHTML = FIXED_MANAGERS.map(m => {
    const stats = calculateCenterStats(m.center);
    const ops = getCenterOperators(m.center);
    const centerSubs = getCenterSubmissions(m.center);
    const estRevenue = centerSubs.reduce((acc, s) => {
      let amt = 0;
      if (s.summary && s.summary.totalAmount) {
        amt = Number(s.summary.totalAmount);
      } else if (s.transactions && s.transactions.length > 0) {
        amt = s.transactions.reduce((tAcc, tx) => tAcc + Number(tx.totalAmount || 0), 0);
      }
      return acc + amt;
    }, 0);

    return `
      <tr>
        <td><b>${m.center}</b></td>
        <td>${m.name}</td>
        <td>${ops.length}</td>
        <td>${stats.submissionCount}</td>
        <td>${stats.totalEnrolments}</td>
        <td>${stats.totalUpdates}</td>
        <td><b>${stats.totalVolume}</b></td>
        <td><b>₹${estRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></td>
        <td><span class="badge ${stats.submittedToday ? 'badge-success' : 'badge-danger'}">${stats.submittedToday ? 'Submitted' : 'Pending'}</span></td>
      </tr>
    `;
  }).join('');
}

function exportEODCSV() {
  const subs = getSubmissions();
  if (subs.length === 0) {
    alert("No EOD data available to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Submission ID,Date,Center,Manager,Station ID,Operator,Enrolments,Updates,Total Volume,Total Collection (Rs),Issues,Remarks\n";

  subs.forEach(s => {
    const totalAmt = s.summary && s.summary.totalAmount ? s.summary.totalAmount : (
      s.transactions ? s.transactions.reduce((acc, t) => acc + Number(t.totalAmount || 0), 0) : ((s.summary ? s.summary.total : 0) * 50)
    );

    const row = [
      s.submissionId,
      s.date,
      `"${s.center}"`,
      `"${s.managerName}"`,
      s.reportInfo ? s.reportInfo.stationId : '',
      s.reportInfo ? s.reportInfo.operator : '',
      s.summary ? s.summary.enrolments : 0,
      s.summary ? s.summary.updates : 0,
      s.summary ? s.summary.total : 0,
      totalAmt,
      `"${(s.issues || '').replace(/"/g, '""')}"`,
      `"${(s.remarks || '').replace(/"/g, '""')}"`
    ].join(',');
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ASK_EOD_Master_Report_${getTodayString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportOperatorsCSV() {
  const ops = getOperators();
  if (ops.length === 0) {
    alert("No operators available to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Operator ID,Operator Name,Manager,Center,Certification,Qualification,Certificate File,Certificate Reg No,Added Date\n";

  ops.forEach(o => {
    const row = [
      o.operatorId,
      `"${o.operatorName}"`,
      `"${o.managerName}"`,
      `"${o.center}"`,
      o.certification,
      o.qualification,
      `"${o.certificateFile || ''}"`,
      `"${o.certificateRegNo || ''}"`,
      o.createdAt ? o.createdAt.split('T')[0] : ''
    ].join(',');
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ASK_Operators_Directory_${getTodayString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clearAllData() {
  if (confirm("WARNING: Are you sure you want to clear all application data? This action cannot be undone.")) {
    localStorage.clear();
    alert("All data cleared. System will now reload.");
    location.reload();
  }
}

function restoreSeedData() {
  if (confirm("Restore original demo dataset for all 5 ASK centers?")) {
    localStorage.clear();
    seedInitialDataIfEmpty();
    alert("Demo dataset restored successfully!");
    location.reload();
  }
}
