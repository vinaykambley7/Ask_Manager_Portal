/**
 * ASK EOD Manager - Supabase Cloud Database Integration & Real-Time Universal Multi-Device Sync
 */

const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || "https://wgskquroadvtekvcnpao.supabase.co",
  anonKey: window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnc2txdXJvYWR2dGVrdmNucGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgyMzU0MiwiZXhwIjoyMTAzMzk5NTQyfQ.ruGDZn1rhl1gf6zEwr8MObYymAVuzLiCGsn0uEt6PLc"
};

let supabaseClient = null;
let isSupabaseConnected = false;
let realtimeChannel = null;
let isSyncing = false;

/**
 * Initialize Supabase Client & Universal Synchronization
 */
async function initSupabase() {
  if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && !SUPABASE_CONFIG.url.includes("your-project-id")) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      isSupabaseConnected = true;
      console.log("⚡ Supabase Cloud Database initialized successfully.");
      
      // Perform initial cloud hydration & health check
      await fetchAndHydrateFromSupabase();
      setupSupabaseRealtime();
      updateCloudStatusBadge(true);
      
      // Set up periodic sync (every 15s) and on tab focus
      setInterval(() => {
        if (!isSyncing) {
          fetchAndHydrateFromSupabase(true);
        }
      }, 15000);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          fetchAndHydrateFromSupabase(true);
        }
      });
    } catch (err) {
      console.warn("⚠️ Supabase initialization failed, operating in resilient local mode:", err);
      isSupabaseConnected = false;
      updateCloudStatusBadge(false);
    }
  } else {
    console.log("ℹ️ Supabase not yet configured. Operating in LocalStorage mode.");
    updateCloudStatusBadge(false);
  }
}

/**
 * Update the Topbar Cloud Status Indicator
 */
function updateCloudStatusBadge(connected) {
  const badge = document.getElementById('supabaseStatusBadge');
  if (badge) {
    if (connected) {
      badge.className = 'badge badge-success';
      badge.style.cursor = 'pointer';
      badge.innerHTML = <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#27ae60; margin-right:5px; box-shadow:0 0 6px #27ae60;"></span> Cloud: Live Universal Sync;
      badge.title = "Connected to Supabase Cloud. Click to sync now!";
      badge.onclick = () => manualCloudSync();
    } else {
      badge.className = 'badge badge-gray';
      badge.style.cursor = 'pointer';
      badge.innerHTML = Cloud: Local Cache;
      badge.title = "Operating in offline local cache mode. Click to retry connection.";
      badge.onclick = () => manualCloudSync();
    }
  }
}

async function manualCloudSync() {
  const badge = document.getElementById('supabaseStatusBadge');
  if (badge) badge.innerHTML = ⏳ Syncing Cloud...;
  await fetchAndHydrateFromSupabase(false);
  await pushAllLocalDataToSupabase();
  updateCloudStatusBadge(isSupabaseConnected);
  alert("☁️ Universal Cloud Sync Complete! All data from all devices is refreshed and synchronized.");
}

/**
 * Real-Time WebSocket Channel Listener for Multi-Device Updates
 */
function setupSupabaseRealtime() {
  if (!supabaseClient || realtimeChannel) return;

  try {
    realtimeChannel = supabaseClient.channel('public:all_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eod_submissions' }, payload => {
        console.log('⚡ Realtime EOD update from another device:', payload);
        fetchAndHydrateFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'operators' }, payload => {
        console.log('⚡ Realtime Operator update from another device:', payload);
        fetchAndHydrateFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_done' }, payload => {
        console.log('⚡ Realtime Work Done update from another device:', payload);
        fetchAndHydrateFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assigned_work' }, payload => {
        console.log('⚡ Realtime Assigned Work update from another device:', payload);
        fetchAndHydrateFromSupabase(true);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'grievances' }, payload => {
        console.log('⚡ Realtime Grievance update from another device:', payload);
        fetchAndHydrateFromSupabase(true);
      })
      .subscribe((status) => {
        console.log('📡 Realtime connection status:', status);
      });
  } catch (err) {
    console.warn("Realtime setup notice:", err);
  }
}

/**
 * Fetch ALL Data from Supabase and Hydrate into Local State for Any Device
 */
