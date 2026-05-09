import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Zap, Clock, Target, TrendingUp, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  {
    icon: <Zap size={18} style={{ color: '#9B6FE8' }} />,
    title: 'Speed arithmetic under pressure',
    desc: 'Train at the pace of a real case interview or GMAT question set — not at your leisure.',
  },
  {
    icon: <Target size={18} style={{ color: '#00E5C4' }} />,
    title: 'Accuracy across every question type',
    desc: 'Percentages, growth rates, market sizing, breakevens — the exact math that separates top candidates.',
  },
  {
    icon: <TrendingUp size={18} style={{ color: '#FF9933' }} />,
    title: 'Progressive difficulty',
    desc: 'Advance through Easy, Medium, and Hard — matching the complexity of real interviews.',
  },
  {
    icon: <Clock size={18} style={{ color: '#9B6FE8' }} />,
    title: 'Short, focused daily drills',
    desc: '2, 5, or 10-minute sessions that fit your prep schedule and build a lasting training habit.',
  },
];

const AUDIENCES = ['MBB', 'IB', 'GMAT', 'GRE'];

const STEPS = [
  { num: '01', title: 'Pick your category', desc: 'Mental math, percentages, business math, market sizing, or GMAT quant.' },
  { num: '02', title: 'Set your difficulty', desc: 'Start easy and progress to Hard — the level that mirrors real interview pressure.' },
  { num: '03', title: 'Train in focused bursts', desc: '2, 5, or 10-minute sessions. Immediate feedback on every answer.' },
];

// Reusable scroll-triggered fade-in section wrapper
function FadeInSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const handleCTA = () => base44.auth.redirectToLogin('/home');

  return (
    <div
      className="flex flex-col overflow-x-hidden"
      style={{ background: '#12082A', scrollBehavior: 'smooth' }}
    >
      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          paddingBottom: 16,
          background: 'rgba(18,8,42,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span className="text-xl font-grotesk font-black" style={{ color: '#fff' }}>
          Quant<span style={{ color: '#9B6FE8' }}>Drill</span>
        </span>
        <button
          onClick={handleCTA}
          className="text-sm font-semibold px-4 py-2 rounded-xl no-select"
          style={{ color: '#9B6FE8', border: '1px solid rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.08)' }}
        >
          Log in
        </button>
      </nav>

      {/* ── Hero — full viewport height ── */}
      <section
        className="flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', paddingTop: 'max(80px, env(safe-area-inset-top, 80px))' }}
      >
        {/* Audience pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex gap-2 mb-8 flex-wrap justify-center"
        >
          {AUDIENCES.map(a => (
            <span
              key={a}
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(124,58,237,0.15)', color: '#9B6FE8', border: '1px solid rgba(124,58,237,0.3)' }}
            >
              {a}
            </span>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-grotesk font-black leading-tight mb-6"
          style={{ color: '#fff', maxWidth: 340, fontSize: 'clamp(2rem, 8vw, 2.75rem)' }}
        >
          Train like the top 1% of candidates
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="text-sm leading-relaxed mb-12"
          style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 300 }}
        >
          Master the fast mental math skills needed for MBB, IB, GMAT & GRE — through daily, structured drilling.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleCTA}
          className="font-grotesk font-bold text-base text-white py-4 px-10 rounded-2xl no-select active:scale-95 transition-transform flex items-center gap-2"
          style={{ background: '#7C3AED', boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.15)' }}
        >
          <Zap size={20} />
          Start Training Free
        </motion.button>
      </section>

      {/* ── Divider ── */}
      <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── What you train ── */}
      <section className="px-6 py-24">
        <FadeInSection>
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              What you train
            </p>
            <p className="font-grotesk font-bold" style={{ color: '#fff', fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>
              The skills that actually matter
            </p>
          </div>
        </FadeInSection>

        <div className="flex flex-col gap-8">
          {FEATURES.map((f, i) => (
            <FadeInSection key={i} delay={i * 0.08}>
              <div className="flex gap-4 items-start">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: '#fff' }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* ── How it works ── */}
      <section className="px-6 py-24">
        <FadeInSection>
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              How it works
            </p>
            <p className="font-grotesk font-bold" style={{ color: '#fff', fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>
              Three steps to a sharper mind
            </p>
          </div>
        </FadeInSection>

        <div className="flex flex-col gap-8">
          {STEPS.map((s, i) => (
            <FadeInSection key={i} delay={i * 0.1}>
              <div className="flex gap-5 items-start">
                <span
                  className="font-black font-grotesk shrink-0 mt-0.5"
                  style={{ color: '#9B6FE8', fontSize: '0.95rem', minWidth: 28 }}
                >
                  {s.num}
                </span>
                <div>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: '#fff' }}>{s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Quote strip ── */}
      <FadeInSection>
        <section className="mx-6 mb-24 rounded-2xl px-6 py-8" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <p className="text-sm font-semibold leading-relaxed text-center" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>
            "The mental math skills that separate top candidates are trainable — and QuantDrill is built to develop exactly those skills."
          </p>
        </section>
      </FadeInSection>

      {/* ── Final CTA ── */}
      <FadeInSection>
        <section
          className="px-6 flex flex-col items-center gap-6 pb-safe"
          style={{ paddingBottom: 'max(64px, env(safe-area-inset-bottom, 64px))' }}
        >
          <div className="text-center">
            <p className="font-grotesk font-black mb-2" style={{ color: '#fff', fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>
              Ready to train smarter?
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Join candidates preparing for the world's most competitive roles.
            </p>
          </div>
          <button
            onClick={handleCTA}
            className="w-full font-grotesk font-bold text-base text-white py-4 rounded-2xl no-select active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{ background: '#7C3AED', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}
          >
            Start Training Free
            <ChevronRight size={18} />
          </button>
        </section>
      </FadeInSection>
    </div>
  );
}