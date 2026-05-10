import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// ── Scroll-triggered fade-up wrapper ──────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Floating ambient orb ──────────────────────────────────────────────────
function Orb({ size, color, x, y, duration = 18, delay = 0, opacity = 0.18 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: x, top: y,
        background: color,
        filter: `blur(${Math.round(size * 0.38)}px)`,
        opacity,
      }}
      animate={{ y: [0, -28, 0], x: [0, 14, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

// ── Hero word-by-word animation ──────────────────────────────────────────
function AnimatedWords({ text, className, style, delayBase = 0 }) {
  const words = text.split(' ');
  return (
    <span className={className} style={style}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: delayBase + i * 0.085 }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function Landing() {
  const handleCTA = () => base44.auth.redirectToLogin('/home');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Scroll indicator fade
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="relative overflow-x-hidden"
      style={{ background: '#0B0F14', scrollBehavior: 'smooth', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Fixed Nav ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          paddingLeft: 'clamp(24px, 5vw, 64px)',
          paddingRight: 'clamp(24px, 5vw, 64px)',
          paddingTop: 'max(18px, env(safe-area-inset-top, 18px))',
          paddingBottom: 18,
          background: 'rgba(11,15,20,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <span className="text-lg font-grotesk font-black tracking-tight" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
          Quant<span style={{ color: '#9B6FE8' }}>Drill</span>
        </span>
        <button
          onClick={handleCTA}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl no-select transition-all duration-200"
          style={{
            color: '#c4b5fd',
            border: '1px solid rgba(124,58,237,0.3)',
            background: 'rgba(124,58,237,0.07)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.16)';
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.55)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.07)';
            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
          }}
        >
          Log in
        </button>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 1. HERO ─────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: '100svh', paddingTop: 'max(100px, env(safe-area-inset-top, 100px))', paddingBottom: 80 }}
      >
        {/* Ambient orbs */}
        <Orb size={520} color="radial-gradient(circle, #7C3AED 0%, transparent 70%)" x="-10%" y="-8%" duration={22} delay={0} opacity={0.22} />
        <Orb size={380} color="radial-gradient(circle, #4F46E5 0%, transparent 70%)" x="60%" y="10%" duration={18} delay={3} opacity={0.15} />
        <Orb size={260} color="radial-gradient(circle, #00E5C4 0%, transparent 70%)" x="75%" y="55%" duration={26} delay={7} opacity={0.1} />
        <Orb size={300} color="radial-gradient(circle, #7C3AED 0%, transparent 70%)" x="20%" y="70%" duration={20} delay={5} opacity={0.1} />

        {/* Radial vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(11,15,20,0.7) 100%)' }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Eyebrow tag */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="flex items-center gap-2 mb-8"
          >
            <span
              className="text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full"
              style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', letterSpacing: '0.12em' }}
            >
              MBB · IB · GMAT · GRE
            </span>
          </motion.div>

          {/* Main headline */}
          <h1
            className="font-grotesk font-black leading-none mb-2 block"
            style={{ fontSize: 'clamp(2.6rem, 9vw, 7rem)', letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.0 }}
          >
            <span className="block">
              <AnimatedWords text="Train your mind." delayBase={0.15} />
            </span>
            <span
              className="block"
              style={{
                backgroundImage: 'linear-gradient(135deg, #c4b5fd 0%, #7C3AED 50%, #4F46E5 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              <AnimatedWords text="Outperform the competition." delayBase={0.32} />
            </span>
          </h1>

          {/* Glow behind text */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 'clamp(300px, 60vw, 700px)',
              height: '180px',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: 'rgba(255,255,255,0.48)', maxWidth: 480, fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', lineHeight: 1.7 }}
            className="mt-7 mb-10 px-4"
          >
            The mental math gym for MBB, IB, GMAT & GRE candidates.<br className="hidden sm:block" />
            3 minutes a day. Real results.
          </motion.p>

          {/* CTA group */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.88, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <button
              onClick={handleCTA}
              className="relative font-grotesk font-bold text-white no-select overflow-hidden group"
              style={{
                fontSize: '1rem',
                padding: '14px 36px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                boxShadow: '0 0 40px rgba(124,58,237,0.45), 0 0 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.12)',
                transition: 'all 0.25s ease',
                minWidth: 200,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.65), 0 0 120px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.45), 0 0 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start for Free →
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-semibold no-select transition-all duration-200"
              style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', padding: '14px 20px' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >
              See how it works
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-10"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 2. HOW IT WORKS ─────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="relative"
        style={{ padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)' }}
      >
        {/* Subtle top separator glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)' }} />

        <Reveal className="mb-20">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(124,58,237,0.7)', letterSpacing: '0.14em' }}>How it works</p>
          <h2
            className="font-grotesk font-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: 540 }}
          >
            Three steps.<br />Zero friction.
          </h2>
        </Reveal>

        <div
          className="grid gap-0"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', maxWidth: 1100, margin: '0 auto' }}
        >
          {[
            { num: '01', title: 'Pick your battlefield', desc: 'Mental math, percentages, business math, market sizing, or GMAT quant. You choose the arena.' },
            { num: '02', title: 'Train under pressure', desc: 'Timed sessions that simulate real interview pace. Immediate feedback on every answer.' },
            { num: '03', title: 'Watch yourself improve', desc: 'Track accuracy, speed percentile, and streaks. Progress you can actually measure.' },
          ].map((step, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div
                className="relative group transition-all duration-300"
                style={{
                  padding: 'clamp(32px, 4vw, 48px) clamp(24px, 3vw, 40px)',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div
                  className="font-grotesk font-black mb-8 block"
                  style={{
                    fontSize: 'clamp(3rem, 7vw, 5rem)',
                    color: 'transparent',
                    backgroundImage: 'linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(124,58,237,0.15) 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {step.num}
                </div>
                <h3
                  className="font-grotesk font-bold mb-3"
                  style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: '#fff', letterSpacing: '-0.01em' }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 3. WHO IT'S FOR ─────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        {/* Background glow */}
        <div
          className="absolute pointer-events-none"
          style={{ width: 700, height: 700, right: '-20%', top: '-20%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <Reveal className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(124,58,237,0.7)', letterSpacing: '0.14em' }}>Who it's for</p>
          <h2
            className="font-grotesk font-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: 480 }}
          >
            Built for the most<br />competitive paths.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-5" style={{ maxWidth: 880 }}>
          {[
            {
              tag: 'MBB Consulting',
              headline: 'Speed matters in case interviews.',
              sub: 'Train the math before the room.',
              accent: '#7C3AED',
              from: -40,
            },
            {
              tag: 'GMAT & MBA',
              headline: 'The quant section is winnable.',
              sub: 'Build fluency, not just knowledge.',
              accent: '#4F46E5',
              from: 40,
            },
            {
              tag: 'Finance & IB',
              headline: 'Accuracy under pressure is a skill.',
              sub: 'QuantDrill makes it a habit.',
              accent: '#7C3AED',
              from: -40,
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.1} y={0}>
              <motion.div
                initial={{ opacity: 0, x: item.from }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className="group relative flex items-center justify-between gap-6 cursor-default transition-all duration-300"
                style={{
                  padding: 'clamp(24px, 3.5vw, 36px) clamp(24px, 4vw, 48px)',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                whileHover={{
                  background: 'rgba(124,58,237,0.05)',
                  borderColor: 'rgba(124,58,237,0.22)',
                  y: -2,
                  transition: { duration: 0.2 },
                }}
              >
                <div>
                  <span
                    className="text-xs font-bold uppercase tracking-widest mb-3 block"
                    style={{ color: item.accent, opacity: 0.75, letterSpacing: '0.13em' }}
                  >
                    {item.tag}
                  </span>
                  <h3
                    className="font-grotesk font-black"
                    style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}
                  >
                    {item.headline}
                  </h3>
                  <p className="mt-1.5" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.92rem' }}>{item.sub}</p>
                </div>
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <span style={{ color: '#a78bfa', fontSize: 16 }}>→</span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 4. FREE VS PRO ──────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 96px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)' }} />

        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{ width: 600, height: 600, left: '-15%', bottom: '-20%', background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />

        <Reveal className="mb-16 text-center">
          <h2
            className="font-grotesk font-black"
            style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3.5rem)', color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1 }}
          >
            Start free. Go Pro<br />when you mean it.
          </h2>
        </Reveal>

        <div
          className="grid gap-4 mx-auto"
          style={{ maxWidth: 800, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {/* Free */}
          <Reveal delay={0.05}>
            <div
              className="flex flex-col h-full"
              style={{
                padding: 'clamp(28px, 4vw, 40px)',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.13em' }}>Free</p>
              <div className="flex flex-col gap-3 flex-1">
                {['12 drills / day', '2 categories', 'Basic stats'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: '0.93rem', color: 'rgba(255,255,255,0.45)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={0.14}>
            <div
              className="flex flex-col h-full relative overflow-hidden"
              style={{
                padding: 'clamp(28px, 4vw, 40px)',
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(79,70,229,0.06) 100%)',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: '0 0 60px rgba(124,58,237,0.1)',
              }}
            >
              {/* Glow */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), transparent)' }} />
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a78bfa', letterSpacing: '0.13em' }}>Pro ⭐</p>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ color: '#00E5C4', background: 'rgba(0,229,196,0.1)', border: '1px solid rgba(0,229,196,0.2)', letterSpacing: '0.1em' }}>BEST VALUE</span>
              </div>
              <div className="flex flex-col gap-3 flex-1 mb-8">
                {['Unlimited drills', 'All 6 categories', 'Hard mode', 'Premium analytics', '200 achievement badges'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#a78bfa' }} />
                    <span style={{ fontSize: '0.93rem', color: 'rgba(255,255,255,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCTA}
                className="w-full font-grotesk font-bold text-white no-select transition-all duration-200"
                style={{
                  padding: '13px 0',
                  borderRadius: 12,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                  boxShadow: '0 0 28px rgba(124,58,237,0.4)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(124,58,237,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Unlock Pro →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 5. FINAL CTA ────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(80px, 12vw, 140px) clamp(24px, 6vw, 96px)' }}>
        {/* Full-width purple gradient bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.1) 50%, rgba(11,15,20,0) 100%)',
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)' }} />

        {/* Big ambient circle */}
        <Orb size={800} color="radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)" x="-10%" y="-30%" duration={25} opacity={1} />

        <Reveal className="relative z-10 flex flex-col items-center text-center gap-8">
          <h2
            className="font-grotesk font-black"
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 5rem)',
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              maxWidth: 680,
            }}
          >
            Your next interview<br />starts today.
          </h2>
          <button
            onClick={handleCTA}
            className="font-grotesk font-bold text-white no-select transition-all duration-200"
            style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)',
              padding: '16px 48px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              boxShadow: '0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 70px rgba(124,58,237,0.7), 0 0 140px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(124,58,237,0.5), 0 0 100px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Start Training Free →
          </button>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── 6. FOOTER ───────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <footer
        className="relative flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{
          padding: 'clamp(24px, 4vw, 40px) clamp(24px, 6vw, 96px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span className="text-sm font-grotesk font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em' }}>
          Quant<span style={{ color: 'rgba(155,111,232,0.5)' }}>Drill</span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => window.openCookiePreferences?.()}
            className="text-xs no-select transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            Cookie Preferences
          </button>
          <a
            href="mailto:support@quantdrill.com"
            className="text-xs transition-colors duration-200"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
          >
            support@quantdrill.com
          </a>
        </div>
      </footer>
    </div>
  );
}