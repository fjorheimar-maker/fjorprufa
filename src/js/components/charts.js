/* ============================================
   CHARTS COMPONENT
   ============================================ */

/**
 * Render weekly bar chart
 * @param {string} containerId - Container element ID
 * @param {Array} data - Array of {label, value} objects
 */
function renderWeeklyChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">Engin gögn</div>';
    return;
  }
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  container.innerHTML = data.map(item => {
    const height = (item.value / maxValue) * 120; // max 120px
    return `
      <div class="bar-item">
        <div class="bar-value">${item.value}</div>
        <div class="bar" style="height: ${Math.max(height, 4)}px; background: var(--center-color);"></div>
        <div class="bar-label">${item.label}</div>
      </div>
    `;
  }).join('');
}

/**
 * Render horizontal bar chart (for schools/grades)
 * @param {string} containerId - Container element ID
 * @param {Array} data - Array of {label, value, color} objects
 */
function renderHorizontalChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">Engin gögn</div>';
    return;
  }
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  container.innerHTML = data.map(item => {
    const width = (item.value / maxValue) * 100;
    const color = item.color || 'var(--center-color)';
    return `
      <div class="h-bar-item">
        <div class="h-bar-label">${escapeHtml(item.label)}</div>
        <div class="h-bar-container">
          <div class="h-bar" style="width: ${width}%; background: ${color};"></div>
        </div>
        <div class="h-bar-value">${item.value}</div>
      </div>
    `;
  }).join('');
}

/**
 * Render school distribution chart
 * @param {string} containerId - Container element ID
 * @param {Object} bySchool - Object with school names as keys and counts as values
 */
function renderSchoolChart(containerId, bySchool) {
  const schoolColors = {
    'Akurskóli': '#EAB308',
    'Stapaskóli': '#8B5CF6',
    'Háleitisskóli': '#EC4899',
    'Myllubakkaskóli': '#22c55e',
    'Njarðvíkurskóli': '#3b82f6',
    'Heiðarskóli': '#f97316',
    'Holtaskóli': '#06b6d4'
  };
  
  const data = Object.entries(bySchool)
    .map(([label, value]) => ({
      label,
      value,
      color: schoolColors[label] || 'var(--center-color)'
    }))
    .sort((a, b) => b.value - a.value);
  
  renderHorizontalChart(containerId, data);
}

/**
 * Render grade distribution chart
 * @param {string} containerId - Container element ID
 * @param {Object} byGrade - Object with grade numbers as keys and counts as values
 */
function renderGradeChart(containerId, byGrade) {
  const data = Object.entries(byGrade)
    .map(([grade, value]) => ({
      label: `${grade}. bekkur`,
      value,
      color: 'var(--center-color)'
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  
  renderHorizontalChart(containerId, data);
}

/**
 * Render comparison chart (for admin - comparing centers)
 * @param {string} containerId - Container element ID
 * @param {Array} centers - Array of center data
 */
function renderCenterComparisonChart(containerId, centers) {
  const centerColors = {
    'HAFNOFELO': '#8B5CF6',
    'STAPAFELO': '#8B5CF6',
    'AKURFELO': '#EAB308',
    'HAALEITIFELO': '#EC4899'
  };
  
  const centerNames = {
    'HAFNOFELO': 'Hafnó',
    'STAPAFELO': 'Stapa',
    'AKURFELO': 'Akur',
    'HAALEITIFELO': 'Háaleiti'
  };
  
  const data = centers.map(c => ({
    label: centerNames[c.center_id] || c.center_id,
    value: c.count || 0,
    color: centerColors[c.center_id] || 'var(--center-color)'
  }));
  
  renderHorizontalChart(containerId, data);
}

/**
 * Render trend line (simple text-based)
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} HTML string for trend indicator
 */
function renderTrend(current, previous) {
  if (previous === 0) return '';
  
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  const arrow = isPositive ? '↑' : '↓';
  const className = isPositive ? 'positive' : 'negative';
  
  return `<span class="stat-change ${className}">${arrow} ${Math.abs(change).toFixed(0)}%</span>`;
}

/**
 * Update stat card with value and trend
 * @param {string} valueId - Value element ID
 * @param {string} changeId - Change element ID (optional)
 * @param {number} value - Current value
 * @param {number} previousValue - Previous value (optional)
 */
function updateStatCard(valueId, changeId, value, previousValue = null) {
  const valueEl = document.getElementById(valueId);
  if (valueEl) {
    valueEl.textContent = value;
  }
  
  if (changeId && previousValue !== null) {
    const changeEl = document.getElementById(changeId);
    if (changeEl) {
      changeEl.innerHTML = renderTrend(value, previousValue);
    }
  }
}
