import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { generateQuestion, checkAnswer, calculateSessionScore, getSpeedRating, getSpeedPercentile } from '@/lib/questionGenerator';
import { calculateNewStreak, getTodayDate } from '@/lib/streakUtils';
import GlobalTimer from '@/components/drill/GlobalTimer';
import QuestionCard from '@/components/drill/QuestionCard';
import MobileHeader from '@/components/MobileHeader';
import { QUESTION_TIME_EXPECTATIONS } from '@/components/DifficultySheet';

// Soft per-question urgency ring (Normal mode only, visual only — never enforces)
function SoftTimerRing({ difficulty, questionStartTime }) {
  const [elapsed, setElapsed] = useState(0);
  const expected = QUESTION_TIME_EXPECTATIONS[difficulty] || 45;

  useEffect(() => {
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed((Date.now() - questionStartTime) / 1000);
    }, 500);
    return () => clearInterval(interval);
  }, [questionStartTime]);

  const progress = Math.min(1, elapsed / expected);
  const r = 14, circ = 2 * Math.PI * r;

  // Color shifts from muted → orange → red as time passes
  const color = progress < 0.6
    ? 'rgba(124,58,237,0.5)'
    : progress < 0.85
    ? 'rgba(255,153,51,0.7)'
    : 'rgba(239,68,68,0.8)';

  if (progress < 0.1) return null; // hide until 10% of expected time passes

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <svg width="34" height="34" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
        <circle
          cx="17" cy="17" r={r} fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          style={{ transition: 'stroke 0.4s ease, stroke-dashoffset 0.5s ease' }}
        />
      </svg>
    </motion.div>
  );
}

