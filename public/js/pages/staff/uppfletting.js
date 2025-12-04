/* ============================================
   UPPFLETTING - Student lookup
   ============================================ */

/**
 * Setup school filter dropdown
 */
function setupSchoolFilter() {
  const schoolFilter = document.getElementById('schoolFilter');
  if (!schoolFilter) return;
  
  // Get unique schools from students
  const schools = [...new Set(students.map(s => s.skoli).filter(Boolean))].sort();
  
  schoolFilter.innerHTML = '<option value="">Allir skólar</option>' + 
    schools.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  
  // Setup search handlers
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  schoolFilter.addEventListener('change', handleSearch);
}

/**
 * Handle search input
 */
function handleSearch() {
  const query = document.getElementById('searchInput')?.value?.toLowerCase() || '';
  const schoolFilter = document.getElementById('schoolFilter')?.value || '';
  const resultsContainer = document.getElementById('searchResults');
  const detailContainer = document.getElementById('studentDetail');
  
  if (!resultsContainer) return;
  
  // Hide detail, show results
  if (detailContainer) detailContainer.style.display = 'none';
  resultsContainer.style.display = 'block';
  
  if (query.length < 2 && !schoolFilter) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <p>Sláðu inn að minnsta kosti 2 stafi til að leita</p>
      </div>
    `;
    return;
  }
  
  let filtered = students;
  
  if (query) {
    filtered = filtered.filter(s => 
      s.nafn?.toLowerCase().includes(query) ||
      String(s.student_id).includes(query)
    );
  }
  
  if (schoolFilter) {
    filtered = filtered.filter(s => s.skoli === schoolFilter);
  }
  
  if (filtered.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😕</div>
        <p>Enginn nemandi fannst</p>
      </div>
    `;
    return;
  }
  
  resultsContainer.innerHTML = filtered.slice(0, 50).map(student => `
    <div class="attendance-item" onclick="showStudentDetail('${student.student_id}')">
      <div class="attendance-item-left">
        <div>
          <div class="attendance-name">${escapeHtml(student.nafn || '')}</div>
          <div class="attendance-meta">${escapeHtml(student.skoli || '')} • ${student.bekkur || ''}. bekkur</div>
        </div>
      </div>
      <div class="attendance-item-right">
        <span style="color: var(--color-text-muted);">→</span>
      </div>
    </div>
  `).join('');
}

/**
 * Show student detail view
 * @param {string} studentId 
 */
