/* ============================================
   LEADERBOARD - Stigatafla
   ============================================ */

/**
 * Load leaderboard
 */
async function loadLeaderboard() {
  const period = document.getElementById('leaderboardPeriod')?.value || 'month';
  const container = document.getElementById('leaderboardList');
  
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Sæki stigatöflu...</p></div>';
  
  try {
    const data = await apiGet('leaderboard', {
      center_id: centerId,
      period: period
    });
    
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Engin gögn fyrir þetta tímabil</p></div>';
      return;
    }
    
    container.innerHTML = data.map((item, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      
      return `
        <div class="attendance-item" onclick="showStudentPopup('${item.student_id}', '${escapeHtml(item.nafn)}')">
          <div class="attendance-item-left">
            <span style="font-size: 1.5rem; min-width: 40px; text-align: center;">${medal}</span>
            <div>
              <div class="attendance-name">${escapeHtml(item.nafn)}</div>
              <div class="attendance-meta">${escapeHtml(item.skoli || '')} • ${item.bekkur || ''}. bekkur</div>
            </div>
          </div>
          <div class="attendance-item-right">
            <span class="attendance-total" style="font-size: 1.2rem;">${item.count} mæt.</span>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Villa:', err);
    container.innerHTML = '<div class="empty-state"><p>Villa við að sækja stigatöflu</p></div>';
  }
}
