import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ── Real questions matching actual MVP question types ──────────────────────
// These are representative of what generateQuestion() produces in the real app.
// Answers match what the real checkAnswer() expects (plain numbers / simple strings).
const QUESTIONS = [
  { q: 'What is 15% of 320?', a: '48', category: 'Percentages', difficulty: 'Medium' },
  { q: 'A store sells an item for $240, which is 20% above cost. What is the cost?', a: '200', category: 'Business Math', difficulty: 'Medium' },
  { q: 'What is 8 × 125?', a: '1000', category: 'Mental Math', difficulty: 'Medium' },
];

// Correct count cycles: after each question we show +1 correct
// Simulates a real session: correct=1, 2, 3 over the loop

// ── GlobalTimer bar — mirrors the real GlobalTimer component ───────────────
function SessionTimerBar({ totalSeconds, elapsed }) {
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = remaining / totalSeconds;
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');

  const color = progress > 0.4
    ? 'hsl(262 83% 68%)'
    : progress > 0.18
    ? 'hsl(28 100% 58%)'
    : '#ef4444';

  return (
    <div
      className="mx-5 mt-3 mb-1 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '10px 16px',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
          Session
        </span>
        <span className="font-grotesk font-black text-sm tabular-nums" style={{ color }}>
          {mins}:{secs}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: color,
            transition: 'width 1s linear, background 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

// ── Per-question urgency ring (Fast-Paced mode) — mirrors SoftTimerRing ────
function QuestionRing({ elapsed, difficulty }) {
  const expected = difficulty === 'hard' ? 75 : difficulty === 'easy' ? 25 : 45;
  const progress = Math.min(1, elapsed / expected);
  const r = 14, circ = 2 * Math.PI * r;
  const color = progress < 0.6
    ? 'rgba(124,58,237,0.7)'
    : progress < 0.85
    ? 'rgba(255,153,51,0.85)'
    : 'rgba(239,68,68,0.9)';

  if (progress < 0.1) return null;
  return (
    <svg width="34" height="34" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
      <circle
        cx="17" cy="17" r={r} fill="none"
        stroke={color} strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - progress)}
        style={{ transition: 'stroke 0.4s ease, stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

// ── Results flash — mirrors the real Results page metrics ──────────────────
function ResultsFlash({ score, accuracy, avgTime, speedRating }) {
  const getAccColor = (a) => a >= 90 ? '#34D399' : a >= 75 ? '#a78bfa' : '#FF9933';

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col items-center justify-center gap-5 p-6"
    >
      {/* Score */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.13em' }}>
          Session Score
        </span>
        <span
          className="font-grotesk font-black tabular-nums"
          style={{
            fontSize: 'clamp(3rem, 8vw, 4.5rem)',
            letterSpacing: '-0.04em',
            backgroundImage: 'linear-gradient(135deg, #c4b5fd 0%, #7C3AED 60%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          {score}
        </span>
      </div>

      {/* Accuracy + Speed row */}
      <div className="flex gap-3 w-full">
        <div className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-grotesk font-black text-lg tabular-nums" style={{ color: getAccColor(accuracy) }}>{accuracy}%</span>
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>Accuracy</span>
        </div>
        <div className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-grotesk font-black text-lg tabular-nums" style={{ color: '#00E5C4' }}>{avgTime}s</span>
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>Avg Speed</span>
        </div>
        <div className="flex-1 rounded-2xl p-3 flex flex-col items-center gap-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="font-grotesk font-black text-sm tabular-nums leading-snug text-center" style={{ color: '#FF9933' }}>{speedRating}</span>
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>Speed</span>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.22)' }}>
        Starting next session…
      </p>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ProductPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  // Loop state
  const LOOP_MS = 7200; // full loop ~7.2s
  const RESULTS_DURATION = 2200; // how long results flash shows
  const QUESTION_DURATION = (LOOP_MS - RESULTS_DURATION) / QUESTIONS.length; // ~1667ms per Q

  const [phase, setPhase] = useState('drill'); // 'drill' | 'results'
  const [qIdx, setQIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Session timer — 5 min session, we simulate it already 4 min in so we
  // see the last minute ticking down (adds urgency without showing full 5 min)
  const SESSION_TOTAL = 300; // 5 min
  const [sessionElapsed, setSessionElapsed] = useState(240); // start at 4:00 in

  // Question-level elapsed time (for urgency ring)
  const [qElapsed, setQElapsed] = useState(0);

  // Tick session timer every second
  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => {
      setSessionElapsed(e => {
        if (e >= SESSION_TOTAL) return SESSION_TOTAL;
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isInView]);

  // Tick question elapsed (resets per question)
  useEffect(() => {
    if (!isInView || phase !== 'drill') return;
    setQElapsed(0);
    const t = setInterval(() => setQElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [isInView, qIdx, phase]);

  // Main loop driver
  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;
    let typeTimer = null;

    const runQuestion = (idx) => {
      if (cancelled) return;
      const q = QUESTIONS[idx];
      setQIdx(idx);
      setFlashCorrect(false);
      setInputVal('');
      setQElapsed(0);

      // Type answer gradually
      let i = 0;
      const typeDelay = QUESTION_DURATION * 0.35; // start typing at 35% of slot
      const typeStep = (QUESTION_DURATION * 0.38) / q.a.length; // finish at ~73%

      typeTimer = setTimeout(() => {
        if (cancelled) return;
        const iv = setInterval(() => {
          if (cancelled) { clearInterval(iv); return; }
          i++;
          setInputVal(q.a.slice(0, i));
          if (i >= q.a.length) {
            clearInterval(iv);
            // Flash correct
            setTimeout(() => {
              if (cancelled) return;
              setFlashCorrect(true);
              setCorrectCount(c => c + 1);
              setTotalCount(c => c + 1);
            }, typeStep * 2);
          }
        }, typeStep);
      }, typeDelay);

      // Move to next question after slot
      const next = setTimeout(() => {
        if (cancelled) return;
        const nextIdx = idx + 1;
        if (nextIdx >= QUESTIONS.length) {
          // Show results flash
          setPhase('results');
          setSessionElapsed(SESSION_TOTAL); // timer hits 0
          setTimeout(() => {
            if (cancelled) return;
            // Reset everything for next loop
            setPhase('drill');
            setCorrectCount(0);
            setTotalCount(0);
            setSessionElapsed(240);
            setFlashCorrect(false);
            setInputVal('');
            runQuestion(0);
          }, RESULTS_DURATION);
        } else {
          runQuestion(nextIdx);
        }
      }, QUESTION_DURATION);

      return () => { clearTimeout(typeTimer); clearTimeout(next); };
    };

    runQuestion(0);

    return () => { cancelled = true; if (typeTimer) clearTimeout(typeTimer); };
  }, [isInView]);

  const currentQ = QUESTIONS[qIdx];
  const acc = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

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
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            pace. Not classroom pace.
          </span>
        </h2>
        <p className="mt-5 mx-auto" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 'clamp(0.9rem, 1.8vw, 1rem)', maxWidth: 480, lineHeight: 1.7 }}>
          Every session is timed, tracked, and calibrated to the speed of a real interviewer.
        </p>
      </motion.div>

      {/* Preview frame */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="relative mx-auto"
        style={{ maxWidth: 560 }}
      >
        {/* Glow */}
        <div className="absolute pointer-events-none" style={{
          inset: '-40px', borderRadius: 40,
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,58,237,0.14) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }} />

        {/* Device chrome */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 28,
            background: '#0B0F14',
            border: '1px solid rgba(124,58,237,0.22)',
            boxShadow: '0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
            minHeight: 500,
          }}
        >
          {/* Titlebar */}
          <div
            className="flex items-center gap-2 px-4"
            style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex-1 flex justify-center">
              <div className="px-3 py-0.5 rounded text-[11px]" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }}>
                quantdrill.com/drill
              </div>
            </div>
          </div>

          {/* ── DRILL PHASE ── */}
          <AnimatePresence mode="wait">
            {phase === 'drill' && (
              <motion.div
                key="drill"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                {/* Session timer */}
                <SessionTimerBar totalSeconds={SESSION_TOTAL} elapsed={sessionElapsed} />

                {/* Session header: difficulty + correct/total */}
                <div className="flex items-center justify-between px-5 mt-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', letterSpacing: '0.12em' }}
                    >
                      Medium
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)' }}>
                      Q{qIdx + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-grotesk font-bold tabular-nums" style={{ color: '#34D399' }}>{correctCount}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
                    <span className="text-sm font-grotesk font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>{totalCount}</span>
                    <span className="text-[10px] uppercase tracking-widest ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>correct</span>
                  </div>
                </div>

                {/* Accuracy bar (only after first answer) */}
                {totalCount > 0 && (
                  <div className="px-5 mb-4">
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${acc}%`,
                          background: 'linear-gradient(90deg, rgba(124,58,237,0.6), rgba(167,139,250,0.9))',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Question card */}
                <div className="px-5 pb-5">
                  <div
                    className="relative rounded-3xl p-5 mb-3 overflow-hidden"
                    style={{
                      background: flashCorrect ? 'rgba(52,211,153,0.04)' : 'hsl(220 18% 9%)',
                      border: flashCorrect ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(255,255,255,0.06)',
                      minHeight: 130,
                      transition: 'background 0.25s ease, border-color 0.25s ease',
                    }}
                  >
                    {/* Top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{
                      background: flashCorrect
                        ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)',
                      transition: 'background 0.25s ease',
                    }} />

                    {/* Category label + urgency ring */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(124,58,237,0.6)', letterSpacing: '0.13em' }}>
                        {currentQ.category}
                      </span>
                      <QuestionRing elapsed={qElapsed} difficulty="medium" />
                    </div>

                    {/* Question text */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={qIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="font-grotesk font-semibold text-white"
                        style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', lineHeight: 1.5 }}
                      >
                        {currentQ.q}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Feedback banner (correct) */}
                  <AnimatePresence>
                    {flashCorrect && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22 }}
                        className="mb-3 rounded-2xl px-4 py-2.5 flex items-center justify-center gap-2"
                        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
                      >
                        <span className="text-sm font-grotesk font-bold" style={{ color: '#34D399' }}>✓ Correct</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Answer input */}
                  <div
                    style={{
                      borderRadius: 18,
                      background: flashCorrect ? 'rgba(52,211,153,0.05)' : 'hsl(220 16% 12%)',
                      border: flashCorrect ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.22s ease',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      className="font-grotesk font-bold"
                      style={{
                        fontSize: '1.15rem',
                        color: flashCorrect ? '#34D399' : inputVal ? '#fff' : 'rgba(255,255,255,0.2)',
                        fontWeight: inputVal ? 700 : 400,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {inputVal || 'Type your answer…'}
                    </span>
                    {!flashCorrect && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                        className="ml-0.5 inline-block w-0.5 h-5 rounded"
                        style={{ background: '#7C3AED' }}
                      />
                    )}
                  </div>

                  <p className="text-center text-[9px] mt-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>
                    Auto-advances on correct · Press enter to skip
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS PHASE — mirrors the real Results page ── */}
            {phase === 'results' && (
              <ResultsFlash
                score={96}
                accuracy={100}
                avgTime={5.4}
                speedRating="Lightning"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}