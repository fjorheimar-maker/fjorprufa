/* ============================================
   NYR NEMANDI - Add new student functionality
   ============================================ */

/**
 * Setup school dropdown listener
 */
function setupSchoolDropdown() {
  const schoolSelect = document.getElementById('newStudentSchool');
  const customSchoolGroup = document.getElementById('customSchoolGroup');
  
  if (!schoolSelect || !customSchoolGroup) return;
  
  schoolSelect.addEventListener('change', () => {
    if (schoolSelect.value === 'Aðrir skólar') {
      customSchoolGroup.style.display = 'block';
    } else {
      customSchoolGroup.style.display = 'none';
      document.getElementById('customSchoolName').value = '';
    }
  });
}

/**
 * Add new student
 */
async function addNewStudent() {
  const nameInput = document.getElementById('newStudentName');
  const schoolSelect = document.getElementById('newStudentSchool');
  const customSchoolInput = document.getElementById('customSchoolName');
  const gradeSelect = document.getElementById('newStudentGrade');
  const successDiv = document.getElementById('addStudentSuccess');
  const passwordSpan = document.getElementById('newStudentPassword');
  
  // Validation
  const nafn = nameInput?.value?.trim();
  let skoli = schoolSelect?.value;
  const bekkur = gradeSelect?.value;
  
  if (!nafn) {
    alert('Vinsamlegast sláðu inn nafn');
    return;
  }
  
  if (!skoli) {
    alert('Vinsamlegast veldu skóla');
    return;
  }
  
  // Use custom school name if "Aðrir skólar" selected
  if (skoli === 'Aðrir skólar') {
    skoli = customSchoolInput?.value?.trim();
    if (!skoli) {
      alert('Vinsamlegast sláðu inn heiti skóla');
      return;
    }
  }
  
  try {
    const response = await apiPost('addStudent', {
      nafn: nafn,
      skoli: skoli,
      bekkur: bekkur,
      center_id: centerId
    });
    
    if (response.status === 'success') {
      // Show success message with password
      if (successDiv) {
        successDiv.style.display = 'block';
        if (passwordSpan) {
          passwordSpan.textContent = response.password || response.student?.password || '----';
        }
      }
      
      // Clear form
      nameInput.value = '';
      schoolSelect.value = '';
      if (customSchoolInput) customSchoolInput.value = '';
      document.getElementById('customSchoolGroup').style.display = 'none';
      
      // Reload students list
      if (typeof loadStudents === 'function') {
        loadStudents();
      }
      
      // Hide success after 10 seconds
      setTimeout(() => {
        if (successDiv) successDiv.style.display = 'none';
      }, 10000);
    } else {
      alert(response.message || 'Villa við að bæta við nemanda');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að bæta við nemanda');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', setupSchoolDropdown);
