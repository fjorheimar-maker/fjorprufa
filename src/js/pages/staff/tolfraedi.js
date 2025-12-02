/* ============================================
   TOLFRAEDI - Statistics functionality
   ============================================ */

/**
 * Load statistics
 */
async function loadStatistics() {
  try {
    const data = await fetchStatistics(centerId);
    
    if (!data) return;
    
    // Update stat cards
    const statDay = document.getElementById('statDay');
    const statWeek = document.getElementById('statWeek');
    const statMonth = document.getElementById('statMonth');
    
    if (statDay) statDay.textContent = data.today || 0;
    if (statWeek) statWeek.textContent = data.thisWeek || 0;
    if (statMonth) statMonth.textContent = data.thisMonth || 0;
    
    // Update change indicators
    if (data.changes) {
      updateChangeIndicator('statDayChange', data.changes.day);
      updateChangeIndicator('statWeekChange', data.changes.week);
      updateChangeIndicator('statMonthChange', data.changes.month);
    }
    
    // Render charts
    if (data.weeklyData) {
      renderWeeklyChart(data.weeklyData);
    }
    
    if (data.bySchool) {
      renderSchoolChart(data.bySchool);
    }
    
    if (data.byGrade) {
      renderGradeChart(data.byGrade);
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Update change indicator
 * @param {string} elementId 
 * @param {number} change 
 */
function updateChangeIndicator(elementId, change) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  if (change > 0) {
    el.textContent = `↑ ${change}%`;
    el.className = 'stat-change positive';
  } else if (change < 0) {
    el.textContent = `↓ ${Math.abs(change)}%`;
    el.className = 'stat-change negative';
  } else {
    el.textContent = '';
  }
}

/**
 * Render weekly bar chart
 * @param {Array} data 
 */
function renderWeeklyChart(data) {
  const container = document.getElementById('weeklyChart');
  if (!container || !data.length) return;
  
  const maxValue = Math.max(...data.map(d => d.count));
  
  container.innerHTML = data.map(item => {
    const height = maxValue > 0 ? (item.count / maxValue) * 120 : 0;
    return `
      <div class="bar-item">
        <div class="bar" style="height: ${height}px;"></div>
        <div class="bar-label">${item.label}</div>
        <div class="bar-value">${item.count}</div>
      </div>
    `;
  }).join('');
}

/**
 * Render school horizontal bar chart
 * @param {Object} data 
 */
function renderSchoolChart(data) {
  const container = document.getElementById('schoolChart');
  if (!container) return;
  
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const maxValue = entries.length > 0 ? entries[0][1] : 0;
  
  container.innerHTML = entries.map(([school, count]) => {
    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
    return `
      <div class="h-bar-item">
        <div class="h-bar-label">${escapeHtml(school)}</div>
        <div class="h-bar-container">
          <div class="h-bar" style="width: ${width}%; background: var(--center-color);"></div>
        </div>
        <div class="h-bar-value">${count}</div>
      </div>
    `;
  }).join('');
}

/**
 * Render grade horizontal bar chart
 * @param {Object} data 
 */
function renderGradeChart(data) {
  const container = document.getElementById('gradeChart');
  if (!container) return;
  
  const entries = Object.entries(data).sort((a, b) => a[0] - b[0]);
  const maxValue = Math.max(...entries.map(e => e[1]));
  
  container.innerHTML = entries.map(([grade, count]) => {
    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
    return `
      <div class="h-bar-item">
        <div class="h-bar-label">${grade}. bekkur</div>
        <div class="h-bar-container">
          <div class="h-bar" style="width: ${width}%; background: var(--center-color);"></div>
        </div>
        <div class="h-bar-value">${count}</div>
      </div>
    `;
  }).join('');
}
