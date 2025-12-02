/* ============================================
   ADMIN STILLINGAR - Settings management
   ============================================ */

let settingsData = {};

/**
 * Load settings
 */
async function loadSettings() {
  try {
    const result = await apiGet('settings');
    if (result.status === 'success') {
      settingsData = result.settings || {};
      renderSettings();
    }
  } catch (err) {
    console.error('Villa við að sækja stillingar:', err);
  }
}

/**
 * Render settings form
 */
function renderSettings() {
  // Academic year dates
  const startDate = document.getElementById('settingYearStart');
  const endDate = document.getElementById('settingYearEnd');
  
  if (startDate && settingsData.academic_year_start) {
    startDate.value = settingsData.academic_year_start;
  }
  if (endDate && settingsData.academic_year_end) {
    endDate.value = settingsData.academic_year_end;
  }
  
  // Toggle settings
  setToggle('settingLeaderboard', settingsData.show_leaderboard !== false);
  setToggle('settingGamification', settingsData.enable_gamification !== false);
  setToggle('settingMidstig', settingsData.enable_midstig !== false);
  setToggle('settingKiosk', settingsData.enable_kiosk !== false);
}

/**
 * Set toggle value
 */
function setToggle(id, value) {
  const toggle = document.getElementById(id);
  if (toggle) {
    toggle.checked = value;
  }
}

/**
 * Save academic year settings
 */
async function saveAcademicYear() {
  const startDate = document.getElementById('settingYearStart')?.value;
  const endDate = document.getElementById('settingYearEnd')?.value;
  
  if (!startDate || !endDate) {
    alert('Vinsamlegast veldu bæði upphafs- og lokadagsetningu');
    return;
  }
  
  try {
    const result = await apiPost('updateSettings', {
      academic_year_start: startDate,
      academic_year_end: endDate
    });
    
    if (result.status === 'success') {
      alert('Skólaár vistað!');
      settingsData.academic_year_start = startDate;
      settingsData.academic_year_end = endDate;
    } else {
      alert(result.message || 'Villa við að vista');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að vista stillingar');
  }
}

/**
 * Toggle a setting
 */
async function toggleSetting(settingName, toggleId) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return;
  
  const value = toggle.checked;
  
  try {
    const data = {};
    data[settingName] = value;
    
    const result = await apiPost('updateSettings', data);
    
    if (result.status === 'success') {
      settingsData[settingName] = value;
    } else {
      // Revert toggle on error
      toggle.checked = !value;
      alert(result.message || 'Villa við að vista');
    }
  } catch (err) {
    console.error('Villa:', err);
    toggle.checked = !value;
    alert('Villa við að vista stillingar');
  }
}

/**
 * Load schedule settings
 */
async function loadScheduleSettings() {
  try {
    const result = await apiGet('schedule');
    const scheduleList = document.getElementById('scheduleList');
    
    if (!scheduleList) return;
    
    if (!result || result.length === 0) {
      scheduleList.innerHTML = '<p style="color: var(--color-text-muted);">Engin dagskrá skráð</p>';
      return;
    }
    
    // Group by center
    const byCenter = {};
    result.forEach(item => {
      const cid = item.center_id || 'unknown';
      if (!byCenter[cid]) byCenter[cid] = [];
      byCenter[cid].push(item);
    });
    
    const centerNames = {
      'HAFNOFELO': 'Fjör Hafnó',
      'STAPAFELO': 'Fjör Stapa',
      'AKURFELO': 'Fjör Akur',
      'HAALEITIFELO': 'Fjör Háaleiti'
    };
    
    scheduleList.innerHTML = Object.entries(byCenter).map(([centerId, items]) => `
      <div class="settings-section">
        <div class="settings-section-title">${centerNames[centerId] || centerId}</div>
        ${items.map(item => `
          <div class="settings-row">
            <div>
              <div class="settings-label">${escapeHtml(item.heiti || '')}</div>
              <div class="settings-description">${item.vikudagur} ${item.byrjar} - ${item.endar}</div>
            </div>
            <div class="table-actions">
              <button class="table-action-btn" onclick="editScheduleItem('${item.id}')">✏️</button>
              <button class="table-action-btn danger" onclick="deleteScheduleItem('${item.id}')">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  } catch (err) {
    console.error('Villa:', err);
  }
}

/**
 * Show add schedule modal
 */
function showAddScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    document.getElementById('scheduleForm')?.reset();
    modal.style.display = 'flex';
  }
}

/**
 * Close schedule modal
 */
function closeScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Save schedule item
 */
async function saveScheduleItem(e) {
  e.preventDefault();
  
  const data = {
    center_id: document.getElementById('scheduleCenter').value,
    vikudagur: document.getElementById('scheduleDay').value,
    heiti: document.getElementById('scheduleHeiti').value.trim(),
    byrjar: document.getElementById('scheduleStart').value,
    endar: document.getElementById('scheduleEnd').value,
    tegund: document.getElementById('scheduleType').value
  };
  
  if (!data.heiti || !data.center_id) {
    alert('Vinsamlegast fylltu út alla reiti');
    return;
  }
  
  try {
    const result = await apiPost('addSchedule', data);
    
    if (result.status === 'success') {
      closeScheduleModal();
      loadScheduleSettings();
    } else {
      alert(result.message || 'Villa við að vista');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að vista dagskrá');
  }
}

/**
 * Delete schedule item
 */
async function deleteScheduleItem(id) {
  if (!confirm('Ertu viss um að þú viljir eyða þessum dagskrárlið?')) return;
  
  try {
    const result = await apiPost('deleteSchedule', { id });
    
    if (result.status === 'success') {
      loadScheduleSettings();
    } else {
      alert(result.message || 'Villa við að eyða');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að eyða dagskrá');
  }
}
