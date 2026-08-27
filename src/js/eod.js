/**
 * ASK EOD Manager - End-of-Day (EOD) Reporting & File Parser Module
 */

let transactionRowCount = 0;

function initEODForm() {
  const user = getCurrentUser();
  const ops = getManagerOperators(user ? user.name : "");
  
  // Populate datalist suggestions if operators exist
  const datalist = document.getElementById('operatorListSuggestions');
  if (datalist) {
    datalist.innerHTML = ops.map(o => `
      <option value="${escapeHtml(o.operatorId)}">${escapeHtml(o.operatorName)} - ${o.center}</option>
    `).join('');
  }

  const opInput = document.getElementById('eodOperatorInput');
  if (opInput) {
    if (!opInput.value && ops.length > 0) {
      opInput.value = ops[0].operatorId;
    }
  }

  const stationInput = document.getElementById('eodStationId');
  if (stationInput && !stationInput.value) {
    stationInput.value = "";
  }

  document.getElementById('eodLastRegistered').value = new Date().toISOString().slice(0, 16);
  document.getElementById('eodLastSynch').value = new Date().toISOString().slice(0, 16);

  document.getElementById('eodEnrolCount').value = "0";
  document.getElementById('eodUpdateCount').value = "0";
  document.getElementById('eodTotalCount').value = "0";
  document.getElementById('eodIssues').value = "";
  document.getElementById('eodRemarks').value = "";

  const tbody = document.getElementById('eodTxTableBody');
  tbody.innerHTML = "";
  transactionRowCount = 0;

  addTransactionRow();
  recalculateEODTotalsFromRows();
}

function updateEODSummaryFromInputs() {
  const enrol = parseInt(document.getElementById('eodEnrolCount').value, 10) || 0;
  const updates = parseInt(document.getElementById('eodUpdateCount').value, 10) || 0;
  document.getElementById('eodTotalCount').value = calculateTotal(enrol, updates);
}

/**
 * Add a Single Streamlined Transaction Row
 */
function addTransactionRow(rowData = null) {
  transactionRowCount++;
  const rowId = transactionRowCount;
  const mainOpInput = document.getElementById('eodOperatorInput');
  const defaultOpId = rowData ? (rowData.operatorId || '') : (mainOpInput ? mainOpInput.value.trim() : '');

  const enrolNo = rowData ? (rowData.enrolmentNo || '') : '';
  const type = rowData ? (rowData.type || 'U') : 'U';
  const mbu = rowData ? (rowData.mandatoryBiometricUpdate || 'No') : 'No';
  const nri = rowData ? (rowData.isNRI || 'No') : 'No';
  const resident = rowData ? (rowData.resident || '') : '';
  const status = rowData ? (rowData.status || 'UPLOADED') : 'UPLOADED';
  const gst = rowData ? (parseFloat(rowData.gstApplied) || 0).toFixed(2) : '0.00';
  const amt = rowData ? (parseFloat(rowData.amount) || (type === 'E' ? 50 : 50)).toFixed(2) : (type === 'E' ? '50.00' : '50.00');
  const total = (parseFloat(gst) + parseFloat(amt)).toFixed(2);

  const tbody = document.getElementById('eodTxTableBody');
  const tr = document.createElement('tr');
  tr.id = `txRow_${rowId}`;
  tr.innerHTML = `
    <td><b>${rowId}</b></td>
    <td><input type="text" class="form-control" name="tx_enrolNo_${rowId}" value="${escapeHtml(enrolNo)}" placeholder="Enrolment / Packet No" required style="min-width:140px;" /></td>
    <td>
      <select class="form-control" name="tx_type_${rowId}" onchange="handleTxTypeChange(${rowId}, this.value)" style="min-width:120px;">
        <option value="U" ${type === 'U' ? 'selected' : ''}>Update (U)</option>
        <option value="E" ${type === 'E' ? 'selected' : ''}>New Enrolment (E)</option>
        <option value="D" ${type === 'D' ? 'selected' : ''}>Doc Update (D)</option>
        <option value="B" ${type === 'B' ? 'selected' : ''}>Biometric (B)</option>
      </select>
    </td>
    <td>
      <select class="form-control" name="tx_mbu_${rowId}">
        <option value="No" ${mbu === 'No' ? 'selected' : ''}>No</option>
        <option value="Yes" ${mbu === 'Yes' ? 'selected' : ''}>Yes</option>
      </select>
    </td>
    <td>
      <select class="form-control" name="tx_nri_${rowId}">
        <option value="No" ${nri === 'No' ? 'selected' : ''}>No</option>
        <option value="Yes" ${nri === 'Yes' ? 'selected' : ''}>Yes</option>
      </select>
    </td>
    <td>
      <input type="text" class="form-control" name="tx_opId_${rowId}" id="txOpId_${rowId}" value="${escapeHtml(defaultOpId)}" placeholder="Operator ID" style="min-width:130px;" required />
    </td>
    <td><input type="text" class="form-control" name="tx_resident_${rowId}" value="${escapeHtml(resident)}" placeholder="Resident Name" style="min-width:120px;" required /></td>
    <td>
      <select class="form-control" name="tx_status_${rowId}">
        <option value="UPLOADED" ${status === 'UPLOADED' ? 'selected' : ''}>UPLOADED</option>
        <option value="PENDING" ${status === 'PENDING' ? 'selected' : ''}>PENDING</option>
        <option value="REJECTED" ${status === 'REJECTED' ? 'selected' : ''}>REJECTED</option>
      </select>
    </td>
    <td><input type="number" class="form-control" name="tx_gst_${rowId}" id="txGst_${rowId}" value="${gst}" step="0.01" oninput="calculateRowTotal(${rowId})" style="min-width:70px;" /></td>
    <td><input type="number" class="form-control" name="tx_amt_${rowId}" id="txAmt_${rowId}" value="${amt}" step="0.01" oninput="calculateRowTotal(${rowId})" style="min-width:75px;" /></td>
    <td><input type="number" class="form-control" name="tx_total_${rowId}" id="txTotal_${rowId}" value="${total}" readonly style="min-width:80px; font-weight:700; background:#f4f6f9;" /></td>
    <td>
      <button type="button" class="btn btn-danger btn-sm" onclick="removeTransactionRow(${rowId})">
        &times;
      </button>
    </td>
  `;

  tbody.appendChild(tr);
  reindexTransactionRows();
  recalculateEODTotalsFromRows();
}

