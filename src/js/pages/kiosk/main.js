/* ============================================
   KIOSK - Fullscreen kiosk mode
   ============================================ */

// Kiosk state
let kioskStudents = [];
let kioskSchedule = [];
let kioskCurrentItem = null;
let kioskSelectedStudent = null;
let kioskTimerInterval = null;
let kioskTimeLeft = 20;

/**
 * Initialize kiosk mode
 */
async function initKiosk() {
  // Get center from URL
  initCenterFromUrl();
  
  if (!centerId) {
    alert('Engin stöð valin');
    window.location.href = 'index.html';
    return;
  }
  
  // Update UI
  const centerNameEl = document.getElementById('kioskCenterName');
  if (centerNameEl) {
    centerNameEl.textContent = centerName;
  }
  
  // Start clock
  updateKioskClock();
  setInterval(updateKioskClock, 1000);
  
  // Load data
  await Promise.all([
    loadKioskStudents(),
    loadKioskSchedule()
  ]);
  
  // Setup input
  setupKioskInput();
  
  // Setup exit trigger (tap top-right corner 5 times)
  setupExitTrigger();
}

/**
 * Update clock display
 */
function updateKioskClock() {
  const timeEl = document.getElementById('kioskTime');
  if (timeEl) {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * Load students for kiosk
 */
async function loadKioskStudents() {
  try {
    kioskStudents = await fetchStudents(centerId);
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Load schedule for kiosk
 */
async function loadKioskSchedule() {
  try {
    const data = await apiGet('scheduleNow', { center_id: centerId });
    
    if (data.dagskrarlid) {
      kioskCurrentItem = data.dagskrarlid;
      showKioskReady();
    } else {
      showKioskClosed();
    }
  } catch (err) {
    console.error('Villa:', err);
    showKioskClosed();
  }
}

/**
 * Show kiosk ready state
 */
function showKioskReady() {
  const view = document.getElementById('kioskMain');
  if (!view) return;
  
  view.innerHTML = `
    <div class="kiosk-card">
      <div class="kiosk-icon">👋</div>
      <div class="kiosk-title">Velkomin!</div>
      <div class="kiosk-subtitle">${escapeHtml(kioskCurrentItem?.heiti || 'Fjörlistinn')}</div>
      
      <div class="kiosk-input-container">
        <input type="text" 
               class="kiosk-input" 
               id="kioskInput" 
               placeholder="Sláðu inn nafnið þitt..." 
               autocomplete="off" />
        <div class="autocomplete-results" id="kioskAutocomplete"></div>
      </div>
      
      <button class="kiosk-btn" id="kioskBtn" disabled onclick="kioskCheckin()">
        Skrá mætingu
      </button>
    </div>
  `;
  
  setupKioskInput();
}

/**
 * Show kiosk closed state
 */
function showKioskClosed() {
  const view = document.getElementById('kioskMain');
  if (!view) return;
  
  view.innerHTML = `
    <div class="kiosk-card">
      <div class="kiosk-icon">😴</div>
      <div class="kiosk-title">Lokað</div>
      <div class="kiosk-subtitle">Engin dagskrá í gangi</div>
    </div>
  `;
}

/**
 * Setup kiosk input autocomplete
 */
function setupKioskInput() {
  const input = document.getElementById('kioskInput');
  const results = document.getElementById('kioskAutocomplete');
  const btn = document.getElementById('kioskBtn');
  
  if (!input || !results) return;
  
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    kioskSelectedStudent = null;
    if (btn) btn.disabled = true;
    
    if (query.length < 2) {
      results.classList.remove('show');
      return;
    }
    
    const matches = kioskStudents.filter(s => {
      const nafn = (s.nafn || '').toLowerCase();
      const kt = String(s.student_id || '');
      return nafn.includes(query) || kt.endsWith(query);
    }).slice(0, 8);
    
    if (matches.length === 0) {
      results.innerHTML = '<div class="autocomplete-item">Enginn nemandi fannst</div>';
      results.classList.add('show');
      return;
    }
    
    results.innerHTML = matches.map(s => `
      <div class="autocomplete-item" data-id="${s.student_id}">
        <div class="autocomplete-name">${escapeHtml(s.nafn)}</div>
        <div class="autocomplete-meta">${escapeHtml(s.skoli || '')} • ${s.bekkur}. bekk</div>
      </div>
    `).join('');
    
    results.classList.add('show');
    
    // Click handlers
    results.querySelectorAll('.autocomplete-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const student = matches.find(s => String(s.student_id) === item.dataset.id);
        if (student) {
          selectKioskStudent(student);
        }
      });
    });
  });
  
  // Focus input
  input.focus();
}

