# ASK EOD Manager - Code Architecture & Function Reference

This document provides a complete guide for maintaining and developing the codebase manually.

---

## 📁 Modular Directory Map

```text
ask-eod-manager/
│
├── index.html                   # Clean HTML structure (UI views & modals)
├── server.js                    # Node.js Static HTTP server (Port 3000)
├── start.bat                    # 1-Click Windows desktop launcher
├── package.json                 # Project manifest & npm scripts
├── README.md                    # System overview and quick start guide
├── CREDENTIALS.md               # User roles, centers, and credentials
│
├── src/
│   ├── css/
│   │   ├── variables.css        # Colors, fonts, shadows, design tokens
│   │   ├── layout.css           # Sidebar, topbar, responsive containers & grids
│   │   ├── components.css       # Cards, KPI stat boxes, buttons, badges, tables, alerts
│   │   ├── login.css            # Tabbed login container, segmented switcher
│   │   └── modals.css           # Modals, certificate inspection windows, print styling
│   │
│   └── js/
│       ├── config.js            # Fixed 5 managers array, storage keys
│       ├── storage.js           # LocalStorage wrapper, calculations, math & initial seed data
│       ├── auth.js              # Manager/Admin authentication logic & tab switcher
│       ├── manager.js           # Manager dashboard, assigned tasks, daily work logs
│       ├── operators.js         # Operator registration, table, certificate upload & viewer
│       ├── eod.js               # EOD dynamic multi-row form, calculations, submit & history
│       ├── admin.js             # 5-center performance grid, work assignment, CSV export & reset
│       └── app.js               # Navigation router, view switcher, live clock, bootstrap
│
├── data/
│   ├── sample_operators.json    # Operator JSON records
│   ├── sample_eod_submission.json# EOD report transaction logs schema
│   └── sample_assigned_work.json# Admin task assignment schema
│
└── docs/
    ├── API_AND_FUNCTIONS.md     # This specification and reference document
    └── MANUAL_AND_WORKFLOWS.md  # System operations manual & verification checklist
```

---

## 🛠️ JavaScript Function Reference

### 1. `src/js/storage.js`
* `getStoredData(key, defaultVal)`: Safely reads and parses JSON from `localStorage`.
* `setStoredData(key, value)`: Serializes and stores JSON in `localStorage`.
* `getCurrentUser()`: Returns active user session object.
* `setCurrentUser(user)`: Saves active user session object.
* `getOperators()`: Returns all registered operators across all centers.
* `getManagerOperators(managerName)`: Filters operators by manager.
* `getCenterOperators(centerName)`: Filters operators by center.
* `getSubmissions()`: Returns all EOD submissions array.
* `getManagerSubmissions(managerName)`: Filters submissions by manager.
* `getCenterSubmissions(centerName)`: Filters submissions by center.
* `getTodaySubmissions()`: Returns submissions submitted today (`YYYY-MM-DD`).
* `calculateCenterStats(centerName)`: Calculates volume, enrolments, updates, and today's submission status for a center.
* `calculateManagerStats(managerName)`: Calculates stats + operator count for manager.
* `calculateTodayStats()`: Global aggregator for HOD/Admin KPI overview.
* `generateEODId()`: Returns formatted ID: `EOD-YYYY-XXXX`.
* `generateWorkId()`: Returns formatted ID: `WORK-XXX`.
* `calculateTotal(enrolments, updates)`: Returns `enrolments + updates`.
* `seedInitialDataIfEmpty()`: Pre-populates demo dataset on first load.

### 2. `src/js/auth.js`
* `handleManagerFormLogin(event)`: Validates manager username/center and logs manager into locked workspace.
* `handleAdminLogin(event)`: Validates administrator username (`admin`) and password (`admin123`).
* `switchLoginTab(tab)`: Toggles between `'manager'` and `'admin'` login panes.
* `handleLogout()`: Clears active session and resets login form.

### 3. `src/js/manager.js`
* `renderManagerHome()`: Renders manager KPI stat cards and top priority tasks.
* `renderManagerAssignedWork()`: Renders assigned tasks with status update action.
* `openUpdateTaskStatusModal(workId)`: Opens status update modal for a specific task.
* `handleSaveTaskStatus(event)`: Updates task status (`Not Started`, `In Progress`, `Completed`, `On Hold`) and manager notes.
* `handleAddWorkDone(event)`: Saves daily work log with category and attachment.
* `renderManagerWorkDone()`: Renders today's work entries table.

### 4. `src/js/operators.js`
* `renderManagerOperators()`: Renders center operator table with certificate badges and actions.
* `handleAddOperator(event)`: Validates and creates a new operator record auto-locked to manager's center.
* `handleDeleteOperator(opId)`: Removes an operator record.
* `openUploadCertModal(opId)`: Opens quick certificate upload modal for an operator.
* `handleSaveQuickCertUpload(event)`: Attaches certificate file and registration number to operator.
* `viewCertModal(opId)`: Displays rich interactive certificate inspection modal.

### 5. `src/js/eod.js`
* `initEODForm()`: Validates operator prerequisite, resets form, and creates initial transaction rows.
* `addTransactionRow()`: Dynamically inserts a new transaction packet row.
* `handleTxTypeChange(rowId, type)`: Sets default fees based on transaction type (`E`, `U`, `B`, `D`).
* `calculateRowTotal(rowId)`: Calculates `GST + Amt Enrol + Amt Update`.
* `removeTransactionRow(rowId)`: Deletes a specific transaction row.
* `handleEODSubmit(event)`: Validates form, extracts transaction table data, builds EOD submission object, and stores report.
* `renderManagerHistory()`: Lists historical EOD reports for the logged-in manager.
* `viewEODDetail(submissionId)`: Opens full EOD inspection modal with station parameters, summary, and multi-row transaction table.

### 6. `src/js/admin.js`
* `renderAdminHome()`: Renders Admin overview and 5 fixed center performance grid.
* `initAdminAssignWork()`: Populates manager dropdown and active task table.
* `handleAdminAssignWork(event)`: Creates a new work assignment for a manager.
* `handleDeleteAssignedWork(workId)`: Deletes an assigned task.
* `renderAdminMonitoring()`: Renders manager progress matrix and real-time work done stream.
* `renderAdminOperatorsTable()`: Renders searchable and filterable all-center operator directory.
* `renderAdminEODHistoryTable()`: Renders master EOD submissions table with date/center/manager filters.
* `renderAdminCenterReports()`: Renders cumulative volume, reports count, and estimated collections.
* `exportEODCSV()`: Downloads structured CSV of all EOD reports.
* `exportOperatorsCSV()`: Downloads structured CSV of all operator records.
* `clearAllData()`: Clears `localStorage` and resets system.
* `restoreSeedData()`: Restores initial demo dataset.

### 7. `src/js/app.js`
* `setupNavigation(user)`: Renders role-specific sidebar navigation links.
* `showView(viewId)`: Activates target view section and triggers data rendering.
* `openModal(modalId)` / `closeModal(modalId)`: Modal lifecycle handlers.
* `updateLiveClock()`: Updates live topbar clock.
* `initApp()`: App bootstrap routine on DOM ready.
