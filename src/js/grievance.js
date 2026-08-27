/**
 * ASK EOD Manager - Grievance Management Module
 * Operators & Managers can log grievance issues with exact UIDAI service types
 * HOD / Admin can review, track, update status, and export grievances.
 */

let grievanceRowCount = 0;

/**
 * Add a Grievance Row matching the exact requested format
 */
function addGrievanceRow(data = null) {
  grievanceRowCount++;
  const rowId = grievanceRowCount;
  const user = getCurrentUser();
  const defaultCenter = user ? (user.center || 'Santosh Nagar') : 'Santosh Nagar';

  const district = data ? (data.district || data.center || defaultCenter) : defaultCenter;
  const enrolmentId = data ? (data.enrolmentId || '') : '';
  const enrolmentDate = data ? (data.enrolmentDate || getTodayString()) : getTodayString();
  const serviceType = data ? (data.serviceType || 'New Enrollment below 5') : 'New Enrollment below 5';
  const description = data ? (data.description || '') : '';
  const casesReported = data ? (data.casesReported || 1) : 1;
  const recurringIssue = data ? (data.recurringIssue || 'No') : 'No';
  const rootCause = data ? (data.rootCause || '') : '';
  const rejectReason = data ? (data.rejectReason || '') : '';
  const status = data ? (data.status || 'Pending') : 'Pending';

  const tbody = document.getElementById('grievanceTableBody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.id = grvRow_;
  tr.innerHTML = 
    <td style="text-align:center;"><b></b></td>
    <td>
      <input type="text" class="form-control" name="grv_district_" value="" placeholder="District / Center" style="min-width:140px; font-weight:600;" required />
    </td>
    <td>
      <input type="text" class="form-control" name="grv_enrolId_" value="" placeholder="Enrollment ID / Packet" style="min-width:180px;" required />
    </td>
    <td>
      <input type="date" class="form-control" name="grv_enrolDate_" value="" style="min-width:130px;" required />
    </td>
    <td>
      <!-- ONLY SERVICE TYPE IS A DROPDOWN AS SPECIFIED BY USER -->
      <select class="form-control" name="grv_serviceType_" style="min-width:190px; font-weight:600; padding:6px 8px;">
        <option value="New Enrollment below 5" >New Enrollment below 5</option>
        <option value="above 5 - 17 enrollment" >above 5 - 17 enrollment</option>
        <option value="18 above enrollment" >18 above enrollment</option>
        <option value="Mandatory Biometric Update" >Mandatory Biometric Update</option>
        <option value="Demographic Update" >Demographic Update</option>
        <option value="Document Update" >Document Update</option>
        <option value="Biometric Update" >Biometric Update</option>
      </select>
    </td>
    <td>
      <input type="text" class="form-control" name="grv_desc_" value="" placeholder="Detailed Grievance Description" style="min-width:200px;" required />
    </td>
    <td>
      <input type="number" class="form-control" name="grv_cases_" value="" min="1" style="min-width:80px; text-align:center; font-weight:600;" required />
    </td>
    <td>
      <select class="form-control" name="grv_recurring_" style="min-width:80px; font-weight:600; padding:6px 8px;">
        <option value="No" >No</option>
        <option value="Yes" >Yes</option>
      </select>
    </td>
    <td>
      <input type="text" class="form-control" name="grv_rootCause_" value="" placeholder="Root Cause (if known)" style="min-width:160px;" />
    </td>
    <td>
      <input type="text" class="form-control" name="grv_rejectReason_" value="" placeholder="If Reject Reason" style="min-width:150px;" />
    </td>
    <td>
      <select class="form-control" name="grv_status_" style="min-width:110px; font-weight:700; padding:6px 8px;">
        <option value="Pending" >Pending</option>
        <option value="Rejected" >Rejected</option>
        <option value="Under Review" >Under Review</option>
        <option value="Resolved" >Resolved</option>
      </select>
    </td>
    <td style="text-align:center;">
      <button type="button" class="btn btn-danger btn-sm" onclick="removeGrievanceRow()" title="Remove entry" style="padding:4px 8px;">
        &times;
      </button>
    </td>
  ;

  tbody.appendChild(tr);
  reindexGrievanceRows();
}

function removeGrievanceRow(rowId) {
  const row = document.getElementById(grvRow_);
  if (row) {
    row.remove();
    reindexGrievanceRows();
  }
}

function reindexGrievanceRows() {
  const tbody = document.getElementById('grievanceTableBody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((r, idx) => {
    if (r.cells && r.cells[0]) {
      r.cells[0].innerHTML = <b></b>;
    }
  });
}

