/* ============================================
   API - Fetch helpers
   ============================================ */

/**
 * GET request til backend
 * @param {string} action - action nafn
 * @param {Object} params - query parameters
 * @returns {Promise<any>}
 */
async function apiGet(action, params = {}) {
  const queryParams = new URLSearchParams({ action, ...params });
  const response = await fetch(`${WEB_APP_URL}?${queryParams}`);
  return response.json();
}

/**
 * POST request til backend
 * @param {string} action - action nafn
 * @param {Object} data - body data
 * @returns {Promise<any>}
 */
async function apiPost(action, data = {}) {
  const response = await fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...data })
  });
  return response.json();
}

/**
 * Sækja centers frá API
 * @returns {Promise<Array>}
 */
async function fetchCenters() {
  try {
    const result = await apiGet('centers');
    if (result.status === 'success') {
      return result.centers;
    }
    return [];
  } catch (err) {
    console.error('Villa við að sækja stöðvar:', err);
    return [];
  }
}

/**
 * Sækja nemendur
 * @param {string} centerId - center ID (optional)
 * @returns {Promise<Array>}
 */
async function fetchStudents(centerId = null) {
  try {
    const params = centerId ? { center_id: centerId } : {};
    return await apiGet('students', params);
  } catch (err) {
    console.error('Villa við að sækja nemendur:', err);
    return [];
  }
}

/**
 * Sækja dagskrá
 * @param {string} centerId 
 * @returns {Promise<Array>}
 */
async function fetchSchedule(centerId) {
  try {
    return await apiGet('schedule', { center_id: centerId });
  } catch (err) {
    console.error('Villa við að sækja dagskrá:', err);
    return [];
  }
}

/**
 * Sækja mætingu dagsins
 * @param {string} centerId 
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>}
 */
async function fetchAttendanceToday(centerId, date = null) {
  try {
    const params = { center_id: centerId };
    if (date) params.date = date;
    const result = await apiGet('attendanceToday', params);
    
    // Handle different response formats
    if (Array.isArray(result)) return result;
    if (result.status === 'error') return [];
    if (Array.isArray(result.data)) return result.data;
    return [];
  } catch (err) {
    console.error('Villa við að sækja mætingu:', err);
    return [];
  }
}

/**
 * Sækja tölfræði
 * @param {string} centerId 
 * @returns {Promise<Object>}
 */
async function fetchStatistics(centerId) {
  try {
    return await apiGet('statistics', { center_id: centerId });
  } catch (err) {
    console.error('Villa við að sækja tölfræði:', err);
    return null;
  }
}

/**
 * Skrá mætingu
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
async function submitAttendance(data) {
  return apiPost('attendance', data);
}

/**
 * Skrá miðstigsmætingu
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
async function submitMidstigAttendance(data) {
  return apiPost('attendanceMidstig', data);
}

/**
 * Staff login
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
async function staffLogin(username, password) {
  return apiPost('staffLogin', { username, password });
}

/**
 * Admin login
 * @param {string} password 
 * @returns {Promise<Object>}
 */
async function adminLogin(password) {
  return apiPost('adminLogin', { password });
}
