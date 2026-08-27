# ASK EOD Manager - Work Management & EOD Portal

A centralized enterprise work management and End-of-Day (EOD) reporting system built for 5 ASK Managers and 1 HOD / Administrator.

---

## 📁 Project File Structure

```text
ask-eod-manager/
├── index.html                   # Complete Standalone Single-File Web Application (No dependencies)
├── server.js                    # Zero-dependency Node.js HTTP Server (Port 3000)
├── start.bat                    # Windows 1-Click Desktop Launcher
├── package.json                 # Project configuration
├── README.md                    # System Documentation & Guide
├── CREDENTIALS.md               # User roles, center assignments, and passwords
├── data/
│   ├── sample_operators.json    # Example Operator records schema
│   ├── sample_eod_submission.json# Example EOD multi-row transaction schema
│   └── sample_assigned_work.json# Example Admin work assignment schema
└── docs/
    └── MANUAL_AND_WORKFLOWS.md  # Detailed user manual, test workflows, and business rules
```

---

## 🚀 Quick Start & How to Run

### Method 1: Instant Browser Launch (No tools required)
Double-click `index.html` or `start.bat` in File Explorer. It opens instantly in your default web browser (Chrome, Edge, Firefox).

### Method 2: Local Web Server (Node.js)
```bash
# In this directory:
node server.js
```
Then open **`http://localhost:3000`** in your browser.

---

## 👥 Fixed User Roles & Centers

### 1. HOD / Administrator
* **Username**: `admin`
* **Password**: `admin123`
* **Access**: Full executive dashboard, team work monitoring, work assignment tool, all operator records, EOD master history, center-wise counters, CSV exports.

### 2. ASK Managers (Fixed 5 Centers)
* **Standard Password for all Managers**: `manager123`

| Manager Name | Center | Username | Password |
|---|---|---|---|
| **Ramesh Kumar** | Santosh Nagar | `ramesh` | `manager123` |
| **Mounika** | A.S. Rao Nagar | `mounika` | `manager123` |
| **Shekar** | Gadwal | `shekar` | `manager123` |
| **Naithika** | Vanasthalipuram | `naithika` | `manager123` |
| **Khadher** | Khamam | `khadher` | `manager123` |

---

## 🌟 Core Features & Modules

### ASK Manager Desk
1. **Overview Dashboard**: Today's active operators, EOD status (Submitted vs Pending), today's total transactions, and priority admin tasks feed.
2. **Assigned Work**: View tasks assigned by Admin, inspect instructions, and update status (`Not Started`, `In Progress`, `Completed`, `On Hold`) with notes.
3. **Today's Work Done**: Log daily tasks with category, time spent, status, remarks, and proof attachments.
4. **Operator Management**: Register operators with qualifications, certification levels, and **certificate file uploads (PDF/Images)**. Center is auto-locked to manager.
5. **EOD Report Submission**:
   - Basic Station & Agency Info.
   - Summary counts with auto-calculated total (`Enrolments + Updates`).
   - Dynamic multi-row transactions table with automatic fee & GST calculations.
   - Issues encountered and daily remarks.
   - Generates formatted EOD ID: `EOD-YYYY-XXXX`.
6. **My Submission History**: Complete archive of past EOD reports with full inspection modal and print view.

### HOD / Admin Executive Portal
1. **Centralized KPI Overview**: Total Centers (5), EOD Submitted/Pending Today, Total Transactions, Active Operators, and Issues reported.
2. **Center Performance Grid**: Real-time side-by-side performance cards for all 5 centers.
3. **Work Assignment Tool**: Assign tasks to managers with priority, due date, instructions, and attachments.
4. **Team Work Monitoring Matrix**: Matrix tracking: `Manager | Center | Assigned | Completed | In Progress | Pending | Overdue` + live manager work logs.
5. **All Operators Directory**: Searchable directory with filters for Center, Certification, and Qualification + Certificate viewer.
6. **Master EOD Submissions History**: Filterable history table with comprehensive report inspection modal.
7. **Center Reports & Counters**: Center-wise cumulative statistics and revenue counters.
8. **Export & Maintenance**:
   - `exportEODCSV()`: Full CSV download of all submissions with headers and transaction logs.
   - `exportOperatorsCSV()`: Full CSV download of all operators.
   - Restore default demo data / Clear data options.

---

## 💾 LocalStorage Persistence Keys
* `eodCurrentUser`: Current session object
* `operators`: Array of Operator records
* `eodSubmissions`: Array of EOD submission records
* `assignedWork`: Array of Admin assigned tasks
* `workDone`: Array of Manager daily work logs
