/* ============================================
   ADMIN NOTENDUR - User management
   ============================================ */

let adminUsers = [];

/**
 * Load all users for admin
 */
async function loadAdminUsers() {
  try {
    const result = await apiGet('users');
    adminUsers = Array.isArray(result) ? result : (result.users || []);
    renderUsersTable();
  } catch (err) {
    console.error('Villa við að sækja notendur:', err);
  }
}

/**
 * Render users table
 */
function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  if (adminUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
          Engir notendur fundust
        </td>
      </tr>
    `;
    return;
  }
  
  const roleNames = {
    'admin': 'Admin',
    'deildarstjori': 'Deildarstjóri',
    'staff': 'Starfsmaður'
  };
  
  const centerNames = {
    'HAFNOFELO': 'Hafnó',
    'STAPAFELO': 'Stapa',
    'AKURFELO': 'Akur',
    'HAALEITIFELO': 'Háaleiti'
  };
  
  tbody.innerHTML = adminUsers.map(u => `
    <tr>
      <td>${escapeHtml(u.nafn || '')}</td>
      <td>${escapeHtml(u.username || '')}</td>
      <td>
        <span class="user-role-badge ${u.hlutverk || 'staff'}">
          ${roleNames[u.hlutverk] || u.hlutverk}
        </span>
      </td>
      <td>${centerNames[u.center_id] || u.center_id || 'Allar'}</td>
      <td>
        <span class="user-status-badge ${u.active !== false ? 'active' : 'inactive'}">
          ${u.active !== false ? 'Virkur' : 'Óvirkur'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn" onclick="editUser('${u.username}')">✏️</button>
          <button class="table-action-btn" onclick="resetUserPassword('${u.username}')">🔑</button>
          <button class="table-action-btn danger" onclick="confirmDeleteUser('${u.username}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/**
 * Show add user modal
 */
function showAddUserModal() {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const title = document.getElementById('userModalTitle');
  const passwordGroup = document.getElementById('userPasswordGroup');
  
  if (modal && form && title) {
    title.textContent = 'Bæta við notanda';
    form.reset();
    form.dataset.mode = 'add';
    form.dataset.username = '';
    if (passwordGroup) passwordGroup.style.display = 'block';
    modal.style.display = 'flex';
  }
}

/**
 * Edit existing user
 */
function editUser(username) {
  const user = adminUsers.find(u => u.username === username);
  if (!user) return;
  
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const title = document.getElementById('userModalTitle');
  const passwordGroup = document.getElementById('userPasswordGroup');
  
  if (modal && form && title) {
    title.textContent = 'Breyta notanda';
    form.dataset.mode = 'edit';
    form.dataset.username = username;
    
    // Fill form
    document.getElementById('userNafn').value = user.nafn || '';
    document.getElementById('userUsername').value = user.username || '';
    document.getElementById('userHlutverk').value = user.hlutverk || 'staff';
    document.getElementById('userCenter').value = user.center_id || '';
    document.getElementById('userEmail').value = user.email || '';
    
    // Hide password field for edit
    if (passwordGroup) passwordGroup.style.display = 'none';
    
    modal.style.display = 'flex';
  }
}

/**
 * Save user (add or edit)
 */
async function saveUser(e) {
  e.preventDefault();
  
  const form = document.getElementById('userForm');
  const mode = form.dataset.mode;
  const originalUsername = form.dataset.username;
  
  const data = {
    nafn: document.getElementById('userNafn').value.trim(),
    username: document.getElementById('userUsername').value.trim(),
    hlutverk: document.getElementById('userHlutverk').value,
    center_id: document.getElementById('userCenter').value,
    email: document.getElementById('userEmail').value.trim()
  };
  
  if (mode === 'add') {
    data.password = document.getElementById('userPassword').value;
  }
  
  if (!data.nafn || !data.username) {
    alert('Vinsamlegast fylltu út nafn og notendanafn');
    return;
  }
  
  if (mode === 'add' && !data.password) {
    alert('Vinsamlegast sláðu inn lykilorð');
    return;
  }
  
  try {
    const action = mode === 'edit' ? 'updateUser' : 'addUser';
    if (mode === 'edit') {
      data.original_username = originalUsername;
    }
    
    const result = await apiPost(action, data);
    
    if (result.status === 'success') {
      closeUserModal();
      loadAdminUsers();
    } else {
      alert(result.message || 'Villa við að vista notanda');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að vista notanda');
  }
}

/**
 * Reset user password
 */
async function resetUserPassword(username) {
  const newPassword = prompt('Sláðu inn nýtt lykilorð fyrir ' + username + ':');
  if (!newPassword) return;
  
  try {
    const result = await apiPost('resetPassword', { 
      username, 
      password: newPassword 
    });
    
    if (result.status === 'success') {
      alert('Lykilorð breytt!');
    } else {
      alert(result.message || 'Villa við að breyta lykilorði');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að breyta lykilorði');
  }
}

/**
 * Confirm delete user
 */
function confirmDeleteUser(username) {
  const user = adminUsers.find(u => u.username === username);
  if (!user) return;
  
  if (confirm(`Ertu viss um að þú viljir eyða notandanum ${user.nafn} (${username})?`)) {
    deleteUser(username);
  }
}

/**
 * Delete user
 */
async function deleteUser(username) {
  try {
    const result = await apiPost('deleteUser', { username });
    
    if (result.status === 'success') {
      loadAdminUsers();
    } else {
      alert(result.message || 'Villa við að eyða notanda');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að eyða notanda');
  }
}

/**
 * Close user modal
 */
function closeUserModal() {
  const modal = document.getElementById('userModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Toggle center select based on role
 */
function onRoleChange() {
  const role = document.getElementById('userHlutverk').value;
  const centerGroup = document.getElementById('userCenterGroup');
  
  if (centerGroup) {
    // Admin doesn't need center
    centerGroup.style.display = role === 'admin' ? 'none' : 'block';
  }
}
