import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ProductPreview from '@/components/landing/ProductPreview';

// ── Utilities ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 30, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-70px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Orb({ size, color, x, y, duration = 20, delay = 0, opacity = 0.18 }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none select-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: color,
        filter: `blur(${Math.round(size * 0.38)}px)`,
        opacity,
      }}
      animate={{ y: [0, -30, 0], x: [0, 16, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

function AnimatedWords({ text, delayBase = 0, gradient = false }) {
  const words = text.split(' ');
  const gradStyle = gradient ? {
    backgroundImage: 'linear-gradient(135deg, #c4b5fd 0%, #7C3AED 55%, #4F46E5 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } : {};
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: delayBase + i * 0.09 }}
          style={{ display: 'inline-block', marginRight: '0.26em', ...gradStyle }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

const PrimaryBtn = ({ onClick, children, large = false }) => (
  <button
    onClick={onClick}
    className="font-grotesk font-bold text-white no-select"
    style={{
      fontSize: large ? 'clamp(1rem, 1.6vw, 1.1rem)' : '1rem',
      padding: large ? '16px 48px' : '14px 36px',
      borderRadius: 14,
      background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
      boxShadow: '0 0 40px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.12)',
      transition: 'all 0.22s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 0 65px rgba(124,58,237,0.65), inset 0 1px 0 rgba(255,255,255,0.14)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.42), inset 0 1px 0 rgba(255,255,255,0.12)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    {children}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const handleCTA = () => base44.auth.redirectToLogin('/home');

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#0B0F14', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          paddingLeft: 'clamp(20px, 5vw, 72px)',
          paddingRight: 'clamp(20px, 5vw, 72px)',
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          paddingBottom: 16,
          background: 'rgba(11,15,20,0.8)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <span className="font-grotesk font-black text-lg" style={{ color: '#fff', letterSpacing: '-0.01em' }}>
          Quant<span style={{ color: '#9B6FE8' }}>Drill</span>
        </span>
        <button
          onClick={handleCTA}
          className="text-sm font-semibold px-5 py-2.5 rounded-xl no-select"
          style={{ color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.28)', background: 'rgba(124,58,237,0.07)', transition: 'all 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.07)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.28)'; }}
        >
          Log in
        </button>
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight: '100svh', paddingTop: 'max(96px, env(safe-area-inset-top, 96px))', paddingBottom: 80, paddingLeft: 'clamp(20px, 5vw, 60px)', paddingRight: 'clamp(20px, 5vw, 60px)' }}
      >
        <Orb size={600} color="radial-gradient(circle, #7C3AED 0%, transparent 68%)" x="-8%" y="-12%" duration={24} opacity={0.2} />
        <Orb size={400} color="radial-gradient(circle, #4F46E5 0%, transparent 70%)" x="62%" y="5%" duration={19} delay={4} opacity={0.14} />
        <Orb size={280} color="radial-gradient(circle, #00E5C4 0%, transparent 70%)" x="78%" y="60%" duration={28} delay={9} opacity={0.08} />
        <Orb size={320} color="radial-gradient(circle, #7C3AED 0%, transparent 70%)" x="15%" y="72%" duration={22} delay={6} opacity={0.09} />

        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 55% at 50% 38%, transparent 28%, rgba(11,15,20,0.75) 100%)',
        }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-9"
          >
            <span
              className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)', letterSpacing: '0.14em' }}
            >
              MBB · IB · GMAT · GRE · MBA
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            className="font-grotesk font-black block"
            style={{ fontSize: 'clamp(2.8rem, 10vw, 7.5rem)', letterSpacing: '-0.035em', lineHeight: 0.95, color: '#fff', marginBottom: '0.08em' }}
          >
            <span className="block overflow-hidden pb-1">
              <AnimatedWords text="Train your mind." delayBase={0.14} />
            </span>
            <span className="block overflow-hidden pb-1">
              <AnimatedWords text="Outperform" delayBase={0.38} gradient />
              {' '}
              <AnimatedWords text="the competition." delayBase={0.52} gradient />
            </span>
          </h1>

          {/* Text glow */}
          <div className="absolute pointer-events-none" style={{
            width: 'clamp(320px, 70vw, 800px)', height: 200,
            top: '28%', left: '50%', transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.16) 0%, transparent 68%)',
            filter: 'blur(30px)',
          }} />

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ color: 'rgba(255,255,255,0.44)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.72, maxWidth: 500 }}
            className="mt-8 mb-11 px-2"
          >
            Sharpen your numerical reflexes for the room.<br className="hidden sm:block" />
            Short daily sessions. Real performance tracking.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <PrimaryBtn onClick={handleCTA}>Start for Free →</PrimaryBtn>
            <button
              onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
              className="font-semibold no-select transition-colors duration-200 px-5 py-3"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              See the platform ↓
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.8, duration: 0.7 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
                className="w-px h-12"
                style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.28), transparent)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── PRODUCT PREVIEW ─────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="preview" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)' }} />
        <Orb size={700} color="radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)" x="60%" y="-10%" duration={30} opacity={1} />
        <ProductPreview />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="relative"
        style={{ padding: 'clamp(80px, 12vw, 160px) clamp(20px, 6vw, 96px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.22), transparent)' }} />

        <Reveal className="mb-20">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(124,58,237,0.65)', letterSpacing: '0.14em' }}>How it works</p>
          <h2 className="font-grotesk font-black" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', color: '#fff', letterSpacing: '-0.028em', lineHeight: 1.05, maxWidth: 560 }}>
            No tutorials.<br />Just reps.
          </h2>
          <p className="mt-4" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.95rem', maxWidth: 380, lineHeight: 1.7 }}>
            The only way to build speed under pressure is to practice under pressure.
          </p>
        </Reveal>

        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: 1200, margin: '0 auto' }}
        >
          {[
            { num: '01', title: 'Pick your battlefield', desc: 'Mental math. Percentages. Business math. Market sizing. GMAT Quant. You choose the category, we set the clock.' },
            { num: '02', title: 'Train under pressure', desc: 'Timed questions at interviewer pace. Instant feedback. Harder with every session. No shortcuts.' },
            { num: '03', title: 'Track what matters', desc: 'Accuracy. Speed percentile. Streaks. Category breakdown. Data that tells you exactly where to drill harder.' },
          ].map((step, i) => (
            <Reveal key={i} delay={i * 0.13}>
              <div
                className="group"
                style={{
                  padding: 'clamp(36px, 4vw, 52px) clamp(28px, 3.5vw, 44px)',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div
                  className="font-grotesk font-black mb-10"
                  style={{
                    fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    backgroundImage: 'linear-gradient(160deg, rgba(124,58,237,0.55) 0%, rgba(124,58,237,0.1) 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {step.num}
                </div>
                <h3 className="font-grotesk font-bold mb-3" style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)', color: '#fff', letterSpacing: '-0.01em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.36)', lineHeight: 1.8 }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── WHO IT'S FOR ────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ padding: 'clamp(80px, 12vw, 160px) clamp(20px, 6vw, 96px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)' }} />
        <div className="absolute pointer-events-none" style={{ width: 800, height: 800, right: '-20%', top: '-15%', background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />

        <Reveal className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(124,58,237,0.65)', letterSpacing: '0.14em' }}>Who it's for</p>
          <h2 className="font-grotesk font-black" style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', color: '#fff', letterSpacing: '-0.028em', lineHeight: 1.05, maxWidth: 520 }}>
            Built for the most<br />competitive rooms.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-4" style={{ maxWidth: 960 }}>
          {[
            {
              tag: 'MBB Consulting',
              headline: 'Ace your case interview before you walk in.',
              body: "When a partner asks you to size a market on the spot, you're expected to structure quickly and explain your reasoning step by step — under time pressure, without a calculator. QuantDrill builds exactly that reflex.",
              accent: '#7C3AED',
              from: -50,
            },
            {
              tag: 'GMAT & GRE',
              headline: 'The quant section is winnable. Make it yours.',
              body: 'Competitive MBA programs typically see GMAT Focus scores of 645–705+ for strong profiles, with GRE Quant at 165–170 for quant-heavy programs. Consistency across sections matters more than raw score — and consistency comes from repetition under real time pressure.',
              accent: '#6D28D9',
              from: 50,
            },
            {
              tag: 'Investment Banking',
              headline: 'Precision under pressure is the standard.',
              body: "In IB interviews, you're expected to compute quickly and clearly explain your logic while under pressure. It's not just about getting the number right — it's about getting it right fast, and showing your reasoning every step of the way.",
              accent: '#7C3AED',
              from: -50,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: item.from }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              className="group relative cursor-default"
              style={{
                padding: 'clamp(28px, 3.5vw, 44px) clamp(28px, 4.5vw, 56px)',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.25s ease',
              }}
              whileHover={{ background: 'rgba(124,58,237,0.04)', borderColor: 'rgba(124,58,237,0.2)', y: -3, transition: { duration: 0.2 } }}
            >
              <span className="text-xs font-bold uppercase tracking-widest mb-4 block" style={{ color: item.accent, opacity: 0.7, letterSpacing: '0.14em' }}>{item.tag}</span>
              <h3 className="font-grotesk font-black mb-3" style={{ fontSize: 'clamp(1.2rem, 2.8vw, 1.75rem)', color: '#fff', letterSpacing: '-0.022em', lineHeight: 1.2 }}>
                {item.headline}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.36)', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 560 }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── FREE vs PRO ─────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ padding: 'clamp(80px, 12vw, 160px) clamp(20px, 6vw, 96px)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.22), transparent)' }} />
        <div className="absolute pointer-events-none" style={{ width: 600, height: 600, left: '-12%', bottom: '-20%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }} />

        <Reveal className="mb-16 text-center">
          <h2 className="font-grotesk font-black" style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: '#fff', letterSpacing: '-0.028em', lineHeight: 1.05 }}>
            Start free.<br />
            <span style={{
              backgroundImage: 'linear-gradient(135deg, #c4b5fd 0%, #7C3AED 55%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Go Pro when you mean it.</span>
          </h2>
        </Reveal>

        <div className="grid gap-5 mx-auto" style={{ maxWidth: 860, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Free */}
          <Reveal delay={0.05}>
            <div className="flex flex-col h-full" style={{ padding: 'clamp(32px, 4vw, 44px)', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em' }}>Free</p>
              <div className="flex flex-col gap-3.5 flex-1">
                {['12 drills per day', '2 categories', 'Core performance stats'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.18)' }} />
                    <span style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.42)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={0.13}>
            <div className="flex flex-col h-full relative overflow-hidden" style={{
              padding: 'clamp(32px, 4vw, 44px)', borderRadius: 20,
              background: 'linear-gradient(145deg, rgba(124,58,237,0.1) 0%, rgba(79,70,229,0.05) 100%)',
              border: '1px solid rgba(124,58,237,0.28)',
              boxShadow: '0 0 60px rgba(124,58,237,0.09)',
            }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.65), transparent)' }} />
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a78bfa', letterSpacing: '0.14em' }}>Pro ⭐</p>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase" style={{ color: '#00E5C4', background: 'rgba(0,229,196,0.09)', border: '1px solid rgba(0,229,196,0.2)', letterSpacing: '0.1em' }}>BEST VALUE</span>
              </div>
              <div className="flex flex-col gap-3.5 flex-1 mb-8">
                {['Unlimited drills', 'All 6 categories', 'Hard mode', 'Premium analytics', '200 achievement badges'].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#a78bfa' }} />
                    <span style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.72)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCTA}
                className="w-full font-grotesk font-bold text-white no-select"
                style={{ padding: '14px 0', borderRadius: 12, fontSize: '0.95rem', background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', boxShadow: '0 0 28px rgba(124,58,237,0.38)', transition: 'all 0.22s ease' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(124,58,237,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.38)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Unlock Pro →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ padding: 'clamp(100px, 14vw, 180px) clamp(20px, 6vw, 96px)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, rgba(124,58,237,0.16) 0%, rgba(79,70,229,0.08) 45%, transparent 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.32), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.12), transparent)' }} />
        <Orb size={900} color="radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 65%)" x="-8%" y="-25%" duration={28} opacity={1} />

        <Reveal className="relative z-10 flex flex-col items-center text-center gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(124,58,237,0.6)', letterSpacing: '0.14em' }}>The next step</p>
            <h2 className="font-grotesk font-black" style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', color: '#fff', letterSpacing: '-0.032em', lineHeight: 1.0, maxWidth: 740 }}>
              Your next interview<br />starts today.
            </h2>
            <p className="mt-6 mx-auto" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)', maxWidth: 420, lineHeight: 1.75 }}>
              One daily session. One lasting habit. The edge you need.
            </p>
          </div>
          <PrimaryBtn onClick={handleCTA} large>Start Training Free →</PrimaryBtn>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer
        className="relative flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ padding: 'clamp(22px, 3vw, 36px) clamp(20px, 6vw, 96px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="font-grotesk font-black text-sm" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '-0.01em' }}>
          Quant<span style={{ color: 'rgba(155,111,232,0.45)' }}>Drill</span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
          ].map(l => (
            <a key={l.label} href={l.href} className="text-xs transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.28)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
            >{l.label}</a>
          ))}
          <button onClick={() => window.openCookiePreferences?.()} className="text-xs no-select transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.28)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
          >Cookie Preferences</button>
          <a href="mailto:support@quantdrill.com" className="text-xs transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.28)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.28)'}
          >support@quantdrill.com</a>
        </div>
      </footer>
    </div>
  );
}