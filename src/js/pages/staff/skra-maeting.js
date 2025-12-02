/* ============================================
   SKRA-MAETING - Manual attendance registration
   ============================================ */

/**
 * Initialize the skrá mætingu form
 */
function initSkraForm() {
  const today = new Date();
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  const dateInput = document.getElementById('skraDagsetning');
  if (!dateInput) return;
  
  dateInput.value = today.toISOString().split('T')[0];
  dateInput.min = twoMonthsAgo.toISOString().split('T')[0];
  dateInput.max = today.toISOString().split('T')[0];
  
  dateInput.addEventListener('change', loadVaktirForDate);
  
  loadVaktirForDate();
  setupAutocomplete();
  
  // Event listener for dropdown
  const dagskrarlidSelect = document.getElementById('skraDagskrarlid');
  if (dagskrarlidSelect) {
    dagskrarlidSelect.addEventListener('change', updateSkraButton);
  }
  
  // Event listener for button
  const btnSkra = document.getElementById('btnSkraMaeting');
  if (btnSkra) {
    btnSkra.addEventListener('click', skraMaetingu);
  }
}

/**
 * Load schedule items for selected date
 */
async function loadVaktirForDate() {
  const dateInput = document.getElementById('skraDagsetning');
  const select = document.getElementById('skraDagskrarlid');
  const selectedDateStr = dateInput?.value;
  
  if (!selectedDateStr || !select) return;
  
  try {
    const schedule = await fetchSchedule(centerId);
    
    // Get weekday for selected date
    const selectedDate = new Date(selectedDateStr + 'T12:00:00');
    const dayNames = ['Sunnudagur', 'Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur'];
    const weekday = dayNames[selectedDate.getDay()];
    
    // Filter schedule items for this weekday
    const items = schedule.filter(item => item.vikudagur === weekday);
    
    select.innerHTML = '<option value="">Veldu dagskrárlið...</option>' +
      items.map(item => `<option value="${escapeHtml(item.heiti)}">${escapeHtml(item.heiti)} (${formatTime(item.byrjar)} - ${formatTime(item.endar)})</option>`).join('');
    
    updateSkraButton();
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Setup autocomplete for student input
 */
function setupAutocomplete() {
  const input = document.getElementById('skraNemandi');
  const results = document.getElementById('autocompleteResults');
  
  if (!input || !results) return;
  
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    
    if (query.length < 2) {
      results.classList.remove('show');
      return;
    }
    
    const matches = allStudents.filter(s => 
      s.nafn?.toLowerCase().includes(query) ||
      String(s.student_id).includes(query)
    ).slice(0, 10);
    
    if (matches.length === 0) {
      results.innerHTML = '<div class="autocomplete-item">Enginn nemandi fannst</div>';
      results.classList.add('show');
      return;
    }
    
    results.innerHTML = matches.map(s => `
      <div class="autocomplete-item" onclick="selectStudentForSkra('${s.student_id}', '${escapeHtml(s.nafn)}', '${escapeHtml(s.skoli || '')}', '${s.bekkur || ''}')">
        <div class="autocomplete-name">${escapeHtml(s.nafn)}</div>
        <div class="autocomplete-meta">${escapeHtml(s.skoli || '')} • ${s.bekkur || ''}. bekkur</div>
      </div>
    `).join('');
    
    results.classList.add('show');
  });
  
  // Hide on click outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('show');
    }
  });
}

/**
 * Select student for registration
 */
function selectStudentForSkra(studentId, nafn, skoli, bekkur) {
  const input = document.getElementById('skraNemandi');
  const results = document.getElementById('autocompleteResults');
  const container = document.getElementById('selectedStudent');
  
  if (input) input.value = '';
  if (results) results.classList.remove('show');
  
  // Check if already selected
  if (selectedStudents.find(s => s.id === studentId)) {
    return;
  }
  
  selectedStudents.push({ id: studentId, nafn, skoli, bekkur });
  renderSelectedStudents();
  updateSkraButton();
}

/**
 * Render selected students list
 */
