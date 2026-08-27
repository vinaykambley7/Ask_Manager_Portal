/**
 * ASK EOD Manager - Storage & Data Access Layer
 */

function getStoredData(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error("Storage read error:", e);
    return defaultVal;
  }
}

function setStoredData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

function getCurrentUser() {
  return getStoredData(STORAGE_KEYS.CURRENT_USER, null);
}

function setCurrentUser(user) {
  setStoredData(STORAGE_KEYS.CURRENT_USER, user);
}

function getOperators() {
  return getStoredData(STORAGE_KEYS.OPERATORS, []);
}

function getManagerOperators(managerName) {
  return getOperators().filter(op => op.managerName === managerName);
}

function getCenterOperators(centerName) {
  return getOperators().filter(op => op.center === centerName);
}

function getSubmissions() {
  return getStoredData(STORAGE_KEYS.EOD_SUBMISSIONS, []);
}

function getManagerSubmissions(managerName) {
  return getSubmissions().filter(s => s.managerName === managerName);
}

function getCenterSubmissions(centerName) {
  return getSubmissions().filter(s => s.center === centerName);
}

function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getTodaySubmissions() {
  const today = getTodayString();
  return getSubmissions().filter(s => s.date === today);
}

function calculateCenterStats(centerName) {
  const centerSubs = getCenterSubmissions(centerName);
  const today = getTodayString();
  const todaySub = centerSubs.find(s => s.date === today);

  let totalEnrolments = 0;
  let totalUpdates = 0;
  let totalVolume = 0;

  centerSubs.forEach(s => {
    if (s.summary) {
      totalEnrolments += Number(s.summary.enrolments || 0);
      totalUpdates += Number(s.summary.updates || 0);
      totalVolume += Number(s.summary.total || 0);
    }
  });

  return {
    submittedToday: !!todaySub,
    todaySubmission: todaySub || null,
    totalEnrolments,
    totalUpdates,
    totalVolume,
    submissionCount: centerSubs.length
  };
}

function calculateManagerStats(managerName) {
  const mgr = FIXED_MANAGERS.find(m => m.name === managerName);
  const center = mgr ? mgr.center : "";
  const centerStats = calculateCenterStats(center);
  const ops = getManagerOperators(managerName);

  return {
    ...centerStats,
    activeOperatorsCount: ops.length,
    operators: ops
  };
}

function calculateTodayStats() {
  const todaySubs = getTodaySubmissions();
  let totalEnrolments = 0;
  let totalUpdates = 0;
  let totalVolume = 0;
  let centersSubmittedCount = 0;

  FIXED_MANAGERS.forEach(m => {
    const isSub = todaySubs.some(s => s.center === m.center);
    if (isSub) centersSubmittedCount++;
  });

  todaySubs.forEach(s => {
    if (s.summary) {
      totalEnrolments += Number(s.summary.enrolments || 0);
      totalUpdates += Number(s.summary.updates || 0);
      totalVolume += Number(s.summary.total || 0);
    }
  });

  return {
    totalCenters: FIXED_MANAGERS.length,
    submittedCount: centersSubmittedCount,
    pendingCount: FIXED_MANAGERS.length - centersSubmittedCount,
    enrolments: totalEnrolments,
    updates: totalUpdates,
    total: totalVolume,
    submissions: todaySubs
  };
}

function generateEODId() {
  const currentYear = new Date().getFullYear();
  const subs = getSubmissions();
  const seq = (subs.length + 1).toString().padStart(4, '0');
  return `EOD-${currentYear}-${seq}`;
}

function generateWorkId() {
  const tasks = getStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  const seq = (tasks.length + 1).toString().padStart(3, '0');
  return `WORK-${seq}`;
}

function calculateTotal(enrolments, updates) {
  const e = parseInt(enrolments, 10) || 0;
  const u = parseInt(updates, 10) || 0;
  return e + u;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function seedInitialDataIfEmpty() {
  const CLEAN_SCHEMA_VERSION = "v2_empty_clean";
  if (localStorage.getItem('ask_schema_ver') !== CLEAN_SCHEMA_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.OPERATORS);
    localStorage.removeItem(STORAGE_KEYS.ASSIGNED_WORK);
    localStorage.removeItem(STORAGE_KEYS.WORK_DONE);
    localStorage.removeItem(STORAGE_KEYS.EOD_SUBMISSIONS);
    localStorage.setItem('ask_schema_ver', CLEAN_SCHEMA_VERSION);
  }

  if (!localStorage.getItem(STORAGE_KEYS.OPERATORS)) {
    setStoredData(STORAGE_KEYS.OPERATORS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ASSIGNED_WORK)) {
    setStoredData(STORAGE_KEYS.ASSIGNED_WORK, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORK_DONE)) {
    setStoredData(STORAGE_KEYS.WORK_DONE, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EOD_SUBMISSIONS)) {
    setStoredData(STORAGE_KEYS.EOD_SUBMISSIONS, []);
  }
}
