/**
 * ASK EOD Manager - Supabase Cloud Database Integration & Real-Time Sync
 */

const SUPABASE_CONFIG = {
  url: window.SUPABASE_URL || "https://wgskquroadvtekvcnpao.supabase.co",
  anonKey: window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnc2txdXJvYWR2dGVrdmNucGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzgyMzU0MiwiZXhwIjoyMTAzMzk5NTQyfQ.ruGDZn1rhl1gf6zEwr8MObYymAVuzLiCGsn0uEt6PLc"
};

let supabaseClient = null;
let isSupabaseConnected = false;

/**
 * Initialize Supabase Client
 */
function initSupabase() {
  if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && !SUPABASE_CONFIG.url.includes("your-project-id")) {
    try {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      isSupabaseConnected = true;
      console.log("⚡ Supabase Client initialized successfully.");
      checkSupabaseHealth();
    } catch (err) {
      console.warn("⚠️ Supabase initialization failed, falling back to LocalStorage:", err);
      isSupabaseConnected = false;
    }
  } else {
    console.log("ℹ️ Supabase not yet configured. Operating seamlessly in LocalStorage mode.");
  }
}

/**
 * Health check to verify database connectivity
 */
async function checkSupabaseHealth() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('operators').select('count', { count: 'exact', head: true });
    if (!error) {
      console.log("✅ Supabase cloud database connected and active!");
      updateCloudStatusBadge(true);
    } else {
      console.warn("Supabase health check note:", error.message);
      updateCloudStatusBadge(false);
    }
  } catch (e) {
    updateCloudStatusBadge(false);
  }
}

function updateCloudStatusBadge(connected) {
  const badge = document.getElementById('supabaseStatusBadge');
  if (badge) {
    if (connected) {
      badge.className = 'badge badge-success';
      badge.textContent = 'Cloud Database: Connected';
    } else {
      badge.className = 'badge badge-gray';
      badge.textContent = 'Cloud Database: Local Mode';
    }
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

    const { data, error } = await supabaseClient.from('eod_submissions').upsert([row], { onConflict: 'submission_id' });
    if (error) throw error;
    console.log(`☁️ Synced EOD report ${submission.submissionId} to Supabase.`);
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

    const { data, error } = await supabaseClient.from('operators').upsert([row], { onConflict: 'operator_id' });
    if (error) throw error;
    console.log(`☁️ Synced operator ${operator.operatorId} to Supabase.`);
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

    const { data, error } = await supabaseClient.from('work_done').upsert([row], { onConflict: 'work_id' });
    if (error) throw error;
    console.log(`☁️ Synced work log ${entry.workId} to Supabase.`);
  } catch (err) {
    console.error("Failed to sync work log to Supabase:", err);
  }
}
