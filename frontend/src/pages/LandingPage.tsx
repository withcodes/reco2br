import { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Users, FileCheck, TrendingUp, CheckCircle, ArrowRight, Star, Building2, Phone, Clock, Brain } from 'lucide-react';

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

interface StatCardProps {
  className: string;
  delay: string;
  numericTarget?: number;
  formatFn?: (n: number) => string;
  value?: string;
  label: React.ReactNode;
  icon: React.ComponentType<{ size?: number; color?: string; fill?: string }>;
}

function StatCard({ className, delay, numericTarget, formatFn, value, label, icon: Icon }: StatCardProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current && numericTarget) {
        started.current = true;
        const start = performance.now();
        const duration = 1200;
        const step = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          setCount(Math.floor(progress * numericTarget));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericTarget]);

  return (
    <div ref={ref} className={className} style={{ animationDelay: delay }}>
      <div className="ko-laser" />
      <div className="ko-stat-card-inner">
        <div className="ko-stat-icon-box">
          <Icon size={16} />
        </div>
        <span className="ko-stat-val">
          {numericTarget && formatFn ? formatFn(count) : value}
        </span>
        {label}
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted }: Props) {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const stat1 = useCountUp(60, 3200);       // 60+ hours

  const hours = stat1 ? stat1.toLocaleString() : "0";

  const featuresGridRef = useRef<HTMLDivElement>(null);
  const [gridVisible, setGridVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setGridVisible(true);
    }, { threshold: 0.05 });
    if (featuresGridRef.current) observer.observe(featuresGridRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMoveFeatures = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!featuresGridRef.current) return;
    const cards = featuresGridRef.current.querySelectorAll('.ko-feature-card');
    cards.forEach((card: any) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  };

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
          <button onClick={onGetStarted} className="btn-ghost" style={{ padding: '9px 20px', fontSize: 14 }}>Log in</button>
          <button onClick={onGetStarted} className="btn-primary" style={{ padding: '9px 20px', fontSize: 14, fontWeight: 600 }}>
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
        @keyframes ko-orb-float-1 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          33%     { transform: translate(30px, -40px) scale(1.08); }
          66%     { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes ko-orb-float-2 {
          0%,100% { transform: translate(0px, 0px) scale(1); }
          33%     { transform: translate(-35px, 30px) scale(1.1); }
          66%     { transform: translate(25px, -25px) scale(0.92); }
        }
        .ko-orb-1 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%);
          filter: blur(80px); pointer-events: none;
          top: -60px; left: -60px;
          animation: ko-orb-float-1 12s ease-in-out infinite;
        }
        .ko-orb-2 {
          position: absolute; width: 440px; height: 440px; border-radius: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.28) 0%, transparent 70%);
          filter: blur(80px); pointer-events: none;
          top: 20px; right: -60px;
          animation: ko-orb-float-2 15s ease-in-out 2s infinite;
        }
        .ko-orb-3 {
          position: absolute; width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.20) 0%, transparent 70%);
          filter: blur(60px); pointer-events: none;
          bottom: 0px; left: calc(50% - 180px);
          animation: ko-orb-float-2 18s ease-in-out 4s infinite;
        }
        @keyframes ko-glow-animate {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .ko-glow-wrapper {
          position: relative;
          display: inline-block;
          border-radius: 99px;
        }
        /* Outer Blurry Glow */
        .ko-glow-wrapper::after {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          border-radius: 99px;
          background: linear-gradient(90deg, #ff007f, #7000ff, #00e5ff, #ff007f);
          background-size: 200% auto;
          filter: blur(14px);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: -1;
          animation: ko-glow-animate 3s linear infinite;
        }
        /* Crisp Outline Glow */
        .ko-glow-wrapper::before {
          content: '';
          position: absolute;
          top: -1.5px; left: -1.5px; right: -1.5px; bottom: -1.5px;
          border-radius: 99px;
          background: linear-gradient(90deg, #ff007f, #7000ff, #00e5ff, #ff007f);
          background-size: 200% auto;
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
          animation: ko-glow-animate 3s linear infinite;
        }
        .ko-glow-wrapper:hover::after,
        .ko-glow-wrapper:hover::before {
          opacity: 1;
        }
        .ko-glow-btn {
          position: relative;
          z-index: 2;
          background: #000000;
          border: 1px solid rgba(255,255,255,0.12); /* fallback static border */
          border-radius: 99px; /* Pill shape */
          padding: 16px 40px;
          color: white; font-size: 16px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: border-color 0.3s ease, transform 0.2s ease, background 0.2s;
        }
        .ko-glow-wrapper:hover .ko-glow-btn {
          border-color: transparent;
          transform: scale(1.02);
          background: rgba(0,0,0,0.9); /* maintain dark core */
        }
        .ko-btn-arrow { transition: transform 0.2s ease; }
        .ko-glow-btn:hover .ko-btn-arrow { transform: translateX(4px); }
        
        /* Secondary Glow Variant (Indigo / Royal Blue) */
        .ko-glow-secondary::after,
        .ko-glow-secondary::before {
          background: linear-gradient(90deg, #4f46e5, #3b82f6, #2dd4bf, #4f46e5);
          background-size: 200% auto;
        }
        
        /* ── Bottom CTA Arches ── */
        @keyframes ko-arch-float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50%       { transform: translate(15px, -15px) rotate(2deg); }
        }
        .ko-bottom-cta {
          position: relative; overflow: hidden; background: #040405;
          padding: 120px 60px; text-align: center;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .ko-arch {
          position: absolute; border-radius: 50%; pointer-events: none;
          mix-blend-mode: screen;
        }
        .ko-arch-1 {
          width: 500px; height: 500px;
          border: 45px solid rgba(124,58,237,0.5); /* increased opacity */
          border-bottom-color: transparent; border-left-color: transparent;
          filter: blur(4px); /* much sharper outline edge */
          left: -250px; bottom: -100px;
          animation: ko-arch-float 8s ease-in-out infinite;
        }
        .ko-arch-2 {
          width: 500px; height: 500px;
          border: 45px solid rgba(139,92,246,0.4);
          border-top-color: transparent; border-right-color: transparent;
          filter: blur(4px);
          right: -250px; top: -100px;
          animation: ko-arch-float 10s ease-in-out infinite reverse;
        }
        /* ── Stat Cards ── */
        @keyframes ko-stat-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ko-stat-card {
          position: relative; padding: 1px; border-radius: 20px;
          overflow: hidden;
          background: rgba(255,255,255,0.05); 
          transition: transform 0.3s ease;
          animation: ko-stat-in 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ko-stat-card:hover { transform: translateY(-5px); }
        
        /* Continuous laser border for STATS */
        .ko-stat-card .ko-laser {
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent 40%, var(--stat-color, #818cf8) 48%, var(--stat-glow, #ec4899) 52%, transparent 60%);
          animation: ko-spin 4s linear infinite;
          opacity: 0.6; /* Continuous glow setups safe formats triggers configs setups */
          z-index: 0;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .ko-stat-card:hover .ko-laser { opacity: 0.9; }

        .ko-stat-card-inner {
          position: relative;
          background: #09090b; /* Solid dark sheet safely formats layouts setups binding */
          border-radius: 19px;
          padding: 36px 24px;
          height: 100%;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center; justify-content: center;
        }
        
        .ko-stat-icon-box {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          color: var(--stat-color, #818cf8);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        
        .ko-stat-s1 { --stat-color: #f43f5e; --stat-glow: #f97316; }
        .ko-stat-s2 { --stat-color: #00d2ff; --stat-glow: #3a7bd5; }
        .ko-stat-s3 { --stat-color: #8e2de2; --stat-glow: #4a00e0; }
        .ko-stat-s4 { --stat-color: #f12711; --stat-glow: #f5af19; }

        /* Ambient Glow Layers behind cards */
        .ko-stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 24px;
          filter: blur(24px);
          opacity: 0.15;
          z-index: -1;
          transition: opacity 0.3s ease;
        }
        .ko-stat-card:hover::after {
          opacity: 0.45;
        }
        .ko-stat-s1::after { background: linear-gradient(135deg, #f43f5e, #f97316); }
        .ko-stat-s2::after { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
        .ko-stat-s3::after { background: linear-gradient(135deg, #6366f1, #a855f7); }
        .ko-stat-s4::after { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        /* ── Feature Cards ── */
        .ko-feature-card {
          position: relative; padding: 28px; border-radius: 16px; 
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02); overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .ko-feature-card:hover {
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-5px);
          background: rgba(255,255,255,0.04);
        }

        /* ── Reveal Entrance Animation (Option A) ── */
        @keyframes ko-reveal-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ko-feature-card { opacity: 0; }
        .ko-feature-grid.is-visible .ko-feature-card {
          animation: ko-reveal-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .ko-feature-grid.is-visible .ko-feature-card:nth-child(1) { animation-delay: 0.1s; }
        .ko-feature-grid.is-visible .ko-feature-card:nth-child(2) { animation-delay: 0.2s; }
        .ko-feature-grid.is-visible .ko-feature-card:nth-child(3) { animation-delay: 0.3s; }
        .ko-feature-grid.is-visible .ko-feature-card:nth-child(4) { animation-delay: 0.4s; }
        .ko-feature-grid.is-visible .ko-feature-card:nth-child(5) { animation-delay: 0.5s; }
        .ko-feature-grid.is-visible .ko-feature-card:nth-child(6) { animation-delay: 0.6s; }

        /* ── Ambient Float Animation (Option B) ── */
        @keyframes ko-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .ko-feature-card-inner {
          position: relative;
          height: 100%;
          background: rgba(9,9,11,0.95); /* Swallows laser bleed with transparent dark depth balance */
          border-radius: 15px;
          padding: 27px; /* 1px less to maintain relative container density offset safely */
          z-index: 1;
          animation: ko-float 4s ease-in-out infinite;
        }
        .ko-feature-grid .ko-feature-card:nth-child(1) .ko-feature-card-inner { animation-delay: 0s; }
        .ko-feature-grid .ko-feature-card:nth-child(2) .ko-feature-card-inner { animation-delay: 0.6s; }
        .ko-feature-grid .ko-feature-card:nth-child(3) .ko-feature-card-inner { animation-delay: 1.2s; }
        .ko-feature-grid .ko-feature-card:nth-child(4) .ko-feature-card-inner { animation-delay: 1.8s; }
        .ko-feature-grid .ko-feature-card:nth-child(5) .ko-feature-card-inner { animation-delay: 2.4s; }
        .ko-feature-grid .ko-feature-card:nth-child(6) .ko-feature-card-inner { animation-delay: 3s; }

        /* ── Conic Laser Border Stream (Option C) ── */
        @keyframes ko-spin {
          100% { transform: rotate(360deg); }
        }
        .ko-feature-card {
          position: relative; 
          border-radius: 16px; 
          overflow: hidden; 
          padding: 1px; /* 1px border reveal gap frame formats sets setups */
          background: rgba(255,255,255,0.06); 
          transition: transform 0.3s ease;
          border: none; /* override previous border definitions safe formats setup */
        }
        .ko-laser {
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: conic-gradient(from 0deg, transparent 40%, rgba(129,140,248,0.8) 48%, rgba(236,72,153,0.8) 52%, transparent 60%);
          animation: ko-spin 3.5s linear infinite;
          opacity: 0.5; /* Permanent soft glow setups context properly setups binders setups */
          transition: opacity 0.4s ease;
          z-index: 0;
          pointer-events: none;
          mix-blend-mode: screen; /* bright vibrant contrast triggers setups configurations */
        }
        .ko-feature-card:hover .ko-laser { opacity: 1; }

        .ko-feature-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 16px;
          background: radial-gradient(500px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.06), transparent 80%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .ko-feature-card:hover::before { opacity: 1; }
        
        .ko-feature-icon-box {
          width: 42px; height: 42px; border-radius: 12px; 
          background: rgba(124,58,237,0.15); display: flex; 
          align-items: center; justify-content: center; margin-bottom: 16px;
          transition: transform 0.3s ease;
        }
        .ko-feature-card:hover .ko-feature-icon-box {
          transform: translateY(-3px) scale(1.05);
        }
        @keyframes ko-number-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(251,191,36,0.15); }
          50%       { text-shadow: 0 0 18px rgba(251,191,36,0.45); }
        }
        .ko-stat-val {
          font-size: 52px; font-weight: 800; letter-spacing: -2.5px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #fbbf24 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums; /* fixes width roll triggers safe layout formats setup */
          animation: ko-shimmer 4s linear infinite, ko-number-glow 2s ease-in-out infinite;
          margin: 0 0 4px; display: block;
        }
        /* ── Hover Glow placeholder if needed ── */
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: 'relative' }}>
        <div className="ko-orb-1" />
        <div className="ko-orb-2" />
        <div className="ko-orb-3" />  
        <div style={{ textAlign: 'center', padding: '100px 60px 80px', maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
            <div className="ko-glow-wrapper">
              <button onClick={onGetStarted} className="ko-glow-btn">
                Start free 14-day trial
                <span className="ko-btn-arrow"><ArrowRight size={18} /></span>
              </button>
            </div>
            <div className="ko-glow-wrapper ko-glow-secondary">
              <button onClick={onGetStarted} className="ko-glow-btn">
                <Phone size={15} /> Book a demo
              </button>
            </div>
          </div>
          <p className="ko-ctas" style={{ fontSize: 12, color: '#52525b', marginTop: 16 }}>No credit card required · Cancel anytime · Setup in 5 minutes</p>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 960, margin: '0 auto 100px', padding: '0 40px' }}>
        <StatCard delay="0.05s" className="ko-stat-card ko-stat-s1" numericTarget={60} formatFn={(n) => `${n}+`} icon={Clock} label={<p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>Hours saved per<br /><strong style={{ color: '#fbbf24' }}>firm/month</strong></p>} />
        <StatCard delay="0.15s" className="ko-stat-card ko-stat-s2" numericTarget={175} formatFn={(n) => `₹${(n / 100).toFixed(2)}L`} icon={Zap} label={<p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>Avg ITC leakage<br /><strong style={{ color: '#34d399' }}>detected</strong></p>} />
        <StatCard delay="0.25s" className="ko-stat-card ko-stat-s3" numericTarget={992} formatFn={(n) => `${(n / 10).toFixed(1)}%`} icon={CheckCircle} label={<p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>Match<br /><strong style={{ color: '#60a5fa' }}>accuracy</strong></p>} />
        <StatCard delay="0.35s" className="ko-stat-card ko-stat-s4" value="3-pass" icon={Brain} label={<p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>Fuzzy matching<br /><strong style={{ color: '#fbbf24' }}>engine</strong></p>} />
      </div>

      {/* ── FEATURES ── */}
      <div id="features" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 60px 100px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: 3, color: '#818cf8', textTransform: 'uppercase', marginBottom: 16 }}>Everything you need</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.8px', marginBottom: 60, color: '#fafafa' }}>
          The only GST tool built<br />specifically for CA firms
        </h2>
        <div ref={featuresGridRef} onMouseMove={handleMouseMoveFeatures} className={`ko-feature-grid ${gridVisible ? 'is-visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="ko-feature-card">
              <div className="ko-laser" />
              <div className="ko-feature-card-inner">
                <div className="ko-feature-icon-box">
                  <f.icon size={20} color="#818cf8" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px', color: '#fafafa' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#71717a', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
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
                <div className="ko-glow-wrapper ko-glow-secondary" style={{ width: '100%', display: 'block' }}>
                  <button onClick={onGetStarted} className="ko-glow-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    {plan.cta} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ABOUT / CTA (Glowing Arches) ── */}
      <div id="about" className="ko-bottom-cta">
        {/* Glow Arches Background */}
        <div className="ko-arch ko-arch-1" />
        <div className="ko-arch ko-arch-2" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 650, margin: '0 auto' }}>
          {/* Small Floating pill tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: 12, fontWeight: 600, marginBottom: 24, letterSpacing: '0.02em' }}>
             <Shield size={13} fill="#a78bfa" color="#a78bfa" /> 100% Automated & Secure
          </div>

          <h2 style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px', color: '#ffffff', lineHeight: 1.15 }}>
            Ready to save 60+ hours<br />of manual work?
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
            Join forward-thinking CA firms across India who trust KnightOwl for their fully automated GST reconciliation.
          </p>

          <div className="ko-glow-wrapper">
            <button onClick={onGetStarted} className="ko-glow-btn">
              Start your free 14-day trial 
              <span className="ko-btn-arrow"><ArrowRight size={18} /></span>
            </button>
          </div>

          <p style={{ fontSize: 13, color: '#52525b', marginTop: 40 }}>© 2025 KnightOwl Tech Pvt Ltd · contact@knightowlgst.com</p>
        </div>
      </div>
    </div>
  );
}
