import { LayoutDashboard, FileText, BookOpen, BarChart3, Settings, LogOut, FileSearch, Building2, Bell, Shield, CalendarDays, FileCheck, UserCog } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps { activeTab: string; onTabChange: (tab: string) => void; }

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const firmName = profile?.firm_name || user?.email || 'Your Firm';
  const role     = profile?.role     || 'Admin';
  const initials = firmName.slice(0, 1).toUpperCase();

  const groups = [
    {
      label: 'RECONCILIATION',
      items: [
        { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'gstr1',      icon: FileText,        label: 'GSTR-1 Reco' },
        { id: 'gstr2b',     icon: BookOpen,        label: 'GSTR-2B Reco' },
        { id: 'monthly',    icon: BarChart3,        label: 'Monthly View' },
        { id: 'gstr3b',     icon: FileCheck,        label: 'GSTR-3B Draft' },
      ],
    },
    {
      label: 'CA FIRM',
      items: [
        { id: 'clients',    icon: Building2,       label: 'Clients' },
        { id: 'team',       icon: UserCog,         label: 'Team Workflow' },
        { id: 'suppliers',  icon: Shield,          label: 'Supplier Health' },
        { id: 'notices',    icon: Bell,            label: 'Notices' },
        { id: 'calendar',   icon: CalendarDays,    label: 'Due Dates' },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { id: 'settings',   icon: Settings,        label: 'Settings' },
      ],
    },
  ];

  return (
    <div className="glass-sidebar flex flex-col pt-5 sticky top-0 h-screen" style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)' }}>
      {/* Logo */}
      <div className="px-5 mb-5 flex items-center gap-3">
        <div className="p-2 rounded-xl animate-pulse-glow" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <FileSearch size={22} color="white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>GST<span style={{ color: '#818cf8' }}>Sync</span></h1>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>CA Firm Edition</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-4 pb-2">
        {groups.map(g => (
          <div key={g.label}>
            <p className="px-2 mb-1 text-[9px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map(item => (
                <button key={item.id} onClick={() => onTabChange(item.id)}
                  className={`nav-item w-full text-left ${activeTab === item.id ? 'active' : ''}`}>
                  <item.icon size={17} /><span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 mb-3">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <div className="flex items-center gap-2">
            <span style={{ color: !isDark ? '#f59e0b' : 'var(--text-muted)', fontSize: 14 }}>☀️</span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{isDark ? 'Dark' : 'Light'} Mode</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: isDark ? '#818cf8' : 'var(--text-muted)', fontSize: 14 }}>🌙</span>
            <div className="toggle-track"><div className="toggle-thumb" /></div>
          </div>
        </button>
      </div>

      {/* User card */}
      <div className="mx-3 mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>{initials}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{firmName}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{role}</p>
        </div>
        <button
          className="flex-shrink-0 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
          title="Logout"
          onClick={signOut}
        >
          <LogOut size={14} color="#f43f5e" />
        </button>
      </div>
    </div>
  );
}

