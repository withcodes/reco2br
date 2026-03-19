import { apiPost } from '../utils/api';
import { useState, useMemo, Fragment, useEffect } from 'react';
import { Search, Filter, Download, Plus, Loader2, X, ChevronLeft, ChevronRight, CheckCircle, MinusCircle, Clock } from 'lucide-react';
import type { ReconciledItem, SummaryStats } from '../App';
import { STATUS_META, RECO_STATUSES, type RecoStatus } from '../utils/gst';
import AddVoucherModal from './AddVoucherModal';
import { toast } from './Toast';

interface ReconciliationGridProps {
  liveData: ReconciledItem[] | null;
  summary:  SummaryStats   | null;
  onVoucherSaved?: (id: number) => void;
  globalSearch?: string;
}


const PAGE_SIZE = 50;

// Action tracker types
type ActionStatus = '' | 'Fixed' | 'Ignored' | 'Pending';
const ACTION_META: Record<ActionStatus, { label: string; color: string; bg: string }> = {
  '':        { label: 'Mark',    color: 'var(--text-muted)',  bg: 'var(--bg-hover)' },
  'Fixed':   { label: 'Fixed',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  'Ignored': { label: 'Ignored', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  'Pending': { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

export default function ReconciliationGrid({ liveData, summary, onVoucherSaved, globalSearch }: ReconciliationGridProps) {
  const [search,        setSearch]        = useState('');
  const [activeFilters, setActiveFilters] = useState<RecoStatus[]>([]);
  const [voucherRow,    setVoucherRow]    = useState<ReconciledItem | null>(null);
  const [isExporting,   setIsExporting]   = useState(false);
  const [expandedRows,  setExpandedRows]  = useState<number[]>([]);
  const [page,          setPage]          = useState(1);
  // action tracker: rowId → ActionStatus stored in local state
  const [actions,       setActions]       = useState<Record<number, ActionStatus>>({});

  const toggleRow = (id: number) =>
    setExpandedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const setAction = (id: number, a: ActionStatus) =>
    setActions(prev => ({ ...prev, [id]: a }));

  const normalise = (s: string): RecoStatus => {
    const map: Record<string, RecoStatus> = {
      'Exact Match': 'Matched', 'Fuzzy Match': 'Manual-Matched',
      'Amount Mismatch': 'Partially-Matched', 'Missing in PR': 'Not In Tally',
      'Missing in 2B': 'Not In Portal',
      'Matched': 'Matched', 'Manual-Matched': 'Manual-Matched',
      'Partially-Matched': 'Partially-Matched', 'Not In Tally': 'Not In Tally', 'Not In Portal': 'Not In Portal',
    };
    return map[s] ?? 'Matched';
  };

  const toggleFilter = (s: RecoStatus) =>
    setActiveFilters(prev => prev.includes(s) ? prev.filter(f => f !== s) : [...prev, s]);

  const rows = useMemo(() => {
    if (!liveData) return [];
    const q = search.toLowerCase();
    const gq = (globalSearch || '').toLowerCase();
    return liveData.filter(r => {
      const status = normalise(r.status);
      const matchQ = !q || [r.vendor, r.gstin, r.invoiceNo].some(v => v?.toLowerCase().includes(q));
      const matchGQ = !gq || [r.vendor, r.gstin, r.invoiceNo].some(v => v?.toLowerCase().includes(gq));
      const matchF = activeFilters.length === 0 || activeFilters.includes(status);
      return matchQ && matchGQ && matchF;
    });
  }, [liveData, search, globalSearch, activeFilters]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows  = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const handleFilterToggle = (s: RecoStatus) => { toggleFilter(s); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  useEffect(() => { setPage(1); }, [globalSearch]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  const handleExport = async () => {
    if (!liveData || !summary) return;
    setIsExporting(true);
    try {
      const res = await apiPost('/api/export', { summary, data: liveData });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `GSTSync_Recon_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Reconciliation sheet exported successfully!');
    } catch { toast.error('Export failed — check backend connection.'); }
    finally { setIsExporting(false); }
  };

  const statusCounts = useMemo(() => {
    const c: Partial<Record<RecoStatus, number>> = {};
    (liveData ?? []).forEach(r => { const s = normalise(r.status); c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [liveData]);

  if (!liveData) {
    return (
      <div className="glass-card p-16 mt-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
        <Search size={44} style={{ color: 'var(--text-muted)', marginBottom: 14 }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No Data Yet</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', maxWidth: 340 }}>Upload Purchase Register and GSTR-2B files above to see reconciliation results.</p>
      </div>
    );
  }

  return (
    <>
      {voucherRow && (
        <AddVoucherModal row={voucherRow} onClose={() => setVoucherRow(null)}
          onSaved={(id) => { onVoucherSaved?.(id); setVoucherRow(null); }} />
      )}

      <div className="glass-card p-6 mt-6" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Reconciliation Results</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {rows.length} of {liveData.length} invoices · Page {page}/{totalPages}
              {activeFilters.length > 0 && ` · filtered`}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search vendor / GSTIN / invoice…" value={search}
                onChange={e => handleSearch(e.target.value)} className="field-input pl-8 pr-3 py-2 text-xs" style={{ width: 220 }} />
              {search && (
                <button onClick={() => handleSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X size={13} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
            <button className="btn-primary btn-sm" onClick={handleExport} disabled={isExporting || !liveData.length}>
              {isExporting ? <><Loader2 size={13} className="animate-spin" /> Exporting…</> : <><Download size={13} /> Export Excel</>}
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span className="flex items-center gap-1 text-xs mr-1" style={{ color: 'var(--text-muted)' }}>
            <Filter size={12} /> Filter:
          </span>
          <button className={`filter-chip ${activeFilters.length === 0 ? 'active' : ''}`} onClick={() => { setActiveFilters([]); setPage(1); }}>
            All ({liveData.length})
          </button>
          {RECO_STATUSES.map(s => {
            const count = statusCounts[s] ?? 0;
            if (!count) return null;
            return (
              <button key={s} onClick={() => handleFilterToggle(s)} className={`filter-chip ${activeFilters.includes(s) ? 'active' : ''}`}>
                {s} ({count})
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Vendor Name','GSTIN','Invoice No.','Date','PR Amount','2B Amount','Status','Category','Action Taken','Voucher'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map(row => {
                const status   = normalise(row.status);
                const meta     = STATUS_META[status];
                const isExp    = expandedRows.includes(row.id);
                // Read persistent status from localStorage if available
                const action   = actions[row.id] || '';

                return (
                  <Fragment key={row.id}>
                    <tr className="tbl-row cursor-pointer" onClick={() => toggleRow(row.id)} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRow(row.id); } }}>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{row.vendor}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{row.gstin}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{row.invoiceNo}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{row.date}</td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(row.prAmount)}</td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>{fmt(row.gstrAmount)}</td>
                      <td className="px-4 py-3"><span className={meta.pillClass}>{meta.label}</span></td>
                      <td className="px-4 py-3">
                        {row.category
                          ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>{row.category}</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      {/* Action Taken tracker */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {(['Fixed', 'Pending', 'Ignored'] as ActionStatus[]).map(a => (
                            <button key={a} onClick={() => setAction(row.id, action === a ? '' : a)}
                              className="text-[10px] px-1.5 py-0.5 rounded font-semibold transition-all"
                              style={{ background: action === a ? ACTION_META[a].bg : 'var(--bg-hover)', color: action === a ? ACTION_META[a].color : 'var(--text-muted)', border: `1px solid ${action === a ? ACTION_META[a].color : 'transparent'}` }}>
                              {a === 'Fixed' ? <CheckCircle size={10} style={{ display: 'inline', marginRight: 2 }} /> : a === 'Ignored' ? <MinusCircle size={10} style={{ display: 'inline', marginRight: 2 }} /> : <Clock size={10} style={{ display: 'inline', marginRight: 2 }} />}
                              {a}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        {status === 'Not In Tally'
                          ? <button className="btn-voucher" onClick={() => setVoucherRow(row)}><Plus size={12} /> Add</button>
                          : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                    </tr>
                    {isExp && (
                      <tr style={{ background: 'var(--bg-hover)' }}>
                        <td colSpan={10} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {row._prRaw && (
                              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
                                <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-accent)' }}>Purchase Register</h4>
                                <div className="space-y-1">
                                  {Object.entries(row._prRaw).filter(([k, v]) => v !== '' && !k.startsWith('_')).map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-2 border-b border-dashed pb-0.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                      <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                                      <span className="font-mono text-right" style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {row._gstrRaw && (
                              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-subtle)' }}>
                                <h4 className="font-semibold text-sm mb-2" style={{ color: '#10b981' }}>GSTR-2B Item</h4>
                                <div className="space-y-1">
                                  {Object.entries(row._gstrRaw).filter(([k, v]) => v !== '' && !k.startsWith('UNKNOWN_') && !k.startsWith('_')).map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-2 border-b border-dashed pb-0.5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                      <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                                      <span className="font-mono text-right" style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {pagedRows.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {search || activeFilters.length > 0 ? 'No invoices match your filters.' : 'No data to display.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {rows.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} records
            </p>
            <div className="flex items-center gap-2">
              <button className="btn-ghost btn-sm flex items-center gap-1" disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={14} /> Prev
              </button>
              {/* Page pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pg = i + 1;
                if (totalPages > 5) {
                  if (page <= 3) pg = i + 1;
                  else if (page >= totalPages - 2) pg = totalPages - 4 + i;
                  else pg = page - 2 + i;
                }
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${page === pg ? 'btn-primary' : 'btn-ghost'}`}>
                    {pg}
                  </button>
                );
              })}
              <button className="btn-ghost btn-sm flex items-center gap-1" disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
