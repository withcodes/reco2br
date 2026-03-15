/** ============================================================
 *  GSTSync — Shared GST Utility Functions
 *  Backend: 15+ yr Full-Stack Dev | GST Domain Knowledge
 *  ============================================================ */

// ── Currency ──────────────────────────────────────────────────
export const formatINR = (val: number | string): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(val));

export const formatINR0 = (val: number | string): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(val));

export const formatLakh = (val: number): string => {
  const l = Math.abs(val) / 100000;
  return `₹${l.toFixed(2)}L`;
};

// ── GSTIN ─────────────────────────────────────────────────────
export const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh',       '05': 'Uttarakhand',      '06': 'Haryana',
  '07': 'Delhi',            '08': 'Rajasthan',         '09': 'Uttar Pradesh',
  '10': 'Bihar',            '11': 'Sikkim',            '12': 'Arunachal Pradesh',
  '13': 'Nagaland',         '14': 'Manipur',           '15': 'Mizoram',
  '16': 'Tripura',          '17': 'Meghalaya',         '18': 'Assam',
  '19': 'West Bengal',      '20': 'Jharkhand',         '21': 'Odisha',
  '22': 'Chhattisgarh',     '23': 'Madhya Pradesh',   '24': 'Gujarat',
  '25': 'Daman & Diu',      '26': 'Dadra & NH',       '27': 'Maharashtra',
  '28': 'Andhra Pradesh',   '29': 'Karnataka',         '30': 'Goa',
  '31': 'Lakshadweep',      '32': 'Kerala',            '33': 'Tamil Nadu',
  '34': 'Puducherry',       '35': 'Andaman & Nicobar', '36': 'Telangana',
  '37': 'Andhra Pradesh (New)', '38': 'Ladakh',
};

export const isValidGSTIN = (gstin: string): boolean =>
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin?.trim() ?? '');

export const getStateCode = (gstin: string): string =>
  gstin?.substring(0, 2) ?? '';

export const getStateName = (gstin: string): string =>
  STATE_CODES[getStateCode(gstin)] ?? 'Unknown';

export const isInterState = (supplierGSTIN: string, buyerGSTIN: string): boolean =>
  getStateCode(supplierGSTIN) !== getStateCode(buyerGSTIN);

// ── GST Calculation ───────────────────────────────────────────
export type GSTComponents = {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  isIGST: boolean;
};

/** Standard GST rates available in India */
export const GST_RATES = [0, 3, 5, 12, 18, 28] as const;

export const calculateGST = (
  rate: number,
  quantity: number,
  gstRatePercent: number,
  interState: boolean
): GSTComponents => {
  const taxableAmount = parseFloat((rate * quantity).toFixed(2));
  const totalGST = parseFloat(((taxableAmount * gstRatePercent) / 100).toFixed(2));

  if (interState) {
    return {
      taxableAmount,
      cgst: 0, sgst: 0,
      igst: totalGST,
      totalAmount: parseFloat((taxableAmount + totalGST).toFixed(2)),
      isIGST: true,
    };
  }
  const halfGST = parseFloat((totalGST / 2).toFixed(2));
  return {
    taxableAmount,
    cgst: halfGST,
    sgst: halfGST,
    igst: 0,
    totalAmount: parseFloat((taxableAmount + halfGST + halfGST).toFixed(2)),
    isIGST: false,
  };
};

// ── Reconciliation Status ─────────────────────────────────────
export type RecoStatus =
  | 'Matched'
  | 'Manual-Matched'
  | 'Partially-Matched'
  | 'Not In Portal'
  | 'Not In Tally';

export const RECO_STATUSES: RecoStatus[] = [
  'Matched', 'Manual-Matched', 'Partially-Matched', 'Not In Portal', 'Not In Tally',
];

export const STATUS_META: Record<RecoStatus, { pillClass: string; label: string }> = {
  'Matched':           { pillClass: 'pill pill-matched',    label: '✓ Matched' },
  'Manual-Matched':    { pillClass: 'pill pill-manual',     label: '⚡ Manual-Matched' },
  'Partially-Matched': { pillClass: 'pill pill-partial',    label: '◑ Partial Match' },
  'Not In Portal':     { pillClass: 'pill pill-not-portal', label: '✗ Not In Portal' },
  'Not In Tally':      { pillClass: 'pill pill-not-tally',  label: '+ Not In Tally' },
};

// ── Month helpers ─────────────────────────────────────────────
export const MONTHS = [
  'April','May','June','July','August','September',
  'October','November','December','January','February','March',
];

export const getFY = (): string => {
  const now = new Date();
  const yr = now.getFullYear();
  return now.getMonth() >= 3
    ? `${yr}-${String(yr + 1).slice(2)}`
    : `${yr - 1}-${String(yr).slice(2)}`;
};

// ── Voucher number generator ──────────────────────────────────
export const generateVoucherNo = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  return `VCH-${ts}`;
};

// ── Number formatting ─────────────────────────────────────────
export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);
