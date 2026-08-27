/**
 * ASK EOD Manager - Operator & Certificate Management Module
 */

function handleOpCertFileChange(input) {
  if (input.files && input.files[0]) {
    document.getElementById('opCertFileName').value = input.files[0].name;
  }
}

function handleQuickCertFileChange(input) {
  if (input.files && input.files[0]) {
    document.getElementById('quickCertFileName').value = input.files[0].name;
  }
}

function openUploadCertModal(opId) {
  const ops = getOperators();
  const op = ops.find(o => o.operatorId === opId);
  if (!op) return;

  document.getElementById('quickCertOpId').value = op.operatorId;
  document.getElementById('quickCertOpName').value = `${op.operatorName} (${op.operatorId}) - ${op.center}`;
  document.getElementById('quickCertRegNo').value = op.certificateRegNo || `UIDAI-${op.operatorId}`;
  document.getElementById('quickCertFileName').value = "";
  document.getElementById('quickCertFileInput').value = "";
  openModal('operatorCertUploadModal');
}

function handleSaveQuickCertUpload(event) {
  event.preventDefault();
  const opId = document.getElementById('quickCertOpId').value;
  const fileName = document.getElementById('quickCertFileName').value || (document.getElementById('quickCertFileInput').files[0] ? document.getElementById('quickCertFileInput').files[0].name : "operator_cert.pdf");
  const regNo = document.getElementById('quickCertRegNo').value.trim();

  const ops = getOperators();
  const opIdx = ops.findIndex(o => o.operatorId === opId);
  if (opIdx > -1) {
    ops[opIdx].certificateFile = fileName;
    ops[opIdx].certificateRegNo = regNo || `UIDAI-${ops[opIdx].operatorId}`;
    setStoredData(STORAGE_KEYS.OPERATORS, ops);
  }

  closeModal('operatorCertUploadModal');
  alert(`Certificate uploaded successfully for operator ${opId}!`);
  
  const user = getCurrentUser();
  if (user && user.role === 'manager') {
    renderManagerOperators();
  } else {
    renderAdminOperatorsTable();
  }
}

function viewCertModal(opId) {
  const ops = getOperators();
  const op = ops.find(o => o.operatorId === opId);
  if (!op) {
    alert("Operator record not found.");
    return;
  }

  const hasCert = op.certificateFile && op.certificateFile.trim() !== "";
  const certName = hasCert ? op.certificateFile : "No Certificate Uploaded";
  const regNo = op.certificateRegNo || "Pending Registration";

  document.getElementById('certViewModalTitle').textContent = `Operator Certificate: ${op.operatorName}`;
  document.getElementById('certViewModalBody').innerHTML = `
    <div style="text-align:center; padding:16px 0 20px; border-bottom:1px solid var(--border-light); margin-bottom:18px;">
      <div style="width:60px; height:60px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
      </div>
      <h3 style="font-size:18px; color:var(--primary-dark); font-weight:800;">UIDAI Operator Competency Certificate</h3>
      <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">Aadhaar Enrolment & Update Certification Document</p>
    </div>

    <div style="background:#f8f9fa; border:1px solid var(--border); border-radius:10px; padding:18px; margin-bottom:16px;">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; font-size:13px;">
        <div><b>Operator Name:</b> ${escapeHtml(op.operatorName)}</div>
        <div><b>Operator ID:</b> <code>${escapeHtml(op.operatorId)}</code></div>
        <div><b>ASK Center:</b> ${escapeHtml(op.center)}</div>
        <div><b>Manager:</b> ${escapeHtml(op.managerName)}</div>
        <div><b>Certification Level:</b> <span class="badge ${getCertBadgeClass(op.certification)}">${op.certification}</span></div>
        <div><b>Qualification:</b> ${op.qualification}</div>
        <div><b>Certificate Reg #:</b> <b>${escapeHtml(regNo)}</b></div>
        <div><b>Registered On:</b> ${op.createdAt ? op.createdAt.split('T')[0] : 'N/A'}</div>
      </div>
    </div>

    <div style="border:1px dashed var(--border); border-radius:10px; padding:16px; display:flex; align-items:center; justify-content:space-between; background:#fff;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:38px; height:38px; border-radius:8px; background:${hasCert ? 'var(--success-light)' : 'var(--danger-light)'}; color:${hasCert ? 'var(--success)' : 'var(--danger)'}; display:flex; align-items:center; justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        </div>
        <div>
          <div style="font-weight:700; font-size:13px;">${escapeHtml(certName)}</div>
          <div style="font-size:11px; color:var(--text-muted);">${hasCert ? 'Verified Document Attached' : 'No document on file'}</div>
        </div>
      </div>
      <div>
        ${hasCert ? `
          <button class="btn btn-secondary btn-sm" onclick="alert('Downloading certificate: ${escapeHtml(certName)}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Download
          </button>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="closeModal('operatorCertViewModal'); openUploadCertModal('${op.operatorId}')">
            + Upload Now
          </button>
        `}
      </div>
    </div>
  `;

  openModal('operatorCertViewModal');
}