async function showStudentDetail(studentId) {
  const resultsContainer = document.getElementById('searchResults');
  const detailEl = document.getElementById('studentDetail');
  
  if (!detailEl) return;
  
  if (resultsContainer) resultsContainer.style.display = 'none';
  detailEl.style.display = 'block';
  detailEl.innerHTML = '<div class="loading"><div class="loading-spinner"></div><p>Sæki upplýsingar...</p></div>';
  
  try {
    const data = await apiGet('studentStats', { student_id: studentId });
    
    if (data.status === 'error') {
      detailEl.innerHTML = `<p>Villa: ${data.message}</p>`;
      return;
    }
    
    const student = students.find(s => String(s.student_id) === String(studentId)) || {};
    const statusClass = getStatusClass(data.daysSinceLast);
    const statusLabel = getStatusLabel(data.daysSinceLast);
    
    // Get attendance history
    const history = data.recentAttendance || [];
    const comments = data.comments || [];
    
    detailEl.innerHTML = `
      <div class="student-detail">
        <div class="student-header">
          <div>
            <div class="student-name">👤 ${escapeHtml(student.nafn || data.nafn || '')}</div>
            <div class="student-school">${escapeHtml(student.skoli || '')} • ${student.bekkur || ''}. bekkur</div>
            ${data.title ? `<span class="popup-title-badge">🏆 ${data.title}</span>` : ''}
          </div>
          <div class="student-status ${statusClass}">${statusLabel}</div>
        </div>
        
        <div class="student-stats">
          <div class="student-stat">
            <div class="student-stat-value">${data.totalCount || 0}</div>
            <div class="student-stat-label">Heildarmæting</div>
          </div>
          <div class="student-stat">
            <div class="student-stat-value">${data.streakWeeks || 0}${data.streakWeeks >= 2 ? ' 🔥' : ''}</div>
            <div class="student-stat-label">Vikur í röð</div>
          </div>
        </div>
        
        <div class="popup-info-list">
          <div class="popup-info-item">
            <span class="popup-info-icon">📅</span>
            <div class="popup-info-text">
              <div class="popup-info-label">Fyrsta mæting</div>
              <div class="popup-info-value">${formatFullDate(data.firstAttendance)}</div>
            </div>
          </div>
          <div class="popup-info-item">
            <span class="popup-info-icon">🕐</span>
            <div class="popup-info-text">
              <div class="popup-info-label">Síðasta mæting</div>
              <div class="popup-info-value">${formatFullDate(data.lastAttendance)} (${data.daysSinceLast || 0} dagar síðan)</div>
            </div>
          </div>
        </div>
        
        <div class="password-section">
          <span class="password-label">🔑 Lykilorð:</span>
          <span class="password-value password-hidden" id="passwordValue">••••••</span>
          <button class="password-toggle" onclick="togglePassword('${studentId}')">Sýna</button>
        </div>
        
        <div class="popup-section-title">📋 Nýlegar mætingar</div>
        <div class="popup-attendance-list">
          ${history.length > 0 ? history.slice(0, 10).map(a => `
            <div class="popup-attendance-item">
              <span class="popup-attendance-date">${formatFullDate(a.date)}</span>
              <span class="popup-attendance-time">${a.time || ''}</span>
              <span class="popup-attendance-dagskra">${escapeHtml(a.dagskrarlid || '-')}</span>
            </div>
          `).join('') : '<div class="popup-attendance-item"><span>Engar mætingar</span></div>'}
        </div>
        
        <div class="comments-section">
          <h4>
            📝 Athugasemdir (${comments.length})
            <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="toggleAddComment()">+ Bæta við</button>
          </h4>
          
          <div id="commentsContainer">
            ${comments.length > 0 ? comments.map(c => `
              <div class="comment">
                <div class="comment-text">${escapeHtml(c.texti)}</div>
                <div class="comment-meta">${c.dagsetning} - ${escapeHtml(c.hofundur)}</div>
              </div>
            `).join('') : '<p style="color: var(--color-text-muted); font-size: 0.9rem;">Engar athugasemdir</p>'}
          </div>

          <div class="add-comment" id="addCommentForm" style="display: none;">
            <input type="text" class="form-input" id="commentText" placeholder="Skrifa athugasemd..." />
            <button class="btn" onclick="submitComment('${studentId}')">Vista</button>
          </div>
        </div>

        <button class="btn btn-secondary" style="margin-top: 20px;" onclick="document.getElementById('studentDetail').style.display='none'; handleSearch();">← Til baka</button>
      </div>
    `;
  } catch (err) {
    console.error('Villa:', err);
    detailEl.innerHTML = '<p>Villa við að sækja upplýsingar</p>';
  }
}

/**
 * Toggle password visibility
 * @param {string} studentId 
 */
function togglePassword(studentId) {
  const el = document.getElementById('passwordValue');
  const btn = el?.nextElementSibling;
  if (!el || !btn) return;

  if (el.classList.contains('password-hidden')) {
    el.textContent = 'Fjor' + String(studentId).padStart(4, '0');
    el.classList.remove('password-hidden');
    btn.textContent = 'Fela';
  } else {
    el.textContent = '••••••';
    el.classList.add('password-hidden');
    btn.textContent = 'Sýna';
  }
}

/**
 * Toggle add comment form
 */
function toggleAddComment() {
  const form = document.getElementById('addCommentForm');
  if (form) form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

/**
 * Submit a comment
 * @param {string} studentId 
 */
async function submitComment(studentId) {
  const text = document.getElementById('commentText')?.value?.trim();
  if (!text) return;

  try {
    await apiPost('comment', {
      student_id: studentId,
      texti: text,
      hofundur: currentUser?.nafn || 'Óþekktur'
    });

    showStudentDetail(studentId);
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Get status class based on days since last attendance
 * @param {number} days 
 * @returns {string}
 */
function getStatusClass(days) {
  if (days <= 7) return 'virkir';
  if (days <= 14) return 'ad-detta';
  if (days <= 30) return 'nylega-haettir';
  if (days <= 60) return 'haettir';
  return 'ovirkir';
}

/**
 * Get status label based on days since last attendance
 * @param {number} days 
 * @returns {string}
 */
function getStatusLabel(days) {
  if (days <= 7) return '🟢 Virkur';
  if (days <= 14) return '🟡 Að detta';
  if (days <= 30) return '🟠 Nýlega hættur';
  if (days <= 60) return '🔴 Hættur';
  return '⚪ Óvirkur';
}
