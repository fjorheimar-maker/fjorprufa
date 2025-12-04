/* ============================================
   ADMIN TÖLFRÆÐI
   Statistics for all centers
   ============================================ */

/**
 * Load admin statistics
 */
async function loadAdminStatistics() {
  const period = document.getElementById('adminStatsPeriod')?.value || 'month';
  const centerId = document.getElementById('adminStatsCenter')?.value || '';
  
  try {
    const params = { period };
    if (centerId) params.center_id = centerId;
    
    const result = await apiGet('adminStatistics', params);
    
    if (result.status === 'success') {
      renderAdminStats(result.data);
    }
  } catch (err) {
    console.error('Villa við að sækja tölfræði:', err);
  }
}

/**
 * Render admin statistics
 */
function renderAdminStats(data) {
  // Update stat cards
  updateStatCard('adminTotalAttendance', null, data.totalAttendance || 0);
  updateStatCard('adminUniqueStudents', null, data.uniqueStudents || 0);
  updateStatCard('adminAvgDaily', null, data.avgDaily?.toFixed(1) || 0);
  
  // School chart
  if (data.bySchool) {
    renderSchoolChart('adminSchoolChart', data.bySchool);
  }
  
  // Grade chart
  if (data.byGrade) {
    renderGradeChart('adminGradeChart', data.byGrade);
  }
  
  // Weekday chart
  if (data.byWeekday) {
    renderWeekdayChart('adminWeekdayChart', data.byWeekday);
  }
}

/**
 * Render weekday chart
 */
function renderWeekdayChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const weekdays = ['Mán', 'Þri', 'Mið', 'Fim', 'Fös'];
  const weekdayMap = {
    'Mánudagur': 'Mán',
    'Þriðjudagur': 'Þri',
    'Miðvikudagur': 'Mið',
    'Fimmtudagur': 'Fim',
    'Föstudagur': 'Fös'
  };
  
  const chartData = weekdays.map(day => {
    const fullDay = Object.keys(weekdayMap).find(k => weekdayMap[k] === day);
    return {
      label: day,
      value: data[fullDay] || 0
    };
  });
  
  renderWeeklyChart(containerId, chartData);
}

/**
 * Load comparison between centers
 */
async function loadCenterComparison() {
  try {
    const result = await apiGet('centerComparison');
    
    if (result.status === 'success' && result.centers) {
      renderCenterComparisonChart('adminCenterChart', result.centers);
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Load retention statistics
 */
async function loadRetentionStats() {
  try {
    const result = await apiGet('retentionStats');
    
    if (result.status === 'success') {
      renderRetentionStats(result.data);
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Render retention statistics
 */
function renderRetentionStats(data) {
  const container = document.getElementById('adminRetentionStats');
  if (!container) return;
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.weeklyRetention || 0}%</div>
        <div class="stat-label">Vikuleg retention</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.monthlyRetention || 0}%</div>
        <div class="stat-label">Mánaðarleg retention</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.churnRate || 0}%</div>
        <div class="stat-label">Churn rate</div>
      </div>
    </div>
  `;
}

/**
 * Load market penetration stats
 */
async function loadMarketPenetration() {
  try {
    const result = await apiGet('marketPenetration');
    
    if (result.status === 'success') {
      renderMarketPenetration(result.data);
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Render market penetration by school
 */
function renderMarketPenetration(data) {
  const container = document.getElementById('adminMarketPenetration');
  if (!container || !data.bySchool) return;
  
  const schools = Object.entries(data.bySchool).map(([school, stats]) => ({
    label: school,
    value: stats.penetration || 0,
    color: getSchoolColor(school)
  }));
  
  container.innerHTML = schools.map(s => `
    <div class="h-bar-item">
      <div class="h-bar-label">${escapeHtml(s.label)}</div>
      <div class="h-bar-container">
        <div class="h-bar" style="width: ${s.value}%; background: ${s.color};"></div>
      </div>
      <div class="h-bar-value">${s.value}%</div>
    </div>
  `).join('');
}

/**
 * Get school color
 */
function getSchoolColor(school) {
  const colors = {
    'Akurskóli': '#EAB308',
    'Stapaskóli': '#8B5CF6',
    'Háleitisskóli': '#EC4899',
    'Myllubakkaskóli': '#22c55e',
    'Njarðvíkurskóli': '#3b82f6',
    'Heiðarskóli': '#f97316',
    'Holtaskóli': '#06b6d4'
  };
  return colors[school] || '#8B5CF6';
}

/**
 * Export admin statistics
 */
function exportAdminStats() {
  const period = document.getElementById('adminStatsPeriod')?.value || 'month';
  
  // Trigger download
  window.open(`${WEB_APP_URL}?action=exportStats&period=${period}`, '_blank');
}