function handleTxTypeChange(rowId, type) {
  const amtInput = document.getElementById(`txAmt_${rowId}`);
  if (type === 'E') {
    amtInput.value = "50.00";
  } else if (type === 'U') {
    amtInput.value = "50.00";
  } else if (type === 'B') {
    amtInput.value = "100.00";
  } else {
    amtInput.value = "50.00";
  }
  calculateRowTotal(rowId);
}

function calculateRowTotal(rowId) {
  const gst = parseFloat(document.getElementById(`txGst_${rowId}`).value) || 0;
  const amt = parseFloat(document.getElementById(`txAmt_${rowId}`).value) || 0;
  const total = gst + amt;
  document.getElementById(`txTotal_${rowId}`).value = total.toFixed(2);
  recalculateEODTotalsFromRows();
}

function removeTransactionRow(rowId) {
  const row = document.getElementById(`txRow_${rowId}`);
  if (row) {
    row.remove();
    reindexTransactionRows();
    recalculateEODTotalsFromRows();
  }
}

function reindexTransactionRows() {
  const tbody = document.getElementById('eodTxTableBody');
  const rows = tbody.querySelectorAll('tr');
  rows.forEach((r, idx) => {
    r.cells[0].innerHTML = `<b>${idx + 1}</b>`;
  });
}

/**
 * Automatically Recalculate Totals from All Active Rows
 */
