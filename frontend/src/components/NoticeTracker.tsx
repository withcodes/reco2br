import { useState, useEffect } from 'react';
import { Plus, Bell, X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Notice { id: string; clientName: string; gstin: string; noticeType: string; dateReceived: string; replyDeadline: string; status: 'Open' | 'Replied' | 'Closed'; notes: string; }

const NOTICE_TYPES = ['ASMT-10','DRC-01','DRC-01A','DRC-02','REG-03','REG-17','GST ADJ-01','SCN (Show Cause Notice)','Other'];
const EMPTY_NOTICE: Omit<Notice, 'id'> = { clientName: '', gstin: '', noticeType: NOTICE_TYPES[0], dateReceived: new Date().toISOString().slice(0,10), replyDeadline: '', status: 'Open', notes: '' };

const STATUS_META: Record<string, { color: string; bg: string; icon: any }> = {
  'Open':    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle },
  'Replied': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  'Closed':  { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
};

export default function NoticeTracker() {
  const [notices, setNotices] = useState<Notice[]>(() => {
    try { return JSON.parse(localStorage.getItem('gstsync_notices') || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_NOTICE });

  useEffect(() => { localStorage.setItem('gstsync_notices', JSON.stringify(notices)); }, [notices]);

  const save = () => {
    if (!form.clientName || !form.replyDeadline) return;
    setNotices(p => [...p, { ...form, id: Date.now().toString() }]);
    setForm({ ...EMPTY_NOTICE });
    setShowForm(false);
  };

  const updateStatus = (id: string, status: Notice['status']) =>
    setNotices(p => p.map(n => n.id === id ? { ...n, status } : n));

  const remove = (id: string) => setNotices(p => p.filter(n => n.id !== id));

  const daysLeft = (deadline: string) => {
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return d;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>GST Notice Tracker</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{notices.filter(n => n.status === 'Open').length} open notices · Track deadlines and replies</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Log Notice</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Log New Notice</h3>
            <button onClick={() => setShowForm(false)}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Client Name *</label>
              <input className="field-input" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} placeholder="Firm name" /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>GSTIN</label>
              <input className="field-input font-mono" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} placeholder="24AAFCL3021L1ZQ" maxLength={15} /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Notice Type</label>
              <select className="field-input" value={form.noticeType} onChange={e => setForm(p => ({ ...p, noticeType: e.target.value }))}>
                {NOTICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Date Received</label>
              <input type="date" className="field-input" value={form.dateReceived} onChange={e => setForm(p => ({ ...p, dateReceived: e.target.value }))} /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Reply Deadline *</label>
              <input type="date" className="field-input" value={form.replyDeadline} onChange={e => setForm(p => ({ ...p, replyDeadline: e.target.value }))} /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Notes</label>
              <input className="field-input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Brief description…" /></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Notice</button>
          </div>
        </div>
      )}

      {notices.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No notices logged</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)', maxWidth: 360 }}>Log GST notices to track deadlines, link evidence, and manage replies.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Client', 'GSTIN', 'Notice Type', 'Received', 'Deadline', 'Days Left', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notices.map(n => {
                const meta = STATUS_META[n.status];
                const Icon = meta.icon;
                const days = daysLeft(n.replyDeadline);
                return (
                  <tr key={n.id} className="tbl-row">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{n.clientName}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{n.gstin || '—'}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>{n.noticeType}</span></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(n.dateReceived).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(n.replyDeadline).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {n.status !== 'Closed' && (
                        <span className="text-xs font-bold" style={{ color: days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981' }}>
                          {days < 0 ? 'Overdue' : `${days}d`}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full w-fit" style={{ background: meta.bg, color: meta.color }}>
                        <Icon size={10} />{n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {n.status === 'Open' && <button className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }} onClick={() => updateStatus(n.id, 'Replied')}>Mark Replied</button>}
                        {n.status === 'Replied' && <button className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }} onClick={() => updateStatus(n.id, 'Closed')}>Close</button>}
                        <button onClick={() => remove(n.id)} className="p-1 rounded hover:bg-red-500/10 ml-1"><X size={13} color="#f43f5e" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
