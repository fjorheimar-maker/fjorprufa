/* ============================================
   AUTOCOMPLETE COMPONENT
   ============================================ */

/**
 * Setup autocomplete for student search
 * @param {string} inputId - Input element ID
 * @param {string} resultsId - Results container ID
 * @param {Function} onSelect - Callback when student is selected
 */
function setupAutocomplete(inputId = 'skraNemandi', resultsId = 'autocompleteResults', onSelect = null) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  
  if (!input || !results) return;
  
  let selectedIndex = -1;
  
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    
    if (query.length < 2) {
      results.classList.remove('show');
      results.innerHTML = '';
      return;
    }
    
    // Filter students
    const matches = allStudents.filter(s => {
      const nafn = (s.nafn || '').toLowerCase();
      const kennitala = String(s.student_id || '');
      return nafn.includes(query) || kennitala.includes(query);
    }).slice(0, 10);
    
    if (matches.length === 0) {
      results.innerHTML = '<div class="autocomplete-item" style="color: var(--color-text-muted);">Enginn nemandi fannst</div>';
      results.classList.add('show');
      return;
    }
    
    results.innerHTML = matches.map((s, i) => `
      <div class="autocomplete-item" data-index="${i}" data-student-id="${s.student_id}">
        <div class="autocomplete-name">${escapeHtml(s.nafn)}</div>
        <div class="autocomplete-meta">${escapeHtml(s.skoli || '')} • ${s.bekkur || ''}. bekkur</div>
      </div>
    `).join('');
    
    results.classList.add('show');
    selectedIndex = -1;
    
    // Add click handlers
    results.querySelectorAll('.autocomplete-item[data-student-id]').forEach(item => {
      item.addEventListener('click', () => {
        const studentId = item.dataset.studentId;
        const student = matches.find(s => String(s.student_id) === studentId);
        if (student) {
          selectStudent(student, inputId, resultsId, onSelect);
        }
      });
    });
  });
  
  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.autocomplete-item[data-student-id]');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items, selectedIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].click();
      }
    } else if (e.key === 'Escape') {
      results.classList.remove('show');
    }
  });
  
  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('show');
    }
  });
}

/**
 * Update selection highlight
 */
function updateSelection(items, index) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === index);
  });
  
  if (items[index]) {
    items[index].scrollIntoView({ block: 'nearest' });
  }
}

/**
 * Select a student from autocomplete
 */
function selectStudent(student, inputId, resultsId, onSelect) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  
  // For multi-select (skrá mætingu)
  if (selectedStudents !== undefined && Array.isArray(selectedStudents)) {
    // Check if already selected
    if (!selectedStudents.find(s => s.student_id === student.student_id)) {
      selectedStudents.push(student);
      renderSelectedStudents();
      updateSkraButton();
    }
    
    input.value = '';
    results.classList.remove('show');
  } else {
    // Single select
    input.value = student.nafn;
    results.classList.remove('show');
    
    if (onSelect) {
      onSelect(student);
    }
  }
}

/**
 * Render selected students list (for skrá mætingu)
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
            <div class="selected-student-meta">${escapeHtml(s.skoli || '')} • ${s.bekkur || ''}. bekkur</div>
          </div>
          <button class="selected-student-remove" onclick="removeSelectedStudent('${s.student_id}')" title="Fjarlægja">×</button>
        </div>
      `).join('')}
    </div>
    <div class="selected-students-count">${selectedStudents.length} nemandi/nemendur valdir</div>
    ${selectedStudents.length > 1 ? '<button class="clear-all-btn" onclick="clearAllSelected()">Hreinsa alla</button>' : ''}
  `;
}

/**
 * Remove a selected student
 */
function removeSelectedStudent(studentId) {
  selectedStudents = selectedStudents.filter(s => String(s.student_id) !== String(studentId));
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
