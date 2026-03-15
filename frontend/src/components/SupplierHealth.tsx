import { Shield, ShieldAlert, ShieldCheck, TrendingUp } from 'lucide-react';
import type { ReconciledItem } from '../App';

interface Props { data: ReconciledItem[] | null; }

export default function SupplierHealth({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
        <Shield size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No supplier data yet</h3>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)', maxWidth: 360 }}>Run a GSTR-2B reconciliation first to see supplier health scores.</p>
      </div>
    );
  }

  // Aggregate per supplier
  const supplierMap = new Map<string, { name: string; gstin: string; total: number; missing: number; matched: number; blocked: number; }>();
  for (const r of data) {
    const key = r.gstin || r.vendor;
    if (!supplierMap.has(key)) supplierMap.set(key, { name: r.vendor, gstin: r.gstin, total: 0, missing: 0, matched: 0, blocked: 0 });
    const s = supplierMap.get(key)!;
    s.total++;
    if (['Exact Match','Fuzzy Match','Matched','Manual-Matched','Partially-Matched'].includes(r.status)) s.matched++;
    if (r.status === 'Missing in PR' || r.status === 'Not In Tally') s.missing++;
    if ((r as any).category === 'ITC Blocked') s.blocked++;
  }

  const suppliers = Array.from(supplierMap.values()).sort((a, b) => b.missing - a.missing);

  const getRisk = (s: typeof suppliers[0]) => {
    if (s.blocked > 0) return { label: 'ITC Blocked', color: '#ef4444', bg: 'rgba(244,63,94,0.12)', Icon: ShieldAlert };
    if (s.missing >= 2) return { label: 'High Risk', color: '#ef4444', bg: 'rgba(244,63,94,0.12)', Icon: ShieldAlert };
    if (s.missing === 1) return { label: 'Medium Risk', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', Icon: Shield };
    return { label: 'Safe', color: '#10b981', bg: 'rgba(16,185,129,0.12)', Icon: ShieldCheck };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Supplier Health</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{suppliers.length} suppliers · ITC risk assessment from current reconciliation</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {[{ c: '#10b981', l: 'Safe' }, { c: '#f59e0b', l: 'Medium' }, { c: '#ef4444', l: 'High / Blocked' }].map(x => (
            <span key={x.l} className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: x.c }} />{x.l}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'var(--bg-hover)' }}>
              {['Supplier', 'GSTIN', 'Total Inv.', 'Matched', 'Missing in PR', 'Match Rate', 'Risk'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => {
              const risk = getRisk(s);
              const RIcon = risk.Icon;
              const rate = s.total > 0 ? Math.round((s.matched / s.total) * 100) : 0;
              return (
                <tr key={i} className="tbl-row">
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{s.gstin}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{s.total}</td>
                  <td className="px-4 py-3" style={{ color: '#10b981', fontWeight: 600 }}>{s.matched}</td>
                  <td className="px-4 py-3" style={{ color: s.missing > 0 ? '#f43f5e' : 'var(--text-muted)', fontWeight: s.missing > 0 ? 600 : 400 }}>{s.missing}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border-subtle)', maxWidth: 80 }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${rate}%`, background: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{rate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit" style={{ background: risk.bg, color: risk.color }}>
                      <RIcon size={11} />{risk.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-6 py-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)' }}>
          <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tip: Advise client to stop purchasing from High Risk suppliers — their invoices may never appear in GSTR-2B, blocking ITC.</p>
        </div>
      </div>
    </div>
  );
}
