import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';
import { Shield, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props { onBack: () => void; }

export default function AuthPage({ onBack }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode,     setMode]     = useState<'login' | 'register'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [firm,     setFirm]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [invite,   setInvite]   = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'register') {
      if (!firm)                { setError('Firm name is required.');         return; }
      if (!invite)              { setError('Beta invite code is required.');  return; }
      const validCode = import.meta.env.VITE_BETA_INVITE_CODE || '';
      if (!validCode || invite !== validCode) { setError('Invalid invite code. Access is currently restricted.'); return; }
      if (password !== confirm) { setError('Passwords do not match.');        return; }
      if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    }
    setLoading(true);
    const { error: err } = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, firm);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      
      {/* Background blobs for light ambient feel */}
      <div style={{ position: 'absolute', top: -100, left: -200, width: 400, height: 400, background: '#dbeafe', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: -100, right: -200, width: 400, height: 400, background: '#eff6ff', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, zIndex: 0 }} />

      {/* Floating Back Button */}
      <button onClick={onBack} style={{ position: 'fixed', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '99px', cursor: 'pointer', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', zIndex: 10, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
         <ArrowLeft size={15} /> Back to home
      </button>

      {/* Main Container Card */}
      <div style={{ width: '100%', maxWidth: 1020, height: 640, background: '#ffffff', borderRadius: 24, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.12)', display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        
        {/* LEFT SIDE: Form */}
        <div style={{ flex: 1, padding: '40px 60px', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto' }}>
          <div style={{ margin: 'auto 0', width: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Logo & Headline */}
          <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Shield size={20} color="white" />
            </div>
            <h2 style={{ color: '#0f172a', fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>KnightOwl</h2>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-1px' }}>
            {mode === 'login' ? 'Sign In' : 'Get Started'}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 32px' }}>
            Welcome to the AI-powered GST automated match dashboard.
          </p>

          {/* Toggle Tab */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: mode === m ? '#ffffff' : 'transparent', color: mode === m ? '#0f172a' : '#64748b', transition: 'all 0.2s', boxShadow: mode === m ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                {m === 'login' ? 'Log In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Actual Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>FIRM / COMPANY NAME</label>
                  <input value={firm} onChange={e => setFirm(e.target.value)} placeholder="e.g. Patel & Associates CA Firm"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'} onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'} />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>EMAIL ADDRESS</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@firm.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>PASSWORD</label>
                {mode === 'login' && <span style={{ fontSize: 12, color: '#4f46e5', fontWeight: 500, cursor: 'pointer' }}>Forgot?</span>}
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
                  style={{ width: '100%', padding: '12px 42px 12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mode === 'register' && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>CONFIRM PASSWORD</label>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4f46e5', marginBottom: 6 }}>BETA INVITE CODE</label>
                    <input type="text" value={invite} onChange={e => setInvite(e.target.value)} placeholder="Enter secret beta invite code"
                      style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(79,70,229,0.3)', background: 'rgba(79,70,229,0.03)', color: '#0f172a', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
               🚨 {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', borderRadius: 14, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 24, boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {mode === 'register' && (
            <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              By registering you agree to our Terms of Service.<br />14-day free trial · No credit card required.
            </p>
          )}
          </div>
        </div>

        {/* RIGHT SIDE: Visual Art Area mimicking graphics */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          
          {/* SVG Dot Grid Matrix Backdrop overlay */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.8, pointerEvents: 'none' }}>
            <defs>
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#4f46e5" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)" />
          </svg>
          
          {/* Internal blur shading background blobs */}
          <div style={{ position: 'absolute', top: '10%', right: '10%', width: 220, height: 220, background: '#93c5fd', borderRadius: '50%', filter: 'blur(50px)', opacity: 0.4 }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: 250, height: 250, background: '#c7d2fe', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.5 }} />

          {/* Main Floating Artwork frame */}
          <motion.div 
            style={{ width: '80%', height: '64%', background: '#ffffff', borderRadius: 20, boxShadow: '0 25px 60px -12px rgba(0,0,0,0.08)', padding: 24, border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Topbar frame header */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.7 }} />
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', opacity: 0.7 }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
               {/* Large Pie Canvas Node */}
               <motion.div 
                 style={{ width: 140, height: 140, borderRadius: '50%', background: 'conic-gradient(#4f46e5 0% 65%, #818cf8 65% 85%, #c7d2fe 85% 100%)', boxShadow: '0 0 30px rgba(79,70,229,0.15)', position: 'relative' }}
                 animate={{ rotate: [0, 5, -5, 0] }}
                 transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
               >
                 {/* Internal cutout to make it a donut chart */}
                 <div style={{ position: 'absolute', top: '22%', left: '22%', width: '56%', height: '56%', background: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#4f46e5' }}>94%</span>
                 </div>
               </motion.div>

               {/* Standard Bars Node supporting visuals */}
               <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 110, width: '100%', justifyContent: 'center', marginTop: 10 }}>
                  <motion.div style={{ width: 28, background: '#4f46e5', borderRadius: '8px 8px 0 0', opacity: 0.9 }} animate={{ height: [50, 80, 50] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                  <motion.div style={{ width: 28, background: '#818cf8', borderRadius: '8px 8px 0 0', opacity: 0.9 }} animate={{ height: [90, 40, 90] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
                  <motion.div style={{ width: 28, background: '#c7d2fe', borderRadius: '8px 8px 0 0', opacity: 0.8 }} animate={{ height: [40, 110, 40] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
                  <motion.div style={{ width: 28, background: '#e0e7ff', borderRadius: '8px 8px 0 0', opacity: 0.7 }} animate={{ height: [60, 30, 60] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
               </div>

               <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Real-time reconciliation</p>
                  <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Processing thousands of invoices securely</p>
               </div>
            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}
