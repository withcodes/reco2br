import { Request, Response } from 'express';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { parseDynamicSheet } from '../utils/excelParser';
import { parseAmount, normalizeString, normalizeGSTIN, normalizeInvoice, normalizeDateString, levenshtein } from '../utils/helpers';
import { ensureXlsx } from '../utils/xlsConverter';

const TRANSPORT_KEYWORDS = ['TRANSPORT', 'LOGISTICS', 'ROADLINES', 'TRAVELS', 'COURIER', 'CARGO', 'FREIGHT', 'MOVERS'];

/** Detect filing period from PR invoice dates (most frequent month) */
function detectFilingPeriod(prRows: any[]): string {
  const freq: Record<string, number> = {};
  for (const r of prRows) {
    const d = r['Invoice date'] || r['Voucher Date'] || r['Invoice Date'];
    if (!d) continue;
    const dt = typeof d === 'number'
      ? new Date((d - 25569) * 86400 * 1000)
      : new Date(String(d));
    if (isNaN(dt.getTime())) continue;
    const key = dt.toLocaleString('en-US', { month: 'short' }).slice(0,3).toUpperCase()
              + "'" + String(dt.getFullYear()).slice(-2);
    freq[key] = (freq[key] || 0) + 1;
  }
  return Object.entries(freq).sort((a,b) => b[1]-a[1])[0]?.[0] || '';
}

/** Detect the flag category for a GSTR-2B row that is Missing in PR */
function detectCategory(row: any, filingPeriod: string): string {
  const supplier = String(row['Trade/Legal name'] || row['Supplier Name'] || '').toUpperCase();
  const itcAvail = String(row['ITC Availability'] || '').toUpperCase();
  const rcm      = String(row['Supply Attract Reverse Charge'] || '').toUpperCase();
  const period   = String(row['GSTR-1/IFF/GSTR-5 Period'] || '').toUpperCase(); // e.g. "MAY'25"

  if (itcAvail === 'NO') return 'ITC Blocked';
  if (rcm === 'YES')     return 'RCM';
  if (TRANSPORT_KEYWORDS.some(k => supplier.includes(k))) return 'Transport';

  // Prior period: GSTR-2B period column != filing period (detected from PR dates)
  if (period && period.length > 0 && filingPeriod) {
    if (!period.includes(filingPeriod)) return 'Prior Period';
  }

  return '';
}

function aggregatePR(prData: any[]): any[] {
  const map = new Map<string, any>();
  for (const row of prData) {
    const gstin = normalizeGSTIN(row['GSTIN of Supplier'] || row['GSTIN/UIN'] || row['GSTIN'] || '');
    const inv = normalizeInvoice(row['Invoice Number'] || row['Voucher Number'] || row['Invoice No'] || '');
    if (!gstin && !inv) continue;
    const key = `${gstin}||${inv}`;
    if (!map.has(key)) { map.set(key, { ...row, _taxSum: 0 }); }
    const e = map.get(key)!;
    // Sum all 3 tax components — Gujarat = CGST+SGST, interstate = IGST only
    e._taxSum += parseAmount(row['Integrated Tax Paid'] || 0)
              + parseAmount(row['Central Tax Paid'] || 0)
              + parseAmount(row['State/UT Tax Paid'] || 0);
  }
  return Array.from(map.values());
}

function readITCAvailable(wb: xlsx.WorkBook): { igst: number; cgst: number; sgst: number } {
  const r = { igst: 0, cgst: 0, sgst: 0 };
  const ws = wb.Sheets['ITC Available'];
  if (!ws) return r;
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
  for (const row of rows) {
    const label = String(row[1] || row[0] || '').toLowerCase();
    if (label.includes('b2b') && label.includes('invoice') && !label.includes('amendment')) {
      r.igst = parseAmount(row[3]); r.cgst = parseAmount(row[4]); r.sgst = parseAmount(row[5]);
      break;
    }
  }
  return r;
}

