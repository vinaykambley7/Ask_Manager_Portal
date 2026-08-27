/**
 * ASK EOD Manager - Authentication & Session Management
 */

function handleManagerFormLogin(event) {
  event.preventDefault();
  const inputVal = document.getElementById('mgrUsernameInput').value.trim().toLowerCase();
  const password = document.getElementById('mgrPasswordInput').value.trim();

  if (!inputVal) {
    alert("Please enter your manager username or center name.");
    return;
  }
  if (!password) {
    alert("Please enter your password.");
    return;
  }

  // Match manager by username, first name, full name, or center name
  const mgr = FIXED_MANAGERS.find(m => 
    m.name.toLowerCase() === inputVal ||
    m.name.toLowerCase().includes(inputVal) ||
    m.name.toLowerCase().split(' ')[0] === inputVal ||
    m.center.toLowerCase() === inputVal ||
    m.center.toLowerCase().includes(inputVal)
  );

  if (mgr) {
    const userSession = {
      role: "manager",
      id: mgr.id,
      name: mgr.name,
      center: mgr.center,
      avatar: mgr.avatar
    };
    setCurrentUser(userSession);
    initApp();
  } else {
    alert("Invalid Manager username or center. Please check your credentials and try again.");
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const u = document.getElementById('adminUsername').value.trim();
  const p = document.getElementById('adminPassword').value.trim();

  if (u === "admin" && p === "admin123") {
    const userSession = {
      role: "admin",
      name: "HOD Administrator",
      center: "Headquarters (All Centers)",
      avatar: "AD"
    };
    setCurrentUser(userSession);
    initApp();
  } else {
    alert("Invalid administrator credentials. Please check your username and password.");
  }
}

function switchLoginTab(tab) {
  const tabMgr = document.getElementById('tabBtnManager');
  const tabAdm = document.getElementById('tabBtnAdmin');
  const paneMgr = document.getElementById('managerLoginPane');
  const paneAdm = document.getElementById('adminLoginPane');

  if (tab === 'admin') {
    tabMgr.classList.remove('active');
    tabAdm.classList.add('active');
    paneMgr.classList.remove('active');
    paneAdm.classList.add('active');
    setTimeout(() => {
      const uInput = document.getElementById('adminUsername');
      if (uInput) uInput.focus();
    }, 50);
  } else {
    tabAdm.classList.remove('active');
    tabMgr.classList.add('active');
    paneAdm.classList.remove('active');
    paneMgr.classList.add('active');
    setTimeout(() => {
      const mInput = document.getElementById('mgrUsernameInput');
      if (mInput) mInput.focus();
    }, 50);
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  document.getElementById('appContainer').style.display = 'none';
  document.getElementById('loginContainer').style.display = 'flex';
  switchLoginTab('manager');
  const mgrForm = document.getElementById('managerLoginForm');
  if (mgrForm) mgrForm.reset();
  const admForm = document.getElementById('adminLoginForm');
  if (admForm) admForm.reset();
}
