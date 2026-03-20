import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, Users, FileCheck, TrendingUp, Search, Bell, Plus, 
  Wallet, Calendar, Clock, CheckCircle, Brain, ArrowRight 
} from 'lucide-react';

export default function DashboardMockup() {
  return (
    <motion.div 
      initial={{ x: 120, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: 1160, margin: '0 auto 120px', padding: '0 40px', position: 'relative' }}
    >
      <style>{`
        .ko-mockup-frame {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(0,0,0,0.06);
          display: flex;
          overflow: hidden;
          height: 640px;
          box-shadow: 0 50px 100px -24px rgba(0,0,0,0.4), 0 0 50px rgba(129,140,248,0.12);
          position: relative;
          transform: perspective(1200px) rotateX(4deg);
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease;
        }
        .ko-mockup-frame:hover {
          transform: perspective(1200px) rotateX(0deg) translateY(-6px);
          box-shadow: 0 60px 120px -20px rgba(0,0,0,0.5), 0 0 60px rgba(129,140,248,0.18);
        }
      `}</style>
      
      <div className="ko-mockup-frame">
        {/* Left Sidebar */}
        <div style={{ width: 72, borderRight: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 28 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
             <Shield size={18} color="white" />
          </div>
          <div style={{ color: '#4f46e5', background: '#f0f0ff', padding: 10, borderRadius: 12 }}><Zap size={18} /></div>
          <div style={{ color: '#94a3b8', cursor: 'pointer' }}><Users size={18} /></div>
          <div style={{ color: '#94a3b8', cursor: 'pointer' }}><FileCheck size={18} /></div>
          <div style={{ color: '#94a3b8', cursor: 'pointer' }}><TrendingUp size={18} /></div>
        </div>

        {/* Main Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {/* Top Bar */}
          <div style={{ height: 68, borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f1f5f9', padding: '8px 16px', borderRadius: 99, width: 250, border: '1px solid #e2e8f0' }}>
              <Search size={14} color="#64748b" />
              <span style={{ fontSize: 13, color: '#64748b' }}>Search...</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>3 August, 2026</span>
              <div style={{ position: 'relative', color: '#64748b', cursor: 'pointer' }}>
                 <Bell size={18} />
                 <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, background: '#ef4444', borderRadius: '50%' }} />
              </div>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                 <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, padding: 32, display: 'flex', gap: 24, overflow: 'hidden' }}>
            {/* Left Column */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Greeting Card mimicking REAL dashboard */}
              <div style={{ background: '#ffffff', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden', border: '1px solid #f1f5f9', height: 210, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 4px', fontWeight: 500 }}>user@yourfirm.com · FY 2025-26</p>
                <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-1px' }}>Welcome back! 👋</h1>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', maxWidth: 300, lineHeight: 1.5 }}>KnightOwl is ready to automate your GST reconciliation for today.</p>
                
                {/* Visual ROI Banner */}
                <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 w-fit" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span className="text-sm">💰</span> Total ITC Saved: <span className="font-extrabold">₹4.24 Lakh</span>
                </div>

                {/* Floating Bear Illustration with float effect */}
                <div style={{ position: 'absolute', right: -5, bottom: -15, width: 220, height: 220, zIndex: 1, animation: 'float-slow 6s ease-in-out infinite' }}>
                  <style>{`
                    @keyframes float-slow {
                      0%, 100% { transform: translateY(0px) rotate(0deg); }
                      50% { transform: translateY(-6px) rotate(1.5deg); }
                    }
                  `}</style>
                  <img src="/cute_bear.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Stat Grid footer - Replaced with Real KPI look */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                <div style={{ background: '#ffffff', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><CheckCircle size={18} /></div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 2px', fontWeight: 500 }}>ITC Matched</p>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>₹12.45L</h3>
                    <p style={{ fontSize: 10, color: '#10b981', margin: '2px 0 0', fontWeight: 600 }}>94.2% Success</p>
                  </div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}><TrendingUp size={18} /></div>
                  <div>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 2px', fontWeight: 500 }}>ITC Leakage Gap</p>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>₹0.84L</h3>
                    <p style={{ fontSize: 10, color: '#ef4444', margin: '2px 0 0', fontWeight: 600 }}>Unclaimed ITC!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#ffffff', fontSize: 12, color: '#475569', fontWeight: 600, cursor: 'pointer' }}>GSTR-2B</button>
                <button style={{ padding: '10px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, border: 'none', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}>Run Reco <Plus size={14} /></button>
              </div>

              {/* Actionable Queue Mockup */}
              <div style={{ flex: 1, background: '#ffffff', borderRadius: 24, padding: 24, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                   <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Actionable Queue</h3>
                   <span style={{ fontSize: 11, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}>Run Reconciliation</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                     <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0, textShadow: 'none' }}>🚨</div>
                     <p style={{ fontSize: 11, color: '#475569', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>5 Invoice discrepancies need review</p>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: '#f8fafc', borderRadius: 14, border: '1px solid #f1f5f9' }}>
                     <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0, textShadow: 'none' }}>⚠️</div>
                     <p style={{ fontSize: 11, color: '#475569', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>₹55,020 ITC leakage risk detected</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
创新