async function fetchAndHydrateFromSupabase(silent = false) {
  if (!supabaseClient) return;
  isSyncing = true;

  try {
    // 1. Fetch EOD Submissions
    const { data: eodData, error: eodErr } = await supabaseClient
      .from('eod_submissions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!eodErr && eodData && eodData.length > 0) {
      const localSubs = getSubmissions();
      const mergedMap = new Map();

      // Put existing local submissions into map
      localSubs.forEach(s => {
        if (s.submissionId) mergedMap.set(s.submissionId, s);
      });

      // Overlay cloud submissions
      eodData.forEach(row => {
        const item = {
          submissionId: row.submission_id,
          managerName: row.manager_name,
          center: row.center,
          date: row.date,
          timestamp: row.timestamp || row.created_at,
          reportInfo: {
            registrar: row.registrar_code || '818',
            enrolmentAgency: row.enrolment_agency || '2081',
            stationId: row.station_id || 'N/A',
            operator: row.operator_id || 'N/A',
            clientVersion: row.client_version || '3.3.4.2',
            lastRegistered: row.last_registered || '',
            lastSynch: row.last_synch || ''
          },
          summary: {
            enrolments: row.enrolments_count || 0,
            updates: row.updates_count || 0,
            total: row.total_volume || 0,
            totalAmount: Number(row.total_amount || 0)
          },
          transactions: Array.isArray(row.transactions) ? row.transactions : [],
          issues: row.issues || 'None',
          remarks: row.remarks || 'None'
        };
        mergedMap.set(item.submissionId, item);
      });

      const updatedList = Array.from(mergedMap.values()).sort((a, b) => {
        return new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date);
      });
      setStoredData(STORAGE_KEYS.EOD_SUBMISSIONS, updatedList);
    }

    // 2. Fetch Operators
    const { data: opData, error: opErr } = await supabaseClient
      .from('operators')
      .select('*');

    if (!opErr && opData && opData.length > 0) {
      const localOps = getOperators();
      const opMap = new Map();
      localOps.forEach(op => {
        if (op.operatorId) opMap.set(op.operatorId, op);
      });

      opData.forEach(row => {
        const item = {
          operatorId: row.operator_id,
          operatorName: row.operator_name,
          managerName: row.manager_name,
          center: row.center,
          certification: row.certification || 'Certified',
          qualification: row.qualification || 'Graduate',
          certificateFile: row.certificate_file || '',
          certificateUrl: row.certificate_url || '',
          certificateRegNo: row.certificate_reg_no || ''
        };
        opMap.set(item.operatorId, item);
      });

      setStoredData(STORAGE_KEYS.OPERATORS, Array.from(opMap.values()));
    }

    // 3. Fetch Work Done
    const { data: workData, error: workErr } = await supabaseClient
      .from('work_done')
      .select('*')
      .order('date', { ascending: false });

    if (!workErr && workData && workData.length > 0) {
      const localWork = getStoredData(STORAGE_KEYS.WORK_DONE, []);
      const workMap = new Map();
      localWork.forEach(w => {
        if (w.workId) workMap.set(w.workId, w);
      });

      workData.forEach(row => {
        const item = {
          workId: row.work_id,
          managerName: row.manager_name,
          center: row.center,
          title: row.title,
          category: row.category,
          description: row.description,
          startTime: row.start_time,
          endTime: row.end_time,
          status: row.status,
          remarks: row.remarks,
          attachment: row.attachment_name || '',
          date: row.date
        };
        workMap.set(item.workId, item);
      });

      setStoredData(STORAGE_KEYS.WORK_DONE, Array.from(workMap.values()));
    }

    // 4. Fetch Assigned Work
    const { data: assignData, error: assignErr } = await supabaseClient
      .from('assigned_work')
      .select('*');

    if (!assignErr && assignData && assignData.length > 0) {
      const localAssigned = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
      const assignMap = new Map();
      localAssigned.forEach(a => {
        if (a.workId) assignMap.set(a.workId, a);
      });

      assignData.forEach(row => {
        const item = {
          workId: row.work_id,
          assignedTo: row.assigned_to,
          center: row.center,
          title: row.title,
          description: row.description,
          priority: row.priority,
          assignedDate: row.assigned_date,
          dueDate: row.due_date,
          status: row.status,
          instructions: row.instructions,
          managerNotes: row.manager_notes
        };
        assignMap.set(item.workId, item);
      });

      setStoredData(STORAGE_KEYS.ASSIGNED_WORK, Array.from(assignMap.values()));
    }

    // 5. Fetch Grievances (if table exists)
    try {
      const { data: grvData, error: grvErr } = await supabaseClient
        .from('grievances')
        .select('*');

      if (!grvErr && grvData && grvData.length > 0) {
        const localGrv = getGrievances();
        const grvMap = new Map();
        localGrv.forEach(g => {
          if (g.grievanceId || g.id) grvMap.set(g.grievanceId || g.id, g);
        });

        grvData.forEach(row => {
          const item = {
            id: row.grievance_id,
            grievanceId: row.grievance_id,
            district: row.district || row.center,
            center: row.center || row.district,
            submittedBy: row.submitted_by,
            operatorId: row.operator_id,
            enrolmentId: row.enrolment_id,
            enrolmentDate: row.enrolment_date,
            serviceType: row.service_type,
            description: row.description,
            casesReported: row.cases_reported || 1,
            recurringIssue: row.recurring_issue || 'No',
            rootCause: row.root_cause || 'N/A',
            rejectReason: row.reject_reason || 'N/A',
            status: row.status || 'Pending',
            adminRemarks: row.admin_remarks || '',
            createdAt: row.created_at
          };
          grvMap.set(item.grievanceId, item);
        });

        setStoredData(STORAGE_KEYS.GRIEVANCES, Array.from(grvMap.values()));
      }
    } catch (e) {
      // Grievances table not yet created in Supabase SQL editor
    }

    isSupabaseConnected = true;
    updateCloudStatusBadge(true);

    // Refresh currently open view
    refreshActiveView();
  } catch (err) {
    console.warn("Hydration notice:", err);
  } finally {
    isSyncing = false;
  }
}

