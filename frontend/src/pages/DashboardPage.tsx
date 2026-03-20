import { motion } from 'framer-motion';
import { DashboardStats } from '../components/DashboardStats';
import FileUploadArea from '../components/FileUploadArea';
import MonthlyDeltaView from '../components/MonthlyDeltaView';
import { toast } from '../components/Toast';

interface DashboardPageProps {
  user: any;
  firmName: string;
  data: any[] | null;
  summary: any | null;
  monthly: any[] | null;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  handleReconciliationComplete: (d: any[], s: any, m?: any[]) => void;
}

const AnalyticsChart = () => {
  // SVG Bezier points for smooth curve
  const points = `M 0,140 C 60,110 120,130 180,80 S 260,60 320,50 S 380,70 420,40 S 480,30 550,20`;
  const fillPoints = `${points} L 550,180 L 0,180 Z`;

  return (
    <div className="glass-card mb-6 relative overflow-hidden h-[180px] p-5" style={{ background: 'linear-gradient(145deg, rgba(79, 70, 229, 0.04), rgba(124, 58, 237, 0.04))' }}>
      <div className="absolute top-5 left-6 z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Historical Performance</p>
        <h3 className="text-2xl font-black mt-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>94.2% Match Rate</h3>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 mt-1">
          <svg size={12} fill="currentColor" viewBox="0 0 24 24" className="w-3 h-3"><path d="M7 14l5-5 5 5z"/></svg>
          +2.4% this month
        </span>
      </div>
      <div className="absolute top-5 right-6 z-10 flex gap-1.5">
        {['1M', '3M', '6M', '1Y'].map((t, i) => (
          <button key={t} className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${i === 2 ? 'bg-indigo-600 text-white' : 'hover:bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]'}`}>{t}</button>
        ))}
      </div>
      <svg viewBox="0 0 550 180" className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <motion.path 
          d={fillPoints} 
          fill="url(#chart-area-grad)" 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.path 
          d={points} 
          fill="none" 
          stroke="url(#chart-line-grad)" 
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

export default function DashboardPage({ user, firmName, data, summary, monthly, setActiveTab, searchQuery, handleReconciliationComplete }: DashboardPageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
    >
      <div style={{ background: '#ffffff', borderRadius: 24, padding: '36px 44px', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', marginBottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 190 }}>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px', fontWeight: 500, letterSpacing: '0.5px' }}>{user.email} · FY 2025-26</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', letterSpacing: '-0.8px' }}>Welcome back, {firmName} 👋</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0, maxWidth: 460, lineHeight: 1.6 }}>KnightOwl is ready to automate your GST reconciliation for today. Let's save some hours!</p>
        <div style={{ position: 'absolute', right: 20, bottom: -15, width: 230, height: 230, zIndex: 1 }}>
          <img src="/cute_bear.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      </div>

      <DashboardStats summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AnalyticsChart />
          <div className="glass-card p-6 h-full flex-1">
            <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Inspection Queue</h3>
            <div className="space-y-3">
              {[
                { name: 'Last upload', status: data ? 'Completed' : 'No data', time: data ? 'Recent' : 'Upload files', errors: summary?.pendingInvoices || 0 },
              ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
               .map((item, i) => (
                <div key={i} onClick={() => setActiveTab('gstr2b')} className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'var(--bg-hover)', border: '1px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-glass)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: item.status === 'Completed' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)', color: item.status === 'Completed' ? '#10b981' : '#3b82f6' }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab('gstr2b')} className="btn-ghost btn-sm w-full mt-5 justify-center">
              Run Reconciliation →
            </button>
          </div>
        </div>
        <div className="lg:col-span-2">
          <FileUploadArea mode="gstr2b" onReconciliationComplete={handleReconciliationComplete} />
        </div>
      </div>

      <MonthlyDeltaView data={monthly} onMonthClick={() => setActiveTab('monthly')} />
    </motion.div>
  );
}
