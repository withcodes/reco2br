import { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Users, FileCheck, TrendingUp, CheckCircle, ArrowRight, Star, Building2, Phone } from 'lucide-react';

interface Props { onGetStarted: () => void; }

const PLANS = [
  {
    name: 'Starter', price: '₹999', period: '/month', tag: '',
    features: ['5 clients', 'GSTR-2B Reconciliation', 'Excel export', 'Email support'],
    cta: 'Start Free Trial', highlight: false,
  },
  {
    name: 'Professional', price: '₹2,499', period: '/month', tag: 'Most Popular',
    features: ['25 clients', 'GSTR-1 + 2B Reco', 'GSTR-3B Draft', 'Team workflow', 'Supplier health', 'Priority support'],
    cta: 'Start Free Trial', highlight: true,
  },
  {
    name: 'Enterprise', price: '₹5,999', period: '/month', tag: '',
    features: ['Unlimited clients', 'All modules', 'Custom branding', 'API access', 'Dedicated manager', 'SLA guarantee'],
    cta: 'Contact Sales', highlight: false,
  },
];

const STATS = [
  { value: '60+', label: 'Hours saved per firm/month' },
  { value: '₹1.75L', label: 'Avg ITC leakage detected' },
  { value: '99.2%', label: 'Match accuracy' },
  { value: '3-pass', label: 'Fuzzy matching engine' },
];

const FEATURES = [
  { icon: Zap, title: 'Smart reconciliation', desc: 'O→0 normalization, fuzzy matching, split-rate aggregation — catches errors Suvit misses.' },
  { icon: FileCheck, title: 'GSTR-3B pre-filled', desc: 'Auto-calculate ITC from reconciled data. No manual entry for Table 4A, 4D.' },
  { icon: TrendingUp, title: 'ITC leakage detection', desc: 'Cross-check GSTR-2B claimable vs PR availed. Instantly show how much ITC is being left unclaimed.' },
  { icon: Users, title: 'Team workflow', desc: 'Assign clients to junior CAs. Senior CA reviews and approves. Full audit trail.' },
  { icon: Building2, title: 'Multi-client dashboard', desc: 'Manage 50–200 client GSTINs from one screen. Due date calendar, notice tracker included.' },
  { icon: Shield, title: 'Supplier health score', desc: 'Know which suppliers consistently miss filing. Advise clients before ITC gets blocked.' },
];

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