function recalculateEODTotalsFromRows() {
  const tbody = document.getElementById('eodTxTableBody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let enrolCount = 0;
  let updateCount = 0;
  let totalAmount = 0;

  rows.forEach(tr => {
    const selectType = tr.querySelector('select[name^="tx_type_"]');
    const totalInput = tr.querySelector('input[name^="tx_total_"]');

    const type = selectType ? selectType.value : 'U';
    const rowTotal = totalInput ? (parseFloat(totalInput.value) || 0) : 0;

    if (type === 'E') {
      enrolCount++;
    } else {
      updateCount++;
    }
    totalAmount += rowTotal;
  });

  const totalVolume = enrolCount + updateCount;

  // Update input fields
  const enrolInput = document.getElementById('eodEnrolCount');
  const updateInput = document.getElementById('eodUpdateCount');
  const totalInput = document.getElementById('eodTotalCount');

  if (enrolInput) enrolInput.value = enrolCount;
  if (updateInput) updateInput.value = updateCount;
  if (totalInput) totalInput.value = totalVolume;

  // Update live stat displays
  const liveEnrol = document.getElementById('liveCalcEnrol');
  const liveUpdate = document.getElementById('liveCalcUpdate');
  const liveVolume = document.getElementById('liveCalcVolume');
  const liveAmount = document.getElementById('liveCalcAmount');

  if (liveEnrol) liveEnrol.textContent = enrolCount;
  if (liveUpdate) liveUpdate.textContent = updateCount;
  if (liveVolume) liveVolume.textContent = totalVolume;
  if (liveAmount) liveAmount.textContent = '₹' + totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Handle Excel / CSV / HTML / PDF / TXT File Upload & Auto-Parsing
 */
function handleEODFileUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const fileName = file.name.toLowerCase();

  const reader = new FileReader();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    reader.onload = function(e) {
      try {
        if (typeof XLSX !== 'undefined') {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          processParsedSheetData(jsonData);
        } else {
          alert("Excel parsing requires SheetJS library. Please save your file as .csv and upload again.");
        }
      } catch (err) {
        console.error("Excel parse error:", err);
        alert("Error parsing Excel file. Please ensure it is a valid .xlsx or .csv spreadsheet.");
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (fileName.endsWith('.pdf')) {
    // PDF UIDAI EOD Report Parsing
    reader.onload = function(e) {
      try {
        if (typeof pdfjsLib !== 'undefined') {
          const typedarray = new Uint8Array(e.target.result);
          parseEODPdfReport(typedarray);
        } else {
          alert("PDF parsing library is still loading. Please try again or convert the PDF to CSV / Excel.");
        }
      } catch (err) {
        console.error("PDF parse error:", err);
        alert("Error loading PDF file.");
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    // HTML UIDAI EOD Report Parsing
    reader.onload = function(e) {
      try {
        const htmlText = e.target.result;
        parseEODHtmlReport(htmlText);
      } catch (err) {
        console.error("HTML EOD parse error:", err);
        alert("Error parsing HTML EOD file. Please ensure it is a valid UIDAI EOD HTML export.");
      }
    };
    reader.readAsText(file);
  } else {
    // CSV / TXT Parsing
    reader.onload = function(e) {
      try {
        const text = e.target.result;
        const lines = text.split(/\r\n|\n/).filter(l => l.trim() !== '');
        const rows = lines.map(line => {
          // Handle comma-separated with potential quotes
          const regex = /(?:^|,)(\"(?:[^\"]+|\"\")*\"|[^,]*)/g;
          const matches = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            let val = match[1].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
            matches.push(val);
          }
          return matches;
        });
        processParsedSheetData(rows);
      } catch (err) {
        console.error("CSV parse error:", err);
        alert("Error parsing CSV file.");
      }
    };
    reader.readAsText(file);
  }

  // Reset file input so user can re-upload if needed
  input.value = "";
}

/**
 * Native PDF UIDAI EOD Report Parser (Multi-page text extraction)
 */
async function parseEODPdfReport(typedarray) {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: typedarray });
    const pdf = await loadingTask.promise;
    let fullPdfText = "";
    const extractedLines = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group items by vertical Y position to reconstruct rows
      const items = textContent.items;
      const linesMap = {};

      items.forEach(item => {
        const y = Math.round(item.transform[5]); // Y coordinate
        if (!linesMap[y]) linesMap[y] = [];
        linesMap[y].push(item);
      });

      // Sort lines from top to bottom
      const sortedY = Object.keys(linesMap).sort((a, b) => Number(b) - Number(a));

      sortedY.forEach(y => {
        // Sort tokens left to right
        const lineItems = linesMap[y].sort((a, b) => a.transform[4] - b.transform[4]);
        const lineText = lineItems.map(i => i.str).join(' ').trim();
        if (lineText) {
          extractedLines.push(lineText);
          fullPdfText += lineText + "\n";
        }
      });
    }

    // 1. Extract Metadata (Station, Registrar, Agency, Operator, Client Version)
    const regMatch = fullPdfText.match(/Registrar\s*(?:Code)?\s*[:=-]\s*([0-9A-Za-z_]+)/i);
    if (regMatch && regMatch[1]) {
      const el = document.getElementById('eodRegistrar');
      if (el) el.value = regMatch[1].trim();
    }

    const eaMatch = fullPdfText.match(/Enrolment\s*Agency\s*(?:Code)?\s*[:=-]\s*([0-9A-Za-z_]+)/i);
    if (eaMatch && eaMatch[1]) {
      const el = document.getElementById('eodEnrolmentAgency');
      if (el) el.value = eaMatch[1].trim();
    }

    const stationMatch = fullPdfText.match(/Station\s*(?:ID)?\s*[:=-]\s*([0-9A-Za-z_-]+)/i);
    if (stationMatch && stationMatch[1]) {
      const el = document.getElementById('eodStationId');
      if (el) el.value = stationMatch[1].trim();
    }

    const opMatch = fullPdfText.match(/Operator\s*(?:ID)?\s*[:=-]\s*([0-9A-Za-z_]+)/i);
    if (opMatch && opMatch[1]) {
      const el = document.getElementById('eodOperatorInput');
      if (el) el.value = opMatch[1].trim();
    }

    const verMatch = fullPdfText.match(/Client\s*Version\s*[:=-]\s*([0-9.]+)/i);
    if (verMatch && verMatch[1]) {
      const el = document.getElementById('eodClientVersion');
      if (el) el.value = verMatch[1].trim();
    }

    // 2. Parse Lines for Transaction Packets
    const parsedRows = [
      ["SNo", "Enrolment_No", "Type", "MBU", "NRI", "Operator_ID", "Resident_Name", "Status", "GST", "Amount"]
    ];

    let rowCount = 0;
    extractedLines.forEach(line => {
      // Look for lines containing an enrolment pattern (e.g. 2345/76581/2026 or 14/28 digit number)
      const enrolMatch = line.match(/([0-9]{4}\/[0-9]{4,6}\/[0-9]{4}|[0-9]{4}\/[0-9]{5}\/[0-9]{4}|[0-9]{14,28})/);
      if (enrolMatch) {
        rowCount++;
        const tokens = line.split(/\s+/);
        const enrolNo = enrolMatch[0];
        
        // Detect Type
        let type = 'U';
        if (/\b(E|NEW|ENROLMENT)\b/i.test(line)) type = 'E';
        else if (/\b(B|BIO|BIOMETRIC)\b/i.test(line)) type = 'B';
        else if (/\b(D|DOC|DOCUMENT)\b/i.test(line)) type = 'D';

        const mbu = /\b(YES|Y)\b/i.test(line) ? 'Yes' : 'No';
        const nri = /\bNRI\b/i.test(line) ? 'Yes' : 'No';
        const opId = document.getElementById('eodOperatorInput') ? document.getElementById('eodOperatorInput').value : 'S_NX_TS_047';
        
        // Estimate resident name
        let resident = `Resident ${rowCount}`;
        const nameMatch = line.match(/(?:UPLOADED|PENDING|SUCCESS)?\s*([A-Za-z\s.]+)(?:UPLOADED|PENDING|SUCCESS|$)/i);
        if (nameMatch && nameMatch[1] && nameMatch[1].trim().length > 2) {
          const cleanName = nameMatch[1].replace(/(Enrolment|Update|Biometric|Resident|Type|Status|GST|Amount)/gi, '').trim();
          if (cleanName.length > 2) resident = cleanName;
        }

        const amt = type === 'B' ? "100" : "50";

        parsedRows.push([
          String(rowCount),
          enrolNo,
          type,
          mbu,
          nri,
          opId,
          resident,
          "UPLOADED",
          "0",
          amt
        ]);
      }
    });

    if (parsedRows.length > 1) {
      processParsedSheetData(parsedRows);
    } else {
      alert("Could not automatically locate transaction rows in this PDF format. You can manually enter or use the Excel/CSV/HTML template.");
    }
  } catch (err) {
    console.error("PDF extraction error:", err);
    alert("Error reading PDF content. Please check the file.");
  }
}

/**
 * Native HTML UIDAI EOD Report Parser
 */
function parseEODHtmlReport(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  // 1. Extract Metadata from Document (Station ID, Registrar, Agency, Operator, Client Version)
  const fullText = doc.body ? doc.body.innerText : htmlText;

  // Regex extractors for standard UIDAI EOD HTML tokens
  const regMatch = fullText.match(/Registrar\s*(?:Code)?\s*[:=-]\s*([0-9A-Za-z_]+)/i);
  if (regMatch && regMatch[1]) {
    const el = document.getElementById('eodRegistrar');
    if (el) el.value = regMatch[1].trim();
  }

  const eaMatch = fullText.match(/Enrolment\s*Agency\s*(?:Code)?\s*[:=-]\s*([0-9A-Za-z_]+)/i);
  if (eaMatch && eaMatch[1]) {
    const el = document.getElementById('eodEnrolmentAgency');
    if (el) el.value = eaMatch[1].trim();
  }

  const stationMatch = fullText.match(/Station\s*(?:ID)?\s*[:=-]\s*([0-9A-Za-z_-]+)/i);
  if (stationMatch && stationMatch[1]) {
    const el = document.getElementById('eodStationId');
    if (el) el.value = stationMatch[1].trim();
  }

  const opMatch = fullText.match(/Operator\s*(?:ID)?\s*[:=-]\s*([0-9A-Za-z_]+)/i);
  if (opMatch && opMatch[1]) {
    const el = document.getElementById('eodOperatorInput');
    if (el) el.value = opMatch[1].trim();
  }

  const verMatch = fullText.match(/Client\s*Version\s*[:=-]\s*([0-9.]+)/i);
  if (verMatch && verMatch[1]) {
    const el = document.getElementById('eodClientVersion');
    if (el) el.value = verMatch[1].trim();
  }

  // 2. Locate Transaction Tables in HTML
  const tables = Array.from(doc.querySelectorAll('table'));
  if (tables.length === 0) {
    alert("Could not find any transaction tables in the uploaded HTML file.");
    return;
  }

  // Pick the table with the most rows or containing header keywords
  let mainTable = tables[0];
  let maxRows = 0;
  tables.forEach(t => {
    const rowCount = t.querySelectorAll('tr').length;
    if (rowCount > maxRows) {
      maxRows = rowCount;
      mainTable = t;
    }
  });

  const trs = Array.from(mainTable.querySelectorAll('tr'));
  if (trs.length < 2) {
    alert("The HTML report table contains no transaction records.");
    return;
  }

  // Convert HTML Table to 2D Array
  const sheetData = [];
  trs.forEach(tr => {
    const cells = Array.from(tr.querySelectorAll('th, td')).map(c => c.innerText.trim());
    if (cells.length > 0 && cells.some(c => c !== '')) {
      sheetData.push(cells);
    }
  });

  processParsedSheetData(sheetData);
}

function processParsedSheetData(rows) {
  if (!rows || rows.length < 2) {
    alert("The uploaded file does not contain transaction records.");
    return;
  }

  const headerRow = rows[0].map(h => String(h).toLowerCase().replace(/[^a-z0-9]/g, ''));
  const dataRows = rows.slice(1);

  // Identify column indices
  let colEnrol = headerRow.findIndex(h => h.includes('enrol') || h.includes('packet') || h.includes('eid') || h.includes('number'));
  let colType = headerRow.findIndex(h => h.includes('type'));
  let colMbu = headerRow.findIndex(h => h.includes('mbu') || h.includes('biometric'));
  let colNri = headerRow.findIndex(h => h.includes('nri'));
  let colOp = headerRow.findIndex(h => h.includes('operator') || h.includes('opid') || h.includes('user'));
  let colResident = headerRow.findIndex(h => h.includes('resident') || h.includes('name'));
  let colStatus = headerRow.findIndex(h => h.includes('status'));
  let colGst = headerRow.findIndex(h => h.includes('gst'));
  let colAmt = headerRow.findIndex(h => h.includes('amount') || h.includes('fee') || h.includes('price') || h.includes('total'));

  if (colEnrol === -1) colEnrol = 1;
  if (colType === -1) colType = 2;
  if (colResident === -1) colResident = 6;

  const tbody = document.getElementById('eodTxTableBody');
  tbody.innerHTML = "";
  transactionRowCount = 0;

  let loadedCount = 0;

  dataRows.forEach(r => {
    if (!r || r.length === 0 || !r.some(cell => String(cell).trim() !== '')) return;

    // Determine Type
    let typeVal = 'U';
    if (colType > -1 && r[colType]) {
      const rawType = String(r[colType]).toUpperCase();
      if (rawType.includes('E') || rawType.includes('NEW') || rawType.includes('ENROL')) {
        typeVal = 'E';
      } else if (rawType.includes('B') || rawType.includes('BIO')) {
        typeVal = 'B';
      } else if (rawType.includes('D') || rawType.includes('DOC')) {
        typeVal = 'D';
      } else {
        typeVal = 'U';
      }
    }

    const rowObj = {
      enrolmentNo: colEnrol > -1 && r[colEnrol] ? String(r[colEnrol]).trim() : `2345/00${loadedCount + 1}/${getTodayString()}`,
      type: typeVal,
      mandatoryBiometricUpdate: colMbu > -1 && r[colMbu] ? (String(r[colMbu]).toUpperCase().includes('Y') ? 'Yes' : 'No') : 'No',
      isNRI: colNri > -1 && r[colNri] ? (String(r[colNri]).toUpperCase().includes('Y') ? 'Yes' : 'No') : 'No',
      operatorId: colOp > -1 && r[colOp] ? String(r[colOp]).trim() : (document.getElementById('eodOperatorInput') ? document.getElementById('eodOperatorInput').value : ''),
      resident: colResident > -1 && r[colResident] ? String(r[colResident]).trim() : `Resident ${loadedCount + 1}`,
      status: colStatus > -1 && r[colStatus] ? String(r[colStatus]).toUpperCase().trim() : 'UPLOADED',
      gstApplied: colGst > -1 && r[colGst] ? parseFloat(r[colGst]) || 0 : 0,
      amount: colAmt > -1 && r[colAmt] ? parseFloat(r[colAmt]) || (typeVal === 'B' ? 100 : 50) : (typeVal === 'B' ? 100 : 50)
    };

    addTransactionRow(rowObj);
    loadedCount++;
  });

  recalculateEODTotalsFromRows();
  alert(`Successfully parsed and loaded ${loadedCount} transaction records into the EOD portal format! Total amounts and summary counts have been calculated.`);
}

/**
 * Download a Ready-to-Use Blank EOD Excel/CSV Template
 */
function downloadBlankEODTemplate() {
  const headers = ["SNo", "Enrolment_No", "Type", "MBU", "NRI", "Operator_ID", "Resident_Name", "Status", "GST", "Amount"];
  const sampleRows = [
    ["1", `2345/76581/${getTodayString()}`, "U", "No", "No", "S_NX_TS_047", "K. Rajesh", "UPLOADED", "0", "50"],
    ["2", `2345/76582/${getTodayString()}`, "E", "Yes", "No", "S_NX_TS_047", "S. Kavitha", "UPLOADED", "0", "50"],
    ["3", `2345/76583/${getTodayString()}`, "B", "No", "No", "S_NX_TS_047", "M. Venkat", "UPLOADED", "0", "100"]
  ];

  let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";
  sampleRows.forEach(r => {
    csvContent += r.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "ASK_EOD_Transaction_Template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Submit End of Day Report
 */
function handleEODSubmit(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const operatorId = document.getElementById('eodOperatorInput').value.trim();

  if (!operatorId) {
    alert("Please enter the Station Operator ID.");
    return;
  }

  // Harvest Transactions Table
  const tbody = document.getElementById('eodTxTableBody');
  const trs = tbody.querySelectorAll('tr');
  const transactions = [];

  let enrolCount = 0;
  let updateCount = 0;
  let totalAmount = 0;

  trs.forEach((tr, index) => {
    const inputs = tr.querySelectorAll('input, select');
    const type = inputs[1].value;
    const gstVal = parseFloat(inputs[6].value) || 0;
    const amtVal = parseFloat(inputs[7].value) || 0;
    const rowTotal = parseFloat(inputs[8].value) || (gstVal + amtVal);

    if (type === 'E') {
      enrolCount++;
    } else {
      updateCount++;
    }
    totalAmount += rowTotal;

    const rowData = {
      sno: index + 1,
      enrolmentNo: inputs[0].value,
      type: type,
      mandatoryBiometricUpdate: inputs[2].value,
      isNRI: inputs[3].value,
      operatorId: inputs[4].value,
      resident: inputs[5].value,
      status: inputs[6].value,
      gstApplied: gstVal,
      amount: amtVal,
      totalAmount: rowTotal
    };
    transactions.push(rowData);
  });

  const totalVolume = enrolCount + updateCount;

  const submission = {
    submissionId: generateEODId(),
    managerName: user.name,
    center: user.center,
    date: getTodayString(),
    timestamp: new Date().toISOString(),
    reportInfo: {
      registrar: document.getElementById('eodRegistrar').value,
      enrolmentAgency: document.getElementById('eodEnrolmentAgency').value,
      operator: operatorId,
      stationId: document.getElementById('eodStationId').value || 'N/A',
      lastRegistered: document.getElementById('eodLastRegistered').value,
      lastSynch: document.getElementById('eodLastSynch').value,
      clientVersion: document.getElementById('eodClientVersion').value
    },
    summary: {
      enrolments: enrolCount,
      updates: updateCount,
      total: totalVolume,
      totalAmount: totalAmount
    },
    transactions,
    issues: document.getElementById('eodIssues').value.trim() || 'None',
    remarks: document.getElementById('eodRemarks').value.trim() || 'None'
  };

  const allSubs = getSubmissions();
  allSubs.unshift(submission);
  setStoredData(STORAGE_KEYS.EOD_SUBMISSIONS, allSubs);

  // Trigger Supabase Cloud Sync
  if (typeof syncEODSubmissionToSupabase === 'function') {
    syncEODSubmissionToSupabase(submission);
  }

  alert(`EOD Report ${submission.submissionId} submitted successfully for ${user.center}! Total Amount: ₹${totalAmount.toFixed(2)}`);
  showView('mgr-history');
}

function renderManagerHistory() {
  const user = getCurrentUser();
  const mySubs = getManagerSubmissions(user.name);
  const tbody = document.getElementById('mgrHistoryTableBody');

  if (mySubs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No EOD reports submitted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = mySubs.map(s => `
    <tr>
      <td><b style="color:var(--primary);">${s.submissionId}</b></td>
      <td><b>${s.date}</b></td>
      <td><code>${s.reportInfo ? s.reportInfo.stationId : 'N/A'}</code></td>
      <td>${s.summary ? s.summary.enrolments : 0}</td>
      <td>${s.summary ? s.summary.updates : 0}</td>
      <td><b>${s.summary ? s.summary.total : 0}</b></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewEODDetail('${s.submissionId}')">
          View Report
        </button>
      </td>
    </tr>
  `).join('');
}

function viewEODDetail(submissionId) {
  const subs = getSubmissions();
  const report = subs.find(s => s.submissionId === submissionId);
  if (!report) return;

  document.getElementById('eodModalTitle').textContent = `EOD Report: ${report.submissionId} - ${report.center}`;

  let txRowsHtml = '';
  if (report.transactions && report.transactions.length > 0) {
    txRowsHtml = report.transactions.map(t => `
      <tr>
        <td>${t.sno}</td>
        <td><code>${escapeHtml(t.enrolmentNo)}</code></td>
        <td><span class="badge ${t.type === 'E' ? 'badge-primary' : 'badge-purple'}">${t.type}</span></td>
        <td>${t.mandatoryBiometricUpdate || 'No'}</td>
        <td>${t.isNRI || 'No'}</td>
        <td><code>${escapeHtml(t.operatorId || '--')}</code></td>
        <td>${escapeHtml(t.resident || '--')}</td>
        <td><span class="badge ${t.status === 'UPLOADED' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
        <td>₹${(t.gstApplied || 0).toFixed(2)}</td>
        <td>₹${(t.amount || (t.totalAmount ? t.totalAmount - (t.gstApplied||0) : 0)).toFixed(2)}</td>
        <td><b>₹${(t.totalAmount || 0).toFixed(2)}</b></td>
      </tr>
    `).join('');
  } else {
    txRowsHtml = `<tr><td colspan="11" style="text-align:center; color:var(--text-muted);">No individual transaction rows logged.</td></tr>`;
  }

  const computedTotalAmount = report.summary && report.summary.totalAmount ? report.summary.totalAmount : (
    report.transactions ? report.transactions.reduce((acc, t) => acc + Number(t.totalAmount || 0), 0) : ((report.summary.total || 0) * 50)
  );

  document.getElementById('eodModalBody').innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--border); padding-bottom:14px;">
      <div>
        <h2 style="font-size:20px; color:var(--primary-dark); font-weight:800;">${report.center}</h2>
        <p style="color:var(--text-muted); font-size:13px;">Submitted by Manager: <b>${report.managerName}</b> on <b>${report.date}</b></p>
      </div>
      <div style="text-align:right;">
        <span class="badge badge-success" style="font-size:13px; padding:6px 12px;">STATUS: SUBMITTED</span>
        <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">ID: <code>${report.submissionId}</code></div>
      </div>
    </div>

    <!-- Station & Agency Details -->
    <div style="background:#fafbfc; border:1px solid var(--border); border-radius:var(--radius); padding:14px; margin-bottom:20px;">
      <h4 style="font-size:13px; font-weight:700; color:var(--primary-dark); margin-bottom:10px;">Station & System Parameters</h4>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; font-size:12px;">
        <div><b>Registrar:</b> ${report.reportInfo ? report.reportInfo.registrar : '818'}</div>
        <div><b>Agency:</b> ${report.reportInfo ? report.reportInfo.enrolmentAgency : '2081'}</div>
        <div><b>Station ID:</b> ${report.reportInfo ? report.reportInfo.stationId : '40026'}</div>
        <div><b>Operator ID:</b> ${report.reportInfo ? report.reportInfo.operator : 'N/A'}</div>
        <div><b>Client Version:</b> ${report.reportInfo ? report.reportInfo.clientVersion : '3.3.4.2'}</div>
        <div><b>Last Registered:</b> ${report.reportInfo ? report.reportInfo.lastRegistered : 'N/A'}</div>
        <div><b>Last Synch:</b> ${report.reportInfo ? report.reportInfo.lastSynch : 'N/A'}</div>
        <div><b>Submission Time:</b> ${new Date(report.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>

    <!-- Summary Counters -->
    <div class="grid grid-4" style="margin-bottom:20px;">
      <div class="stat-card primary">
        <div class="stat-content">
          <div class="stat-label">Enrolments</div>
          <div class="stat-value">${report.summary ? report.summary.enrolments : 0}</div>
        </div>
      </div>
      <div class="stat-card purple">
        <div class="stat-content">
          <div class="stat-label">Updates</div>
          <div class="stat-value">${report.summary ? report.summary.updates : 0}</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-content">
          <div class="stat-label">Total Volume</div>
          <div class="stat-value">${report.summary ? report.summary.total : 0}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-content">
          <div class="stat-label">Total Collection (₹)</div>
          <div class="stat-value">₹${computedTotalAmount.toLocaleString()}</div>
        </div>
      </div>
    </div>

    <!-- Multi-row Transactions Table -->
    <h4 style="font-size:14px; font-weight:700; color:var(--primary-dark); margin-bottom:10px;">Logged Transactions</h4>
    <div class="table-responsive" style="margin-bottom:20px; max-height:280px;">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Enrolment #</th>
            <th>Type</th>
            <th>MBU</th>
            <th>NRI</th>
            <th>Operator</th>
            <th>Resident Name</th>
            <th>Status</th>
            <th>GST (₹)</th>
            <th>Amount (₹)</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${txRowsHtml}
        </tbody>
      </table>
    </div>

    <!-- Issues & Remarks -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
      <div style="background:#fff; border:1px solid var(--border); border-radius:var(--radius); padding:14px;">
        <h4 style="font-size:13px; font-weight:700; color:var(--danger); margin-bottom:6px;">Issues Encountered</h4>
        <p style="font-size:13px; color:var(--text-main);">${escapeHtml(report.issues || 'None reported')}</p>
      </div>
      <div style="background:#fff; border:1px solid var(--border); border-radius:var(--radius); padding:14px;">
        <h4 style="font-size:13px; font-weight:700; color:var(--primary-dark); margin-bottom:6px;">Manager Remarks</h4>
        <p style="font-size:13px; color:var(--text-main);">${escapeHtml(report.remarks || 'None')}</p>
      </div>
    </div>
  `;

  openModal('eodDetailModal');
}