function renderManagerOperators() {
  const user = getCurrentUser();
  document.getElementById('opCenter').value = user.center;
  const ops = getManagerOperators(user.name);
  const tbody = document.getElementById('mgrOperatorsTableBody');

  if (ops.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No operators registered for ${user.center}. Add one using the form.</td></tr>`;
    return;
  }

  tbody.innerHTML = ops.map(op => {
    const hasCert = op.certificateFile && op.certificateFile.trim() !== "";
    return `
      <tr>
        <td><code>${escapeHtml(op.operatorId)}</code></td>
        <td style="font-weight:600;">${escapeHtml(op.operatorName)}</td>
        <td><span class="badge ${getCertBadgeClass(op.certification)}">${op.certification}</span></td>
        <td>${op.qualification}</td>
        <td>
          ${hasCert ? `
            <button class="btn btn-secondary btn-sm" onclick="viewCertModal('${op.operatorId}')" style="gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
              ${escapeHtml(op.certificateFile)}
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" onclick="openUploadCertModal('${op.operatorId}')" style="border-style:dashed; color:var(--primary);">
              + Upload Cert
            </button>
          `}
        </td>
        <td>${op.createdAt ? op.createdAt.split('T')[0] : 'N/A'}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="handleDeleteOperator('${op.operatorId}')">
            Remove
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function handleAddOperator(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const opId = document.getElementById('opId').value.trim();
  const opName = document.getElementById('opName').value.trim();
  const cert = document.getElementById('opCertification').value;
  const qual = document.getElementById('opQualification').value;
  const certFile = document.getElementById('opCertFileName').value || (document.getElementById('opCertFileInput').files[0] ? document.getElementById('opCertFileInput').files[0].name : "");

  const ops = getOperators();
  if (ops.some(o => o.operatorId.toLowerCase() === opId.toLowerCase())) {
    alert("An operator with this Operator ID already exists!");
    return;
  }

  const newOp = {
    operatorId: opId,
    operatorName: opName,
    managerName: user.name,
    center: user.center, // Auto-locked to manager's center
    certification: cert,
    qualification: qual,
    certificateFile: certFile,
    certificateRegNo: certFile ? `UIDAI-${opId}` : "",
    createdAt: new Date().toISOString()
  };

  ops.push(newOp);
  setStoredData(STORAGE_KEYS.OPERATORS, ops);

  // Trigger Supabase Cloud Sync
  if (typeof syncOperatorToSupabase === 'function') {
    syncOperatorToSupabase(newOp);
  }

  document.getElementById('addOperatorForm').reset();
  document.getElementById('opCertFileName').value = "";
  document.getElementById('opCenter').value = user.center;
  alert("Operator registered successfully with certificate attached!");
  renderManagerOperators();
  renderManagerHome();
}

function handleDeleteOperator(opId) {
  if (confirm(`Are you sure you want to remove operator ${opId}?`)) {
    let ops = getOperators();
    ops = ops.filter(o => o.operatorId !== opId);
    setStoredData(STORAGE_KEYS.OPERATORS, ops);
    renderManagerOperators();
    renderManagerHome();
  }
}
