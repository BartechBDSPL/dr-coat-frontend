import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  fileName: string
): void => {
  const columns = [
    'RowNo',
    'PlantCode',
    'AppType',
    'Activity',
    'Action',
    'OldData',
    'NewData',
    'Remark',
    'UserId',
    'ActivityDate',
  ];

  const ws = XLSX.utils.json_to_sheet(data, { header: columns });

  const colWidths = columns.map(col => ({ wch: Math.max(col.length, 15) }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail Report');

  const excelBuffer = XLSX.write(wb, { bookType: 'xls', type: 'array' });
  const data_blob = new Blob([excelBuffer], {
    type: 'application/vnd.ms-excel',
  });

  saveAs(data_blob, `${fileName}.xls`);
};
