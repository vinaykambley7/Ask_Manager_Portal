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
  const user = getStoredData(STORAGE_KEYS.CURRENT_USER, null);
  if (user) {
    if (user.center === 'Gadwa' || (user.name === 'Shekar' && user.center !== 'Gadwal')) {
      user.center = 'Gadwal';
      setCurrentUser(user);
    }
    if (user.center === 'Anthosh Nagar' || (user.name === 'Ramesh Kumar' && user.center !== 'Santosh Nagar')) {
      user.center = 'Santosh Nagar';
      setCurrentUser(user);
    }
  }
  return user;
}

function setCurrentUser(user) {
  setStoredData(STORAGE_KEYS.CURRENT_USER, user);
}

function getOperators() {
  const ops = getStoredData(STORAGE_KEYS.OPERATORS, []);
  let modified = false;
  ops.forEach(o => {
    if (o.center === 'Gadwa' || (o.managerName === 'Shekar' && o.center !== 'Gadwal')) {
      o.center = 'Gadwal';
      modified = true;
    }
    if (o.center === 'Anthosh Nagar' || (o.managerName === 'Ramesh Kumar' && o.center !== 'Santosh Nagar')) {
      o.center = 'Santosh Nagar';
      modified = true;
    }
  });
  if (modified) {
    setStoredData(STORAGE_KEYS.OPERATORS, ops);
  }
  return ops;
}

function getManagerOperators(managerName) {
  return getOperators().filter(op => op.managerName === managerName);
}

function getCenterOperators(centerName) {
  const target = (centerName || '').trim().toLowerCase();
  return getOperators().filter(op => {
    const c = (op.center || '').trim().toLowerCase();
    return c === target || 
           (target.startsWith('gadwa') && c.startsWith('gadwa')) ||
           (target.includes('anthosh') && c.includes('santosh')) ||
           (target.includes('santosh') && c.includes('anthosh'));
  });
}

function getSubmissions() {
  const subs = getStoredData(STORAGE_KEYS.EOD_SUBMISSIONS, []);
  let modified = false;
  subs.forEach(s => {
    if (s.center === 'Gadwa' || (s.managerName === 'Shekar' && s.center !== 'Gadwal')) {
      s.center = 'Gadwal';
      modified = true;
    }
    if (s.center === 'Anthosh Nagar' || (s.managerName === 'Ramesh Kumar' && s.center !== 'Santosh Nagar')) {
      s.center = 'Santosh Nagar';
      modified = true;
    }
  });
  if (modified) {
    setStoredData(STORAGE_KEYS.EOD_SUBMISSIONS, subs);
  }
  return subs;
}

function getManagerSubmissions(managerName) {
  return getSubmissions().filter(s => s.managerName === managerName);
}

function getCenterSubmissions(centerName) {
  const target = (centerName || '').trim().toLowerCase();
  return getSubmissions().filter(s => {
    const c = (s.center || '').trim().toLowerCase();
    return c === target || 
           (target.startsWith('gadwa') && c.startsWith('gadwa')) ||
           (target.includes('anthosh') && c.includes('santosh')) ||
           (target.includes('santosh') && c.includes('anthosh'));
  });
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
  // Migrate any legacy Gadwa/Anthosh references in localStorage to Gadwal/Santosh Nagar
  try {
    const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawUser && (rawUser.includes('Gadwa') || rawUser.includes('Anthosh'))) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, rawUser.replace(/Gadwa/g, 'Gadwal').replace(/Anthosh/g, 'Santosh'));
    }
    const rawOps = localStorage.getItem(STORAGE_KEYS.OPERATORS);
    if (rawOps && (rawOps.includes('Gadwa') || rawOps.includes('Anthosh'))) {
      localStorage.setItem(STORAGE_KEYS.OPERATORS, rawOps.replace(/Gadwa/g, 'Gadwal').replace(/Anthosh/g, 'Santosh'));
    }
    const rawSubs = localStorage.getItem(STORAGE_KEYS.EOD_SUBMISSIONS);
    if (rawSubs && (rawSubs.includes('Gadwa') || rawSubs.includes('Anthosh'))) {
      localStorage.setItem(STORAGE_KEYS.EOD_SUBMISSIONS, rawSubs.replace(/Gadwa/g, 'Gadwal').replace(/Anthosh/g, 'Santosh'));
    }
    const rawWork = localStorage.getItem(STORAGE_KEYS.ASSIGNED_WORK);
    if (rawWork && (rawWork.includes('Gadwa') || rawWork.includes('Anthosh'))) {
      localStorage.setItem(STORAGE_KEYS.ASSIGNED_WORK, rawWork.replace(/Gadwa/g, 'Gadwal').replace(/Anthosh/g, 'Santosh'));
    }
    const rawDone = localStorage.getItem(STORAGE_KEYS.WORK_DONE);
    if (rawDone && (rawDone.includes('Gadwa') || rawDone.includes('Anthosh'))) {
      localStorage.setItem(STORAGE_KEYS.WORK_DONE, rawDone.replace(/Gadwa/g, 'Gadwal').replace(/Anthosh/g, 'Santosh'));
    }
  } catch (e) {}

  const CLEAN_SCHEMA_VERSION = "v4_clean_santosh_gadwal";
  if (localStorage.getItem('ask_schema_ver') !== CLEAN_SCHEMA_VERSION) {
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
