import * as XLSX from 'xlsx';

/**
 * Utility to export JSON data to Excel (.xlsx) file
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column configurations: { key, label, format (optional) }
 * @param {string} sheetName - Excel sheet tab name
 * @param {string} fileName - Exported file name
 */
export const exportToExcel = (data, columns, sheetName = 'Data', fileName = 'export.xlsx') => {
  // Format the data to match sheet columns
  const formattedData = data.map(item => {
    const row = {};
    columns.forEach(col => {
      let val = item[col.key];
      if (col.format) {
        val = col.format(val, item);
      }
      row[col.label] = val;
    });
    return row;
  });

  // Create sheet & workbook
  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Trigger file download
  XLSX.writeFile(wb, fileName);
};
