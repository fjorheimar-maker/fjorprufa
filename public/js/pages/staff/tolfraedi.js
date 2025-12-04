/* ============================================
   TOLFRAEDI - Statistics functionality
   Based on openings, not calendar days
   ============================================ */

/**
 * Load statistics based on openings
 */
async function loadStatistics() {
  try {
    // Fetch calendar data from September to current month
    const openings = await fetchAllOpenings(centerId);
    
    if (!openings || openings.length === 0) {
      console.log('Engar opnanir fundust');
      return;
    }
    
    // Calculate opening-based statistics
    calculateOpeningStats(openings);
    
    // Render line chart with all openings
    renderOpeningsLineChart(openings);
    
    // Fetch and render school/grade data (totals, not just month)
    const statsData = await fetchStatistics(centerId);
    if (statsData) {
      if (statsData.bySchool) {
        // Use total data, not _month
        const schoolData = statsData.bySchool._month || statsData.bySchool;
        renderSchoolChart(schoolData);
      }
      
      if (statsData.byGrade) {
        // Use total data, not _month
        const gradeData = statsData.byGrade._month || statsData.byGrade;
        renderGradeChart(gradeData);
      }
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Fetch all openings from September to current month for a center
 * @param {string} cid - Center ID
 * @returns {Array} - Array of openings [{date, count}, ...]
 */
async function fetchAllOpenings(cid) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // School year starts in September
  const startYear = currentMonth >= 9 ? currentYear : currentYear - 1;
  const startMonth = 9; // September
  
  const allOpenings = [];
  
  // Fetch each month from September to current
  let year = startYear;
  let month = startMonth;
  
  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    try {
      const data = await apiGet('calendarMonth', { year, month });
      
      if (data && data.calendar) {
        // Filter to get openings for this center
        data.calendar.forEach(day => {
          const centerData = day.centers?.[cid];
          if (centerData && centerData.count > 0) {
            // Only include dates in the past or today
            const dayDate = new Date(day.date);
            if (dayDate <= now) {
              allOpenings.push({
                date: day.date,
                count: centerData.count,
                weekdayName: day.weekdayName
              });
            }
          }
        });
      }
    } catch (err) {
      console.error(`Villa við að sækja mánuð ${month}/${year}:`, err);
    }
    
    // Move to next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  
  // Sort by date ascending
  allOpenings.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return allOpenings;
}

/**
 * Calculate and display opening-based statistics
 * @param {Array} openings - All openings
 */
function calculateOpeningStats(openings) {
  const total = openings.length;
  
  // Last opening (current/most recent)
  const lastOpening = openings[total - 1];
  const prevOpening = openings[total - 2];
  
  // Last 5 openings
  const last5 = openings.slice(-5);
  const prev5 = openings.slice(-10, -5);
  
  // Last 10 openings
  const last10 = openings.slice(-10);
  const prev10 = openings.slice(-20, -10);
  
  // Calculate sums
  const last5Sum = last5.reduce((sum, o) => sum + o.count, 0);
  const prev5Sum = prev5.reduce((sum, o) => sum + o.count, 0);
  const last10Sum = last10.reduce((sum, o) => sum + o.count, 0);
  const prev10Sum = prev10.reduce((sum, o) => sum + o.count, 0);
  
  // Update stat cards
  const statDay = document.getElementById('statDay');
  const statWeek = document.getElementById('statWeek');
  const statMonth = document.getElementById('statMonth');
  
  // Update labels
  const statDayLabel = document.querySelector('#statDay')?.parentElement?.querySelector('.stat-label');
  const statWeekLabel = document.querySelector('#statWeek')?.parentElement?.querySelector('.stat-label');
  const statMonthLabel = document.querySelector('#statMonth')?.parentElement?.querySelector('.stat-label');
  
  if (statDayLabel) statDayLabel.textContent = 'Síðasta opnun';
  if (statWeekLabel) statWeekLabel.textContent = 'Síðustu 5 opnanir';
  if (statMonthLabel) statMonthLabel.textContent = 'Síðustu 10 opnanir';
  
  // Set values
  if (statDay) statDay.textContent = lastOpening?.count || 0;
  if (statWeek) statWeek.textContent = last5Sum;
  if (statMonth) statMonth.textContent = last10Sum;
  
  // Calculate changes
  const dayChange = prevOpening ? (lastOpening?.count || 0) - prevOpening.count : 0;
  const weekChange = prev5.length > 0 ? last5Sum - prev5Sum : 0;
  const monthChange = prev10.length > 0 ? last10Sum - prev10Sum : 0;
  
  // Update change indicators
  updateChangeIndicator('statDayChange', dayChange);
  updateChangeIndicator('statWeekChange', weekChange);
  updateChangeIndicator('statMonthChange', monthChange);
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
    el.textContent = `↑ ${change}`;
    el.className = 'stat-change positive';
  } else if (change < 0) {
    el.textContent = `↓ ${Math.abs(change)}`;
    el.className = 'stat-change negative';
  } else {
    el.textContent = '—';
    el.className = 'stat-change';
  }
}

/**
 * Render line chart showing all openings
 * @param {Array} openings 
 */
function renderOpeningsLineChart(openings) {
  const container = document.getElementById('weeklyChart');
  if (!container) return;
  
  if (openings.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Engar opnanir</p>';
    return;
  }
  
  const maxValue = Math.max(...openings.map(o => o.count));
  const chartHeight = 150;
  const chartWidth = Math.max(openings.length * 40, container.clientWidth || 600);
  
  // Create SVG line chart
  const points = openings.map((o, i) => {
    const x = (i / (openings.length - 1 || 1)) * (chartWidth - 60) + 30;
    const y = chartHeight - 30 - ((o.count / maxValue) * (chartHeight - 50));
    return { x, y, ...o };
  });
  
  // Create path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Create area fill
  const areaD = pathD + ` L ${points[points.length - 1].x} ${chartHeight - 30} L ${points[0].x} ${chartHeight - 30} Z`;
  
  container.innerHTML = `
    <div class="line-chart-container" style="overflow-x: auto;">
      <svg width="${chartWidth}" height="${chartHeight}" class="line-chart">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = chartHeight - 30 - (pct * (chartHeight - 50));
          const val = Math.round(maxValue * pct);
          return `
            <line x1="30" y1="${y}" x2="${chartWidth - 10}" y2="${y}" stroke="var(--color-border)" stroke-dasharray="2,2" opacity="0.3"/>
            <text x="5" y="${y + 4}" fill="var(--color-text-muted)" font-size="10">${val}</text>
          `;
        }).join('')}
        
        <!-- Area fill -->
        <path d="${areaD}" fill="var(--center-color)" opacity="0.2"/>
        
        <!-- Line -->
        <path d="${pathD}" fill="none" stroke="var(--center-color)" stroke-width="2"/>
        
        <!-- Data points -->
        ${points.map((p, i) => `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--center-color)" class="chart-point" data-index="${i}"/>
          <title>${formatShortDate(p.date)}: ${p.count} mætingar</title>
        `).join('')}
        
        <!-- X-axis labels (show every nth) -->
        ${points.filter((p, i) => i % Math.ceil(points.length / 10) === 0 || i === points.length - 1).map(p => `
          <text x="${p.x}" y="${chartHeight - 10}" fill="var(--color-text-muted)" font-size="9" text-anchor="middle">${formatShortDate(p.date)}</text>
        `).join('')}
      </svg>
    </div>
    <p style="color: var(--color-text-muted); font-size: 0.8rem; text-align: center; margin-top: 8px;">
      ${openings.length} opnanir frá upphafi skólaárs
    </p>
  `;
}

