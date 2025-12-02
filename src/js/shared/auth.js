/* ============================================
   AUTH - Login og logout
   ============================================ */

/**
 * Check if staff is logged in
 * @param {string} centerId 
 * @returns {Object|null} user data or null
 */
function checkStaffSession(centerId) {
  const session = sessionStorage.getItem('fjorlistinn_staff_session');
  if (!session) return null;
  
  try {
    const data = JSON.parse(session);
    if (data.center_id === centerId) {
      return data.user;
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Save staff session
 * @param {string} centerId 
 * @param {Object} user 
 */
function saveStaffSession(centerId, user) {
  sessionStorage.setItem('fjorlistinn_staff_session', JSON.stringify({
    center_id: centerId,
    user: user
  }));
}

/**
 * Clear staff session
 */
function clearStaffSession() {
  sessionStorage.removeItem('fjorlistinn_staff_session');
}

/**
 * Check if admin is logged in
 * @returns {boolean}
 */
function checkAdminSession() {
  return sessionStorage.getItem('fjorlistinn_admin_session') !== null;
}

/**
 * Save admin session
 */
function saveAdminSession() {
  sessionStorage.setItem('fjorlistinn_admin_session', 'true');
}

/**
 * Clear admin session
 */
function clearAdminSession() {
  sessionStorage.removeItem('fjorlistinn_admin_session');
}

/**
 * Staff logout
 */
function logout() {
  clearStaffSession();
  currentUser = null;
  
  const centerSelectView = document.getElementById('centerSelectView');
  const loginView = document.getElementById('loginView');
  const mainView = document.getElementById('mainView');
  
  if (centerSelectView) centerSelectView.style.display = 'none';
  if (loginView) loginView.style.display = 'flex';
  if (mainView) mainView.classList.remove('show');
  
  const loginPassword = document.getElementById('loginPassword');
  if (loginPassword) loginPassword.value = '';
  
  const loginError = document.getElementById('loginError');
  if (loginError) loginError.classList.remove('show');
}

/**
 * Admin logout
 */
function adminLogout() {
  clearAdminSession();
  window.location.href = 'index.html';
}

/**
 * Handle staff login form submit
 * @param {Event} e 
 * @param {string} centerId 
 * @param {Function} onSuccess 
 */
async function handleStaffLogin(e, centerId, onSuccess) {
  e.preventDefault();
  
  const password = document.getElementById('loginPassword').value;
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  
  if (loginError) loginError.classList.remove('show');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'SkráI inn...';
  }
  
  try {
    const result = await staffLogin(
      centerId.toLowerCase().replace('felo', '') + '_staff',
      password
    );
    
    if (result.status === 'success') {
      currentUser = result.user;
      saveStaffSession(centerId, currentUser);
      if (onSuccess) onSuccess();
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
  } finally {
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Skrá inn';
    }
  }
}
