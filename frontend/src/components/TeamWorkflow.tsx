import { useState, useEffect } from 'react';
import { Users, Plus, UserCheck, X, Shield, User, CheckCircle } from 'lucide-react';

interface TeamMember { id: string; name: string; email: string; role: 'Senior CA' | 'Junior CA' | 'Admin'; assignedClients: string[]; }
interface Assignment { id: string; clientName: string; gstin: string; assignedTo: string; status: 'Pending Review' | 'In Progress' | 'Approved' | 'Needs Rework'; createdAt: string; }

const EMPTY_MEMBER = { name: '', email: '', role: 'Junior CA' as const };

const ROLE_META: Record<string, { color: string; bg: string; icon: any }> = {
  'Admin':      { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', icon: Shield },
  'Senior CA':  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', icon: UserCheck },
  'Junior CA':  { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: User },
};
const STATUS_META: Record<string, { color: string; bg: string }> = {
  'Pending Review':  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'In Progress':     { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  'Approved':        { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'Needs Rework':    { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function TeamWorkflow() {
  const [members, setMembers] = useState<TeamMember[]>(() => {
    try { return JSON.parse(localStorage.getItem('gstsync_team') || '[]'); } catch { return []; }
  });
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try { return JSON.parse(localStorage.getItem('gstsync_assignments') || '[]'); } catch { return []; }
  });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_MEMBER });
  const [assignForm, setAssignForm] = useState({ clientName: '', gstin: '', assignedTo: '' });

  useEffect(() => { localStorage.setItem('gstsync_team', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('gstsync_assignments', JSON.stringify(assignments)); }, [assignments]);

  const addMember = () => {
    if (!form.name || !form.email) return;
    setMembers(p => [...p, { ...form, id: Date.now().toString(), assignedClients: [] }]);
    setForm({ ...EMPTY_MEMBER }); setShowMemberForm(false);
  };

  const addAssignment = () => {
    if (!assignForm.clientName || !assignForm.assignedTo) return;
    setAssignments(p => [...p, { ...assignForm, id: Date.now().toString(), status: 'In Progress', createdAt: new Date().toLocaleDateString('en-IN') }]);
    setAssignForm({ clientName: '', gstin: '', assignedTo: '' }); setShowAssignForm(false);
  };

  const updateStatus = (id: string, status: Assignment['status']) =>
    setAssignments(p => p.map(a => a.id === id ? { ...a, status } : a));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Team Workflow</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{members.length} team members · {assignments.filter(a => a.status !== 'Approved').length} open tasks</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setShowAssignForm(true)}><Plus size={16} /> Assign Client</button>
          <button className="btn-primary" onClick={() => setShowMemberForm(true)}><Users size={16} /> Add Member</button>
        </div>
      </div>

      {/* Add member form */}
      {showMemberForm && (
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Add Team Member</h3>
            <button onClick={() => setShowMemberForm(false)}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Name *</label>
              <input className="field-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Email *</label>
              <input type="email" className="field-input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@firm.com" /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Role</label>
              <select className="field-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as any }))}>
                <option>Admin</option><option>Senior CA</option><option>Junior CA</option>
              </select></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button className="btn-ghost" onClick={() => setShowMemberForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={addMember}>Add Member</button>
          </div>
        </div>
      )}

      {/* Assign form */}
      {showAssignForm && (
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Assign Client to Team Member</h3>
            <button onClick={() => setShowAssignForm(false)}><X size={16} style={{ color: 'var(--text-muted)' }} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Client Name *</label>
              <input className="field-input" value={assignForm.clientName} onChange={e => setAssignForm(p => ({ ...p, clientName: e.target.value }))} /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>GSTIN</label>
              <input className="field-input font-mono" value={assignForm.gstin} onChange={e => setAssignForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} maxLength={15} /></div>
            <div><label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Assign To *</label>
              <select className="field-input" value={assignForm.assignedTo} onChange={e => setAssignForm(p => ({ ...p, assignedTo: e.target.value }))}>
                <option value="">Select member…</option>
                {members.map(m => <option key={m.id} value={m.name}>{m.name} ({m.role})</option>)}
              </select></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button className="btn-ghost" onClick={() => setShowAssignForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={addAssignment}>Assign</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team members */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>TEAM MEMBERS</h3>
          {members.length === 0
            ? <div className="glass-card p-8 text-center"><Users size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No team members yet</p></div>
            : <div className="space-y-3">
                {members.map(m => {
                  const rm = ROLE_META[m.role];
                  const Icon = rm.icon;
                  return (
                    <div key={m.id} className="glass-card p-4 flex items-center gap-3">
                      <div className="p-2 rounded-xl flex-shrink-0" style={{ background: rm.bg }}><Icon size={18} style={{ color: rm.color }} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{m.email}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: rm.bg, color: rm.color }}>{m.role}</span>
                      <button onClick={() => setMembers(p => p.filter(x => x.id !== m.id))} className="p-1 rounded hover:bg-red-500/10"><X size={13} color="#f43f5e" /></button>
                    </div>
                  );
                })}
              </div>
          }
        </div>

        {/* Assignments */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>TASK ASSIGNMENTS</h3>
          {assignments.length === 0
            ? <div className="glass-card p-8 text-center"><CheckCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} /><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No assignments yet</p></div>
            : <div className="glass-card overflow-hidden">
                <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-hover)' }}>
                      {['Client', 'GSTIN', 'Assigned To', 'Created', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => {
                      const sm = STATUS_META[a.status];
                      return (
                        <tr key={a.id} className="tbl-row">
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{a.clientName}</td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{a.gstin || '—'}</td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{a.assignedTo}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{a.createdAt}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: sm.bg, color: sm.color }}>{a.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {a.status !== 'Approved' && <button className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }} onClick={() => updateStatus(a.id, 'Approved')}>Approve</button>}
                              {a.status !== 'Needs Rework' && a.status !== 'Approved' && <button className="text-[10px] px-2 py-0.5 rounded font-semibold" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }} onClick={() => updateStatus(a.id, 'Needs Rework')}>Rework</button>}
                              <button onClick={() => setAssignments(p => p.filter(x => x.id !== a.id))} className="p-0.5"><X size={12} color="#f43f5e" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </div>
  );
}
