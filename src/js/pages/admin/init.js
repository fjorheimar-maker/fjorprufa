/* ============================================
   ADMIN PAGE - Initialization
   ============================================ */

/**
 * Initialize admin page
 */
async function init() {
  // Check for existing session
  if (checkAdminSession()) {
    showMainView();
    return;
  }
  
  // Setup login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }
  
  setupTabs();
}

/**
 * Handle admin login
 * @param {Event} e 
 */
async function handleAdminLogin(e) {
  e.preventDefault();
  
  const password = document.getElementById('adminPassword')?.value;
  const loginError = document.getElementById('loginError');
  
  if (loginError) loginError.classList.remove('show');
  
  try {
    const result = await adminLogin(password);
    
    if (result.status === 'success') {
      saveAdminSession();
      showMainView();
    } else {
      if (loginError) {
        loginError.textContent = result.message || 'Rangt lykilorð';
        loginError.classList.add('show');
      }
    }
  } catch (err) {
    console.error('Villa:', err);
    if (loginError) {
      loginError.textContent = 'Villa við innskráningu';
      loginError.classList.add('show');
    }
  }
}

/**
 * Show main admin view
 */
function showMainView() {
  const loginView = document.getElementById('loginView');
  const mainView = document.getElementById('mainView');
  
  if (loginView) loginView.style.display = 'none';
  if (mainView) mainView.classList.add('show');
  
  setupTabs();
  loadAdminData();
}

/**
 * Load admin data
 */
async function loadAdminData() {
  await Promise.all([
    loadAdminStats(),
    loadUsers(),
    loadAllStudents()
  ]);
}

/**
 * Load admin statistics
 */
async function loadAdminStats() {
  try {
    const data = await apiGet('adminStats');
    
    if (data) {
      const totalStudents = document.getElementById('totalStudents');
      const totalStaff = document.getElementById('totalStaff');
      const totalAttendance = document.getElementById('totalAttendance');
      
      if (totalStudents) totalStudents.textContent = data.totalStudents || 0;
      if (totalStaff) totalStaff.textContent = data.totalStaff || 0;
      if (totalAttendance) totalAttendance.textContent = data.totalAttendance || 0;
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Load users list
 */
async function loadUsers() {
  const container = document.getElementById('userList');
  if (!container) return;
  
  try {
    const users = await apiGet('users');
    
    if (!users || users.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Engir notendur</p></div>';
      return;
    }
    
    container.innerHTML = users.map(user => `
      <div class="list-item">
        <div class="list-item-info">
          <div class="list-item-name">${escapeHtml(user.nafn)}</div>
          <div class="list-item-meta">${escapeHtml(user.username)} • ${user.hlutverk} • ${user.center_id || 'Allar stöðvar'}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-edit" onclick="editUser('${user.username}')">Breyta</button>
          <button class="btn-delete" onclick="deleteUser('${user.username}')">Eyða</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Villa:', err);
    container.innerHTML = '<div class="empty-state"><p>Villa við að sækja notendur</p></div>';
  }
}

/**
 * Load all students for admin
 */
async function loadAllStudents() {
  const container = document.getElementById('adminStudentList');
  if (!container) return;
  
  try {
    const students = await fetchStudents();
    
    if (!students || students.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Engir nemendur</p></div>';
      return;
    }
    
    renderAdminStudentList(students);
    
    // Setup search
    const searchInput = document.getElementById('studentSearch');
    const centerFilter = document.getElementById('studentCenterFilter');
    
    if (searchInput) {
      searchInput.addEventListener('input', () => filterAdminStudents(students));
    }
    if (centerFilter) {
      centerFilter.addEventListener('change', () => filterAdminStudents(students));
    }
  } catch (err) {
    console.error('Villa:', err);
    container.innerHTML = '<div class="empty-state"><p>Villa við að sækja nemendur</p></div>';
  }
}

/**
 * Render admin student list
 * @param {Array} students 
 */
function renderAdminStudentList(students) {
  const container = document.getElementById('adminStudentList');
  if (!container) return;
  
  container.innerHTML = students.slice(0, 100).map(s => `
    <div class="list-item">
      <div class="list-item-info">
        <div class="list-item-name">${escapeHtml(s.nafn)}</div>
        <div class="list-item-meta">${escapeHtml(s.skoli || '')} • ${s.bekkur || ''}. bekkur • ${s.student_id}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" onclick="editStudent('${s.student_id}')">Breyta</button>
      </div>
    </div>
  `).join('');
  
  if (students.length > 100) {
    container.innerHTML += `<p style="text-align: center; color: var(--color-text-muted); padding: 16px;">Sýni fyrstu 100 af ${students.length} nemendum</p>`;
  }
}

/**
 * Filter admin students
 * @param {Array} allStudents 
 */
function filterAdminStudents(allStudents) {
  const query = document.getElementById('studentSearch')?.value?.toLowerCase() || '';
  const centerFilter = document.getElementById('studentCenterFilter')?.value || '';
  
  let filtered = allStudents;
  
  if (query) {
    filtered = filtered.filter(s => 
      s.nafn?.toLowerCase().includes(query) ||
      String(s.student_id).includes(query)
    );
  }
  
  if (centerFilter) {
    // This would need additional logic to filter by center
  }
  
  renderAdminStudentList(filtered);
}

/**
 * Show add user modal
 */
function showAddUserModal() {
  alert('Bæta við notanda - TODO');
}

/**
 * Edit user
 * @param {string} username 
 */
function editUser(username) {
  alert(`Breyta notanda: ${username} - TODO`);
}

/**
 * Delete user
 * @param {string} username 
 */
function deleteUser(username) {
  if (confirm(`Ertu viss um að þú viljir eyða notanda ${username}?`)) {
    alert('Eyða notanda - TODO');
  }
}

/**
 * Edit student
 * @param {string} studentId 
 */
function editStudent(studentId) {
  alert(`Breyta nemanda: ${studentId} - TODO`);
}

/**
 * Export for PowerBI
 */
async function exportForPowerBI() {
  try {
    const result = await apiGet('exportPowerBI');
    
    if (result.url) {
      window.open(result.url, '_blank');
    } else {
      alert('Villa við export');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við export');
  }
}

/**
 * Export students
 */
async function exportStudents() {
  try {
    const result = await apiGet('exportStudents');
    
    if (result.url) {
      window.open(result.url, '_blank');
    } else {
      alert('Villa við export');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við export');
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
