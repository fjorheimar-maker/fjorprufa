/* ============================================
   VIRKNI - Activity status
   ============================================ */

/**
 * Load activity status
 */
async function loadActivityStatus() {
  try {
    const data = await apiGet('activityStatus', { center_id: centerId });
    
    if (!data || data.status === 'error') return;
    
    activityData = data;
    
    // Update counts
    const countVirkir = document.getElementById('countVirkir');
    const countAdDetta = document.getElementById('countAdDetta');
    const countNylegaHaettir = document.getElementById('countNylegaHaettir');
    const countHaettir = document.getElementById('countHaettir');
    const countOvirkir = document.getElementById('countOvirkir');
    
    if (countVirkir) countVirkir.textContent = data.virkir?.count || 0;
    if (countAdDetta) countAdDetta.textContent = data.ad_detta?.count || 0;
    if (countNylegaHaettir) countNylegaHaettir.textContent = data.nylega_haettir?.count || 0;
    if (countHaettir) countHaettir.textContent = data.haettir?.count || 0;
    if (countOvirkir) countOvirkir.textContent = data.ovirkir?.count || 0;
    
    // Setup click handlers
    document.querySelectorAll('.activity-card').forEach(card => {
      card.addEventListener('click', () => {
        const status = card.dataset.status;
        showActivityBreakdown(status);
        
        // Update selected state
        document.querySelectorAll('.activity-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Show activity breakdown by school
 * @param {string} status 
 */
function showActivityBreakdown(status) {
  const container = document.getElementById('activityBreakdown');
  if (!container || !activityData) return;
  
  const statusData = activityData[status];
  if (!statusData || !statusData.bySchool) {
    container.innerHTML = '<div class="activity-info-text">Engin gögn</div>';
    return;
  }
  
  const statusLabels = {
    'virkir': 'Virkir',
    'ad_detta': 'Að detta úr',
    'nylega_haettir': 'Nýlega hættir',
    'haettir': 'Hættir',
    'ovirkir': 'Óvirkir'
  };
  
  const entries = Object.entries(statusData.bySchool).sort((a, b) => b[1] - a[1]);
  const maxValue = entries.length > 0 ? entries[0][1] : 0;
  
  container.innerHTML = `
    <div class="activity-breakdown-title">${statusLabels[status] || status} - eftir skólum</div>
    <div class="horizontal-bar-chart">
      ${entries.map(([school, count]) => {
        const width = maxValue > 0 ? (count / maxValue) * 100 : 0;
        return `
          <div class="h-bar-item">
            <div class="h-bar-label">${escapeHtml(school)}</div>
            <div class="h-bar-container">
              <div class="h-bar" style="width: ${width}%; background: var(--color-${status.replace('_', '-')});"></div>
            </div>
            <div class="h-bar-value">${count}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
