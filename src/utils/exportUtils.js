/**
 * Export Utilities: CSV / Excel Export & Printable Report View
 */

import { formatNPR } from './nepaliValidators';
import { formatDisplayDate } from '../services/nepaliDate';

/**
 * Exports data to CSV/Excel with UTF-8 BOM for proper Nepali Unicode display
 */
export function exportToCSV(filename, rows, headers) {
  if (!rows || !rows.length) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [];
  // Add header row
  csvRows.push(headerLabels.map(escapeCSV).join(','));

  // Add data rows
  for (const row of rows) {
    const values = headerKeys.map(key => {
      const val = row[key];
      return escapeCSV(val);
    });
    csvRows.push(values.join(','));
  }

  // Prepend \uFEFF for Excel UTF-8 BOM
  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  let stringVal = val.toString().replace(/"/g, '""');
  return `"${stringVal}"`;
}

/**
 * Triggers clean browser print for official subsidy report
 */
export function triggerPrintReport(title = 'Nepal Agriculture Subsidy Report') {
  window.print();
}