function resetGrievanceForm() {
  const tbody = document.getElementById('grievanceTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    grievanceRowCount = 0;
    addGrievanceRow();
  }
}

/**
 * Handle Multi-Row Grievance Form Submission to Admin
 */
function handleGrievanceSubmit(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const tbody = document.getElementById('grievanceTableBody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 0) {
    alert("Please add at least one grievance row before submitting.");
    return;
  }

  const newGrievances = [];
  const timestamp = new Date().toISOString();

  rows.forEach((r, idx) => {
    const districtInput = r.querySelector('[name^="grv_district_"]');
    const enrolIdInput = r.querySelector('[name^="grv_enrolId_"]');
    const enrolDateInput = r.querySelector('[name^="grv_enrolDate_"]');
    const serviceTypeSelect = r.querySelector('[name^="grv_serviceType_"]');
    const descInput = r.querySelector('[name^="grv_desc_"]');
    const casesInput = r.querySelector('[name^="grv_cases_"]');
    const recurringSelect = r.querySelector('[name^="grv_recurring_"]');
    const rootCauseInput = r.querySelector('[name^="grv_rootCause_"]');
    const rejectReasonInput = r.querySelector('[name^="grv_rejectReason_"]');
    const statusSelect = r.querySelector('[name^="grv_status_"]');

    const grvId = GRV--;

    const entry = {
      id: grvId,
      grievanceId: grvId,
      district: districtInput ? districtInput.value.trim() : (user.center || 'Santosh Nagar'),
      center: districtInput ? districtInput.value.trim() : (user.center || 'Santosh Nagar'),
      submittedBy: user.name || 'Operator',
      operatorId: user.operatorId || 'S_NX_TS_047',
      enrolmentId: enrolIdInput ? enrolIdInput.value.trim() : '',
      enrolmentDate: enrolDateInput ? enrolDateInput.value : getTodayString(),
      serviceType: serviceTypeSelect ? serviceTypeSelect.value : 'New Enrollment below 5',
      description: descInput ? descInput.value.trim() : '',
      casesReported: casesInput ? parseInt(casesInput.value, 10) || 1 : 1,
      recurringIssue: recurringSelect ? recurringSelect.value : 'No',
      rootCause: rootCauseInput ? rootCauseInput.value.trim() : 'N/A',
      rejectReason: rejectReasonInput ? rejectReasonInput.value.trim() : 'N/A',
      status: statusSelect ? statusSelect.value : 'Pending',
      adminRemarks: 'Awaiting Admin Review',
      createdAt: timestamp
    };

    if (entry.enrolmentId && entry.description) {
      newGrievances.push(entry);
    }
  });

  if (newGrievances.length === 0) {
    alert("Please fill in Enrollment ID and Grievance Description for each row.");
    return;
  }

  saveGrievances(newGrievances);
  alert(✅ Successfully submitted  grievance report(s) directly to Admin & HOD Desk!);
  
  resetGrievanceForm();
  showView('mgr-grievance-history');
}

/**
 * Render Grievance History for Current Center
 */
function renderManagerGrievanceHistory() {
  const user = getCurrentUser();
  const centerGrievances = getCenterGrievances(user.center);
  const tbody = document.getElementById('mgrGrievanceHistoryTableBody');
  const countEl = document.getElementById('mgrGrievanceCountBadge');

  if (countEl) countEl.textContent = centerGrievances.length;
  if (!tbody) return;

  if (centerGrievances.length === 0) {
    tbody.innerHTML = 
      <tr>
        <td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">
          No grievances submitted yet for . Use the Grievance Form to log any operator or machine issues.
        </td>
      </tr>
    ;
    return;
  }

  tbody.innerHTML = centerGrievances.map((g, idx) => {
    let statusClass = 'badge-warning';
    if (g.status === 'Resolved') statusClass = 'badge-success';
    else if (g.status === 'Rejected') statusClass = 'badge-danger';
    else if (g.status === 'Under Review') statusClass = 'badge-primary';

    return 
      <tr>
        <td><b></b></td>
        <td><span style="font-family:monospace; font-weight:700; color:var(--primary);"></span></td>
        <td><b></b></td>
        <td></td>
        <td><span class="badge badge-purple" style="font-size:11px;"></span></td>
        <td style="max-width:240px; white-space:normal;"></td>
        <td style="text-align:center;"><b></b></td>
        <td style="text-align:center;"><span class="badge "></span></td>
        <td></td>
        <td><span class="badge "></span></td>
      </tr>
    ;
  }).join('');
}

/**
 * Render All Grievances for HOD / Admin with Filters & Status Controls
 */
