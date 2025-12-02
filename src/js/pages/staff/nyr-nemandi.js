/* ============================================
   STAFF - NÝR NEMANDI
   Add new student form handling
   ============================================ */

/**
 * Setup new student form
 */
function setupNyrNemandaForm() {
  const form = document.getElementById('nyrNemandaForm');
  if (form) {
    form.addEventListener('submit', handleAddStudent);
  }
}

/**
 * Handle add student form submission
 */
async function handleAddStudent(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const successMsg = document.getElementById('nyrNemandaSuccess');
  const errorMsg = document.getElementById('nyrNemandaError');
  
  // Get form data
  const data = {
    nafn: document.getElementById('nyrNafn')?.value.trim(),
    student_id: document.getElementById('nyrKennitala')?.value.trim(),
    skoli: document.getElementById('nyrSkoli')?.value,
    bekkur: document.getElementById('nyrBekkur')?.value,
    password: document.getElementById('nyrPassword')?.value || generatePin()
  };
  
  // Validate
  if (!data.nafn) {
    showFormError('Vinsamlegast sláðu inn nafn');
    return;
  }
  
  if (!data.skoli) {
    showFormError('Vinsamlegast veldu skóla');
    return;
  }
  
  // Hide messages
  if (successMsg) successMsg.style.display = 'none';
  if (errorMsg) errorMsg.style.display = 'none';
  
  // Disable button
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Bæti við...';
  }
  
  try {
    const result = await apiPost('addStudent', data);
    
    if (result.status === 'success') {
      // Show success
      if (successMsg) {
        successMsg.textContent = `✅ ${data.nafn} hefur verið bætt við! PIN: ${data.password}`;
        successMsg.style.display = 'block';
      }
      
      // Reset form
      form.reset();
      
      // Reload students list
      if (typeof loadStudents === 'function') {
        loadStudents();
      }
      
      // Auto-hide success after 5 seconds
      setTimeout(() => {
        if (successMsg) successMsg.style.display = 'none';
      }, 5000);
    } else {
      showFormError(result.message || 'Villa við að bæta við nemanda');
    }
  } catch (err) {
    console.error('Villa:', err);
    showFormError('Villa við að bæta við nemanda');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bæta við';
    }
  }
}

/**
 * Show form error message
 */
function showFormError(message) {
  const errorMsg = document.getElementById('nyrNemandaError');
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
  }
}

/**
 * Generate random 4-digit PIN
 */
function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Auto-fill school based on center
 */
function autoFillSchool() {
  const schoolSelect = document.getElementById('nyrSkoli');
  if (!schoolSelect || !centerId) return;
  
  // Map centers to primary schools
  const centerSchools = {
    'HAFNOFELO': 'NJARDVIK',
    'AKURFELO': 'AKUR',
    'STAPAFELO': 'STAPA',
    'HAALEITIFELO': 'HAALEITI'
  };
  
  const defaultSchool = centerSchools[centerId];
  if (defaultSchool) {
    schoolSelect.value = defaultSchool;
  }
}

/**
 * Validate kennitala format
 */
function validateKennitala(kt) {
  if (!kt) return true; // Optional field
  
  // Remove hyphen and spaces
  const clean = kt.replace(/[-\s]/g, '');
  
  // Should be 10 digits
  if (!/^\d{10}$/.test(clean)) {
    return false;
  }
  
  return true;
}

/**
 * Format kennitala with hyphen
 */
function formatKennitala(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length > 6) {
    value = value.slice(0, 6) + '-' + value.slice(6, 10);
  }
  
  input.value = value;
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupNyrNemandaForm();
  
  // Add kennitala formatting
  const ktInput = document.getElementById('nyrKennitala');
  if (ktInput) {
    ktInput.addEventListener('input', () => formatKennitala(ktInput));
  }
});