function renderSelectedStudents() {
  const container = document.getElementById('selectedStudent');
  if (!container) return;
  
  if (selectedStudents.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = `
    <div class="selected-students-list">
      ${selectedStudents.map(s => `
        <div class="selected-student">
          <div class="selected-student-info">
            <div class="selected-student-name">${escapeHtml(s.nafn)}</div>
            <div class="selected-student-meta">${escapeHtml(s.skoli)} • ${s.bekkur}. bekkur</div>
          </div>
          <button class="selected-student-remove" onclick="removeSelectedStudent('${s.id}')">&times;</button>
        </div>
      `).join('')}
    </div>
    <div class="selected-students-count">${selectedStudents.length} nemandi/nemendur valdir</div>
    ${selectedStudents.length > 1 ? '<button class="clear-all-btn" onclick="clearAllSelected()">Hreinsa alla</button>' : ''}
  `;
}

/**
 * Remove a selected student
 * @param {string} studentId 
 */
function removeSelectedStudent(studentId) {
  selectedStudents = selectedStudents.filter(s => s.id !== studentId);
  renderSelectedStudents();
  updateSkraButton();
}

/**
 * Clear all selected students
 */
function clearAllSelected() {
  selectedStudents = [];
  renderSelectedStudents();
  updateSkraButton();
}

/**
 * Update skrá button state
 */
function updateSkraButton() {
  const btn = document.getElementById('btnSkraMaeting');
  const dagskrarlid = document.getElementById('skraDagskrarlid')?.value;
  
  if (btn) {
    btn.disabled = !dagskrarlid || selectedStudents.length === 0;
  }
}

/**
 * Submit attendance
 */
async function skraMaetingu() {
  const dateInput = document.getElementById('skraDagsetning');
  const dagskrarlid = document.getElementById('skraDagskrarlid')?.value;
  const msgContainer = document.getElementById('skraMessage');
  
  if (!dateInput || !dagskrarlid || selectedStudents.length === 0) return;
  
  const date = dateInput.value;
  
  try {
    let successCount = 0;
    let errorMessages = [];
    
    for (const student of selectedStudents) {
      const result = await submitAttendance({
        student_id: student.id,
        center_id: centerId,
        dagskrarlid: dagskrarlid,
        staff_id: currentUser?.username || 'unknown',
        source: 'staff',
        date: date
      });
      
      if (result.status === 'success') {
        successCount++;
        
        // Add to nylegaSkrad
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        nylegaSkrad.unshift({
          nafn: student.nafn,
          skoli: student.skoli,
          bekkur: student.bekkur,
          time: time
        });
      } else {
        errorMessages.push(`${student.nafn}: ${result.message || 'Villa'}`);
      }
    }
    
    // Show message
    if (msgContainer) {
      if (successCount > 0 && errorMessages.length === 0) {
        msgContainer.innerHTML = `<div class="skra-success">✅ ${successCount} mæting(ar) skráðar!</div>`;
      } else if (errorMessages.length > 0) {
        msgContainer.innerHTML = `<div class="skra-warning">⚠️ ${successCount} skráðar, ${errorMessages.length} villur:<br>${errorMessages.join('<br>')}</div>`;
      }
      
      setTimeout(() => { msgContainer.innerHTML = ''; }, 5000);
    }
    
    // Clear selections
    selectedStudents = [];
    renderSelectedStudents();
    updateSkraButton();
    renderNylegaSkrad();
    
    // Reload attendance list
    loadAttendanceToday();
  } catch (err) {
    console.error('Villa:', err);
    if (msgContainer) {
      msgContainer.innerHTML = '<div class="skra-error">❌ Villa við að skrá mætingu</div>';
    }
  }
}

/**
 * Render nýlega skráð list
 */
function renderNylegaSkrad() {
  const container = document.getElementById('nylegaSkradList');
  if (!container) return;
  
  if (nylegaSkrad.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.9rem;">Engar skráningar enn...</p>';
    return;
  }
  
  container.innerHTML = nylegaSkrad.slice(0, 10).map(item => `
    <div class="nylega-item">
      <span class="nylega-time">${item.time}</span>
      <div class="nylega-info">
        <div class="nylega-name">${escapeHtml(item.nafn)}</div>
        <div class="nylega-meta">${escapeHtml(item.skoli)} • ${item.bekkur}. bekkur</div>
      </div>
      <span class="nylega-check">✓</span>
    </div>
  `).join('');
}

/**
 * Open kiosk mode
 */
function openKioskMode() {
  window.location.href = `kiosk.html?center=${centerId}`;
}
