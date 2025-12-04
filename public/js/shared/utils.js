/* ============================================
   UTILS - Hjálparföll
   ============================================ */

/**
 * Format date for display (Í dag, Í gær, 5. jan)
 * @param {Date} date 
 * @returns {string}
 */
function formatDateDisplay(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  const diffDays = Math.round((today - compareDate) / (24 * 60 * 60 * 1000));
  
  if (diffDays === 0) return 'Í dag';
  if (diffDays === 1) return 'Í gær';
  
  const day = date.getDate();
  const months = ['jan', 'feb', 'mar', 'apr', 'maÍ', 'jÚn', 'jÚl', 'ágÚ', 'sep', 'okt', 'nÓv', 'des'];
  return `${day}. ${months[date.getMonth()]}`;
}

/**
 * Format date for API (YYYY-MM-DD)
 * @param {Date} date 
 * @returns {string}
 */
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time (handle different formats from Sheets)
 * @param {any} timeValue 
 * @returns {string}
 */
function formatTime(timeValue) {
  if (!timeValue) return '00:00';
  
  // If it's already a string like "14:00"
  if (typeof timeValue === 'string') {
    if (timeValue.match(/^\d{1,2}:\d{2}/)) {
      return timeValue.substring(0, 5);
    }
    return timeValue;
  }
  
  // If it's a Date object
  if (timeValue instanceof Date) {
    const h = timeValue.getHours().toString().padStart(2, '0');
    const m = timeValue.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  
  // If it's a number (Excel/Sheets time as fraction of day)
  if (typeof timeValue === 'number') {
    const totalMinutes = Math.round(timeValue * 24 * 60);
    const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const m = (totalMinutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
  
  return String(timeValue);
}

/**
 * Parse time to minutes since midnight
 * @param {any} timeValue 
 * @returns {number}
 */
function parseTimeToMinutes(timeValue) {
  const formatted = formatTime(timeValue);
  const [h, m] = formatted.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * Format full date (27. desember 2025)
 * @param {string} dateStr 
 * @returns {string}
 */
function formatFullDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const months = ['janÚar', 'febrÚar', 'mars', 'aprÍl', 'maÍ', 'jÚnÍ', 'jÚlÍ', 'ágÚst', 'september', 'oktÓber', 'nÓvember', 'desember'];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Get title based on attendance count
 * @param {number} count 
 * @returns {string}
 */
function getTitleForCount(count) {
  for (const title of TITLES) {
    if (count >= title.min && count <= title.max) {
      return title.name;
    }
  }
  return 'NÝliði';
}

/**
 * Get today's weekday name in Icelandic
 * @returns {string}
 */
function getTodayWeekday() {
  const dayNames = ['Sunnudagur', 'Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur'];
  return dayNames[new Date().getDay()];
}

/**
 * Update header date display
 */
function updateHeaderDate() {
  const now = new Date();
  const days = ['Sun', 'Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau'];
  const months = ['jan', 'feb', 'mar', 'apr', 'maÍ', 'jÚn', 'jÚl', 'ágÚ', 'sep', 'okt', 'nÓv', 'des'];
  
  const headerDate = document.getElementById('headerDate');
  if (headerDate) {
    headerDate.textContent = `${days[now.getDay()]} ${now.getDate()}. ${months[now.getMonth()]}`;
  }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Show element by ID
 * @param {string} id 
 */
function showElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

/**
 * Hide element by ID
 * @param {string} id 
 */
function hideElement(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/**
 * Add class to element
 * @param {string} id 
 * @param {string} className 
 */
function addClass(id, className) {
  const el = document.getElementById(id);
  if (el) el.classList.add(className);
}

/**
 * Remove class from element
 * @param {string} id 
 * @param {string} className 
 */
function removeClass(id, className) {
  const el = document.getElementById(id);
  if (el) el.classList.remove(className);
}
