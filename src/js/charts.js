/**
 * ASK EOD Manager - Interactive Analytics, Bar Charts & HOD Intelligence Module
 */

let chartInstances = {};

function destroyChart(chartId) {
  if (chartInstances[chartId]) {
    chartInstances[chartId].destroy();
    delete chartInstances[chartId];
  }
}

/**
 * Get date range records for analytics
 */
function getLastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Render Manager Charts (Daily Volume & Daily Amount)
 */
function renderManagerCharts() {
  const user = getCurrentUser();
  if (!user || user.role !== 'manager') return;

  const mySubs = getManagerSubmissions(user.name);
  const last7Days = getLastNDays(7);

  const dateLabels = last7Days.map(d => {
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}`;
  });

  const enrolData = [];
  const updateData = [];
  const amountData = [];

  last7Days.forEach(dateStr => {
    const sub = mySubs.find(s => s.date === dateStr);
    if (sub) {
      enrolData.push(sub.summary ? Number(sub.summary.enrolments || 0) : 0);
      updateData.push(sub.summary ? Number(sub.summary.updates || 0) : 0);

      let dayAmt = 0;
      if (sub.summary && sub.summary.totalAmount) {
        dayAmt = Number(sub.summary.totalAmount);
      } else if (sub.transactions && sub.transactions.length > 0) {
        dayAmt = sub.transactions.reduce((acc, tx) => acc + Number(tx.totalAmount || 0), 0);
      } else if (sub.summary) {
        dayAmt = (Number(sub.summary.enrolments || 0) * 50) + (Number(sub.summary.updates || 0) * 50);
      }
      amountData.push(dayAmt);
    } else {
      enrolData.push(0);
      updateData.push(0);
      amountData.push(0);
    }
  });

  // 1. Manager Volume Chart (Enrolments vs Updates)
  const ctxVol = document.getElementById('mgrDailyVolumeChart');
  if (ctxVol && typeof Chart !== 'undefined') {
    destroyChart('mgrDailyVolumeChart');
    chartInstances['mgrDailyVolumeChart'] = new Chart(ctxVol, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'New Enrolments',
            data: enrolData,
            backgroundColor: '#2e86c1',
            borderRadius: 6
          },
          {
            label: 'Updates',
            data: updateData,
            backgroundColor: '#8e44ad',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { stacked: false, grid: { display: false } },
          y: { beginAtZero: true, ticks: { stepSize: 5 } }
        }
      }
    });
  }

  // 2. Manager Daily Amount / Revenue Chart
  const ctxAmt = document.getElementById('mgrDailyAmountChart');
  if (ctxAmt && typeof Chart !== 'undefined') {
    destroyChart('mgrDailyAmountChart');
    chartInstances['mgrDailyAmountChart'] = new Chart(ctxAmt, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Daily Collection Total (₹)',
            data: amountData,
            backgroundColor: '#27ae60',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => ` Total: ₹${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value
            }
          }
        }
      }
    });
  }
}

/**
 * Render Admin Charts on Dashboard Overview
 */