/**
 * Push all local data into Supabase Cloud so no historical uploads are missed
 */
async function pushAllLocalDataToSupabase() {
  if (!supabaseClient || !isSupabaseConnected) return;

  try {
    const subs = getSubmissions();
    for (const s of subs) {
      await syncEODSubmissionToSupabase(s);
    }
    const ops = getOperators();
    for (const op of ops) {
      await syncOperatorToSupabase(op);
    }
    const workList = getStoredData(STORAGE_KEYS.WORK_DONE, []);
    for (const w of workList) {
      await syncWorkDoneToSupabase(w);
    }
    const assignList = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
    for (const a of assignList) {
      await syncAssignedWorkToSupabase(a);
    }
    const grvList = getGrievances();
    for (const g of grvList) {
      await syncGrievanceToSupabase(g);
    }
  } catch (e) {
    console.warn("Batch cloud push notice:", e);
  }
}

/**
 * Dynamically re-render the active screen when cloud data arrives
 */
function refreshActiveView() {
  const activeSection = document.querySelector('.view-section.active');
  if (!activeSection) return;
  const viewId = activeSection.id;
  const user = getCurrentUser();
  if (!user) return;

  if (viewId === 'mgr-home') {
    renderManagerHome();
    setTimeout(renderManagerCharts, 50);
  } else if (viewId === 'mgr-history') {
    renderManagerHistory();
  } else if (viewId === 'mgr-operators') {
    renderManagerOperators();
  } else if (viewId === 'mgr-assigned-work') {
    renderManagerAssignedWork();
  } else if (viewId === 'mgr-work-done') {
    renderManagerWorkDone();
  } else if (viewId === 'mgr-grievance-history') {
    if (typeof renderManagerGrievanceHistory === 'function') renderManagerGrievanceHistory();
  } else if (viewId === 'admin-home') {
    renderAdminHome();
    setTimeout(renderAdminAnalyticsCharts, 50);
  } else if (viewId === 'admin-center-reports') {
    renderAdminCenterReports();
    setTimeout(renderAdminAnalyticsCharts, 50);
  } else if (viewId === 'admin-eod-history') {
    renderAdminEODHistoryTable();
  } else if (viewId === 'admin-operators') {
    renderAdminOperatorsTable();
  } else if (viewId === 'admin-grievances') {
    if (typeof renderAdminGrievances === 'function') renderAdminGrievances();
  }
}

/**
 * Sync EOD Submission to Supabase Cloud
 */
async function syncEODSubmissionToSupabase(submission) {
  if (!supabaseClient || !isSupabaseConnected) return;

  try {
    const row = {
      submission_id: submission.submissionId,
      manager_name: submission.managerName,
      center: submission.center,
      date: submission.date,
      timestamp: submission.timestamp,
      registrar_code: submission.reportInfo ? submission.reportInfo.registrar : '818',
      enrolment_agency: submission.reportInfo ? submission.reportInfo.enrolmentAgency : '2081',
      station_id: submission.reportInfo ? submission.reportInfo.stationId : 'N/A',
      operator_id: submission.reportInfo ? submission.reportInfo.operator : 'N/A',
      client_version: submission.reportInfo ? submission.reportInfo.clientVersion : '3.3.4.2',
      last_registered: submission.reportInfo && submission.reportInfo.lastRegistered ? new Date(submission.reportInfo.lastRegistered).toISOString() : null,
      last_synch: submission.reportInfo && submission.reportInfo.lastSynch ? new Date(submission.reportInfo.lastSynch).toISOString() : null,
      enrolments_count: submission.summary ? submission.summary.enrolments : 0,
      updates_count: submission.summary ? submission.summary.updates : 0,
      total_volume: submission.summary ? submission.summary.total : 0,
      total_amount: submission.summary ? submission.summary.totalAmount : 0,
      transactions: submission.transactions || [],
      issues: submission.issues || 'None',
      remarks: submission.remarks || 'None'
    };

    const { error } = await supabaseClient.from('eod_submissions').upsert([row], { onConflict: 'submission_id' });
    if (error) throw error;
    console.log(☁️ Synced EOD report  to Supabase.);
  } catch (err) {
    console.error("Failed to sync EOD report to Supabase:", err);
  }
}

