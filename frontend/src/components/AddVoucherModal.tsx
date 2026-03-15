import { apiPost } from '../utils/api';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import type { ReconciledItem } from '../App';
import {
  calculateGST,
  generateVoucherNo,
  isValidGSTIN,
  getStateName,
  GST_RATES,
  formatINR,
} from '../utils/gst';
import { toast } from './Toast';

interface AddVoucherModalProps {
  row: ReconciledItem;
  onClose: () => void;
  onSaved: (id: number) => void;
}

const LEDGERS = [
  'Purchase Account', 'Import of Goods', 'Capital Purchases',
  'Stock in Trade', 'Raw Material Purchase', 'Consumables',
];

export default function AddVoucherModal({ row, onClose, onSaved }: AddVoucherModalProps) {
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Form state ──────────────────────────────────────────────
  const [voucherNo, setVoucherNo] = useState(generateVoucherNo);
  const [date, setDate]           = useState(row.date || new Date().toISOString().slice(0, 10));
  const [partyName, setPartyName] = useState(row.vendor);
  const [gstin, setGstin]         = useState(row.gstin);
  const [itemName, setItemName]   = useState('');
  const [ledger, setLedger]       = useState(LEDGERS[0]);
  const [hsn, setHsn]             = useState('');
  const [qty, setQty]             = useState<number>(1);
  const [rate, setRate]           = useState<number>(row.gstrAmount || 0);
  const [gstRate, setGstRate]     = useState<number>(18);

  // ── Computed ─────────────────────────────────────────────────
  const gstComp = calculateGST(rate, qty, gstRate, false);

  // Recompute on change
  const taxableAmt  = gstComp.taxableAmount;
  const cgst        = gstComp.cgst;
  const sgst        = gstComp.sgst;
  const igst        = gstComp.igst;
  const totalAmount = gstComp.totalAmount;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // ── Validation ────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!voucherNo.trim()) return 'Voucher number is required';
    if (!partyName.trim()) return 'Party name is required';
    if (!isValidGSTIN(gstin))  return `Invalid GSTIN: ${gstin}`;
    if (!itemName.trim())  return 'Item name is required';
    if (!/^\d{4,8}$/.test(hsn)) return 'HSN code must be 4-8 digits';
    if (qty <= 0)          return 'Quantity must be > 0';
    if (rate <= 0)         return 'Rate must be > 0';
    return null;
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }

    setSaving(true);
    try {
      const res = await apiPost('/api/vouchers', {
invoiceId: row.id,
          voucherNo, date, partyName, gstin,
          itemName, ledger, hsn, qty, rate, gstRate,
          taxableAmt, cgst, sgst, igst, totalAmount,
        });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`✅ Voucher ${voucherNo} saved & synced — status updated to Matched`);
      onSaved(row.id);
      onClose();
    } catch (e: any) {
      // Graceful fallback if backend is down during demo
      toast.warning('Backend offline — status updated locally only');
      onSaved(row.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // ── Render field helper ───────────────────────────────────────
  const Field = ({
    label, children, required,
  }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}{required && <span style={{ color: '#f43f5e' }}> *</span>}
      </label>
      {children}
    </div>
  );

  return createPortal(
    <div className="modal-backdrop" ref={overlayRef} onClick={handleOverlayClick}>
      <div
        className="glass-modal animate-slide-up w-full"
        style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)' }}>
              <Plus size={16} color="white" />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Add Missing Voucher
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Pre-filled from GSTR-2B Portal · {row.vendor}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Section 1: Header Details ── */}
          <div>
            <p className="section-label">① Header Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Voucher No." required>
                <div className="flex gap-2">
                  <input
                    className="field-input flex-1"
                    value={voucherNo}
                    onChange={e => setVoucherNo(e.target.value)}
                  />
                  <button
                    onClick={() => setVoucherNo(generateVoucherNo())}
                    className="px-2.5 rounded-lg border transition-colors"
                    style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-hover)' }}
                    title="Generate new"
                  >
                    <RefreshCw size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </Field>
              <Field label="Date" required>
                <input
                  type="date"
                  className="field-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </Field>
              <Field label="Party Name" required>
                <input
                  className="field-input"
                  value={partyName}
                  onChange={e => setPartyName(e.target.value)}
                />
              </Field>
              <Field label="GSTIN" required>
                <input
                  className="field-input font-mono"
                  value={gstin}
                  onChange={e => setGstin(e.target.value.toUpperCase())}
                  maxLength={15}
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {isValidGSTIN(gstin)
                    ? `✅ ${getStateName(gstin)}`
                    : gstin.length > 0 ? '❌ Invalid GSTIN format' : ''}
                </p>
              </Field>
            </div>
          </div>

          {/* ── Section 2: Item Details ── */}
          <div>
            <p className="section-label">② Item Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Item Name" required>
                <input
                  className="field-input"
                  placeholder="e.g. Raw Material – Steel"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                />
              </Field>
              <Field label="Ledger" required>
                <select
                  className="field-input"
                  value={ledger}
                  onChange={e => setLedger(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {LEDGERS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="HSN Code" required>
                <input
                  className="field-input font-mono"
                  placeholder="e.g. 7208"
                  value={hsn}
                  onChange={e => setHsn(e.target.value.replace(/\D/g, '').slice(0, 8))}
                />
              </Field>
              <Field label="GST Rate (%)">
                <select
                  className="field-input"
                  value={gstRate}
                  onChange={e => setGstRate(Number(e.target.value))}
                  style={{ cursor: 'pointer' }}
                >
                  {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </Field>
              <Field label="Quantity" required>
                <input
                  type="number" min={1}
                  className="field-input"
                  value={qty}
                  onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                />
              </Field>
              <Field label="Rate per Unit (₹)" required>
                <input
                  type="number" min={0}
                  className="field-input"
                  value={rate}
                  onChange={e => setRate(Math.max(0, Number(e.target.value)))}
                />
              </Field>
            </div>
          </div>

          {/* ── Section 3: Tax Details (Auto-calculated) ── */}
          <div>
            <p className="section-label">③ Tax Details — Auto Calculated</p>
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-glass)' }}
            >
              {[
                { label: 'Taxable Amount', val: formatINR(taxableAmt), highlight: false },
                { label: `CGST @ ${gstRate / 2}%`, val: formatINR(cgst), highlight: false },
                { label: `SGST @ ${gstRate / 2}%`, val: formatINR(sgst), highlight: false },
                { label: 'IGST', val: igst > 0 ? formatINR(igst) : '₹0 (Same State)', highlight: false },
              ].map(({ label, val, highlight }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span className={`text-sm font-semibold ${highlight ? 'text-purple-500' : ''}`} style={{ color: highlight ? '#7c3aed' : 'var(--text-primary)' }}>
                    {val}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between items-center pt-3"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Total Invoice Value
                </span>
                <span className="text-base font-bold" style={{ color: '#7c3aed' }}>
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Warning banner ── */}
          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.30)' }}
          >
            <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: '#d97706' }}>
              <strong>Double-check all amounts before saving.</strong> Once synced, this voucher will reflect in your
              GSTR-2B reconciliation and update the match status to <strong>Matched</strong>.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="animate-spin inline-block mr-1">⏳</span> Saving…</>
              : <><Save size={15} /> Save &amp; Close</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
