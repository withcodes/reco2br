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
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'register') {
      if (!firm)                { setError('Firm name is required.');         return; }
      if (password !== confirm) { setError('Passwords do not match.');         return; }
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
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Back button */}
      <button onClick={onBack} style={{ position: 'fixed', top: 24, left: 24, display: 'flex', alignItems: 'center', gap: 6, color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to home
      </button>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ color: '#fafafa', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>
            Knight<span style={{ color: '#818cf8' }}>Owl</span> GST
          </h1>
          <p style={{ color: '#71717a', fontSize: 14, margin: 0 }}>
            {mode === 'login' ? 'Sign in to your firm account' : 'Create your firm account'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 32px' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, background: mode === m ? 'rgba(79,70,229,0.8)' : 'transparent', color: mode === m ? 'white' : '#71717a', transition: 'all 0.2s' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Firm / Company Name</label>
                <input value={firm} onChange={e => setFirm(e.target.value)} placeholder="e.g. Patel & Associates CA Firm"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@firm.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 8 characters' : 'Your password'}
                  style={{ width: '100%', padding: '11px 42px 11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                <button onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#a1a1aa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fafafa', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ marginTop: 24, width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Please wait…</> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {mode === 'register' && (
            <p style={{ fontSize: 12, color: '#52525b', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
              By registering you agree to our Terms of Service.<br />14-day free trial · No credit card required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