export default function LandingPage({ onGetStarted }: Props) {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const hours = useCountUp(60, 1600);

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#fafafa', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Knight<span style={{ color: '#818cf8' }}>Owl</span></span>
            <span style={{ fontSize: 10, display: 'block', color: '#71717a', letterSpacing: 2, textTransform: 'uppercase', marginTop: -2 }}>GST Automation</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, color: '#a1a1aa' }}>
          <a href="#features" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Features</a>
          <a href="#pricing" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Pricing</a>
          <a href="#about"   style={{ color: '#a1a1aa', textDecoration: 'none' }}>About</a>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onGetStarted} style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fafafa', fontSize: 14, cursor: 'pointer' }}>Log in</button>
          <button onClick={onGetStarted} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            Start free trial <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── HERO ANIMATIONS — injected inline, bypasses Tailwind purge ── */}
      <style>{`
        @keyframes ko-fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ko-shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ko-trust-pulse {
          0%, 100% { box-shadow: 0 0 0px rgba(251,191,36,0), 0 0 8px rgba(251,191,36,0.15); border-color: rgba(251,191,36,0.35); }
          50%       { box-shadow: 0 0 14px rgba(251,191,36,0.45), 0 0 28px rgba(251,191,36,0.20); border-color: rgba(251,191,36,0.75); }
        }
        @keyframes ko-star-spin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.3); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .ko-badge { animation: ko-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .ko-h1    { animation: ko-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
        .ko-p     { animation: ko-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.30s both; }
        .ko-ctas  { animation: ko-fade-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.42s both; }
        .ko-trust-badge {
          animation: ko-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both,
                     ko-trust-pulse 2.8s ease-in-out 0.8s infinite;
        }
        .ko-trust-star { animation: ko-star-spin 4s ease-in-out infinite; display: inline-flex; }
        .ko-shimmer-text {
          background: linear-gradient(to right, #818cf8 0%, #34d399 45%, #818cf8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: ko-shimmer 3s linear infinite;
        }
        @keyframes ko-kw-glow {
          0%,100% { opacity: 0.85; }
          50%      { opacity: 1; filter: brightness(1.25); }
        }
        .ko-kw-gold   { color: #fbbf24; font-weight: 700; animation: ko-kw-glow 2.5s ease-in-out infinite; }
        .ko-kw-rose   { color: #fb7185; font-weight: 600; animation: ko-kw-glow 3s   ease-in-out 0.4s infinite; }
        .ko-kw-purple { color: #a78bfa; font-weight: 600; animation: ko-kw-glow 2.8s ease-in-out 0.8s infinite; }
        .ko-kw-green  { color: #34d399; font-weight: 600; animation: ko-kw-glow 3.2s ease-in-out 1.2s infinite; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ textAlign: 'center', padding: '100px 60px 80px', maxWidth: 860, margin: '0 auto' }}>
        <div className="ko-trust-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 99, border: '1px solid rgba(251,191,36,0.35)', background: 'rgba(251,191,36,0.08)', fontSize: 12, color: '#fbbf24', marginBottom: 32, fontWeight: 600, letterSpacing: '0.02em' }}>
          <span className="ko-trust-star"><Star size={12} fill="#fbbf24" color="#fbbf24" /></span>
          Trusted by 50+ CA firms across India
        </div>
        <h1 className="ko-h1" style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', margin: '0 0 24px' }}>
          GST Reconciliation<br />
          <span className="ko-shimmer-text">Built for CA Firms.</span>
        </h1>
        <p className="ko-p" style={{ fontSize: 18, color: '#a1a1aa', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 40px' }}>
          Stop spending{' '}
          <span className="ko-kw-gold">{hours}+ hours</span>{' '}
          a month on manual reconciliation. KnightOwl detects{' '}
          <span className="ko-kw-rose">ITC leakage</span>, fixes data entry errors, and pre-fills your{' '}
          <span className="ko-kw-purple">GSTR-3B</span>{' '}—{' '}
          <span className="ko-kw-green">automatically.</span>
        </p>
        <div className="ko-ctas" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} style={{ padding: '14px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 40px rgba(79,70,229,0.4)' }}>
            Start free 14-day trial <ArrowRight size={18} />
          </button>
          <button onClick={onGetStarted} style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fafafa', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={15} /> Book a demo
          </button>
        </div>
        <p className="ko-ctas" style={{ fontSize: 12, color: '#52525b', marginTop: 16 }}>No credit card required · Cancel anytime · Setup in 5 minutes</p>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', maxWidth: 900, margin: '0 auto 100px' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ padding: '32px 24px', textAlign: 'center', background: '#09090b' }}>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#818cf8', margin: '0 0 6px', letterSpacing: '-1px' }}>{s.value}</p>
            <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 60px 100px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 16 }}>Everything you need</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 60, color: '#fafafa' }}>
          The only GST tool built<br />specifically for CA firms
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ padding: '28px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', transition: 'border-color 0.2s' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={20} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#fafafa' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#71717a', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 60px 100px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 16 }}>Simple pricing</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 12, color: '#fafafa' }}>
          Pay per firm, not per user
        </h2>
        <p style={{ textAlign: 'center', color: '#71717a', fontSize: 15, marginBottom: 40 }}>One subscription covers your entire team. Unlimited team members on all plans.</p>

        {/* Billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <span style={{ fontSize: 14, color: !billingAnnual ? '#fafafa' : '#71717a' }}>Monthly</span>
          <button onClick={() => setBillingAnnual(p => !p)} style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative', background: billingAnnual ? '#4f46e5' : 'rgba(255,255,255,0.15)', transition: 'background 0.2s' }}>
            <span style={{ position: 'absolute', top: 3, left: billingAnnual ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
          </button>
          <span style={{ fontSize: 14, color: billingAnnual ? '#fafafa' : '#71717a' }}>Annual <span style={{ color: '#34d399', fontWeight: 600, fontSize: 12 }}>Save 20%</span></span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {PLANS.map((plan, i) => {
            const price = billingAnnual
              ? `₹${Math.round(parseInt(plan.price.replace(/[₹,]/g, '')) * 0.8).toLocaleString('en-IN')}`
              : plan.price;
            return (
              <div key={i} style={{ padding: '32px', borderRadius: 20, border: plan.highlight ? '1.5px solid #4f46e5' : '1px solid rgba(255,255,255,0.08)', background: plan.highlight ? 'rgba(79,70,229,0.08)' : 'rgba(255,255,255,0.02)', position: 'relative' }}>
                {plan.tag && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 99 }}>{plan.tag}</span>}
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fafafa' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: plan.highlight ? '#818cf8' : '#fafafa' }}>{price}</span>
                  <span style={{ fontSize: 13, color: '#71717a' }}>{plan.period}</span>
                </div>
                <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <CheckCircle size={15} color="#34d399" style={{ flexShrink: 0 }} />
                      <span style={{ color: '#a1a1aa' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={onGetStarted} style={{ width: '100%', padding: '12px', borderRadius: 12, border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.2)', background: plan.highlight ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'transparent', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {plan.cta} <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ABOUT / CTA ── */}
      <div id="about" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(79,70,229,0.06)', padding: '80px 60px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={26} color="white" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Knight<span style={{ color: '#818cf8' }}>Owl</span></p>
            <p style={{ margin: 0, fontSize: 11, color: '#71717a', letterSpacing: 2, textTransform: 'uppercase' }}>GST Automation</p>
          </div>
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.5px' }}>Ready to save 60 hours/month?</h2>
        <p style={{ color: '#71717a', fontSize: 16, marginBottom: 36 }}>Join CA firms across India who trust KnightOwl for their GST reconciliation.</p>
        <button onClick={onGetStarted} style={{ padding: '16px 40px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 50px rgba(79,70,229,0.5)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Start your free 14-day trial <ArrowRight size={18} />
        </button>
        <p style={{ fontSize: 13, color: '#52525b', marginTop: 20 }}>© 2025 KnightOwl Tech Pvt Ltd · contact@knightowlgst.com</p>
      </div>
    </div>
  );
}
