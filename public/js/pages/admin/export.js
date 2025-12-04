/* ============================================
   ADMIN EXPORT - Data export functionality
   ============================================ */

/**
 * Export attendance data to CSV
 */
async function exportAttendanceCSV() {
  const startDate = document.getElementById('exportStartDate')?.value;
  const endDate = document.getElementById('exportEndDate')?.value;
  const centerId = document.getElementById('exportCenter')?.value;
  
  try {
    showExportLoading(true);
    
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (centerId) params.center_id = centerId;
    
    const result = await apiGet('exportAttendance', params);
    
    if (!result || result.length === 0) {
      alert('Engin gögn fundust fyrir valið tímabil');
      return;
    }
    
    const headers = ['Dagsetning', 'Tími', 'Nafn', 'Kennitala', 'Skóli', 'Bekkur', 'Félagsmiðstöð', 'Dagskrárliður', 'Starfsmaður'];
    const rows = result.map(r => [
      r.date || '',
      r.time || '',
      r.nafn || '',
      r.student_id || '',
      r.skoli || '',
      r.bekkur || '',
      r.center_id || '',
      r.dagskrarlid || '',
      r.staff_id || ''
    ]);
    
    downloadCSV(headers, rows, 'maeting');
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að sækja gögn');
  } finally {
    showExportLoading(false);
  }
}

/**
 * Export midstig data to CSV
 */
async function exportMidstigCSV() {
  const startDate = document.getElementById('exportStartDate')?.value;
  const endDate = document.getElementById('exportEndDate')?.value;
  
  try {
    showExportLoading(true);
    
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const result = await apiGet('exportMidstig', params);
    
    if (!result || result.length === 0) {
      alert('Engin miðstigsgögn fundust');
      return;
    }
    
    const headers = ['Dagsetning', 'Félagsmiðstöð', 'Skóli', '5. bekkur', '6. bekkur', '7. bekkur', 'Samtals', 'Starfsmaður'];
    const rows = result.map(r => [
      r.date || '',
      r.center_id || '',
      r.skoli || '',
      r.bekkur_5 || 0,
      r.bekkur_6 || 0,
      r.bekkur_7 || 0,
      (parseInt(r.bekkur_5) || 0) + (parseInt(r.bekkur_6) || 0) + (parseInt(r.bekkur_7) || 0),
      r.staff_id || ''
    ]);
    
    downloadCSV(headers, rows, 'midstig');
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að sækja gögn');
  } finally {
    showExportLoading(false);
  }
}

/**
 * Export students to CSV
 */
async function exportStudentsCSV() {
  try {
    showExportLoading(true);
    
    const result = await apiGet('students');
    
    if (!result || result.length === 0) {
      alert('Engir nemendur fundust');
      return;
    }
    
    const headers = ['Nafn', 'Kennitala', 'Skóli', 'Bekkur', 'Staða', 'Heildarmæting'];
    const rows = result.map(r => [
      r.nafn || '',
      r.student_id || '',
      r.skoli || '',
      r.bekkur || '',
      r.active !== false ? 'Virkur' : 'Óvirkur',
      r.total_attendance || 0
    ]);
    
    downloadCSV(headers, rows, 'nemendur');
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að sækja gögn');
  } finally {
    showExportLoading(false);
  }
}

/**
 * Export statistics summary
 */
async function exportStatisticsSummary() {
  try {
    showExportLoading(true);
    
    const result = await apiGet('fullStatistics');
    
    if (!result || result.status !== 'success') {
      alert('Villa við að sækja tölfræði');
      return;
    }
    
    const data = result.data;
    
    // Create summary text
    let summary = 'FJÖRLISTINN - TÖLFRÆÐIYFIRLIT\n';
    summary += '================================\n\n';
    summary += `Dagsetning: ${formatFullDate(new Date().toISOString())}\n\n`;
    
    summary += 'HEILDARTÖLUR:\n';
    summary += `- Mæting í dag: ${data.today || 0}\n`;
    summary += `- Mæting þessa viku: ${data.week || 0}\n`;
    summary += `- Mæting þennan mánuð: ${data.month || 0}\n`;
    summary += `- Virkir nemendur: ${data.activeStudents || 0}\n\n`;
    
    if (data.byCenter) {
      summary += 'EFTIR STÖÐVUM:\n';
      Object.entries(data.byCenter).forEach(([center, stats]) => {
        summary += `\n${center}:\n`;
        summary += `  - Í dag: ${stats.today || 0}\n`;
        summary += `  - Þessi vika: ${stats.week || 0}\n`;
        summary += `  - Þessi mánuður: ${stats.month || 0}\n`;
      });
    }
    
    // Download as text file
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tolfraedi_${formatDateForAPI(new Date())}.txt`;
    link.click();
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að sækja gögn');
  } finally {
    showExportLoading(false);
  }
}

/**
 * Export for PowerBI (JSON format)
 */
async function exportForPowerBI() {
  try {
    showExportLoading(true);
    
    const [attendance, students, midstig] = await Promise.all([
      apiGet('exportAttendance'),
      apiGet('students'),
      apiGet('exportMidstig')
    ]);
    
    const data = {
      exported_at: new Date().toISOString(),
      attendance: attendance || [],
      students: students || [],
      midstig: midstig || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fjorlistinn_powerbi_${formatDateForAPI(new Date())}.json`;
    link.click();
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við að sækja gögn');
  } finally {
    showExportLoading(false);
  }
}

/**
 * Download CSV helper
 */
function downloadCSV(headers, rows, filename) {
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${formatDateForAPI(new Date())}.csv`;
  link.click();
}

/**
 * Show/hide export loading state
 */
function showExportLoading(show) {
  const btn = document.querySelector('.export-card:active, .btn:active');
  if (btn) {
    btn.disabled = show;
  }
  
  const loading = document.getElementById('exportLoading');
  if (loading) {
    loading.style.display = show ? 'flex' : 'none';
  }
}

/**
 * Trigger year-end cleanup
 */
async function triggerYearEndCleanup() {
  const confirm1 = confirm('VIÐVÖRUN: Þetta mun:\n\n1. Hækka alla nemendur um einn bekk\n2. Gera 10. bekkinga óvirka\n3. Eyða gömlum mætingagögnum\n\nErtu viss?');
  if (!confirm1) return;
  
  const confirm2 = confirm('Ertu ALVEG viss? Þetta er ekki hægt að afturkalla.');
  if (!confirm2) return;
  
  const password = prompt('Sláðu inn admin lykilorð til staðfestingar:');
  if (!password) return;
  
  try {
    const result = await apiPost('yearEndCleanup', { password });
    
    if (result.status === 'success') {
      alert('Árslokahreinsun lokið!\n\n' + result.summary);
    } else {
      alert(result.message || 'Villa við árslokahreinsun');
    }
  } catch (err) {
    console.error('Villa:', err);
    alert('Villa við árslokahreinsun');
  }
}
