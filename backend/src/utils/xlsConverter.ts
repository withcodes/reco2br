import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * If the uploaded file is legacy .XLS (OLE2/BIFF), convert to .xlsx via
 * LibreOffice headless before handing to the xlsx parser.
 * Returns the path to a .xlsx file (may be the original if already xlsx).
 */
export function ensureXlsx(buffer: Buffer, originalName: string): string {
  const ext = (originalName || '').split('.').pop()?.toLowerCase() || 'xlsx';
  const tmp = path.join(os.tmpdir(), `gst_${Date.now()}`);

  if (ext === 'xls') {
    // Write .xls then convert
    const xlsPath = `${tmp}.xls`;
    fs.writeFileSync(xlsPath, buffer);
    try {
      execSync(`libreoffice --headless --convert-to xlsx "${xlsPath}" --outdir "${os.tmpdir()}"`, {
        timeout: 30000,
        stdio: 'pipe',
      });
    } catch (e) {
      // LibreOffice not available — fall back, xlsx lib handles some .xls files
      fs.writeFileSync(`${tmp}.xlsx`, buffer);
      fs.unlinkSync(xlsPath);
      return `${tmp}.xlsx`;
    }
    try { fs.unlinkSync(xlsPath); } catch {}
    // LibreOffice outputs filename without path prefix, use basename
    const base = path.basename(xlsPath, '.xls');
    const converted = path.join(os.tmpdir(), `${base}.xlsx`);
    if (fs.existsSync(converted)) return converted;
    // Fallback: just write buffer as-is and let xlsx try
    fs.writeFileSync(`${tmp}.xlsx`, buffer);
    return `${tmp}.xlsx`;
  }

  // Already .xlsx or .csv — write directly
  const outPath = `${tmp}.${ext}`;
  fs.writeFileSync(outPath, buffer);
  return outPath;
}
