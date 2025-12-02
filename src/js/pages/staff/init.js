/* ============================================
   STAFF INIT - Initialization for staff pages
   ============================================ */

/**
 * Main initialization function
 */
async function init() {
  // Load center colors
  await loadCenterColors();
  
  // Get center from URL
  const cid = initCenterFromUrl();
  
  if (!cid) {
    // Show center selection
    showCenterSelect();
    return;
  }
  
  // Update login view with center name
  const loginCenterName = document.getElementById('loginCenterName');
  if (loginCenterName) {
    loginCenterName.textContent = centerName;
  }
  
  // Hide center select, show login
  const centerSelectView = document.getElementById('centerSelectView');
  const loginView = document.getElementById('loginView');
  
  if (centerSelectView) centerSelectView.style.display = 'none';
  if (loginView) loginView.style.display = 'flex';
  
  // Check for existing session
  const existingUser = checkStaffSession(centerId);
  if (existingUser) {
    currentUser = existingUser;
    showMainView();
    return;
  }
  
  // Setup login form
  setupLoginForm();
  setupTabs();
}

/**
 * Show center selection view
 */
function showCenterSelect() {
  const centerSelectView = document.getElementById('centerSelectView');
  const loginView = document.getElementById('loginView');
  const mainView = document.getElementById('mainView');
  
  if (centerSelectView) centerSelectView.style.display = 'flex';
  if (loginView) loginView.style.display = 'none';
  if (mainView) mainView.classList.remove('show');
  
  // Setup center select buttons
  document.querySelectorAll('.center-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCenter = btn.dataset.center;
      // Redirect to same page with center param
      const pageName = window.location.pathname.split('/').pop() || 'starfsmadur.html';
      window.location.href = `${pageName}?center=${selectedCenter}`;
    });
  });
}

/**
 * Setup login form handler
 */
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      handleStaffLogin(e, centerId, showMainView);
    });
  }
}

/**
 * Show main view after login
 */
function showMainView() {
  const centerSelectView = document.getElementById('centerSelectView');
  const loginView = document.getElementById('loginView');
  const mainView = document.getElementById('mainView');
  
  if (centerSelectView) centerSelectView.style.display = 'none';
  if (loginView) loginView.style.display = 'none';
  if (mainView) mainView.classList.add('show');
  
  // Update header
  const headerCenterName = document.getElementById('headerCenterName');
  const userName = document.getElementById('userName');
  
  if (headerCenterName) headerCenterName.textContent = centerName;
  if (userName) userName.textContent = currentUser?.nafn || '';
  
  updateHeaderDate();
  setupTabs();
  loadAllData();
  initSkraForm();
  loadCalendar();
}

/**
 * Load all data after login
 */
async function loadAllData() {
  updateDateDisplay();
  
  await Promise.all([
    loadScheduleNow(),
    loadAttendanceToday(),
    loadStudents(),
    loadStatistics(),
    loadActivityStatus()
  ]);
  
  setupMidstigTable();
  setupSchoolFilter();
}

/**
 * Load current schedule
 */
async function loadScheduleNow() {
  try {
    const data = await apiGet('scheduleNow', { center_id: centerId });
    
    const activityName = document.getElementById('activityName');
    const activityTime = document.getElementById('activityTime');
    
    if (data.dagskrarlid) {
      if (activityName) activityName.textContent = data.dagskrarlid.heiti;
      if (activityTime) activityTime.textContent = `${data.dagskrarlid.byrjar} - ${data.dagskrarlid.endar}`;
    } else {
      if (activityName) activityName.textContent = 'Ekkert í gangi';
      if (activityTime) activityTime.textContent = '';
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Load students list
 */
async function loadStudents() {
  try {
    students = await fetchStudents();
    allStudents = students;
  } catch (err) {
    console.error('Villa:', err);
  }
}

// Auto refresh every 5 minutes
setInterval(() => {
  loadAttendanceToday();
  loadScheduleNow();
}, 300000);