function renderAdminGrievances() {
  const grievances = getGrievances();
  const filterCenter = document.getElementById('adminGrvCenterFilter') ? document.getElementById('adminGrvCenterFilter').value : 'ALL';
  const filterStatus = document.getElementById('adminGrvStatusFilter') ? document.getElementById('adminGrvStatusFilter').value : 'ALL';
  const filterService = document.getElementById('adminGrvServiceFilter') ? document.getElementById('adminGrvServiceFilter').value : 'ALL';

  // KPI Stat Computations
  const totalCount = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Pending').length;
  const reviewCount = grievances.filter(g => g.status === 'Under Review').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const rejectedCount = grievances.filter(g => g.status === 'Rejected').length;
  const recurringCount = grievances.filter(g => g.recurringIssue === 'Yes').length;

  const totalEl = document.getElementById('adminGrvTotalKpi');
  const pendingEl = document.getElementById('adminGrvPendingKpi');
  const resolvedEl = document.getElementById('adminGrvResolvedKpi');
  const recurringEl = document.getElementById('adminGrvRecurringKpi');

  if (totalEl) totalEl.textContent = totalCount;
  if (pendingEl) pendingEl.textContent = pendingCount + reviewCount;
  if (resolvedEl) resolvedEl.textContent = resolvedCount;
  if (recurringEl) recurringEl.textContent = recurringCount;

  // Filter List
  let filtered = grievances;
  if (filterCenter !== 'ALL') {
    filtered = filtered.filter(g => {
      const c = (g.district || g.center || '').toLowerCase();
      return c.includes(filterCenter.toLowerCase());
    });
  }
  if (filterStatus !== 'ALL') {
    filtered = filtered.filter(g => g.status === filterStatus);
  }
  if (filterService !== 'ALL') {
    filtered = filtered.filter(g => g.serviceType === filterService);
  }

  const tbody = document.getElementById('adminGrievanceTableBody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = 
      <tr>
        <td colspan="11" style="text-align:center; padding:35px; color:var(--text-muted);">
          No grievance records match the selected filters.
        </td>
      </tr>
    ;
    return;
  }

  tbody.innerHTML = filtered.map((g, idx) => {
    let statusClass = 'badge-warning';
    if (g.status === 'Resolved') statusClass = 'badge-success';
    else if (g.status === 'Rejected') statusClass = 'badge-danger';
    else if (g.status === 'Under Review') statusClass = 'badge-primary';

    const safeId = escapeHtml(g.id || g.grievanceId);

    return 
      <tr>
        <td><b></b></td>
        <td><b></b></td>
        <td><span style="font-family:monospace; font-weight:700;"></span></td>
        <td></td>
        <td><span class="badge badge-purple" style="font-size:11px;"></span></td>
        <td style="max-width:220px; white-space:normal; font-size:12px;"></td>
        <td style="text-align:center;"><b></b></td>
        <td style="text-align:center;"><span class="badge "></span></td>
        <td style="font-size:12px;"></td>
        <td><span class="badge "></span></td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            <select class="form-control" style="width:115px; font-size:11px; padding:3px 6px; font-weight:600;" onchange="handleAdminGrievanceStatusChange('', this.value)">
              <option value="Pending" >Pending</option>
              <option value="Under Review" >In Review</option>
              <option value="Resolved" >Resolved</option>
              <option value="Rejected" >Rejected</option>
            </select>
          </div>
        </td>
      </tr>
    ;
  }).join('');
}

function handleAdminGrievanceStatusChange(grievanceId, newStatus) {
  const remarks = prompt(Enter resolution notes or reason for marking as "":, "Updated by Administrator");
  if (remarks !== null) {
    updateGrievanceStatus(grievanceId, newStatus, remarks);
    renderAdminGrievances();
  }
}

/**
 * Export Grievances to CSV
 */
function exportGrievancesCSV() {
  const grievances = getGrievances();
  if (grievances.length === 0) {
    alert("No grievance records available to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Sl. No.,District (Center),Enrollment ID,Enrollment Date,Service Type,Detailed Grievance Description,No. of Cases Reported,Recurring Issue (Yes/No),Root Cause (if known),If Reject Reason,Status(Rejected/Pending),Submitted By,Submission Date\n";

  grievances.forEach((g, idx) => {
    const row = [
      idx + 1,
      "",
      "",
      g.enrolmentDate || '',
      "",
      "",
      g.casesReported || 1,
      g.recurringIssue || 'No',
      "",
      "",
      g.status || 'Pending',
      "",
      g.createdAt || ''
    ];
    csvContent += row.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", ASK_Grievance_Report_.csv);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