/**
 * Select student in kiosk
 */
function selectKioskStudent(student) {
  kioskSelectedStudent = student;
  
  const input = document.getElementById('kioskInput');
  const results = document.getElementById('kioskAutocomplete');
  const btn = document.getElementById('kioskBtn');
  
  if (input) input.value = student.nafn;
  if (results) results.classList.remove('show');
  if (btn) btn.disabled = false;
}

/**
 * Kiosk checkin
 */
async function kioskCheckin() {
  if (!kioskSelectedStudent || !kioskCurrentItem) return;
  
  const btn = document.getElementById('kioskBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Skráir...';
  }
  
  try {
    const result = await submitAttendance({
      student_id: kioskSelectedStudent.student_id,
      center_id: centerId,
      dagskrarlid: kioskCurrentItem.heiti,
      source: 'kiosk'
    });
    
    if (result.status === 'success') {
      showKioskSuccess(result);
    } else if (result.status === 'duplicate') {
      showKioskDuplicate();
    } else {
      alert(result.message || 'Villa við skráningu');
      showKioskReady();
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við skráningu');
    showKioskReady();
  }
}

/**
 * Show success state
 */
function showKioskSuccess(result) {
  const view = document.getElementById('kioskMain');
  if (!view) return;
  
  const gamification = result.gamification || {};
  const milestone = MILESTONES[gamification.totalCount];
  
  view.innerHTML = `
    <div class="kiosk-card kiosk-success">
      <div class="kiosk-success-icon">✅</div>
      <div class="kiosk-success-name">${escapeHtml(kioskSelectedStudent.nafn)}</div>
      <div class="kiosk-success-message">Mæting skráð!</div>
      
      ${milestone ? `
        <div class="kiosk-milestone">
          <div class="kiosk-milestone-icon">🎉</div>
          <div class="kiosk-milestone-text">${milestone}</div>
        </div>
      ` : ''}
      
      <div class="kiosk-gamification">
        <div class="kiosk-title-badge">🏆 ${gamification.title || 'Nýliði'}</div>
        <div class="kiosk-stats">
          <div class="kiosk-stat">
            <div class="kiosk-stat-value">${gamification.totalCount || 1}</div>
            <div class="kiosk-stat-label">Mætingar</div>
          </div>
          <div class="kiosk-stat">
            <div class="kiosk-stat-value">${gamification.streakWeeks || 0} 🔥</div>
            <div class="kiosk-stat-label">Vikur í röð</div>
          </div>
        </div>
      </div>
      
      <button class="kiosk-minsida-btn" onclick="showKioskMinsida()">
        📊 Sjá mína síðu
      </button>
    </div>
  `;
  
  // Auto-reset after 10 seconds
  startKioskTimer(10, showKioskReady);
}

/**
 * Show duplicate message
 */
function showKioskDuplicate() {
  const view = document.getElementById('kioskMain');
  if (!view) return;
  
  view.innerHTML = `
    <div class="kiosk-card">
      <div class="kiosk-icon">ℹ️</div>
      <div class="kiosk-title">Þegar skráð/ur!</div>
      <div class="kiosk-subtitle">${escapeHtml(kioskSelectedStudent.nafn)} er nú þegar með mætingu í dag</div>
      
      <button class="kiosk-minsida-btn" onclick="showKioskMinsida()">
        📊 Sjá mína síðu
      </button>
    </div>
  `;
  
  startKioskTimer(8, showKioskReady);
}

/**
 * Show mín síða in kiosk
 */
async function showKioskMinsida() {
  clearKioskTimer();
  
  const view = document.getElementById('kioskMain');
  if (!view || !kioskSelectedStudent) return;
  
  view.innerHTML = `
    <div class="kiosk-card">
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Sæki upplýsingar...</p>
      </div>
    </div>
  `;
  
  try {
    const stats = await apiGet('studentStats', { student_id: kioskSelectedStudent.student_id });
    
    // Render mín síða
    view.innerHTML = `
      <div class="kiosk-card">
        <div class="kiosk-success-name">${escapeHtml(kioskSelectedStudent.nafn)}</div>
        <div class="kiosk-title-badge">🏆 ${stats.title || 'Nýliði'}</div>
        
        <div class="kiosk-gamification" style="margin-top: 24px;">
          <div class="kiosk-stats">
            <div class="kiosk-stat">
              <div class="kiosk-stat-value">${stats.totalCount || 0}</div>
              <div class="kiosk-stat-label">Heildar mætingar</div>
            </div>
            <div class="kiosk-stat">
              <div class="kiosk-stat-value">${stats.streakWeeks || 0} 🔥</div>
              <div class="kiosk-stat-label">Vikur í röð</div>
            </div>
          </div>
        </div>
        
        <button class="kiosk-btn" onclick="showKioskReady()" style="margin-top: 24px;">
          ← Til baka
        </button>
      </div>
    `;
    
    startKioskTimer(20, showKioskReady);
  } catch (err) {
    console.error('Villa:', err);
    showKioskReady();
  }
}

/**
 * Start countdown timer
 */
function startKioskTimer(seconds, callback) {
  clearKioskTimer();
  kioskTimeLeft = seconds;
  
  // Show timer UI
  let timerEl = document.getElementById('kioskTimer');
  if (!timerEl) {
    timerEl = document.createElement('div');
    timerEl.id = 'kioskTimer';
    timerEl.className = 'kiosk-timer';
    document.body.appendChild(timerEl);
  }
  
  updateTimerUI();
  
  kioskTimerInterval = setInterval(() => {
    kioskTimeLeft--;
    updateTimerUI();
    
    if (kioskTimeLeft <= 0) {
      clearKioskTimer();
      callback();
    }
  }, 1000);
}

/**
 * Update timer UI
 */
function updateTimerUI() {
  const timerEl = document.getElementById('kioskTimer');
  if (!timerEl) return;
  
  const percentage = (kioskTimeLeft / 20) * 100;
  timerEl.innerHTML = `
    <div class="kiosk-timer-bar">
      <div class="kiosk-timer-progress" style="width: ${percentage}%"></div>
    </div>
    <span class="kiosk-timer-text">${kioskTimeLeft}s</span>
  `;
}

/**
 * Clear timer
 */
function clearKioskTimer() {
  if (kioskTimerInterval) {
    clearInterval(kioskTimerInterval);
    kioskTimerInterval = null;
  }
  
  const timerEl = document.getElementById('kioskTimer');
  if (timerEl) {
    timerEl.remove();
  }
}

/**
 * Setup exit trigger (5 taps on top-right)
 */
function setupExitTrigger() {
  let tapCount = 0;
  let tapTimer = null;
  
  const trigger = document.getElementById('kioskExitTrigger');
  if (!trigger) return;
  
  trigger.addEventListener('click', () => {
    tapCount++;
    
    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000);
    
    if (tapCount >= 5) {
      tapCount = 0;
      showExitModal();
    }
  });
}

