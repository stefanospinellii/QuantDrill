import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Animated counter hook
function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

// Circular accuracy ring
function AccuracyRing({ pct, started }) {
  const r = 28, circ = 2 * Math.PI * r;
  const [dashOffset, setDashOffset] = useState(circ);
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setDashOffset(circ * (1 - pct / 100)), 300);
    return () => clearTimeout(timer);
  }, [started, pct, circ]);
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke="url(#accGrad)" strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <defs>
        <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated timer ring
function TimerRing({ seconds = 8, totalSeconds = 15 }) {
  const r = 18, circ = 2 * Math.PI * r;
  const pct = seconds / totalSeconds;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="3.5" />
      <motion.circle
        cx="24" cy="24" r={r} fill="none"
        stroke="#7C3AED" strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        transform="rotate(-90 24 24)"
        animate={{ strokeDashoffset: [circ * (1 - pct), circ] }}
        transition={{ duration: seconds, ease: 'linear', repeat: Infinity }}
      />
    </svg>
  );
}

export default function ProductPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const accuracy = useCountUp(91, 1600, isInView);
  const streak = useCountUp(12, 1200, isInView);
  const tests = useCountUp(128, 2000, isInView);

  // Cycling questions for the drill card
  const questions = [
    { q: 'What is 18% of 250?', a: '45', category: 'Percentages' },
    { q: 'A company grew from $2.4M to $3.6M. What is the growth rate?', a: '50%', category: 'Business Math' },
    { q: 'If margins are 35% on revenue of $480K, what is gross profit?', a: '$168K', category: 'Finance' },
  ];
  const [qIdx, setQIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [flashCorrect, setFlashCorrect] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setFlashCorrect(true);
      setTimeout(() => {
        setFlashCorrect(false);
        setInputVal('');
        setQIdx(i => (i + 1) % questions.length);
      }, 700);
    }, 3200);
    return () => clearInterval(interval);
  }, [isInView]);

  // Simulate typing the answer
  useEffect(() => {
    if (!isInView) return;
    const answer = questions[qIdx].a;
    let i = 0;
    setInputVal('');
    const type = setInterval(() => {
      i++;
      setInputVal(answer.slice(0, i));
      if (i >= answer.length) clearInterval(type);
    }, 120);
    return () => clearInterval(type);
  }, [qIdx, isInView]);

  const currentQ = questions[qIdx];

  return (
    <div ref={ref} className="relative w-full" style={{ padding: 'clamp(80px, 10vw, 140px) clamp(16px, 5vw, 80px)' }}>

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(124,58,237,0.7)', letterSpacing: '0.14em' }}>The platform</p>
        <h2
          className="font-grotesk font-black"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.8rem)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          Built for interview<br />
          <span style={{
            backgroundImage: 'linear-gradient(135deg, #c4b5fd 0%, #7C3AED 60%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            pace. Not classroom pace.
          </span>
        </h2>
        <p className="mt-5 mx-auto" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', maxWidth: 480, lineHeight: 1.7 }}>
          Every session is timed, tracked, and calibrated to the speed of a real interviewer.
        </p>
      </motion.div>

      {/* Main preview container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative mx-auto"
        style={{ maxWidth: 1100 }}
      >
        {/* Outer glow */}
        <div className="absolute pointer-events-none" style={{
          inset: '-40px', borderRadius: 40,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }} />

        {/* Chrome frame */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 24,
            background: 'rgba(15,19,26,0.95)',
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Titlebar */}
          <div
            className="flex items-center gap-2 px-5"
            style={{ height: 44, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md text-xs" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>
                quantdrill.com/drill
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 340px', minHeight: 480 }}>

            {/* LEFT: Drill interface */}
            <div className="p-8 flex flex-col gap-6" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>

              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-grotesk font-black text-base" style={{ color: '#fff' }}>
                    Quant<span style={{ color: '#9B6FE8' }}>Drill</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
                    Hard Mode
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>Streak</span>
                  <span className="font-bold text-sm" style={{ color: '#FF9933' }}>🔥 {streak}</span>
                </div>
              </div>

              {/* Session progress bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>SESSION PROGRESS</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>7 / 12 correct</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7C3AED, #a78bfa)' }}
                    animate={{ width: ['58%', '67%'] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div
                className="flex-1 relative rounded-2xl p-6 flex flex-col justify-between"
                style={{
                  background: 'rgba(124,58,237,0.05)',
                  border: flashCorrect ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(124,58,237,0.2)',
                  transition: 'border-color 0.3s ease',
                  minHeight: 180,
                }}
              >
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span style={{ fontSize: '0.7rem', color: 'rgba(124,58,237,0.6)', letterSpacing: '0.1em' }}>
                    {currentQ.category.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-start gap-4 mt-2">
                  <div className="relative shrink-0">
                    <TimerRing seconds={8} totalSeconds={15} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-grotesk font-black text-xs" style={{ color: '#a78bfa' }}>8s</span>
                    </div>
                  </div>
                  <motion.p
                    key={qIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="font-grotesk font-semibold leading-snug"
                    style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)', color: '#fff', lineHeight: 1.45 }}
                  >
                    {currentQ.q}
                  </motion.p>
                </div>

                {/* Answer input simulation */}
                <div className="mt-6">
                  <div
                    className="flex items-center px-4 py-3 rounded-xl"
                    style={{
                      background: flashCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                      border: flashCorrect ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <motion.span
                      key={qIdx + inputVal}
                      className="font-grotesk font-bold"
                      style={{ color: flashCorrect ? '#34D399' : '#fff', fontSize: '1.1rem' }}
                    >
                      {inputVal || <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, fontSize: '0.9rem' }}>Type your answer...</span>}
                    </motion.span>
                    {!flashCorrect && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                        className="ml-0.5 inline-block w-0.5 h-5 rounded"
                        style={{ background: '#7C3AED' }}
                      />
                    )}
                    {flashCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-sm font-bold"
                        style={{ color: '#34D399' }}
                      >
                        ✓ Correct
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Performance panel */}
            <div className="p-6 flex flex-col gap-5" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.13em' }}>Performance</p>

              {/* Accuracy ring */}
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.14)' }}>
                <div className="relative">
                  <AccuracyRing pct={accuracy} started={isInView} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-grotesk font-black text-sm" style={{ color: '#a78bfa' }}>{accuracy}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#fff' }}>Accuracy</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Last 30 sessions</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Avg Speed', value: '4.2s', sub: 'per question', color: '#00E5C4' },
                  { label: 'Tests Done', value: tests, sub: 'total sessions', color: '#a78bfa' },
                  { label: 'Percentile', value: 'Top 8%', sub: 'speed ranking', color: '#FF9933' },
                  { label: 'Best Streak', value: '21 days', sub: 'personal record', color: '#a78bfa' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: '#fff' }}>{stat.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{stat.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Badge progress */}
              <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>Badges</p>
                  <span className="text-[10px] font-semibold" style={{ color: '#a78bfa' }}>18 / 200</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['🧮', '⚡', '🔥', '🎯', '🏆', '💎'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      animate={isInView ? { scale: [0.8, 1], opacity: [0, 1] } : {}}
                      transition={{ delay: 0.6 + i * 0.07, duration: 0.35 }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                      style={{
                        background: i < 4 ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                        border: i < 4 ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(255,255,255,0.05)',
                        filter: i >= 4 ? 'grayscale(1) opacity(0.3)' : 'none',
                      }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Category breakdown */}
              <div className="flex flex-col gap-2">
                {[
                  { cat: 'Mental Math', pct: 88 },
                  { cat: 'Percentages', pct: 94 },
                  { cat: 'Market Sizing', pct: 76 },
                ].map((c, i) => (
                  <div key={c.cat}>
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{c.cat}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{c.pct}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.5), rgba(167,139,250,0.8))' }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${c.pct}%` } : {}}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile version — simplified card stack */}
      <div className="hidden" />
    </div>
  );
}