import { useState, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import FileUploadArea from './components/FileUploadArea';
import ReconciliationGrid from './components/ReconciliationGrid';
import MonthlyDeltaView from './components/MonthlyDeltaView';
import ClientManager from './components/ClientManager';
import SupplierHealth from './components/SupplierHealth';
import DueDateCalendar from './components/DueDateCalendar';
import NoticeTracker from './components/NoticeTracker';
import Gstr3bDraft from './components/Gstr3bDraft';
import TeamWorkflow from './components/TeamWorkflow';
import { ToastContainer } from './components/Toast';
import { Bell, Search, UserCircle, LogOut, Crown } from 'lucide-react';

export type ReconciledItem = {
  id: number; vendor: string; gstin: string; invoiceNo: string; date: string;
  prAmount: number; gstrAmount: number; status: string; category?: string;
  _prRaw?: any; _gstrRaw?: any;
};
export type SummaryStats = {
  totalReconciled: number; itcAtRisk: number; pendingInvoices: number; totalTaxSaved: number;
  itcClaimable?: { igst: number; cgst: number; sgst: number };
  itcAvailed?:   { igst: number; cgst: number; sgst: number };
  itcLeakage?:   { igst: number; cgst: number; sgst: number };
};

type Tab = 'dashboard'|'gstr1'|'gstr2b'|'monthly'|'gstr3b'|'clients'|'team'|'suppliers'|'notices'|'calendar'|'settings';
type View = 'landing' | 'auth' | 'app';

const PLAN_META: Record<string, { label: string; color: string; bg: string }> = {
  starter:      { label: 'Starter',      color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' },
  professional: { label: 'Professional', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  enterprise:   { label: 'Enterprise',   color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
};

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('landing');

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data,    setData]    = useState<ReconciledItem[] | null>(null);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [monthly, setMonthly] = useState<any[] | null>(null);

  const handleVoucherSaved = useCallback((id: number) => {
    setData(prev => prev ? prev.map(r => r.id === id ? { ...r, status: 'Manual-Matched' } : r) : prev);
  }, []);

  const handleReconciliationComplete = useCallback((d: ReconciledItem[], s: SummaryStats, m?: any[]) => {
    setData(d); setSummary(s); setMonthly(m || null);
    setActiveTab('gstr2b');
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 22, height: 22, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ color: '#71717a', fontSize: 14 }}>Loading KnightOwl...</p>
        </div>
      </div>
    );
  }

  // If authenticated → show app directly
  if (user) {
    const plan = profile?.plan || 'starter';
    const planMeta = PLAN_META[plan] || PLAN_META.starter;
    const firmName = profile?.firm_name || user.email || 'Your Firm';
    const userName = profile?.email?.split('@')[0] || 'User';

    const renderContent = () => {
      switch (activeTab) {
        case 'dashboard':
          return (
            <>
              <DashboardStats summary={summary} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
                <div className="lg:col-span-1">
                  <div className="glass-card p-6 h-full">
                    <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Recent Reconciliations</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Last upload', status: data ? 'Completed' : 'No data', time: data ? 'Recent' : 'Upload files', errors: summary?.pendingInvoices || 0 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
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
                    <button onClick={() => setActiveTab('gstr2b')} className="w-full mt-5 py-2 text-xs font-medium rounded-lg" style={{ color: 'var(--text-accent)', background: 'var(--bg-hover)' }}>
                      Run Reconciliation →
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <FileUploadArea mode="gstr2b" onReconciliationComplete={handleReconciliationComplete} />
                </div>
              </div>
              <MonthlyDeltaView data={monthly} onMonthClick={() => setActiveTab('monthly')} />
            </>
          );
        case 'gstr1':
          return (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>GSTR-1 Reconciliation</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Compare Sales Register (Tally) vs GSTR-1 filed on Portal</p>
              </div>
              <FileUploadArea mode="gstr1" onReconciliationComplete={handleReconciliationComplete} />
              <ReconciliationGrid liveData={data} summary={summary} onVoucherSaved={handleVoucherSaved} />
            </>
          );
        case 'gstr2b':
          return (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>GSTR-2B Reconciliation</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Compare Purchase Register (Tally) vs GSTR-2B available on Portal</p>
              </div>
              <FileUploadArea mode="gstr2b" onReconciliationComplete={handleReconciliationComplete} />
              <ReconciliationGrid liveData={data} summary={summary} onVoucherSaved={handleVoucherSaved} />
            </>
          );
        case 'monthly':
          return (
            <>
              <div className="mb-2">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Monthly Delta View</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Month-wise mismatch between Tally books and GST Portal</p>
              </div>
              <MonthlyDeltaView data={monthly} />
            </>
          );
        case 'gstr3b':   return <Gstr3bDraft data={data} summary={summary} />;
        case 'clients':  return <ClientManager />;
        case 'team':     return <TeamWorkflow />;
        case 'suppliers':return <SupplierHealth data={data} />;
        case 'notices':  return <NoticeTracker />;
        case 'calendar': return <DueDateCalendar />;
        case 'settings':
          return (
            <div className="glass-card p-10">
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Account Settings</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Firm Details</p>
                  <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{firmName}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: planMeta.bg, color: planMeta.color }}>
                    <Crown size={11} /> {planMeta.label} Plan
                  </span>
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Plan Usage</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upgrade for more clients and features.</p>
                  <button className="btn-primary mt-4 text-sm py-2">Upgrade Plan</button>
                </div>
              </div>
              <button onClick={signOut} className="mt-8 flex items-center gap-2 text-sm" style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }}>
                <LogOut size={15} /> Sign out
              </button>
            </div>
          );
        default: return null;
      }
    };

    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', width: '100%', overflow: 'hidden' }}>
        <ToastContainer />
        <Sidebar activeTab={activeTab} onTabChange={tab => setActiveTab(tab as Tab)} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
          <header className="glass-header sticky top-0 z-40 px-8" style={{ height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {firmName} 👋</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email} · FY 2025-26</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search GSTIN or client…" className="field-input" style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, fontSize: '0.8rem', width: 220 }} />
              </div>
              <button style={{ padding: 7, borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderRadius: 12, background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                <button onClick={() => setActiveTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <UserCircle size={28} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{firmName}</p>
                    <p style={{ fontSize: '0.65rem', color: planMeta.color, margin: 0, fontWeight: 600 }}>{planMeta.label} Plan</p>
                  </div>
                </button>
                <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 4px' }} />
                <button onClick={signOut} title="Sign Out" style={{ padding: 6, borderRadius: 8, background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>
          <div style={{ padding: '28px 32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
            {renderContent()}
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated
  if (view === 'auth') return <AuthPage onBack={() => setView('landing')} />;
  return <LandingPage onGetStarted={() => setView('auth')} />;
}

export default App;
