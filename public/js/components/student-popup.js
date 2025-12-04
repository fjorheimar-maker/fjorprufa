/* ============================================
   STUDENT POPUP - Student detail popup
   ============================================ */

/**
 * Show student popup
 * @param {string} studentId 
 * @param {string} studentName 
 */
async function showStudentPopup(studentId, studentName) {
  const overlay = document.getElementById('studentPopupOverlay');
  const popup = document.getElementById('studentPopup');
  
  if (!overlay || !popup) return;
  
  overlay.classList.add('active');
  popup.innerHTML = '<div class="popup-loading"><div class="loading-spinner"></div><p>Sæki upplýsingar...</p></div>';
  
  try {
    const data = await apiGet('studentDetail', { 
      student_id: studentId, 
      center_id: centerId 
    });
    
    if (data.status === 'error') {
      popup.innerHTML = `
        <div class="student-popup-header">
          <div class="student-popup-info">
            <h3>Villa</h3>
            <p>${data.message}</p>
          </div>
          <button class="student-popup-close" onclick="closeStudentPopup()">×</button>
        </div>
      `;
      return;
    }
    
    renderStudentPopup(data);
  } catch (err) {
    console.error('Villa:', err);
    popup.innerHTML = `
      <div class="student-popup-header">
        <div class="student-popup-info">
          <h3>Villa</h3>
          <p>${err.message}</p>
        </div>
        <button class="student-popup-close" onclick="closeStudentPopup()">×</button>
      </div>
    `;
  }
}

/**
 * Render student popup content
 * @param {Object} data 
 */
function renderStudentPopup(data) {
  const { student, stats, recentAttendance } = data;
  const popup = document.getElementById('studentPopup');
  
  if (!popup) return;
  
  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const months = ['jan', 'feb', 'mar', 'apr', 'maí', 'jún', 'júl', 'ágú', 'sep', 'okt', 'nóv', 'des'];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  popup.innerHTML = `
    <div class="student-popup-header">
      <div class="student-popup-info">
        <h3>👤 ${escapeHtml(student.nafn)}</h3>
        <p>${student.bekkur}. bekkur • ${escapeHtml(student.skoli)}</p>
        ${stats.title ? `<span class="popup-title-badge">🏆 ${stats.title}</span>` : ''}
      </div>
      <button class="student-popup-close" onclick="closeStudentPopup()">×</button>
    </div>
    
    <div class="student-popup-body">
      <div class="popup-stats-grid">
        <div class="popup-stat">
          <div class="popup-stat-value">${stats.totalCount}</div>
          <div class="popup-stat-label">Heildarmæting</div>
        </div>
        <div class="popup-stat">
          <div class="popup-stat-value">${stats.streakWeeks >= 2 ? '🔥' : ''}${stats.streakWeeks}</div>
          <div class="popup-stat-label">Vikur í röð</div>
        </div>
      </div>
      
      <div class="popup-info-list">
        <div class="popup-info-item">
          <span class="popup-info-icon">📅</span>
          <div class="popup-info-text">
            <div class="popup-info-label">Fyrsta mæting</div>
            <div class="popup-info-value">${formatDate(stats.firstAttendance)}</div>
          </div>
        </div>
        <div class="popup-info-item">
          <span class="popup-info-icon">🕐</span>
          <div class="popup-info-text">
            <div class="popup-info-label">Síðasta mæting</div>
            <div class="popup-info-value">${formatDate(stats.lastAttendance)} (${stats.daysSinceLast} dagar síðan)</div>
          </div>
        </div>
        <div class="popup-info-item">
          <span class="popup-info-icon">🎯</span>
          <div class="popup-info-text">
            <div class="popup-info-label">Næsti áfangi</div>
            <div class="popup-info-value">${stats.nextMilestone} mætingar (${stats.untilNextMilestone} eftir)</div>
          </div>
        </div>
      </div>
      
      <div class="popup-section-title">📋 Nýlegar mætingar</div>
      <div class="popup-attendance-list">
        ${recentAttendance && recentAttendance.length > 0 ? recentAttendance.map(a => `
          <div class="popup-attendance-item">
            <span class="popup-attendance-date">${formatDate(a.date)}</span>
            <span class="popup-attendance-time">${a.time}</span>
            <span class="popup-attendance-dagskra">${escapeHtml(a.dagskrarlid || '-')}</span>
          </div>
        `).join('') : '<div class="popup-attendance-item"><span>Engar mætingar</span></div>'}
      </div>
      
      <button class="popup-see-more" onclick="goToFlettaUpp('${student.student_id}')">
        Sjá allar mætingar →
      </button>
    </div>
  `;
}

/**
 * Close student popup
 */
function closeStudentPopup() {
  const overlay = document.getElementById('studentPopupOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * Navigate to uppfletting tab with student
 * @param {string} studentId 
 */
function goToFlettaUpp(studentId) {
  closeStudentPopup();
  
  // Switch to uppfletting tab
  switchToTab('uppfletting');
  
  // Find student and show details
  setTimeout(() => {
    const student = students.find(s => String(s.student_id).trim() === String(studentId).trim());
    if (student) {
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.value = student.nafn;
        searchInput.dispatchEvent(new Event('input'));
      }
      
      setTimeout(() => {
        showStudentDetail(studentId);
      }, 300);
    }
  }, 100);
}