/**
 * Show exit modal
 */
function showExitModal() {
  const modal = document.createElement('div');
  modal.className = 'kiosk-exit-modal';
  modal.id = 'kioskExitModal';
  modal.innerHTML = `
    <div class="kiosk-exit-modal-content">
      <div class="kiosk-exit-title">🔐 Slá inn lykilorð til að loka kiosk</div>
      <input type="password" class="kiosk-exit-input" id="kioskExitPassword" placeholder="Lykilorð..." />
      <div class="kiosk-exit-actions">
        <button class="btn-secondary" onclick="closeExitModal()">Hætta við</button>
        <button class="btn" onclick="exitKiosk()">Loka kiosk</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('kioskExitPassword').focus();
}

/**
 * Close exit modal
 */
function closeExitModal() {
  const modal = document.getElementById('kioskExitModal');
  if (modal) modal.remove();
}

/**
 * Exit kiosk mode
 */
async function exitKiosk() {
  const password = document.getElementById('kioskExitPassword')?.value;
  
  try {
    const result = await staffLogin(centerId.toLowerCase().replace('felo', '') + '_staff', password);
    
    if (result.status === 'success') {
      window.location.href = `starfsmadur.html?center=${centerId}`;
    } else {
      alert('Rangt lykilorð');
    }
  } catch (err) {
    alert('Villa við að athuga lykilorð');
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initKiosk);
