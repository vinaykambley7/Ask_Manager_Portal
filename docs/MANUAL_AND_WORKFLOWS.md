# ASK EOD Manager - Comprehensive System Manual & Workflows

---

## 1. System Architecture Overview

ASK EOD Manager is an end-to-end work management and reporting system designed for Aadhaar Seva Kendra (ASK) management operations.

```
+-------------------------------------------------------------+
|                     ASK EOD PORTAL                          |
+------------------------------+------------------------------+
|       MANAGER WORKSPACE      |      ADMINISTRATOR PORTAL    |
+------------------------------+------------------------------+
| - Daily KPI & Status Cards   | - 5-Center Executive Monitor |
| - Assigned Task Tracking     | - Task Assignment Generator  |
| - Work Done & Proof Logs     | - Team Progress Matrix       |
| - Operator & Cert Management | - All Operators Directory    |
| - Dynamic EOD Form (Tx rows) | - EOD Master History & Detail|
| - Manager EOD History Archive| - CSV Export & System Reset  |
+------------------------------+------------------------------+
```

---

## 2. Manager Daily Operating Workflow

1. **Sign In**:
   - Open portal, select **ASK Manager Login** tab.
   - Enter your Username (e.g., `ramesh`) and password (`manager123`).
2. **Review Assigned Work**:
   - Navigate to **Assigned Work**. Check tasks from the Administrator.
   - Update status to `In Progress` or `Completed` with progress notes.
3. **Log Daily Work & Attach Proof**:
   - Go to **Today's Work Done**.
   - Input task details, category, time spent, and upload document proof.
4. **Manage Operators & Upload Certificates**:
   - Under **Operator Management**, register operators with qualification and attach **UIDAI Certificates (PDF/Image)**.
   - Click certificate badge to preview or upload missing certificates.
5. **Submit EOD Report**:
   - Go to **Submit EOD Report**.
   - Select station operator, verify basic details.
   - Check Summary counts (Auto-calculated `Total = Enrolments + Updates`).
   - Add/Edit individual transaction rows with fees and GST.
   - Enter issues and remarks, then click **Submit End-of-Day Report**.

---

## 3. Administrator Review Workflow

1. **Sign In**:
   - Select **HOD / Admin Login** tab.
   - Enter Username `admin` and password `admin123`.
2. **Monitor Center Real-Time Performance**:
   - Inspect the **5 Center Performance Cards** (Submitted vs Pending status).
   - Check Total Enrolments, Updates, and Revenue.
3. **Assign New Work Tasks**:
   - Open **Assign Work**, select manager, choose priority (`Urgent`, `High`, `Medium`, `Low`), and set due date.
4. **Inspect Master EOD Submissions**:
   - Go to **EOD History** &rarr; Click **View Report** on any submission to inspect station ID, summary, issues, and full multi-row transaction table.
   - Print or review submission records.
5. **Export Data**:
   - Open **Export & Data** to download structured CSV spreadsheets of EOD Submissions and Operator directories.

---

## 4. Verification & Testing Checklist

- [x] Ramesh Kumar logs into Anthosh Nagar with center locked
- [x] Operator registration with certificate attachment
- [x] Admin assigns work task to manager
- [x] Manager updates task progress to In Progress / Completed
- [x] Manager logs daily work done entry with file attachment
- [x] Manager submits EOD report with multi-row transactions
- [x] Admin verifies Anthosh Nagar marked as Submitted (Green)
- [x] Full EOD inspection modal with print capability
- [x] Export to CSV for Submissions and Operators
