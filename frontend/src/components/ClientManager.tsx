import { useState, useEffect } from 'react';
import { Plus, Building2, Trash2, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

interface Client { id: string; name: string; gstin: string; lastReco: string; status: 'Completed' | 'Pending' | 'Action Required'; pendingCount: number; }

const EMPTY: Client = { id: '', name: '', gstin: '', lastReco: '', status: 'Pending', pendingCount: 0 };

const STATUS_STYLES: Record<string, { bg: string; color: string; icon: any }> = {
  'Completed':       { bg: 'rgba(16,185,129,0.12)', color: '#10b981', icon: CheckCircle },
  'Pending':         { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', icon: Clock },
  'Action Required': { bg: 'rgba(245,158,11,0.12)',  color: '#d97706', icon: AlertTriangle },
};

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>(() => {
    try { return JSON.parse(localStorage.getItem('gstsync_clients') || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<typeof EMPTY>({ ...EMPTY });

  useEffect(() => { localStorage.setItem('gstsync_clients', JSON.stringify(clients)); }, [clients]);

  const save = () => {
    if (!form.name.trim() || !form.gstin.trim()) return;
    const client: Client = { ...form, id: Date.now().toString(), lastReco: new Date().toLocaleDateString('en-IN'), pendingCount: 0 };
    setClients(p => [...p, client]);
    setForm({ ...EMPTY });
    setShowForm(false);
  };

  const remove = (id: string) => setClients(p => p.filter(c => c.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Client Manager</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{clients.length} clients · Manage all GSTINs from one place</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Client</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>New Client</h3>
            <button onClick={() => setShowForm(false)}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Client / Firm Name *</label>
              <input className="field-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Lucichem Pvt Ltd" /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>GSTIN *</label>
              <input className="field-input font-mono" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} placeholder="24AAFCL3021L1ZQ" maxLength={15} /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select className="field-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
                <option>Pending</option><option>Completed</option><option>Action Required</option>
              </select></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={save}>Save Client</button>
          </div>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
          <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No clients yet</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)', maxWidth: 340 }}>Add your first client GSTIN to start managing their reconciliation from one dashboard.</p>
          <button className="btn-primary mt-5" onClick={() => setShowForm(true)}><Plus size={16} /> Add First Client</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map(c => {
            const st = STATUS_STYLES[c.status];
            const Icon = st.icon;
            return (
              <div key={c.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                    <Building2 size={18} color="white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1" style={{ background: st.bg, color: st.color }}>
                      <Icon size={11} /> {c.status}
                    </span>
                    <button onClick={() => remove(c.id)} className="p-1 rounded hover:bg-red-500/10 transition-colors"><Trash2 size={13} color="#f43f5e" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{c.name}</h3>
                <p className="font-mono text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{c.gstin}</p>
                <div className="flex justify-between text-xs pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Last reco: {c.lastReco || '—'}</span>
                  {c.pendingCount > 0 && <span style={{ color: '#f43f5e', fontWeight: 600 }}>{c.pendingCount} pending</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