export default function Drill() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const difficulty = urlParams.get('difficulty') || 'medium';
  const category = urlParams.get('category') || 'daily';
  const durationParam = urlParams.get('duration');
  const pace = urlParams.get('pace') || 'normal'; // 'normal' | 'fast'

  const isFastPaced = pace === 'fast';
  // Both modes use the session timer — duration is always set from param
  const totalSeconds = durationParam ? (parseInt(durationParam, 10) * 60) : null;

  const [currentQ, setCurrentQ] = useState(() => generateQuestion(difficulty, category));
  const [answer, setAnswer] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [shake, setShake] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const inputRef = useRef(null);
  const resultsRef = useRef([]);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100); }, []);

  useEffect(() => {
    setStartTime(Date.now());
    setAnswer('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentQ]);

  const advanceToNext = useCallback((newResults) => {
    resultsRef.current = newResults;
    setCurrentQ(generateQuestion(difficulty, category));
    setQuestionCount(c => c + 1);
    setFlash(null);
  }, [difficulty, category]);

  const finishSession = useCallback(async (finalResults) => {
    if (!finalResults.length) { navigate('/'); return; }
    const correct = finalResults.filter(r => r.correct).length;
    const total = finalResults.length;
    const accuracy = Math.round((correct / total) * 100);
    const avgTime = parseFloat((finalResults.reduce((s, r) => s + r.timeTaken, 0) / total).toFixed(1));
    const score = calculateSessionScore(finalResults, difficulty);
    const speedRating = getSpeedRating(avgTime, difficulty);
    const speedPercentile = getSpeedPercentile(avgTime, difficulty);
    const durationMinutes = durationParam ? parseInt(durationParam, 10) : null;

    navigate('/results', {
      state: { score, accuracy, avgTime, speedRating, speedPercentile, difficulty, correct, total, category, durationMinutes },
    });

    (async () => {
      try {
        const user = await base44.auth.me();
        await base44.entities.Session.create({
          date: getTodayDate(), score, accuracy, avg_time: avgTime,
          difficulty, category,
          questions_answered: total, correct_count: correct,
          speed_rating: speedRating, percentile: speedPercentile,
          user_id: user?.id,
        });
        const newStreak = calculateNewStreak(user.streak_count || 0, user.last_active_date);
        await base44.auth.updateMe({ streak_count: newStreak, last_active_date: getTodayDate() });
      } catch (_e) {}
    })();
  }, [difficulty, category, durationParam, navigate]);

  const handleTimerExpire = useCallback(() => {
    setSessionActive(false);
    finishSession(resultsRef.current);
  }, [finishSession]);

  const handleChange = (e) => {
    const val = e.target.value;
    setAnswer(val);
    if (!val.trim()) return;
    const correct = checkAnswer(val, currentQ.correct_answer);
    if (correct) {
      const timeTaken = (Date.now() - startTime) / 1000;
      const newResults = [...resultsRef.current, { correct: true, timeTaken, answer: val, correctAnswer: currentQ.correct_answer }];
      setFlash('correct');
      if (navigator.vibrate) navigator.vibrate(40);
      setTimeout(() => advanceToNext(newResults), 400);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    const correct = checkAnswer(answer, currentQ.correct_answer);
    if (correct) return;
    const timeTaken = (Date.now() - startTime) / 1000;
    const newResults = [...resultsRef.current, { correct: false, timeTaken, answer, correctAnswer: currentQ.correct_answer }];
    setFlash('wrong');
    setTimeout(() => advanceToNext(newResults), 650);
  };

  const correctCount = resultsRef.current.filter(r => r.correct).length;
  const totalAnswered = resultsRef.current.length;

  const diffConfig = {
    easy:   { label: 'Easy',   color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
    medium: { label: 'Medium', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
    hard:   { label: 'Hard',   color: '#FF9933', bg: 'rgba(255,153,51,0.1)',  border: 'rgba(255,153,51,0.2)' },
  };
  const diff = diffConfig[difficulty] || diffConfig.medium;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B0F14' }}>
      <MobileHeader title="" onBack={() => { setSessionActive(false); navigate('/'); }} />

      <div className="fixed pointer-events-none" style={{
        top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)',
        filter: 'blur(40px)',
      }} />

      <div className="flex-1 flex flex-col w-full lg:max-w-xl lg:mx-auto lg:w-full relative z-10">

        {/* Session timer — always shown (Normal uses duration or default 5min display, Fast-Paced uses chosen duration) */}
        {totalSeconds && (
          <div className="mt-4">
            <GlobalTimer totalSeconds={totalSeconds} onExpire={handleTimerExpire} isActive={sessionActive} />
          </div>
        )}

        {/* Session header */}
        <div className={`flex items-center justify-between px-5 ${isFastPaced ? 'mb-4' : 'mt-5 mb-4'}`}>
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`, letterSpacing: '0.12em' }}
            >
              {diff.label}
            </span>
            {isFastPaced && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full" style={{ color: 'hsl(174 100% 45%)', background: 'rgba(0,229,196,0.08)', border: '1px solid rgba(0,229,196,0.2)', letterSpacing: '0.1em' }}>
                ⚡ Fast
              </span>
            )}
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest" style={{ letterSpacing: '0.1em' }}>
              Q{questionCount + 1}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-grotesk font-bold tabular-nums" style={{ color: '#34D399' }}>{correctCount}</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
            <span className="text-sm font-grotesk font-bold tabular-nums" style={{ color: 'rgba(255,255,255,0.45)' }}>{totalAnswered}</span>
            <span className="text-[10px] uppercase tracking-widest ml-1" style={{ color: 'rgba(255,255,255,0.25)' }}>correct</span>
          </div>
        </div>

        {/* Accuracy progress bar */}
        {totalAnswered > 0 && (
          <div className="px-5 mb-5">
            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.6), rgba(167,139,250,0.9))' }}
                animate={{ width: `${(correctCount / Math.max(totalAnswered, 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        {/* Question card */}
        <div className="flex-1 flex flex-col px-5">
          <div
            className="relative rounded-3xl p-6 mb-4 overflow-hidden"
            style={{
              background: flash === 'correct'
                ? 'rgba(52,211,153,0.04)'
                : flash === 'wrong'
                ? 'rgba(239,68,68,0.04)'
                : 'hsl(220 18% 9%)',
              border: flash === 'correct'
                ? '1px solid rgba(52,211,153,0.25)'
                : flash === 'wrong'
                ? '1px solid rgba(239,68,68,0.25)'
                : '1px solid rgba(255,255,255,0.06)',
              minHeight: 160,
              transition: 'background 0.25s ease, border-color 0.25s ease',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: flash === 'correct'
                ? 'linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent)'
                : flash === 'wrong'
                ? 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.25), transparent)',
              transition: 'background 0.25s ease',
            }} />

            {/* Per-question urgency ring — Fast-Paced mode only */}
            {isFastPaced && flash === null && (
              <div className="absolute top-4 right-4">
                <SoftTimerRing difficulty={difficulty} questionStartTime={startTime} />
              </div>
            )}

            <AnimatePresence mode="wait">
              <QuestionCard key={questionCount} question={currentQ} questionNumber={questionCount + 1} />
            </AnimatePresence>
          </div>

          {/* Feedback banners */}
          <AnimatePresence>
            {flash === 'correct' && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="mb-4 rounded-2xl px-4 py-3 flex items-center justify-center gap-2"
                style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}
              >
                <span className="text-sm font-grotesk font-bold" style={{ color: '#34D399' }}>✓ Correct</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {flash === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22 }}
                className="mb-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <span className="text-sm font-grotesk font-bold" style={{ color: '#f87171' }}>✗ Incorrect</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Answer: <span className="font-bold text-white">{currentQ.correct_answer}</span></span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer input */}
          <form onSubmit={handleSubmit} className="mt-auto pb-4">
            <div
              className={shake ? 'animate-shake' : ''}
              style={{
                borderRadius: 18,
                background: flash === 'correct' ? 'rgba(52,211,153,0.05)' : flash === 'wrong' ? 'rgba(239,68,68,0.05)' : 'hsl(220 16% 12%)',
                border: flash === 'correct' ? '1px solid rgba(52,211,153,0.3)' : flash === 'wrong' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: flash === 'correct' ? '0 0 20px rgba(52,211,153,0.1)' : flash === 'wrong' ? '0 0 20px rgba(239,68,68,0.1)' : 'none',
                transition: 'all 0.22s ease',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={answer}
                onChange={handleChange}
                placeholder="Type your answer..."
                autoComplete="off"
                className="w-full bg-transparent rounded-[18px] px-5 py-4 font-grotesk font-bold text-white placeholder:font-normal focus:outline-none"
                style={{
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  caretColor: 'hsl(262 83% 68%)',
                  color: flash === 'correct' ? '#34D399' : flash === 'wrong' ? '#f87171' : '#fff',
                  transition: 'color 0.2s ease',
                }}
              />
            </div>
            <p className="text-center text-[10px] mt-2.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>
              Auto-advances on correct · Press enter to skip
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}