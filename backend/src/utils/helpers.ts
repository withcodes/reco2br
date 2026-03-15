export const normalizeString = (str: string | undefined | null): string => {
  if (!str) return '';
  // O → 0 swap catches GSTIN/invoice letter-O vs digit-0 data entry errors
  return str.toString().toUpperCase().replace(/O/g, '0').replace(/[^A-Z0-9]/g, '');
};

export const normalizeGSTIN = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.toString().toUpperCase().replace(/O/g, '0').trim();
};

// Levenshtein distance for fuzzy invoice matching
export const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
};

export const parseAmount = (val: any) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const num = parseFloat(val.toString().replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

export const normalizeInvoice = (str: string | undefined | null): string => {
    if (!str) return '';
    let cleaned = str.toString().toUpperCase();
    // O → 0 swap: fixes IFF:029 vs IFF029, HSS/OO31 vs HSS/031
    cleaned = cleaned.replace(/O/g, '0');
    // strip year formats: 2025-26, 2526, 25-26
    cleaned = cleaned.replace(/\b(20\d{2}(-\d{2})?)\b/g, '');
    cleaned = cleaned.replace(/\b(25\d{2})\b/g, '');
    // strip all non-alphanumeric (colons, slashes, hyphens, spaces)
    cleaned = cleaned.replace(/[^A-Z0-9]/g, '');
    // strip leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    return cleaned;
};

export const excelDateToJSDate = (serial: number | string) => {
  if (typeof serial === 'number') {
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const dateInfo  = new Date(utc_value * 1000);
    return dateInfo.toISOString().slice(0, 10);
  }
  return serial;
};

export const normalizeDateString = (dateStr: string | number) => {
  if (!dateStr) return 'N/A';
  if (typeof dateStr === 'number') return excelDateToJSDate(dateStr);
  const str = dateStr.toString().trim();
  const parts = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
  return str;
};
