/* ============================================
   STATE - Shared state variables
   ============================================ */

// Center info
let centerId = null;
let centerName = '';

// User info
let currentUser = null;

// Data
let students = [];
let allStudents = [];
let scheduleData = [];
let activityData = null;

// Selected date for attendance view
let selectedDate = new Date();

// Skrá mætingu state
let selectedStudents = [];
let nylegaSkrad = [];

// Calendar state
let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth() + 1;
let calendarData = null;

// User role
let currentUserRole = 'staff'; // 'staff', 'deildarstjori', 'admin'

/**
 * Initialize center from URL params
 * @returns {string|null} centerId or null
 */
function initCenterFromUrl() {
  const params = new URLSearchParams(window.location.search);
  centerId = params.get('center');
  
  if (centerId && CENTER_STYLES[centerId]) {
    const style = CENTER_STYLES[centerId];
    document.documentElement.style.setProperty('--center-color', style.color);
    centerName = style.name;
  }
  
  return centerId;
}

/**
 * Set center color CSS variable
 * @param {string} cid - center ID
 */
function setCenterColor(cid) {
  const style = CENTER_STYLES[cid];
  if (style) {
    document.documentElement.style.setProperty('--center-color', style.color);
    centerName = style.name;
  }
}

/**
 * Load center colors dynamically from API
 */
async function loadCenterColors() {
  try {
    const result = await apiGet('centers');
    
    if (result.status === 'success') {
      const style = document.createElement('style');
      let css = '';
      
      result.centers.forEach(center => {
        const className = center.center_id.toLowerCase().replace('felo', '');
        css += `.center-${className} { color: ${center.litur}; }\n`;
      });
      
      style.textContent = css;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.error('Villa við að sækja liti:', error);
  }
}