/**
 * Sync Operator to Supabase Cloud
 */
async function syncOperatorToSupabase(operator) {
  if (!supabaseClient || !isSupabaseConnected) return;

  try {
    const row = {
      operator_id: operator.operatorId,
      operator_name: operator.operatorName,
      manager_name: operator.managerName,
      center: operator.center,
      certification: operator.certification,
      qualification: operator.qualification,
      certificate_file: operator.certificateFile || '',
      certificate_reg_no: operator.certificateRegNo || ''
    };

    const { error } = await supabaseClient.from('operators').upsert([row], { onConflict: 'operator_id' });
    if (error) throw error;
    console.log(☁️ Synced operator  to Supabase.);
  } catch (err) {
    console.error("Failed to sync operator to Supabase:", err);
  }
}

/**
 * Sync Work Done Entry to Supabase Cloud
 */
async function syncWorkDoneToSupabase(entry) {
  if (!supabaseClient || !isSupabaseConnected) return;

  try {
    const row = {
      work_id: entry.workId,
      manager_name: entry.managerName,
      center: entry.center,
      title: entry.title,
      category: entry.category,
      description: entry.description,
      start_time: entry.startTime,
      end_time: entry.endTime,
      status: entry.status,
      remarks: entry.remarks,
      attachment_name: entry.attachment,
      date: entry.date
    };

    const { error } = await supabaseClient.from('work_done').upsert([row], { onConflict: 'work_id' });
    if (error) throw error;
    console.log(☁️ Synced work log  to Supabase.);
  } catch (err) {
    console.error("Failed to sync work log to Supabase:", err);
  }
}

/**
 * Sync Assigned Work to Supabase Cloud
 */
async function syncAssignedWorkToSupabase(work) {
  if (!supabaseClient || !isSupabaseConnected) return;

  try {
    const row = {
      work_id: work.workId,
      assigned_to: work.assignedTo,
      center: work.center,
      title: work.title,
      description: work.description,
      priority: work.priority,
      assigned_date: work.assignedDate,
      due_date: work.dueDate,
      status: work.status,
      instructions: work.instructions || '',
      manager_notes: work.managerNotes || ''
    };

    const { error } = await supabaseClient.from('assigned_work').upsert([row], { onConflict: 'work_id' });
    if (error) throw error;
    console.log(☁️ Synced assigned task  to Supabase.);
  } catch (err) {
    console.error("Failed to sync assigned work to Supabase:", err);
  }
}

/**
 * Sync Grievance Entry to Supabase Cloud
 */
async function syncGrievanceToSupabase(entry) {
  if (!supabaseClient || !isSupabaseConnected) return;

  try {
    const row = {
      grievance_id: entry.id || entry.grievanceId,
      district: entry.district || entry.center,
      center: entry.center || entry.district,
      submitted_by: entry.submittedBy,
      operator_id: entry.operatorId,
      enrolment_id: entry.enrolmentId,
      enrolment_date: entry.enrolmentDate,
      service_type: entry.serviceType,
      description: entry.description,
      cases_reported: entry.casesReported || 1,
      recurring_issue: entry.recurringIssue || 'No',
      root_cause: entry.rootCause || 'N/A',
      reject_reason: entry.rejectReason || 'N/A',
      status: entry.status || 'Pending',
      admin_remarks: entry.adminRemarks || '',
      created_at: entry.createdAt || new Date().toISOString()
    };

    const { error } = await supabaseClient.from('grievances').upsert([row], { onConflict: 'grievance_id' });
    if (error) throw error;
    console.log(☁️ Synced grievance  to Supabase.);
  } catch (err) {
    console.warn("Grievance sync note (table pending):", err.message);
  }
}

async function syncGrievancesToSupabase(entries) {
  if (!entries || entries.length === 0) return;
  for (const entry of entries) {
    await syncGrievanceToSupabase(entry);
  }
}
