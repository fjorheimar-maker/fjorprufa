/* ============================================
   NEMANDI PAGE - Student check-in
   ============================================ */

// State
let selectedStudent = null;
let currentScheduleItem = null;

// DOM elements
const centerView = document.getElementById('centerView');
const nameView = document.getElementById('nameView');
const successView = document.getElementById('successView');
const nameInput = document.getElementById('nameInput');
const autocompleteList = document.getElementById('autocompleteList');
const checkinBtn = document.getElementById('checkinBtn');

/**
 * Initialize page
 */
async function init() {
  // Check for center in URL
  const params = new URLSearchParams(window.location.search);
  const urlCenter = params.get('center');
  
  if (urlCenter && CENTER_STYLES[urlCenter]) {
    selectCenter(urlCenter);
    return;
  }
  
  // Setup center buttons
  document.querySelectorAll('.center-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectCenter(btn.dataset.center);
    });
  });
}

/**
 * Select a center
 * @param {string} id 
 */
function selectCenter(id) {
  centerId = id;
  const style = CENTER_STYLES[id];
  
  if (style) {
    document.documentElement.style.setProperty('--center-color', style.color);
    centerName = style.name;
    document.getElementById('centerName').textContent = centerName;
  }

  centerView.classList.add('hidden');
  nameView.classList.remove('hidden');

  loadStudents();
  loadSchedule();
}

/**
 * Go back to center selection
 */
function goBack() {
  nameView.classList.add('hidden');
  centerView.classList.remove('hidden');
  nameInput.value = '';
  nameInput.disabled = true;
  selectedStudent = null;
  checkinBtn.disabled = true;
  autocompleteList.classList.remove('show');
}

/**
 * Load students
 */
async function loadStudents() {
  try {
    students = await fetchStudents(centerId);
    setupNameInput();
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Load schedule
 */
async function loadSchedule() {
  const scheduleStatus = document.getElementById('scheduleStatus');
  const scheduleActive = document.getElementById('scheduleActive');
  const scheduleInactive = document.getElementById('scheduleInactive');
  
  try {
    scheduleData = await fetchSchedule(centerId);
    
    // Find active schedule items
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayNames = ['Sunnudagur', 'Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur'];
    const todayName = dayNames[now.getDay()];
    
    const activeItems = scheduleData.filter(item => {
      if (item.vikudagur !== todayName) return false;
      const startMinutes = parseTimeToMinutes(item.byrjar);
      const endMinutes = parseTimeToMinutes(item.endar);
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
    
    scheduleStatus.innerHTML = '';
    
    if (activeItems.length >= 1) {
      currentScheduleItem = activeItems[0];
      scheduleActive.classList.remove('hidden');
      scheduleInactive.classList.add('hidden');
      
      document.getElementById('currentActivityName').textContent = currentScheduleItem.heiti;
      document.getElementById('currentActivityTime').textContent = 
        `${formatTime(currentScheduleItem.byrjar)} - ${formatTime(currentScheduleItem.endar)}`;
      
      nameInput.disabled = false;
      nameInput.placeholder = 'Skrifaðu nafnið þitt...';
      nameInput.focus();
    } else {
      currentScheduleItem = null;
      scheduleActive.classList.add('hidden');
      scheduleInactive.classList.remove('hidden');
      nameInput.disabled = true;
      nameInput.placeholder = 'Engin vakt í gangi...';
    }
  } catch (err) {
    console.error('Villa:', err);
    scheduleStatus.innerHTML = '<p style="color: var(--color-error);">Villa við að sækja dagskrá</p>';
  }
}

/**
 * Setup name input autocomplete
 */
function setupNameInput() {
  nameInput.addEventListener('input', () => {
    const query = nameInput.value.toLowerCase();
    
    if (query.length < 2) {
      autocompleteList.classList.remove('show');
      selectedStudent = null;
      checkinBtn.disabled = true;
      return;
    }
    
    const matches = students.filter(s => 
      s.nafn?.toLowerCase().includes(query)
    ).slice(0, 10);
    
    if (matches.length === 0) {
      autocompleteList.innerHTML = '<div class="autocomplete-item"><div class="no-results"><div class="no-results-icon">😕</div><div class="no-results-text">Enginn nemandi fannst</div></div></div>';
      autocompleteList.classList.add('show');
      return;
    }
    
    autocompleteList.innerHTML = matches.map(s => `
      <div class="autocomplete-item" onclick="selectStudent('${s.student_id}', '${escapeHtml(s.nafn)}')">
        <div class="autocomplete-name">${escapeHtml(s.nafn)}</div>
        <div class="autocomplete-details">${escapeHtml(s.skoli || '')} • ${s.bekkur || ''}. bekkur</div>
      </div>
    `).join('');
    
    autocompleteList.classList.add('show');
  });
  
  // Hide on click outside
  document.addEventListener('click', (e) => {
    if (!nameInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.classList.remove('show');
    }
  });
  
  // Setup checkin button
  checkinBtn.addEventListener('click', doCheckin);
}

/**
 * Select a student
 * @param {string} studentId 
 * @param {string} nafn 
 */
function selectStudent(studentId, nafn) {
  selectedStudent = { student_id: studentId, nafn };
  nameInput.value = nafn;
  autocompleteList.classList.remove('show');
  checkinBtn.disabled = false;
}

/**
 * Do check-in
 */
async function doCheckin() {
  if (!selectedStudent || !currentScheduleItem) return;
  
  checkinBtn.disabled = true;
  checkinBtn.textContent = 'Skrái...';
  
  try {
    const result = await submitAttendance({
      student_id: selectedStudent.student_id,
      center_id: centerId,
      dagskrarlid: currentScheduleItem.heiti,
      source: 'student'
    });
    
    if (result.status === 'success') {
      showSuccess(selectedStudent.nafn, result);
    } else {
      alert(result.message || 'Villa við skráningu');
      checkinBtn.disabled = false;
      checkinBtn.textContent = 'Skrá mig';
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við skráningu');
    checkinBtn.disabled = false;
    checkinBtn.textContent = 'Skrá mig';
  }
}

/**
 * Show success view
 * @param {string} nafn 
 * @param {Object} result 
 */
function showSuccess(nafn, result) {
  nameView.classList.add('hidden');
  successView.classList.remove('hidden');
  
  document.getElementById('successName').textContent = `Velkominn/n, ${nafn}!`;
  
  let message = 'Mæting skráð!';
  if (result.gamification?.milestone) {
    message = result.gamification.milestone;
  } else if (result.gamification?.totalCount) {
    message = `Þetta er mæting númer ${result.gamification.totalCount}!`;
  }
  
  document.getElementById('successMessage').textContent = message;
  
  // Auto reset after 5 seconds
  setTimeout(resetToNameInput, 5000);
}

/**
 * Reset to name input
 */
function resetToNameInput() {
  successView.classList.add('hidden');
  nameView.classList.remove('hidden');
  
  nameInput.value = '';
  selectedStudent = null;
  checkinBtn.disabled = true;
  checkinBtn.textContent = 'Skrá mig';
  nameInput.focus();
}

// Start
document.addEventListener('DOMContentLoaded', init);