/**
 * Format date as short string (d. mmm)
 * @param {string} dateStr 
 * @returns {string}
 */
function formatShortDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ágú', 'sep', 'okt', 'nóv', 'des'];
  return `${date.getDate()}. ${months[date.getMonth()]}`;
}

/**
 * Render school horizontal bar chart
 * @param {Object} data 
 */
function renderSchoolChart(data) {
  const container = document.getElementById('schoolChart');
  if (!container) return;
  
  const entries = Object.entries(data)
    .filter(([key]) => !key.startsWith('_'))
    .sort((a, b) => b[1] - a[1]);
  
  if (entries.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Engin gögn</p>';
    return;
  }
  
  const maxValue = entries[0][1];
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  
  container.innerHTML = entries.map(([school, count]) => {
    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div class="h-bar-item">
        <div class="h-bar-label">${escapeHtml(school)}</div>
        <div class="h-bar-container">
          <div class="h-bar" style="width: ${width}%; background: var(--center-color);"></div>
        </div>
        <div class="h-bar-value">${count} <span style="color: var(--color-text-muted); font-size: 0.8em;">(${pct}%)</span></div>
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
  
  const entries = Object.entries(data)
    .filter(([key]) => !key.startsWith('_'))
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  
  if (entries.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center;">Engin gögn</p>';
    return;
  }
  
  const maxValue = Math.max(...entries.map(e => e[1]));
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  
  container.innerHTML = entries.map(([grade, count]) => {
    const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div class="h-bar-item">
        <div class="h-bar-label">${grade}. bekkur</div>
        <div class="h-bar-container">
          <div class="h-bar" style="width: ${width}%; background: var(--center-color);"></div>
        </div>
        <div class="h-bar-value">${count} <span style="color: var(--color-text-muted); font-size: 0.8em;">(${pct}%)</span></div>
      </div>
    `;
  }).join('');
}
