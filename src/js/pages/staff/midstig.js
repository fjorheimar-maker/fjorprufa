/* ============================================
   MIDSTIG - Middle school attendance
   ============================================ */

/**
 * Setup midstig table with schools
 */
function setupMidstigTable() {
  const tbody = document.getElementById('midstigTableBody');
  if (!tbody) return;
  
  // Get schools for this center from config
  const schools = getSchoolsForCenter(centerId);
  
  tbody.innerHTML = schools.map(school => `
    <tr data-school="${school}">
      <td>${escapeHtml(school)}</td>
      <td><input type="number" class="midstig-input" data-grade="5" min="0" value="0" onchange="updateMidstigTotals()" /></td>
      <td><input type="number" class="midstig-input" data-grade="6" min="0" value="0" onchange="updateMidstigTotals()" /></td>
      <td><input type="number" class="midstig-input" data-grade="7" min="0" value="0" onchange="updateMidstigTotals()" /></td>
      <td class="total">0</td>
    </tr>
  `).join('');
  
  updateMidstigTotals();
  loadPreviousMidstig();
}

/**
 * Get schools for a center
 * @param {string} cid 
 * @returns {Array}
 */
function getSchoolsForCenter(cid) {
  const schoolMap = {
    'HAFNOFELO': ['Myllubakkaskóli', 'Njarðvíkurskóli', 'Heiðarskóli', 'Holtaskóli'],
    'AKURFELO': ['Akurskóli'],
    'STAPAFELO': ['Stapaskóli'],
    'HAALEITIFELO': ['Háleitisskóli']
  };
  return schoolMap[cid] || ['Akurskóli'];
}

/**
 * Update midstig totals
 */
function updateMidstigTotals() {
  const tbody = document.getElementById('midstigTableBody');
  if (!tbody) return;
  
  let total5 = 0, total6 = 0, total7 = 0;
  
  tbody.querySelectorAll('tr').forEach(row => {
    const inputs = row.querySelectorAll('.midstig-input');
    const rowTotal = Array.from(inputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
    row.querySelector('.total').textContent = rowTotal;
    
    inputs.forEach(input => {
      const grade = input.dataset.grade;
      const val = parseInt(input.value) || 0;
      if (grade === '5') total5 += val;
      if (grade === '6') total6 += val;
      if (grade === '7') total7 += val;
    });
  });
  
  const t5 = document.getElementById('midstigTotal5');
  const t6 = document.getElementById('midstigTotal6');
  const t7 = document.getElementById('midstigTotal7');
  const tAll = document.getElementById('midstigTotalAll');
  
  if (t5) t5.textContent = total5;
  if (t6) t6.textContent = total6;
  if (t7) t7.textContent = total7;
  if (tAll) tAll.textContent = total5 + total6 + total7;
}

/**
 * Submit midstig attendance
 */
async function submitMidstig() {
  const tbody = document.getElementById('midstigTableBody');
  if (!tbody) return;
  
  const entries = [];
  
  tbody.querySelectorAll('tr').forEach(row => {
    const school = row.dataset.school;
    const inputs = row.querySelectorAll('.midstig-input');
    
    const bekkur5 = parseInt(inputs[0].value) || 0;
    const bekkur6 = parseInt(inputs[1].value) || 0;
    const bekkur7 = parseInt(inputs[2].value) || 0;
    
    if (bekkur5 > 0 || bekkur6 > 0 || bekkur7 > 0) {
      entries.push({
        skoli: school,
        bekkur_5: bekkur5,
        bekkur_6: bekkur6,
        bekkur_7: bekkur7
      });
    }
  });
  
  if (entries.length === 0) {
    alert('Vinsamlegast sláðu inn mætingartölur');
    return;
  }
  
  try {
    for (const entry of entries) {
      await submitMidstigAttendance({
        center_id: centerId,
        skoli: entry.skoli,
        bekkur_5: entry.bekkur_5,
        bekkur_6: entry.bekkur_6,
        bekkur_7: entry.bekkur_7,
        staff_id: currentUser?.username || 'unknown'
      });
    }
    
    alert('Miðstigsmæting skráð!');
    
    // Reset inputs
    tbody.querySelectorAll('.midstig-input').forEach(input => input.value = '0');
    updateMidstigTotals();
    loadPreviousMidstig();
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að skrá miðstigsmætingu');
  }
}

/**
 * Load previous midstig entries for today
 */
async function loadPreviousMidstig() {
  try {
    const today = formatDateForAPI(new Date());
    const data = await apiGet('midstigToday', { center_id: centerId, date: today });
    
    const container = document.getElementById('previousMidstig');
    if (!container) return;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<p class="previous-entry">Engar fyrri skráningar í dag</p>';
      return;
    }
    
    container.innerHTML = data.map(entry => `
      <div class="previous-entry">
        ${escapeHtml(entry.skoli)}: ${entry.bekkur_5 || 0} + ${entry.bekkur_6 || 0} + ${entry.bekkur_7 || 0} = ${(entry.bekkur_5 || 0) + (entry.bekkur_6 || 0) + (entry.bekkur_7 || 0)}
        <span style="color: var(--color-text-muted);">(${entry.timestamp?.split(' ')[1] || ''})</span>
      </div>
    `).join('');
  } catch (err) {
    console.error('Villa:', err);
  }
}
