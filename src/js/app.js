/**
 * ASK EOD Manager - Main Application Entry, Routing & UI Controller
 */

function setupNavigation(user) {
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarPortalType = document.getElementById('sidebarPortalType');
  const userNameText = document.getElementById('userNameText');
  const userRoleText = document.getElementById('userRoleText');
  const userAvatarText = document.getElementById('userAvatarText');
  const centerBadgeText = document.getElementById('centerBadgeText');

  userNameText.textContent = user.name;
  userAvatarText.textContent = user.avatar || user.name.charAt(0);

  if (user.role === 'admin') {
    sidebarPortalType.textContent = "HOD Executive Portal";
    userRoleText.textContent = "Administrator";
    centerBadgeText.textContent = "HQ • All Centers";

    sidebarNav.innerHTML = `
      <li class="nav-section-title">Administration</li>
      <li class="nav-item">
        <a class="nav-link active" onclick="showView('admin-home')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          Dashboard
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-assign-work')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          Assign Work
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-monitoring')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          Team Monitoring
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-operators')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          All Operators
        </a>
      </li>
      <li class="nav-section-title">Reports & Intelligence</li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-analytics')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>
          Executive Analytics
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-eod-history')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
          EOD History
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-center-reports')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
          Center Performance
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('admin-export')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Export & Data
        </a>
      </li>
    `;
    showView('admin-home');
  } else {
    sidebarPortalType.textContent = "ASK Manager Desk";
    userRoleText.textContent = "ASK Manager";
    centerBadgeText.textContent = user.center;

    sidebarNav.innerHTML = `
      <li class="nav-section-title">My Workspace</li>
      <li class="nav-item">
        <a class="nav-link active" onclick="showView('mgr-home')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          Overview
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('mgr-assigned-work')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          Assigned Tasks
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('mgr-work-done')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          Daily Work Done
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('mgr-operators')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          Operator Management
        </a>
      </li>
      <li class="nav-section-title">EOD Reporting</li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('mgr-eod-form')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          Submit EOD Report
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" onclick="showView('mgr-history')">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
          Submission History
        </a>
      </li>
    `;
    showView('mgr-home');
  }
}

function showView(viewId) {
  // Hide all sections
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.remove('active');
  });

  // Activate target section
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }

  // Update nav active link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    const onclickAttr = link.getAttribute('onclick') || '';
    if (onclickAttr.includes(`'${viewId}'`)) {
      link.classList.add('active');
    }
  });

  // Dynamic View Data Rendering Triggers
  const user = getCurrentUser();
  if (viewId === 'mgr-home') {
    renderManagerHome();
    setTimeout(renderManagerCharts, 60);
  }
  if (viewId === 'mgr-assigned-work') renderManagerAssignedWork();
  if (viewId === 'mgr-work-done') renderManagerWorkDone();
  if (viewId === 'mgr-operators') renderManagerOperators();
  if (viewId === 'mgr-eod-form') initEODForm();
  if (viewId === 'mgr-history') renderManagerHistory();

  if (viewId === 'admin-home') {
    renderAdminHome();
    setTimeout(renderAdminAnalyticsCharts, 60);
  }
  if (viewId === 'admin-analytics') {
    renderHODAnalyticsDashboard();
  }
  if (viewId === 'admin-assign-work') initAdminAssignWork();
  if (viewId === 'admin-monitoring') renderAdminMonitoring();
  if (viewId === 'admin-operators') renderAdminOperatorsTable();
  if (viewId === 'admin-eod-history') renderAdminEODHistoryTable();
  if (viewId === 'admin-center-reports') {
    renderAdminCenterReports();
    setTimeout(renderAdminAnalyticsCharts, 60);
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function getPriorityBadgeClass(priority) {
  if (priority === 'Urgent') return 'badge-danger';
  if (priority === 'High') return 'badge-purple';
  if (priority === 'Medium') return 'badge-warning';
  return 'badge-gray';
}

function getStatusBadgeClass(status) {
  if (status === 'Completed') return 'badge-success';
  if (status === 'In Progress') return 'badge-warning';
  if (status === 'On Hold') return 'badge-purple';
  return 'badge-gray';
}

function getCertBadgeClass(cert) {
  if (cert === 'Certified') return 'badge-success';
  if (cert === 'In-Training') return 'badge-warning';
  return 'badge-danger';
}

function updateLiveClock() {
  const elem = document.getElementById('liveDateTimeText');
  if (elem) {
    const d = new Date();
    elem.textContent = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + ' • ' + d.toLocaleTimeString();
  }
}

function initApp() {
  seedInitialDataIfEmpty();
  if (typeof initSupabase === 'function') {
    initSupabase();
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  const user = getCurrentUser();
  if (!user) {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    switchLoginTab('manager');
  } else {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    setupNavigation(user);
  }
}

// Bootstrap app on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
