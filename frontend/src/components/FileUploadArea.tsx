import { apiPost } from '../utils/api';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import type { ReconciledItem, SummaryStats } from '../App';
import { toast } from './Toast';

interface FileUploadAreaProps {
  mode: 'gstr1' | 'gstr2b';
  onReconciliationComplete: (data: ReconciledItem[], summary: SummaryStats, rawBackendResponse: any) => void;
}

const CONFIG = {
  gstr2b: {
    icon: '📦',
    file1: { key: 'prFile',    label: 'Purchase Register (Tally)',  accent: '#6366f1' },
    file2: { key: 'gstr2bFile',label: 'GSTR-2B (Portal)',           accent: '#0891b2' },
    endpoint: '/api/reconcile',
    title: 'GSTR-2B Reconciliation Engine',
    desc:  'Upload Tally Purchase Register and GSTR-2B Excel files to run smart reconciliation.',
  },
  gstr1: {
    icon: '📤',
    file1: { key: 'salesFile', label: 'Sales Register (Tally)',     accent: '#7c3aed' },
    file2: { key: 'gstr1File', label: 'GSTR-1 (Portal)',            accent: '#0d9488' },
    endpoint: '/api/reconcile/gstr1',
    title: 'GSTR-1 Reconciliation Engine',
    desc:  'Upload Tally Sales Register and GSTR-1 Excel files to identify missing invoices.',
  },
} as const;

export default function FileUploadArea({ mode, onReconciliationComplete }: FileUploadAreaProps) {
  const cfg = CONFIG[mode];
  const [file1, setFile1]         = useState<File | null>(null);
  const [file2, setFile2]         = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (!file1 || !file2) {
      toast.warning('Please upload both files before running reconciliation.');
      return;
    }
    setIsUploading(true);
    const fd = new FormData();
    fd.append(cfg.file1.key, file1);
    fd.append(cfg.file2.key, file2);
    try {
      const res = await apiPost(cfg.endpoint, fd);
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      
      const allData: ReconciledItem[] = [];
      const processCategory = (items: any[] | undefined, status: string, category: string) => {
        if (!items) return;
        items.forEach(item => {
          const pr = item.pr_rec || item.gstr_rec || item;
          const gstr = item.gstr_rec || item.pr_rec || item;
          
          allData.push({
            id: pr.id || Math.random(),
            vendor: pr.vendor_name || gstr.vendor_name || 'Unknown',
            gstin: pr.gstin || gstr.gstin || '',
            prGstin: item.pr_rec?.gstin || '',
            gstrGstin: item.gstr_rec?.gstin || '',
            prInvoiceNo: item.pr_rec?.invoice_no_raw || '',
            gstrInvoiceNo: item.gstr_rec?.invoice_no_raw || '',
            invoiceNo: pr.invoice_no_raw || gstr.invoice_no_raw || pr.invoice_no || '',
            date: pr.invoice_date || gstr.invoice_date || '',
            prAmount: pr.prAmount ?? 0,
            gstrAmount: gstr.gstrAmount ?? 0,
            status: status,
            category: pr.category || gstr.category || category,
            _prRaw: item.pr_rec,
            _gstrRaw: item.gstr_rec,
          });
        });
      };

      processCategory(result.matched, 'Exact Match', 'Exact Match');
      processCategory(result.matched_normalized, 'Matched', 'Invoice Normalized');
      processCategory(result.gstin_typo_cases, 'Fuzzy Match', 'GSTIN Typo');
      processCategory(result.near_match_cases, 'Fuzzy Match', 'Near Match');
      processCategory(result.mismatched, 'Amount Mismatch', 'Value/Tax Issue');
      processCategory(result.missing_in_books, 'Missing in PR', 'Missing in Books');
      processCategory(result.missing_in_2b, 'Missing in 2B', 'Missing in 2B');
      processCategory(result.prior_period, 'Missing in PR', 'Prior Period');

      const summaryStr = {
        totalReconciled: result.summary?.books_unique_invoices || 0,
        itcAtRisk: result.summary?.itc_at_risk || 0,
        pendingInvoices: result.summary?.missing_in_books || 0,
        totalTaxSaved: result.summary?.total_tax_saved || 0
      };

      onReconciliationComplete(allData, summaryStr, result);
      toast.success(`✅ Reconciliation complete — ${allData.length} invoices processed`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to process files. Ensure Excel format is correct.');
    } finally {
      setIsUploading(false);
    }
  };

  const FileZone = ({
    file, setFile, refEl, label, accent,
  }: {
    file: File | null;
    setFile: (f: File) => void;
    refEl: React.RefObject<HTMLInputElement | null>;
    label: string;
    accent: string;
  }) => (
    <div
      className="rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
      style={{
        border: `2px dashed ${file ? accent : 'var(--border-subtle)'}`,
        background: file ? `${accent}0a` : 'var(--bg-surface-2)',
        minHeight: 150,
      }}
      onClick={() => refEl.current?.click()}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={e => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) setFile(f);
      }}
    >
      <input
        type="file"
        ref={refEl}
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={e => e.target.files?.[0] && setFile(e.target.files[0])}
      />
      <div
        className="p-3 rounded-full mb-3"
        style={{ background: `${accent}18` }}
      >
        {file
          ? <CheckCircle size={26} style={{ color: '#10b981' }} />
          : <FileText size={26} style={{ color: accent }} />}
      </div>
      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {file ? file.name : label}
      </h4>
      {!file && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Drop file here or click to browse
        </p>
      )}
      {file && (
        <p className="text-xs mt-1" style={{ color: '#10b981' }}>
          ✅ {(file.size / 1024).toFixed(1)} KB · Click to change
        </p>
      )}
    </div>
  );

  return (
    <div
      className="glass-card p-7 relative overflow-hidden"
    >
      {/* bg icon */}
      <div style={{ position: 'absolute', top: 10, right: 16, opacity: 0.06, fontSize: 90 }}>
        <UploadCloud />
      </div>

      <div className="mb-5">
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {cfg.title}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', maxWidth: 500 }}>
          {cfg.desc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <FileZone file={file1} setFile={setFile1} refEl={ref1} label={cfg.file1.label} accent={cfg.file1.accent} />
        <FileZone file={file2} setFile={setFile2} refEl={ref2} label={cfg.file2.label} accent={cfg.file2.accent} />
      </div>

      {/* Run button */}
      <div className="flex justify-end">
        {file1 && file2 && (
          <button
            onClick={handleProcess}
            disabled={isUploading}
            className="btn-primary"
            style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 12, paddingBottom: 12 }}
          >
            {isUploading
              ? <><Loader2 size={17} className="animate-spin" /> Processing…</>
              : <>⚡ Run {mode === 'gstr2b' ? 'GSTR-2B' : 'GSTR-1'} Reconciliation</>}
          </button>
        )}
      </div>

      {/* Info strip */}
      <div className="grid grid-cols-2 gap-4 mt-5">
        <div
          className="p-3 rounded-xl flex items-start gap-3"
          style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
        >
          <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Smart Auto-mapping
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Tally & GST Portal columns mapped automatically.
            </p>
          </div>
        </div>
        <div
          className="p-3 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Required Columns
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              GSTIN, Vendor Name, Invoice No., Tax Amount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
