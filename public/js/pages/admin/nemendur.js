/* ============================================
   ADMIN NEMENDUR - Student management
   ============================================ */

let adminStudents = [];
let filteredStudents = [];

/**
 * Load all students for admin
 */
async function loadAdminStudents() {
  try {
    const result = await apiGet('students');
    adminStudents = Array.isArray(result) ? result : [];
    filteredStudents = [...adminStudents];
    renderStudentsTable();
  } catch (err) {
    console.error('Villa við að sækja nemendur:', err);
  }
}

/**
 * Filter students by search/school/grade
 */
function filterStudents() {
  const search = (document.getElementById('studentSearch')?.value || '').toLowerCase();
  const school = document.getElementById('studentSchoolFilter')?.value || '';
  const grade = document.getElementById('studentGradeFilter')?.value || '';
  
  filteredStudents = adminStudents.filter(s => {
    const matchesSearch = !search || 
      (s.nafn || '').toLowerCase().includes(search) ||
      String(s.student_id || '').includes(search);
    const matchesSchool = !school || s.skoli === school;
    const matchesGrade = !grade || String(s.bekkur) === grade;
    
    return matchesSearch && matchesSchool && matchesGrade;
  });
  
  renderStudentsTable();
}

/**
 * Render students table
 */
function renderStudentsTable() {
  const tbody = document.getElementById('studentsTableBody');
  if (!tbody) return;
  
  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-muted);">
          Engir nemendur fundust
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = filteredStudents.map(s => `
    <tr>
      <td>${escapeHtml(s.nafn || '')}</td>
      <td>${escapeHtml(String(s.student_id || ''))}</td>
      <td>${escapeHtml(s.skoli || '')}</td>
      <td>${s.bekkur || ''}. bekkur</td>
      <td>
        <span class="user-status-badge ${s.active !== false ? 'active' : 'inactive'}">
          ${s.active !== false ? 'Virkur' : 'Óvirkur'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="table-action-btn" onclick="editStudent('${s.student_id}')">✏️</button>
          <button class="table-action-btn" onclick="viewStudentDetail('${s.student_id}')">👁️</button>
          <button class="table-action-btn danger" onclick="confirmDeleteStudent('${s.student_id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
  
  // Update count
  const countEl = document.getElementById('studentsCount');
  if (countEl) {
    countEl.textContent = `${filteredStudents.length} nemendur`;
  }
}

/**
 * Show add student modal
 */
function showAddStudentModal() {
  const modal = document.getElementById('studentModal');
  const form = document.getElementById('studentForm');
  const title = document.getElementById('studentModalTitle');
  
  if (modal && form && title) {
    title.textContent = 'Bæta við nemanda';
    form.reset();
    form.dataset.mode = 'add';
    form.dataset.studentId = '';
    modal.style.display = 'flex';
  }
}

/**
 * Edit existing student
 */
function editStudent(studentId) {
  const student = adminStudents.find(s => String(s.student_id) === String(studentId));
  if (!student) return;
  
  const modal = document.getElementById('studentModal');
  const form = document.getElementById('studentForm');
  const title = document.getElementById('studentModalTitle');
  
  if (modal && form && title) {
    title.textContent = 'Breyta nemanda';
    form.dataset.mode = 'edit';
    form.dataset.studentId = studentId;
    
    // Fill form
    document.getElementById('studentNafn').value = student.nafn || '';
    document.getElementById('studentKennitala').value = student.student_id || '';
    document.getElementById('studentSkoli').value = student.skoli || '';
    document.getElementById('studentBekkur').value = student.bekkur || '8';
    
    modal.style.display = 'flex';
  }
}

/**
 * Save student (add or edit)
 */
async function saveStudent(e) {
  e.preventDefault();
  
  const form = document.getElementById('studentForm');
  const mode = form.dataset.mode;
  const studentId = form.dataset.studentId;
  
  const data = {
    nafn: document.getElementById('studentNafn').value.trim(),
    student_id: document.getElementById('studentKennitala').value.trim(),
    skoli: document.getElementById('studentSkoli').value,
    bekkur: document.getElementById('studentBekkur').value
  };
  
  if (!data.nafn || !data.skoli) {
    alert('Vinsamlegast fylltu út nafn og skóla');
    return;
  }
  
  try {
    const action = mode === 'edit' ? 'updateStudent' : 'addStudent';
    if (mode === 'edit') {
      data.original_student_id = studentId;
    }
    
    const result = await apiPost(action, data);
    
    if (result.status === 'success') {
      closeStudentModal();
      loadAdminStudents();
    } else {
      alert(result.message || 'Villa við að vista nemanda');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að vista nemanda');
  }
}

/**
 * Confirm delete student
 */
function confirmDeleteStudent(studentId) {
  const student = adminStudents.find(s => String(s.student_id) === String(studentId));
  if (!student) return;
  
  if (confirm(`Ertu viss um að þú viljir eyða ${student.nafn}?\n\nÞetta mun eyða öllum mætingum þessa nemanda.`)) {
    deleteStudent(studentId);
  }
}

/**
 * Delete student
 */
async function deleteStudent(studentId) {
  try {
    const result = await apiPost('deleteStudent', { student_id: studentId });
    
    if (result.status === 'success') {
      loadAdminStudents();
    } else {
      alert(result.message || 'Villa við að eyða nemanda');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að eyða nemanda');
  }
}

/**
 * Close student modal
 */
function closeStudentModal() {
  const modal = document.getElementById('studentModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * View student detail in popup
 */
function viewStudentDetail(studentId) {
  showStudentPopup(studentId);
}

/**
 * Export students to CSV
 */
function exportStudentsCSV() {
  const headers = ['Nafn', 'Kennitala', 'Skóli', 'Bekkur', 'Staða'];
  const rows = filteredStudents.map(s => [
    s.nafn || '',
    s.student_id || '',
    s.skoli || '',
    s.bekkur || '',
    s.active !== false ? 'Virkur' : 'Óvirkur'
  ]);
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `nemendur_${formatDateForAPI(new Date())}.csv`;
  link.click();
}