function renderAdminAnalyticsCharts() {
  const allSubs = getSubmissions();
  const last7Days = getLastNDays(7);

  const dateLabels = last7Days.map(d => {
    const parts = d.split('-');
    return `${parts[2]}/${parts[1]}`;
  });

  const dailyEnrolments = [];
  const dailyUpdates = [];
  const dailyTotalAmount = [];

  last7Days.forEach(dateStr => {
    const daySubs = allSubs.filter(s => s.date === dateStr);
    let eCount = 0;
    let uCount = 0;
    let amt = 0;

    daySubs.forEach(s => {
      eCount += s.summary ? Number(s.summary.enrolments || 0) : 0;
      uCount += s.summary ? Number(s.summary.updates || 0) : 0;
      if (s.summary && s.summary.totalAmount) {
        amt += Number(s.summary.totalAmount);
      } else if (s.transactions && s.transactions.length > 0) {
        amt += s.transactions.reduce((acc, tx) => acc + Number(tx.totalAmount || 0), 0);
      } else if (s.summary) {
        amt += (Number(s.summary.enrolments || 0) * 50) + (Number(s.summary.updates || 0) * 50);
      }
    });

    dailyEnrolments.push(eCount);
    dailyUpdates.push(uCount);
    dailyTotalAmount.push(amt);
  });

  // 1. Admin Daily Enrolments vs Updates Chart
  const ctxAdminDaily = document.getElementById('adminDailyVolumeChart');
  if (ctxAdminDaily && typeof Chart !== 'undefined') {
    destroyChart('adminDailyVolumeChart');
    chartInstances['adminDailyVolumeChart'] = new Chart(ctxAdminDaily, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'All Centers Enrolments',
            data: dailyEnrolments,
            backgroundColor: '#2e86c1',
            borderRadius: 6
          },
          {
            label: 'All Centers Updates',
            data: dailyUpdates,
            backgroundColor: '#8e44ad',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  // 2. Admin Daily Collection Amount Chart
  const ctxAdminAmt = document.getElementById('adminDailyAmountChart');
  if (ctxAdminAmt && typeof Chart !== 'undefined') {
    destroyChart('adminDailyAmountChart');
    chartInstances['adminDailyAmountChart'] = new Chart(ctxAdminAmt, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Total Daily Collections (₹)',
            data: dailyTotalAmount,
            backgroundColor: '#27ae60',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => ` Total Collections: ₹${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value
            }
          }
        }
      }
    });
  }

  // 3. Center-wise Comparison Chart (Monthly check)
  const ctxCenterComp = document.getElementById('adminCenterComparisonChart');
  if (ctxCenterComp && typeof Chart !== 'undefined') {
    destroyChart('adminCenterComparisonChart');
    const centerNames = FIXED_MANAGERS.map(m => m.center);
    const centerEnrols = [];
    const centerUpdates = [];

    FIXED_MANAGERS.forEach(m => {
      const stats = calculateCenterStats(m.center);
      centerEnrols.push(stats.totalEnrolments);
      centerUpdates.push(stats.totalUpdates);
    });

    chartInstances['adminCenterComparisonChart'] = new Chart(ctxCenterComp, {
      type: 'bar',
      data: {
        labels: centerNames,
        datasets: [
          {
            label: 'Total Enrolments',
            data: centerEnrols,
            backgroundColor: '#2e86c1',
            borderRadius: 6
          },
          {
            label: 'Total Updates',
            data: centerUpdates,
            backgroundColor: '#8e44ad',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }
}

/**
 * ============================================================================
 * HOD DEDICATED EXECUTIVE ANALYTICS CONTROLLER
 * ============================================================================
 */
function renderHODAnalyticsDashboard() {
  const allSubs = getSubmissions();
  const allOps = getOperators();

  const timeFilter = document.getElementById('hodTimeFilter') ? document.getElementById('hodTimeFilter').value : '7days';
  const centerFilter = document.getElementById('hodCenterFilter') ? document.getElementById('hodCenterFilter').value : 'ALL';
  const customDate = document.getElementById('hodDateFilter') ? document.getElementById('hodDateFilter').value : '';

  // Determine date array
  let dateList = [];
  const todayStr = getTodayString();

  if (customDate) {
    dateList = [customDate];
  } else if (timeFilter === 'today') {
    dateList = [todayStr];
  } else if (timeFilter === '7days') {
    dateList = getLastNDays(7);
  } else if (timeFilter === '30days') {
    dateList = getLastNDays(30);
  } else {
    // All time (collect unique dates from submissions)
    const uniqueDates = Array.from(new Set(allSubs.map(s => s.date))).sort();
    dateList = uniqueDates.length > 0 ? uniqueDates : getLastNDays(7);
  }

  // Filter submissions by dateList and centerFilter
  const filteredSubs = allSubs.filter(s => {
    const matchDate = dateList.includes(s.date);
    const matchCenter = centerFilter === 'ALL' || s.center === centerFilter;
    return matchDate && matchCenter;
  });

  // 1. Calculate Executive KPI Figures
  let totalIncome = 0;
  let totalEnrolments = 0;
  let totalUpdates = 0;

  filteredSubs.forEach(s => {
    totalEnrolments += s.summary ? Number(s.summary.enrolments || 0) : 0;
    totalUpdates += s.summary ? Number(s.summary.updates || 0) : 0;

    let amt = 0;
    if (s.summary && s.summary.totalAmount) {
      amt = Number(s.summary.totalAmount);
    } else if (s.transactions && s.transactions.length > 0) {
      amt = s.transactions.reduce((acc, tx) => acc + Number(tx.totalAmount || 0), 0);
    } else if (s.summary) {
      amt = (Number(s.summary.enrolments || 0) * 50) + (Number(s.summary.updates || 0) * 50);
    }
    totalIncome += amt;
  });

  const totalVolume = totalEnrolments + totalUpdates;

  // Filter Operators
  const filteredOps = centerFilter === 'ALL' ? allOps : allOps.filter(o => o.center === centerFilter);
  const activeOpsCount = filteredOps.length;
  const certifiedOpsCount = filteredOps.filter(o => o.certification === 'Certified').length;

  // Update KPI Cards
  const kpiIncome = document.getElementById('hodKpiIncome');
  const kpiOps = document.getElementById('hodKpiOperators');
  const kpiVolume = document.getElementById('hodKpiVolume');
  const kpiAvg = document.getElementById('hodKpiAvgRevenue');

  if (kpiIncome) kpiIncome.textContent = '₹' + totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (kpiOps) kpiOps.textContent = activeOpsCount;
  if (kpiVolume) kpiVolume.textContent = totalVolume;

  const activeCentersCount = centerFilter === 'ALL' ? FIXED_MANAGERS.length : 1;
  const avgIncome = totalIncome / (activeCentersCount || 1);
  if (kpiAvg) kpiAvg.textContent = '₹' + avgIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const kpiSubtextOps = document.getElementById('hodKpiOpsSubtext');
  if (kpiSubtextOps) kpiSubtextOps.textContent = `${certifiedOpsCount} Certified • ${activeOpsCount - certifiedOpsCount} In-Training`;

  const kpiSubtextVol = document.getElementById('hodKpiVolSubtext');
  if (kpiSubtextVol) kpiSubtextVol.textContent = `${totalEnrolments} Enrol • ${totalUpdates} Updates`;

  // 2. Render Charts for HOD
  renderHODCharts(dateList, filteredSubs, allOps, centerFilter);

  // 3. Render Table
  renderHODIncomeTable(filteredSubs, allOps);
}

/**
 * Render 4 Specialized HOD Intelligence Charts
 */
function renderHODCharts(dateList, subs, allOps, selectedCenter) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Daily Income Trend (₹)
  const ctxIncome = document.getElementById('hodIncomeTrendChart');
  if (ctxIncome) {
    destroyChart('hodIncomeTrendChart');

    const dateLabels = dateList.map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`;
    });

    const incomePerDay = dateList.map(dateStr => {
      const daySubs = subs.filter(s => s.date === dateStr);
      return daySubs.reduce((acc, s) => {
        let amt = 0;
        if (s.summary && s.summary.totalAmount) {
          amt = Number(s.summary.totalAmount);
        } else if (s.transactions && s.transactions.length > 0) {
          amt = s.transactions.reduce((tAcc, tx) => tAcc + Number(tx.totalAmount || 0), 0);
        } else if (s.summary) {
          amt = (Number(s.summary.enrolments || 0) * 50) + (Number(s.summary.updates || 0) * 50);
        }
        return acc + amt;
      }, 0);
    });

    chartInstances['hodIncomeTrendChart'] = new Chart(ctxIncome, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Daily Revenue from EOD (₹)',
            data: incomePerDay,
            backgroundColor: '#27ae60',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => ` Total Income: ₹${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value
            }
          }
        }
      }
    });
  }

  // Chart 2: Operator Distribution & Capacity by Center
  const ctxOps = document.getElementById('hodOperatorCenterChart');
  if (ctxOps) {
    destroyChart('hodOperatorCenterChart');

    const centers = selectedCenter === 'ALL' ? FIXED_MANAGERS.map(m => m.center) : [selectedCenter];
    const certifiedCounts = [];
    const trainingCounts = [];

    centers.forEach(c => {
      const targetCenter = c.trim().toLowerCase();
      const cOps = allOps.filter(o => {
        const oCenter = (o.center || '').trim().toLowerCase();
        return oCenter === targetCenter || (targetCenter.startsWith('gadwa') && oCenter.startsWith('gadwa'));
      });
      certifiedCounts.push(cOps.filter(o => o.certification === 'Certified').length);
      trainingCounts.push(cOps.filter(o => o.certification !== 'Certified').length);
    });

    chartInstances['hodOperatorCenterChart'] = new Chart(ctxOps, {
      type: 'bar',
      data: {
        labels: centers,
        datasets: [
          {
            label: 'Certified Operators',
            data: certifiedCounts,
            backgroundColor: '#2e86c1',
            borderRadius: 6
          },
          {
            label: 'In-Training / Other',
            data: trainingCounts,
            backgroundColor: '#f39c12',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // Chart 3: Center-wise Income Share
  const ctxCenterIncome = document.getElementById('hodCenterIncomeChart');
  if (ctxCenterIncome) {
    destroyChart('hodCenterIncomeChart');

    const centers = selectedCenter === 'ALL' ? FIXED_MANAGERS.map(m => m.center) : [selectedCenter];
    const centerIncomes = centers.map(c => {
      const targetCenter = c.trim().toLowerCase();
      const cSubs = subs.filter(s => {
        const sCenter = (s.center || '').trim().toLowerCase();
        return sCenter === targetCenter || (targetCenter.startsWith('gadwa') && sCenter.startsWith('gadwa'));
      });

      return cSubs.reduce((acc, s) => {
        let amt = 0;
        if (s.summary && s.summary.totalAmount) {
          amt = Number(s.summary.totalAmount);
        } else if (s.transactions && s.transactions.length > 0) {
          amt = s.transactions.reduce((tAcc, tx) => tAcc + Number(tx.totalAmount || 0), 0);
        } else if (s.summary) {
          amt = (Number(s.summary.enrolments || 0) * 50) + (Number(s.summary.updates || 0) * 50);
        }
        return acc + amt;
      }, 0);
    });

    chartInstances['hodCenterIncomeChart'] = new Chart(ctxCenterIncome, {
      type: 'bar',
      data: {
        labels: centers,
        datasets: [
          {
            label: 'Total Collections (₹)',
            data: centerIncomes,
            backgroundColor: '#16a085',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) => ` Center Revenue: ₹${context.raw.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + Number(value).toLocaleString()
            }
          }
        }
      }
    });
  }

  // Chart 4: Daily Enrolments vs Updates Mix
  const ctxMix = document.getElementById('hodVolumeMixChart');
  if (ctxMix) {
    destroyChart('hodVolumeMixChart');

    const dateLabels = dateList.map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`;
    });

    const eCounts = dateList.map(d => {
      const dSubs = subs.filter(s => s.date === d);
      return dSubs.reduce((acc, s) => acc + (s.summary ? Number(s.summary.enrolments || 0) : 0), 0);
    });

    const uCounts = dateList.map(d => {
      const dSubs = subs.filter(s => s.date === d);
      return dSubs.reduce((acc, s) => acc + (s.summary ? Number(s.summary.updates || 0) : 0), 0);
    });

    chartInstances['hodVolumeMixChart'] = new Chart(ctxMix, {
      type: 'bar',
      data: {
        labels: dateLabels,
        datasets: [
          {
            label: 'Enrolments',
            data: eCounts,
            backgroundColor: '#2980b9',
            borderRadius: 6
          },
          {
            label: 'Updates',
            data: uCounts,
            backgroundColor: '#8e44ad',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true }
        }
      }
    });
  }
}

/**
 * Render Daily Income & Operator Ledger Table for HOD
 */
function renderHODIncomeTable(subs, allOps) {
  const tbody = document.getElementById('hodIncomeTableBody');
  if (!tbody) return;

  if (subs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-muted);">No EOD submissions match the selected date & center filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = subs.map(s => {
    const centerOps = allOps.filter(o => o.center === s.center);
    const enrol = s.summary ? Number(s.summary.enrolments || 0) : 0;
    const update = s.summary ? Number(s.summary.updates || 0) : 0;
    const vol = s.summary ? Number(s.summary.total || 0) : (enrol + update);

    let amt = 0;
    if (s.summary && s.summary.totalAmount) {
      amt = Number(s.summary.totalAmount);
    } else if (s.transactions && s.transactions.length > 0) {
      amt = s.transactions.reduce((acc, tx) => acc + Number(tx.totalAmount || 0), 0);
    } else {
      amt = (enrol * 50) + (update * 50);
    }

    return `
      <tr>
        <td><b>${s.date}</b></td>
        <td><b>${s.center}</b></td>
        <td>${s.managerName}</td>
        <td><code>${s.reportInfo ? (s.reportInfo.operator || 'N/A') : 'N/A'}</code> (${centerOps.length} Active in Center)</td>
        <td>${enrol}</td>
        <td>${update}</td>
        <td><b>${vol}</b></td>
        <td><b style="color:var(--success); font-size:14px;">₹${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="viewEODDetail('${s.submissionId}')">
            Inspect EOD
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
