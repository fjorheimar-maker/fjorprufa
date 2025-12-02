/* ============================================
   TABS - Tab switching functionality
   ============================================ */

/**
 * Setup tab click handlers
 */
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked tab
      tab.classList.add('active');
      const tabContent = document.getElementById('tab-' + tab.dataset.tab);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Switch to a specific tab
 * @param {string} tabId - The tab ID (without 'tab-' prefix)
 */
function switchToTab(tabId) {
  const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (tabBtn) {
    tabBtn.click();
  }
}
