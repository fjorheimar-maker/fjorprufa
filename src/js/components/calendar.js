/* ============================================
   CALENDAR - Calendar component
   ============================================ */

const centerColors = {
  'HAFNOFELO': 'center-hafno',
  'AKURFELO': 'center-akur',
  'STAPAFELO': 'center-stapa',
  'HAALEITIFELO': 'center-haaleiti'
};

const centerNames = {
  'HAFNOFELO': 'Hafnó',
  'AKURFELO': 'Akur',
  'STAPAFELO': 'Stapa',
  'HAALEITIFELO': 'Háaleiti'
};

/**
 * Load calendar data
 */
async function loadCalendar() {
  const loading = document.getElementById('calendarLoading');
  const grid = document.getElementById('calendarGrid');
  
  if (!grid) return;
  
  if (loading) loading.classList.add('active');
  grid.style.display = 'none';
  
  try {
    const response = await apiGet('calendarMonth', {
      year: currentCalendarYear,
      month: currentCalendarMonth
    });
    
    if (response.status === 'success') {
      calendarData = response;
      renderCalendar(response.calendar);
      updateCalendarTitle();
    } else {
      console.error('Villa við að sækja dagatal:', response.message);
    }
  } catch (error) {
    console.error('Villa:', error);
  } finally {
    if (loading) loading.classList.remove('active');
    grid.style.display = 'grid';
  }
}

/**
 * Render calendar grid
 * @param {Array} calendar 
 */
function renderCalendar(calendar) {
  const grid = document.getElementById('calendarGrid');
  if (!grid || !calendar) return;
  
  grid.innerHTML = '';
  
  calendar.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    // Staff = readonly, others clickable
    if (currentUserRole === 'staff') {
      dayEl.classList.add('readonly');
    } else {
      dayEl.onclick = () => goToAttendanceForDate(day.date);
    }
    
    // Day number
    const numberEl = document.createElement('div');
    numberEl.className = 'calendar-day-number';
    numberEl.textContent = day.day;
    dayEl.appendChild(numberEl);
    
    // Centers
    for (let cid in day.centers) {
      const centerData = day.centers[cid];
      const centerEl = document.createElement('div');
      centerEl.className = 'calendar-center';
      
      if (centerData.closed) {
        centerEl.classList.add('closed');
        centerEl.textContent = 'LOKAÐ';
        if (centerData.athugasemd) {
          centerEl.title = centerData.athugasemd;
        }
      } else {
        const nameEl = document.createElement('div');
        nameEl.className = 'calendar-center-name ' + (centerColors[cid] || '');
        nameEl.textContent = centerNames[cid] || cid;
        
        const countEl = document.createElement('div');
        countEl.className = 'calendar-center-count';
        countEl.textContent = centerData.count;
        
        centerEl.appendChild(nameEl);
        centerEl.appendChild(countEl);
      }
      
      dayEl.appendChild(centerEl);
    }
    
    grid.appendChild(dayEl);
  });
}

/**
 * Update calendar title
 */
function updateCalendarTitle() {
  const title = document.getElementById('calendarTitle');
  if (title) {
    title.textContent = `${monthNames[currentCalendarMonth - 1]} ${currentCalendarYear}`;
  }
}

/**
 * Go to previous month
 */
function prevMonth() {
  currentCalendarMonth--;
  if (currentCalendarMonth < 1) {
    currentCalendarMonth = 12;
    currentCalendarYear--;
  }
  loadCalendar();
}

/**
 * Go to next month
 */
function nextMonth() {
  currentCalendarMonth++;
  if (currentCalendarMonth > 12) {
    currentCalendarMonth = 1;
    currentCalendarYear++;
  }
  loadCalendar();
}

/**
 * Navigate to attendance for a specific date
 * @param {string} date - YYYY-MM-DD
 */
function goToAttendanceForDate(date) {
  selectedDate = new Date(date + 'T12:00:00');
  updateDateDisplay();
  loadAttendanceToday();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Switch to mæting tab
  switchToTab('maeting');
}

// Setup calendar navigation buttons
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  
  if (prevBtn) prevBtn.onclick = prevMonth;
  if (nextBtn) nextBtn.onclick = nextMonth;
});