export const reconcileGstr2b = (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.prFile || !files.gstr2bFile) return res.status(400).json({ error: 'Both files are required.' });

    // .XLS and .XLSX both handled — LibreOffice converts legacy .XLS
    const tempPrPath = ensureXlsx(files.prFile[0].buffer, files.prFile[0].originalname || 'pr.xlsx');
    const prWorkbook = xlsx.readFile(tempPrPath);

    let prDataRaw: any[] = [];
    const PR_SHEETS = ['B2B', 'b2bur', 'cdnr', 'cdnur', 'impg', 'imps'];
    for (const sn of prWorkbook.SheetNames) {
      if (PR_SHEETS.some(s => sn.toLowerCase() === s.toLowerCase()))
        prDataRaw = prDataRaw.concat(parseDynamicSheet(prWorkbook.Sheets[sn], sn));
    }

    const prDataFiltered = prDataRaw.filter(r => {
      const g = String(r['GSTIN of Supplier'] || r['GSTIN/UIN'] || r['GSTIN'] || '').trim();
      const i = String(r['Invoice Number'] || r['Voucher Number'] || '').trim();
      return g.length > 2 || i.length > 2;
    });
    const prData = aggregatePR(prDataFiltered);
    const filingPeriod = detectFilingPeriod(prDataFiltered).toUpperCase();

    const tempGstrPath = ensureXlsx(files.gstr2bFile[0].buffer, files.gstr2bFile[0].originalname || 'gstr2b.xlsx');
    const gstrWorkbook = xlsx.readFile(tempGstrPath);

    const itcClaimable = readITCAvailable(gstrWorkbook);

    const SKIP = ['Read me', 'ITC Available', 'ITC not available', 'ITC Reversal', 'ITC Rejected'];
    let gstrData: any[] = [];
    for (const sn of gstrWorkbook.SheetNames) {
      if (SKIP.some(s => sn.toLowerCase() === s.toLowerCase())) continue;
      let sd = parseDynamicSheet(gstrWorkbook.Sheets[sn], sn);
      sd = sd.map(row => {
        if (sn.endsWith('A')) {
          if (row['Revised Integrated Tax(₹)']) row['Integrated Tax(\u20b9)'] = row['Revised Integrated Tax(₹)'];
          if (row['Revised Central Tax(₹)']) row['Central Tax(\u20b9)'] = row['Revised Central Tax(₹)'];
        }
        if (sn.includes('CDNR') || sn.includes('Reversal')) {
          row['Tax Amount'] = parseAmount(row['Tax Amount'] || row['Integrated Tax(\u20b9)']) * -1;
          row['Taxable Value (\u20b9)'] = parseAmount(row['Taxable Value (\u20b9)']) * -1;
        }
        return row;
      });
      gstrData = gstrData.concat(sd);
    }
    gstrData = gstrData.filter(r => {
      const g = String(r['GSTIN of supplier'] || r['GSTIN of Supplier'] || r['GSTIN'] || '').trim();
      const i = String(r['Invoice number'] || r['Invoice Number'] || r['Invoice Details'] || '').trim();
      return g.length > 2 || i.length > 2;
    });

    const results: any[] = [];
    const matched = new Set<number>();
    let id = 1;
    const T = 2.0;

    const pgk  = (r: any) => normalizeString(normalizeGSTIN(r['GSTIN of Supplier'] || r['GSTIN/UIN'] || r['GSTIN'] || ''));
    const pgi  = (r: any) => normalizeInvoice(r['Invoice Number'] || r['Voucher Number'] || r['Invoice No'] || '');
    const pga  = (r: any) => r._taxSum || parseAmount(r['Integrated Tax Paid'] || r['Central Tax Paid'] || r['Tax Amount'] || 0);
    const pgd  = (r: any) => normalizeDateString(r['Invoice date'] || r['Voucher Date'] || r['Invoice Date']);
    const ggk  = (r: any) => normalizeString(normalizeGSTIN(r['GSTIN of supplier'] || r['GSTIN of Supplier'] || r['GSTIN'] || r['GSTIN of ECO'] || r['GSTIN of ISD'] || ''));
    const ggi  = (r: any) => normalizeInvoice(r['Invoice number'] || r['Invoice Number'] || r['Invoice Details'] || r['Document number'] || r['Note number'] || '');
    const getTax = (row: any, keywords: string[]) => {
      const key = Object.keys(row).find(k => keywords.some(kw => k.toLowerCase().includes(kw)));
      return key ? parseAmount(row[key]) : 0;
    };

    // Sum all tax types — GSTR-2B row can have IGST, or CGST+SGST (intrastate)
    const gga  = (r: any) => getTax(r, ['integrated tax', 'igst'])
                           + getTax(r, ['central tax', 'cgst'])
                           + getTax(r, ['state/ut tax', 'state tax', 'sgst']);
    const ggd  = (r: any) => normalizeDateString(r['Invoice date'] || r['Invoice Date'] || r['Document date']);
    const name = (p: any, g: any) => p['Supplier Name'] || (g && g['Trade/Legal name']) || pgk(p);
    const gstin = (p: any) => p['GSTIN of Supplier'] || p['GSTIN/UIN'] || p['GSTIN'] || 'N/A';
    const inv   = (p: any) => p['Invoice Number'] || p['Voucher Number'] || 'N/A';

    // Pass 1: Exact
    for (const p of prData) {
      if (!pgk(p) && !pgi(p)) continue;
      for (let i = 0; i < gstrData.length; i++) {
        if (matched.has(i)) continue;
        const g = gstrData[i];
        if (ggk(g) !== pgk(p) || ggi(g) !== pgi(p) || Math.abs(pga(p) - gga(g)) > T) continue;
        results.push({ id: id++, vendor: name(p,g), gstin: gstin(p), invoiceNo: inv(p), date: pgd(p) || ggd(g), prAmount: pga(p), gstrAmount: gga(g), status: 'Exact Match', category: '', _prRaw: p, _gstrRaw: g });
        matched.add(i); p._matched = true; break;
      }
    }

    // Pass 2: Fuzzy (levenshtein ≤ 2)
    for (const p of prData) {
      if (p._matched || (!pgk(p) && !pgi(p))) continue;
      for (let i = 0; i < gstrData.length; i++) {
        if (matched.has(i)) continue;
        const g = gstrData[i];
        if (ggk(g) !== pgk(p)) continue;
        if (levenshtein(pgi(p), ggi(g)) > 2) continue;
        if (Math.abs(pga(p) - gga(g)) > T) continue;
        const diff = Math.abs(pga(p) - gga(g));
        results.push({ id: id++, vendor: name(p,g), gstin: gstin(p), invoiceNo: inv(p), date: pgd(p) || ggd(g), prAmount: pga(p), gstrAmount: gga(g), status: diff > 0.01 ? 'Amount Mismatch' : 'Fuzzy Match', category: '', _prRaw: p, _gstrRaw: g });
        matched.add(i); p._matched = true; break;
      }
    }

    // Missing in 2B
    for (const p of prData) {
      if (p._matched || (!pgk(p) && !pgi(p))) continue;
      results.push({ id: id++, vendor: p['Supplier Name'] || pgk(p) || 'Unknown', gstin: gstin(p), invoiceNo: inv(p), date: pgd(p) || 'N/A', prAmount: pga(p), gstrAmount: 0, status: 'Missing in 2B', category: '', _prRaw: p });
    }

    // Missing in PR
    for (let i = 0; i < gstrData.length; i++) {
      if (matched.has(i)) continue;
      const g = gstrData[i];
      results.push({ id: id++, vendor: g['Trade/Legal name'] || 'Unknown', gstin: g['GSTIN of supplier'] || g['GSTIN of Supplier'] || 'N/A', invoiceNo: g['Invoice number'] || g['Invoice Number'] || g['Invoice Details'] || 'N/A', date: ggd(g) || 'N/A', prAmount: 0, gstrAmount: gga(g), status: 'Missing in PR', category: detectCategory(g, filingPeriod), _gstrRaw: g });
    }

    results.sort((a, b) => a.status.localeCompare(b.status));

    // Monthly grouping
    const monthMap = new Map<string, any>();
    const getM = (d: string) => { if (!d || d === 'N/A') return null; const dt = new Date(d); return isNaN(dt.getTime()) ? null : `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`; };
    for (const r of results) {
      const m = getM(r.date); if (!m) continue;
      if (!monthMap.has(m)) monthMap.set(m, { month: m, tally: { invoices: 0, taxAmt: 0 }, portal: { invoices: 0, taxAmt: 0 }, delta: { invoices: 0, taxAmt: 0 } });
      const md = monthMap.get(m)!;
      if (r.prAmount > 0) { md.tally.invoices++; md.tally.taxAmt += r.prAmount; }
      if (r.gstrAmount > 0) { md.portal.invoices++; md.portal.taxAmt += r.gstrAmount; }
    }
    for (const [,md] of monthMap) { md.delta.invoices = md.portal.invoices - md.tally.invoices; md.delta.taxAmt = md.portal.taxAmt - md.tally.taxAmt; }
    const monthly = Array.from(monthMap.values());

    const itcAvailed = {
      igst: prData.reduce((s,r) => s + parseAmount(r['Availed ITC Integrated Tax'] || r['Integrated Tax Paid'] || 0), 0),
      cgst: prData.reduce((s,r) => s + parseAmount(r['Availed ITC Central Tax'] || r['Central Tax Paid'] || 0), 0),
      sgst: prData.reduce((s,r) => s + parseAmount(r['Availed ITC State/UT Tax'] || r['State/UT Tax Paid'] || 0), 0),
    };

    const summary = {
      totalReconciled: results.filter(r => ['Exact Match','Fuzzy Match','Amount Mismatch'].includes(r.status)).reduce((s,r) => s+r.gstrAmount, 0),
      itcAtRisk: results.filter(r => r.status === 'Missing in 2B').reduce((s,r) => s+r.prAmount, 0),
      pendingInvoices: results.filter(r => ['Missing in PR','Missing in 2B'].includes(r.status)).length,
      totalTaxSaved: results.reduce((s,r) => s+r.gstrAmount, 0),
      itcClaimable, itcAvailed,
      itcLeakage: { igst: Math.max(0, itcClaimable.igst - itcAvailed.igst), cgst: Math.max(0, itcClaimable.cgst - itcAvailed.cgst), sgst: Math.max(0, itcClaimable.sgst - itcAvailed.sgst) },
    };

    res.json({ success: true, summary, data: results, monthly });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to process files.' }); }
};

