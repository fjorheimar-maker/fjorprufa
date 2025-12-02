/* ============================================
   ADMIN YFIRLIT - Overview dashboard
   ============================================ */

/**
 * Load admin overview data
 */
async function loadAdminOverview() {
  try {
    // Fetch overall statistics
    const stats = await apiGet('adminStats');
    
    if (stats.status === 'success') {
      renderOverviewCards(stats.data);
      renderCenterComparison(stats.centers);
    }
  } catch (err) {
    console.error('Villa við að sækja yfirlit:', err);
  }
}

/**
 * Render overview stat cards
 */
function renderOverviewCards(data) {
  const grid = document.getElementById('overviewGrid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="overview-card" style="--card-accent: #22c55e;">
      <div class="overview-card-icon">👥</div>
      <div class="overview-card-value">${data.totalStudents || 0}</div>
      <div class="overview-card-label">Nemendur samtals</div>
    </div>
    <div class="overview-card" style="--card-accent: #3b82f6;">
      <div class="overview-card-icon">📋</div>
      <div class="overview-card-value">${data.todayAttendance || 0}</div>
      <div class="overview-card-label">Mæting í dag</div>
    </div>
    <div class="overview-card" style="--card-accent: #8B5CF6;">
      <div class="overview-card-icon">📊</div>
      <div class="overview-card-value">${data.weekAttendance || 0}</div>
      <div class="overview-card-label">Þessi vika</div>
    </div>
    <div class="overview-card" style="--card-accent: #f97316;">
      <div class="overview-card-icon">👷</div>
      <div class="overview-card-value">${data.activeUsers || 0}</div>
      <div class="overview-card-label">Virkir notendur</div>
    </div>
  `;
}

/**
 * Render center comparison cards
 */
function renderCenterComparison(centers) {
  const container = document.getElementById('centersComparison');
  if (!container || !centers) return;
  
  const centerColors = {
    'HAFNOFELO': '#8B5CF6',
    'STAPAFELO': '#8B5CF6',
    'AKURFELO': '#EAB308',
    'HAALEITIFELO': '#EC4899'
  };
  
  const centerNames = {
    'HAFNOFELO': 'Fjör Hafnó',
    'STAPAFELO': 'Fjör Stapa',
    'AKURFELO': 'Fjör Akur',
    'HAALEITIFELO': 'Fjör Háaleiti'
  };
  
  container.innerHTML = centers.map(c => `
    <div class="center-comparison-card" style="--center-accent: ${centerColors[c.center_id] || '#8B5CF6'};">
      <div class="center-comparison-name">${centerNames[c.center_id] || c.center_id}</div>
      <div class="center-comparison-stat">
        <span>Í dag</span>
        <span>${c.today || 0}</span>
      </div>
      <div class="center-comparison-stat">
        <span>Þessi vika</span>
        <span>${c.week || 0}</span>
      </div>
      <div class="center-comparison-stat">
        <span>Þessi mánuður</span>
        <span>${c.month || 0}</span>
      </div>
      <div class="center-comparison-stat">
        <span>Virkir nemendur</span>
        <span>${c.activeStudents || 0}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Refresh overview data
 */
function refreshOverview() {
  loadAdminOverview();
}
