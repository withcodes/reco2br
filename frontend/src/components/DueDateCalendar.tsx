import { CalendarDays, AlertCircle, CheckCircle, Clock } from 'lucide-react';

function getDueDate(dayOfMonth: number, monthOffset: number = 1): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, dayOfMonth);
  return d;
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
}

function fmt(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DueDateCalendar() {
  const deadlines = [
    { name: 'GSTR-1', desc: 'Outward supplies (monthly)', due: getDueDate(11), form: '4A, 4B, 4C, 6B, 6C', color: '#7c3aed' },
    { name: 'GSTR-3B', desc: 'Monthly return & tax payment', due: getDueDate(20), form: 'Tax payment', color: '#0ea5e9' },
    { name: 'GSTR-1 (Quarterly)', desc: 'QRMP scheme filers', due: getDueDate(13), form: 'QRMP', color: '#6366f1' },
    { name: 'GSTR-9', desc: 'Annual return', due: new Date(new Date().getFullYear(), 11, 31), form: 'Annual', color: '#f59e0b' },
    { name: 'GSTR-9C', desc: 'Reconciliation statement', due: new Date(new Date().getFullYear(), 11, 31), form: 'Audit', color: '#e07b39' },
    { name: 'TDS under GST', desc: 'Section 51 deductors', due: getDueDate(10), form: 'GSTR-7', color: '#10b981' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>GST Due Date Calendar</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Upcoming filing deadlines — alerts when less than 7 days remain</p>
        </div>
        <div className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
          <CalendarDays size={13} /> FY 2025-26
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {deadlines.map((d, i) => {
          const days = daysUntil(d.due);
          const isUrgent = days <= 3;
          const isWarning = days > 3 && days <= 7;
          const isPast = days < 0;
          const statusColor = isPast ? '#6b7280' : isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
          const statusBg = isPast ? 'rgba(107,114,128,0.1)' : isUrgent ? 'rgba(239,68,68,0.1)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
          const StatusIcon = isPast ? CheckCircle : isUrgent ? AlertCircle : Clock;
          return (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ background: `${d.color}18` }}>
                    <CalendarDays size={18} style={{ color: d.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{d.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.desc}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full" style={{ background: statusBg, color: statusColor }}>
                  <StatusIcon size={11} />
                  {isPast ? 'Filed' : isUrgent ? `${days}d left!` : isWarning ? `${days}d left` : `${days}d`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Due: <strong style={{ color: 'var(--text-primary)' }}>{fmt(d.due)}</strong></span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{d.form}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-5 mt-5 flex items-start gap-3">
        <AlertCircle size={18} style={{ color: '#818cf8', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Late filing penalties</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>GSTR-1 and GSTR-3B: ₹50/day (₹20/day for nil returns). Interest at 18% p.a. on late tax payment. Maximum late fee ₹10,000 per return.</p>
        </div>
      </div>
    </div>
  );
}
