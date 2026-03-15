import { Request, Response } from 'express';
import ExcelJS from 'exceljs';

const HDR = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FF4F46E5' } }, alignment: { horizontal: 'center' as const } };

function applyHeader(sheet: ExcelJS.Worksheet, cols: { header: string; key: string; width: number }[]) {
  sheet.columns = cols;
  sheet.getRow(1).eachCell(cell => { cell.font = HDR.font; cell.fill = HDR.fill; cell.alignment = HDR.alignment; });
}

const BASE_COLS = [
  { header: 'Vendor Name', key: 'vendor', width: 32 },
  { header: 'GSTIN', key: 'gstin', width: 18 },
  { header: 'Invoice No', key: 'invoiceNo', width: 22 },
  { header: 'Date', key: 'date', width: 14 },
  { header: 'PR Amount (₹)', key: 'prAmount', width: 16 },
  { header: '2B Amount (₹)', key: 'gstrAmount', width: 16 },
  { header: 'Status', key: 'status', width: 18 },
];

export const exportReconciliation = async (req: Request, res: Response) => {
  try {
    const { summary, data } = req.body;
    if (!summary || !data) return res.status(400).json({ error: 'Summary and data are required' });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'GSTSync';

    // ── Tab 1: Matched ─────────────────────────────────────────
    const matched = wb.addWorksheet('✓ Matched');
    applyHeader(matched, BASE_COLS);
    (data as any[]).filter(r => ['Exact Match','Fuzzy Match','Matched','Manual-Matched'].includes(r.status)).forEach(r => {
      const row = matched.addRow(r);
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
    });

    // ── Tab 2: PR Only (Missing in 2B) ─────────────────────────
    const prOnly = wb.addWorksheet('⚠ Missing in 2B');
    applyHeader(prOnly, [...BASE_COLS, { header: 'Action Taken', key: 'actionTaken', width: 20 }]);
    (data as any[]).filter(r => r.status === 'Missing in 2B' || r.status === 'Not In Portal').forEach(r => {
      const row = prOnly.addRow({ ...r, actionTaken: '' });
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    });

    // ── Tab 3: 2B Only (Missing in PR) ────────────────────────
    const g2bOnly = wb.addWorksheet('+ Missing in PR');
    applyHeader(g2bOnly, [...BASE_COLS, { header: 'Category', key: 'category', width: 16 }, { header: 'Action Taken', key: 'actionTaken', width: 20 }]);
    (data as any[]).filter(r => r.status === 'Missing in PR' || r.status === 'Not In Tally').forEach(r => {
      const row = g2bOnly.addRow({ ...r, actionTaken: '' });
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
    });

    // ── Tab 4: Value Mismatches ───────────────────────────────
    const mismatches = wb.addWorksheet('◑ Mismatches');
    applyHeader(mismatches, [...BASE_COLS, { header: 'Difference (₹)', key: 'diff', width: 16 }, { header: 'Action Taken', key: 'actionTaken', width: 20 }]);
    (data as any[]).filter(r => r.status === 'Amount Mismatch' || r.status === 'Partially-Matched').forEach(r => {
      const row = mismatches.addRow({ ...r, diff: r.prAmount - r.gstrAmount, actionTaken: '' });
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
    });

    // ── Tab 5: ITC Summary ────────────────────────────────────
    const itcSheet = wb.addWorksheet('₹ ITC Summary');
    itcSheet.columns = [{ header: 'Description', key: 'desc', width: 36 }, { header: 'IGST (₹)', key: 'igst', width: 16 }, { header: 'CGST (₹)', key: 'cgst', width: 16 }, { header: 'SGST (₹)', key: 'sgst', width: 16 }];
    itcSheet.getRow(1).eachCell(cell => { cell.font = HDR.font; cell.fill = HDR.fill; });
    const addITCRow = (desc: string, vals: any, fill: string) => {
      const row = itcSheet.addRow({ desc, igst: vals?.igst || 0, cgst: vals?.cgst || 0, sgst: vals?.sgst || 0 });
      if (fill) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    };
    addITCRow('ITC Claimable (as per GSTR-2B portal)', summary.itcClaimable, 'FFD4EDDA');
    addITCRow('ITC Availed (as per Purchase Register)', summary.itcAvailed, 'FFD4EDDA');
    addITCRow('ITC Leakage Gap (Claimable - Availed)', summary.itcLeakage, 'FFF8D7DA');
    itcSheet.addRow({});
    itcSheet.addRow({ desc: 'Total Reconciled Amount', igst: summary.totalReconciled });
    itcSheet.addRow({ desc: 'ITC At Risk (Missing in 2B)', igst: summary.itcAtRisk });
    itcSheet.addRow({ desc: 'Pending Invoices', igst: summary.pendingInvoices });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="GSTSync_Reconciliation_${new Date().toISOString().slice(0,10)}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Export failed.' });
  }
};
