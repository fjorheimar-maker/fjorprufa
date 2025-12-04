/* ============================================
   INDEX PAGE - Main entry point
   ============================================ */

// State
let selectedCenter = null;
let selectedCenterName = '';
let deferredPrompt = null;

/**
 * Show view by ID
 * @param {string} viewId 
 */
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId)?.classList.add('active');
}

/**
 * Initialize page
 */
async function init() {
  const grid = document.getElementById('centersGrid');
  if (!grid) return;

  try {
    const response = await fetch(`${WEB_APP_URL}?action=centers`);
    const centers = await response.json();

    if (Array.isArray(centers) && centers.length > 0) {
      renderCenters(grid, centers);
    } else {
      renderCentersFromConfig(grid);
    }
  } catch (err) {
    console.error('Villa:', err);
    renderCentersFromConfig(grid);
  }
}

/**
 * Render centers from API
 * @param {Element} container 
 * @param {Array} centers 
 */
function renderCenters(container, centers) {
  let html = '';

  centers.forEach(center => {
    const config = CENTER_STYLES[center.center_id] || { colorClass: 'purple', schools: '' };
    
    html += `
      <div class="center-card ${config.colorClass}" style="--card-color: ${config.color};" onclick="selectCenter('${center.center_id}', '${center.nafn}')">
        <div class="center-card-content">
          <div class="center-card-name">${center.nafn}</div>
          <div class="center-card-schools">${config.schools}</div>
        </div>
        <div class="center-card-arrow">→</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Render centers from config (fallback)
 * @param {Element} container 
 */
function renderCentersFromConfig(container) {
  const defaultCenters = [
    { center_id: 'HAFNOFELO', nafn: 'Fjör Hafnó' },
    { center_id: 'STAPAFELO', nafn: 'Fjör Stapa' },
    { center_id: 'AKURFELO', nafn: 'Fjör Akur' },
    { center_id: 'HAALEITIFELO', nafn: 'Fjör Háaleiti' }
  ];

  renderCenters(container, defaultCenters);
}

/**
 * Select a center
 * @param {string} centerId 
 * @param {string} centerName 
 */
function selectCenter(cid, cname) {
  selectedCenter = cid;
  selectedCenterName = cname;
  
  // Update color
  const config = CENTER_STYLES[cid];
  if (config) {
    document.documentElement.style.setProperty('--center-color', config.color);
  }

  document.getElementById('selectedCenterName').textContent = cname;
  showView('roleSelectView');
}

/**
 * Go back to center selection
 */
function goBack() {
  selectedCenter = null;
  selectedCenterName = '';
  showView('centerSelectView');
}

/**
 * Navigate to role page
 * @param {string} role 
 */
function goToRole(role) {
  if (!selectedCenter) return;

  const urls = {
    'nemandi': `/nemandi/?center=${selectedCenter}`,
    'starfsmadur': `/starfsmadur/?center=${selectedCenter}`,
    'deildarstjori': `/deildarstjori/?center=${selectedCenter}`,
    'admin': `/admin/?center=${selectedCenter}`
  };

  window.location.href = urls[role];
}

// PWA Install
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install prompt after 3 seconds
  setTimeout(() => {
    if (deferredPrompt && !localStorage.getItem('installDismissed')) {
      document.getElementById('installPrompt')?.classList.add('show');
    }
  }, 3000);
});

document.getElementById('installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  deferredPrompt = null;
  document.getElementById('installPrompt')?.classList.remove('show');
});

document.getElementById('installClose')?.addEventListener('click', () => {
  document.getElementById('installPrompt')?.classList.remove('show');
  localStorage.setItem('installDismissed', 'true');
});

// Start - bíða eftir að DOM og önnur scripts hafi loadað
document.addEventListener('DOMContentLoaded', init);
