import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, BarChart2 } from 'lucide-react';
import { formatINR0, MONTHS } from '../utils/gst';

export type MonthlyDelta = {
  month: string;
  tally:  { invoices: number; taxableAmt: number; taxAmt: number };
  portal: { invoices: number; taxableAmt: number; taxAmt: number };
  delta:  { invoices: number; taxableAmt: number; taxAmt: number };
};

interface MonthlyDeltaViewProps {
  data: MonthlyDelta[] | null;
  onMonthClick?: (month: string) => void;
}

const DEMO_DATA: MonthlyDelta[] = MONTHS.slice(0, 9).map((m, i) => {
  const base = 800000 + i * 50000;
  const portalAmt = base - (i % 3 === 0 ? -20000 : i % 2 === 0 ? 15000 : 0);
  const invBase = 42 + i * 2;
  const portalInv = invBase + (i % 4 === 0 ? -2 : 0);
  return {
    month: m,
    tally:  { invoices: invBase,   taxableAmt: base,      taxAmt: Math.round(base * 0.18)  },
    portal: { invoices: portalInv, taxableAmt: portalAmt, taxAmt: Math.round(portalAmt * 0.18) },
    delta:  {
      invoices: portalInv - invBase,
      taxableAmt: portalAmt - base,
      taxAmt:  Math.round((portalAmt - base) * 0.18),
    },
  };
});

// Normalise backend monthly data (which uses taxAmt) into MonthlyDelta shape
function formatMonthLabel(m: string): string {
  // Convert YYYY-MM to "Apr '25" format
  if (/^\d{4}-\d{2}$/.test(m)) {
    const d = new Date(m + '-01');
    return d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
  }
  return m;
}

function normaliseBackendData(raw: any[]): MonthlyDelta[] {
  return raw.map(r => ({
    month: formatMonthLabel(r.month),
    tally:  { invoices: r.tally?.invoices || 0,  taxableAmt: r.tally?.taxAmt || 0,  taxAmt: r.tally?.taxAmt  || 0 },
    portal: { invoices: r.portal?.invoices || 0, taxableAmt: r.portal?.taxAmt || 0, taxAmt: r.portal?.taxAmt || 0 },
    delta:  { invoices: r.delta?.invoices || 0,  taxableAmt: r.delta?.taxAmt  || 0, taxAmt: r.delta?.taxAmt  || 0 },
  }));
}

function DeltaCell({ val }: { val: number }) {
  if (val === 0) return <span className="delta-zero">—</span>;
  const positive = val > 0;
  return (
    <span className={positive ? 'delta-pos' : 'delta-neg'} style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? '+' : ''}{val.toLocaleString('en-IN')}
    </span>
  );
}

export default function MonthlyDeltaView({ data, onMonthClick }: MonthlyDeltaViewProps) {
  const [view, setView] = useState<'table' | 'chart'>('table');
  const rows = data && data.length > 0 ? normaliseBackendData(data) : DEMO_DATA;

  // Chart max for normalization
  const maxAmt = Math.max(...rows.map(r => Math.max(r.tally.taxableAmt, r.portal.taxableAmt)));

  return (
    <div className="glass-card p-6" style={{ marginTop: 24 }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Monthly Reconciliation Overview
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {data ? 'Live data' : 'Sample data — upload files to see real numbers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {(['table', 'chart'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-1.5 text-xs font-medium capitalize transition-all"
                style={{
                  background: view === v ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent',
                  color: view === v ? 'white' : 'var(--text-muted)',
                }}
              >
                {v === 'chart' ? '📊' : '📋'} {v}
              </button>
            ))}
          </div>
          <button
            className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
            style={{ borderRadius: 10 }}
          >
            FY 2024-25 <ChevronDown size={13} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        {[
          { color: '#7c3aed', label: 'Tally (Books)' },
          { color: '#0ea5e9', label: 'Portal (GSTN)' },
          { color: '#ef4444', label: 'Variance' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* ── TABLE VIEW ── */}
      {view === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Month', 'Tally Inv.', 'Portal Inv.', 'Δ Inv.', 'Tally Taxable', 'Portal Taxable', 'Δ Taxable', 'Δ Tax'].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-left"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="tbl-row cursor-pointer"
                  onClick={() => onMonthClick?.(row.month)}
                  title={`Click to view ${row.month} transactions`}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {row.month}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {row.tally.invoices}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {row.portal.invoices}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeltaCell val={row.delta.invoices} />
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {formatINR0(row.tally.taxableAmt)}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {formatINR0(row.portal.taxableAmt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeltaCell val={row.delta.taxableAmt} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeltaCell val={row.delta.taxAmt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── CHART VIEW ── */}
      {view === 'chart' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end gap-3" style={{ minWidth: 600, height: 200 }}>
            {rows.map((row, i) => {
              const tallyH  = Math.max(8, Math.round((row.tally.taxableAmt / maxAmt) * 180));
              const portalH = Math.max(8, Math.round((row.portal.taxableAmt / maxAmt) * 180));
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                  onClick={() => onMonthClick?.(row.month)}
                  title={row.month}
                >
                  <div className="flex items-end gap-1 w-full">
                    {/* Tally bar */}
                    <div
                      className="flex-1 chart-bar group-hover:brightness-110"
                      style={{
                        height: tallyH,
                        background: 'linear-gradient(to top, #6d28d9, #a78bfa)',
                        boxShadow: '0 0 10px rgba(124,58,237,0.30)',
                      }}
                    />
                    {/* Portal bar */}
                    <div
                      className="flex-1 chart-bar group-hover:brightness-110"
                      style={{
                        height: portalH,
                        background: 'linear-gradient(to top, #0284c7, #38bdf8)',
                        boxShadow: '0 0 10px rgba(14,165,233,0.30)',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {row.month.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!data && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border-glass)' }}>
          <BarChart2 size={16} style={{ color: '#818cf8' }} />
          <p className="text-xs" style={{ color: 'var(--text-accent)' }}>
            Upload your files above to replace sample data with real reconciliation numbers.
          </p>
        </div>
      )}
    </div>
  );
}