export const reconcileGstr1 = (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (!files.salesFile || !files.gstr1File) return res.status(400).json({ error: 'Both files required.' });
    // Support .XLS for both Sales Register and GSTR-1
    const salesPath = ensureXlsx(files.salesFile[0].buffer, files.salesFile[0].originalname || 'sales.xlsx');
    const salesWb = xlsx.readFile(salesPath);
    const salesData = (xlsx.utils.sheet_to_json(salesWb.Sheets[salesWb.SheetNames[0]]) as any[]);
    const gstr1Path = ensureXlsx(files.gstr1File[0].buffer, files.gstr1File[0].originalname || 'gstr1.xlsx');
    const gstr1Wb = xlsx.readFile(gstr1Path);
    const gstr1Data = (xlsx.utils.sheet_to_json(gstr1Wb.Sheets[gstr1Wb.SheetNames[0]]) as any[]);
    const results: any[] = [];
    const matchedP = new Set<number>();
    let id = 1;
    const sk = (r: any) => normalizeString(normalizeGSTIN(r['GSTIN/UIN']||r['Buyer GSTIN']||r['GSTIN']||''));
    const si = (r: any) => normalizeInvoice(r['Voucher Number']||r['Invoice No']||r['Invoice Number']||'');
    const sa = (r: any) => parseAmount(r['Tax Amount']||r['IGST']||r['CGST']||0);
    const gk = (r: any) => normalizeString(normalizeGSTIN(r['Receiver GSTIN']||r['GSTIN']||''));
    const gi = (r: any) => normalizeInvoice(r['Invoice Number']||r['Invoice No']||'');
    const ga = (r: any) => parseAmount(r['Tax Amount']||r['IGST']||r['CGST']||0);
    for (const s of salesData) {
      for (let i = 0; i < gstr1Data.length; i++) {
        if (matchedP.has(i)) continue;
        const g = gstr1Data[i];
        if (gk(g) !== sk(s) || gi(g) !== si(s) || Math.abs(sa(s)-ga(g)) > 0.5) continue;
        results.push({ id: id++, vendor: s['Party Name']||g['Receiver Name']||'Unknown', gstin: s['GSTIN/UIN']||'N/A', invoiceNo: s['Voucher Number']||'N/A', date: s['Voucher Date']||'N/A', prAmount: sa(s), gstrAmount: ga(g), status: 'Exact Match', category: '' });
        matchedP.add(i); s._matched = true; break;
      }
    }
    for (const s of salesData) {
      if (s._matched) continue;
      for (let i = 0; i < gstr1Data.length; i++) {
        if (matchedP.has(i)) continue;
        const g = gstr1Data[i];
        if (gk(g) !== sk(s) || levenshtein(si(s),gi(g)) > 2 || Math.abs(sa(s)-ga(g)) > 2) continue;
        results.push({ id: id++, vendor: s['Party Name']||'Unknown', gstin: s['GSTIN/UIN']||'N/A', invoiceNo: s['Voucher Number']||'N/A', date: s['Voucher Date']||'N/A', prAmount: sa(s), gstrAmount: ga(g), status: 'Fuzzy Match', category: '' });
        matchedP.add(i); s._matched = true; break;
      }
    }
    for (const s of salesData) { if (!s._matched) results.push({ id: id++, vendor: s['Party Name']||'Unknown', gstin: s['GSTIN/UIN']||'N/A', invoiceNo: s['Voucher Number']||'N/A', date: s['Voucher Date']||'N/A', prAmount: sa(s), gstrAmount: 0, status: 'Not In Portal', category: '' }); }
    for (let i = 0; i < gstr1Data.length; i++) { if (!matchedP.has(i)) { const g = gstr1Data[i]; results.push({ id: id++, vendor: g['Receiver Name']||'Unknown', gstin: g['Receiver GSTIN']||'N/A', invoiceNo: g['Invoice Number']||'N/A', date: g['Invoice Date']||'N/A', prAmount: 0, gstrAmount: ga(g), status: 'Not In Tally', category: '' }); } }
    results.sort((a,b) => a.status.localeCompare(b.status));
    const empty = { igst: 0, cgst: 0, sgst: 0 };
    const summary = { totalReconciled: results.filter(r=>['Exact Match','Fuzzy Match'].includes(r.status)).reduce((s,r)=>s+r.gstrAmount,0), itcAtRisk: 0, pendingInvoices: results.filter(r=>['Not In Portal','Not In Tally'].includes(r.status)).length, totalTaxSaved: 0, itcClaimable: empty, itcAvailed: empty, itcLeakage: empty };
    res.json({ success: true, summary, data: results, monthly: [] });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
};
