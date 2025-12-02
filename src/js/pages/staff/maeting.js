/* ============================================
   MAETING - Attendance functionality
   ============================================ */

/**
 * Update date display
 */
function updateDateDisplay() {
  const displayEl = document.getElementById('dateDisplay');
  const prevBtn = document.getElementById('prevDayBtn');
  const nextBtn = document.getElementById('nextDayBtn');
  
  if (!displayEl) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(selectedDate);
  compareDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((today - compareDate) / (24 * 60 * 60 * 1000));
  
  displayEl.textContent = formatDateDisplay(selectedDate);
  displayEl.classList.toggle('is-today', diffDays === 0);
  
  // Disable next if we're on today
  if (nextBtn) nextBtn.disabled = diffDays <= 0;
  // Disable prev if we're 14 days back
  if (prevBtn) prevBtn.disabled = diffDays >= 14;
}

/**
 * Change selected date
 * @param {number} direction - -1 for previous, 1 for next
 */
function changeDate(direction) {
  const newDate = new Date(selectedDate);
  newDate.setDate(newDate.getDate() + direction);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(newDate);
  compareDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((today - compareDate) / (24 * 60 * 60 * 1000));
  
  // Don't allow going past today or more than 14 days back
  if (diffDays < 0 || diffDays > 14) return;
  
  selectedDate = newDate;
  updateDateDisplay();
  loadAttendanceToday();
}

/**
 * Load attendance for selected date
 */
async function loadAttendanceToday() {
  try {
    const dateParam = formatDateForAPI(selectedDate);
    const data = await fetchAttendanceToday(centerId, dateParam);
    
    const activityCount = document.getElementById('activityCount');
    if (activityCount) activityCount.textContent = data.length;
    
    const listEl = document.getElementById('attendanceList');
    const legendEl = document.getElementById('attendanceLegend');
    
    if (data.length === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(selectedDate);
      compareDate.setHours(0, 0, 0, 0);
      const isToday = today.getTime() === compareDate.getTime();
      const emptyMsg = isToday ? 'Engin mæting skráð í dag' : `Engin mæting skráð ${formatDateDisplay(selectedDate)}`;
      
      if (listEl) {
        listEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>${emptyMsg}</p>
          </div>
        `;
      }
      if (legendEl) legendEl.style.display = 'none';
      return;
    }
    
    // Check if new backend is in use
    const hasNewFields = data[0] && (data[0].totalCount !== undefined || data[0].icon !== undefined);
    
    if (legendEl) legendEl.style.display = hasNewFields ? 'flex' : 'none';
    
    if (listEl) {
      listEl.innerHTML = data.map(item => {
        const time = item.time || (item.timestamp ? item.timestamp.split(' ')[1]?.substring(0, 5) : '');
        
        let iconHtml = '';
        if (hasNewFields) {
          if (item.icon === '⚠️') {
            iconHtml = `<span class="attendance-icon warning">⚠️</span>`;
          } else if (item.icon === '⭐') {
            iconHtml = `<span class="attendance-icon star">⭐</span>`;
          } else if (item.icon === '🔥') {
            iconHtml = `<span class="attendance-icon streak">🔥${item.iconValue || ''}</span>`;
          } else {
            iconHtml = `<span class="attendance-icon"></span>`;
          }
        }
        
        const dagskrarlid = item.dagskrarlid || '';
        const totalCount = item.totalCount || 0;
        
        if (!hasNewFields) {
          return `
            <div class="attendance-item" onclick="showStudentPopup('${item.student_id}', '${escapeHtml(item.nafn || '')}')">
              <div class="attendance-item-left">
                <span class="attendance-time">${time}</span>
                <div>
                  <div class="attendance-name">${escapeHtml(item.nafn || '')}</div>
                  <div class="attendance-meta">${escapeHtml(item.skoli || '')} • ${item.bekkur || ''}. bekkur</div>
                </div>
              </div>
            </div>
          `;
        }
        
        return `
          <div class="attendance-item" onclick="showStudentPopup('${item.student_id}', '${escapeHtml(item.nafn || '')}')">
            <div class="attendance-item-left">
              <span class="attendance-time">${time}</span>
              <div>
                <div class="attendance-name">${escapeHtml(item.nafn || '')}</div>
                <div class="attendance-meta">${escapeHtml(item.skoli || '')} • ${item.bekkur || ''}. bekkur</div>
              </div>
            </div>
            <div class="attendance-item-right">
              ${dagskrarlid ? `<span class="attendance-dagskrarlid" title="${escapeHtml(dagskrarlid)}">${escapeHtml(dagskrarlid)}</span>` : ''}
              <span class="attendance-total">${totalCount} mæt.</span>
              ${iconHtml}
            </div>
          </div>
        `;
      }).join('');
    }
    
    // Breakdown
    const bySchool = {};
    const byGrade = {};
    data.forEach(item => {
      if (item.skoli) bySchool[item.skoli] = (bySchool[item.skoli] || 0) + 1;
      if (item.bekkur) byGrade[item.bekkur] = (byGrade[item.bekkur] || 0) + 1;
    });
    
    const breakdownEl = document.getElementById('attendanceBreakdown');
    if (breakdownEl) {
      let breakdownHtml = '';
      
      Object.entries(bySchool).forEach(([school, count]) => {
        breakdownHtml += `<div class="breakdown-item"><span class="breakdown-label">${escapeHtml(school)}:</span><span class="breakdown-value">${count}</span></div>`;
      });
      
      Object.entries(byGrade).sort().forEach(([grade, count]) => {
        breakdownHtml += `<div class="breakdown-item"><span class="breakdown-label">${grade}. bekkur:</span><span class="breakdown-value">${count}</span></div>`;
      });
      
      breakdownEl.innerHTML = breakdownHtml;
    }
  } catch (err) {
    console.error('Villa:', err);
  }
}
