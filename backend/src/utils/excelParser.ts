import * as xlsx from 'xlsx';
import { normalizeDateString } from './helpers';

export const parseDynamicSheet = (sheet: xlsx.WorkSheet, sheetName: string) => {
  const cleanSheetName = sheetName.replace(/[^\x20-\x7E]/g, '').trim().toUpperCase();

  const SKIP_SHEET_NAMES = ['READ ME', 'ITC AVAILABLE', 'ITC NOT AVAILABLE', 'ITC REVERSAL', 'ITC REJECTED'];
  if (SKIP_SHEET_NAMES.some(s => cleanSheetName === s || cleanSheetName.includes(s))) {
    return [];
  }

  const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
  let headerIndex = -1;

  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i];
    if (!row) continue;
    const rowString = row.join('').toUpperCase();
    
    const hasGstin = rowString.includes('GSTIN');
    const hasInvoice = rowString.includes('INVOICE') || rowString.includes('DOCUMENT') || rowString.includes('VOUCHER') || rowString.includes('NOTE');
    const hasTaxable = rowString.includes('TAXABLE') || rowString.includes('TAX PAID') || rowString.includes('AMOUNT');
    const hasGstinHeader = row.some((cell: any) => cell && cell.toString().toUpperCase().trim().startsWith('GSTIN'));
    
    if (hasGstinHeader && (hasInvoice || hasTaxable)) {
      let nextRowHasGstinData = false;
      for (let j = 1; j <= 3; j++) {
          const nextRow = rawData[i + j];
          if (nextRow && nextRow.some((cell: any) => {
            const s = cell ? cell.toString().trim() : '';
            return s.length === 15 && /^[0-9A-Z]+$/.test(s);
          })) {
              nextRowHasGstinData = true;
              break;
          }
      }
      if (nextRowHasGstinData || i === 0) {
        headerIndex = i;
        break;
      }
    }
  }

  if (headerIndex === -1) return [];

  const headers = rawData[headerIndex].map((h: any) => h ? h.toString().trim().replace(/[\n\r]/g, '') : `UNKNOWN_${Math.random()}`);
  const extractedRecords = [];
  
  for (let i = headerIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0 || row.every(cell => cell === "" || cell == null)) continue;

    const record: any = { _sourceSheet: sheetName };
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    
    const possibleGstins = record['GSTIN of supplier'] || record['GSTIN of Supplier'] || record['GSTIN'] || record['GSTIN/UIN'] || record['GSTIN of ECO'] || record['GSTIN of ISD'];
    const possibleInvoices = record['Invoice number'] || record['Invoice Number'] || record['Invoice No'] || record['Voucher Number'] || record['Document number'] || record['Note number'];
    
    const gstinStr = possibleGstins ? possibleGstins.toString().trim() : '';
    const invoiceStr = possibleInvoices ? possibleInvoices.toString().trim() : '';
    
    if (gstinStr.length > 0 || invoiceStr.length > 0) {
        extractedRecords.push(record);
    }
  }

  return extractedRecords;
};
