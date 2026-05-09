import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { generateQuestion, checkAnswer, calculateSessionScore, getSpeedRating, getSpeedPercentile } from '@/lib/questionGenerator';
import { calculateNewStreak, getTodayDate } from '@/lib/streakUtils';
import GlobalTimer from '@/components/drill/GlobalTimer';
import QuestionCard from '@/components/drill/QuestionCard';
import MobileHeader from '@/components/MobileHeader';


export default function Drill() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const difficulty = urlParams.get('difficulty') || 'medium';
  const category = urlParams.get('category') || 'daily';
  const durationMinutes = parseInt(urlParams.get('duration') || '5', 10);
  const totalSeconds = durationMinutes * 60;

  const [currentQ, setCurrentQ] = useState(() => generateQuestion(difficulty, category));
  const [answer, setAnswer] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [shake, setShake] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const inputRef = useRef(null);
  const resultsRef = useRef([]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Focus input on new question
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
    if (!finalResults.length) {
      navigate('/');
      return;
    }

    const correct = finalResults.filter(r => r.correct).length;
    const total = finalResults.length;
    const accuracy = Math.round((correct / total) * 100);
    const avgTime = parseFloat((finalResults.reduce((s, r) => s + r.timeTaken, 0) / total).toFixed(1));
    const score = calculateSessionScore(finalResults, difficulty);
    const speedRating = getSpeedRating(avgTime, difficulty);
    const speedPercentile = getSpeedPercentile(avgTime, difficulty);
    const today = getTodayDate();

    navigate('/results', {
      state: { score, accuracy, avgTime, speedRating, speedPercentile, difficulty, correct, total, category, durationMinutes },
    });

    (async () => {
      try {
        await base44.entities.Session.create({
          date: today, score, accuracy, avg_time: avgTime,
          difficulty, category,
          questions_answered: total,
          correct_count: correct,
          speed_rating: speedRating,
          percentile: speedPercentile,
        });
        const user = await base44.auth.me();
        const newStreak = calculateNewStreak(user.streak_count || 0, user.last_active_date);
        await base44.auth.updateMe({ streak_count: newStreak, last_active_date: today });
      } catch (_e) { /* fire and forget */ }
    })();
  }, [difficulty, category, durationMinutes, navigate]);

  const handleTimerExpire = useCallback(() => {
    setSessionActive(false);
    finishSession(resultsRef.current);
  }, [finishSession]);

  // Auto-check on every keystroke
  const handleChange = (e) => {
    const val = e.target.value;
    setAnswer(val);

    if (!val.trim()) return;

    const correct = checkAnswer(val, currentQ.correct_answer);
    if (correct) {
      const timeTaken = (Date.now() - startTime) / 1000;
      const result = { correct: true, timeTaken, answer: val, correctAnswer: currentQ.correct_answer };
      const newResults = [...resultsRef.current, result];
      setFlash('correct');
      // Haptic feedback on mobile
      if (navigator.vibrate) navigator.vibrate(40);
      setTimeout(() => advanceToNext(newResults), 380);
    }
  };

  // Manual submit for wrong answers — user can press Enter to skip
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const correct = checkAnswer(answer, currentQ.correct_answer);
    if (correct) return; // already handled by onChange

    // Wrong answer — flash red, record, and advance
    const timeTaken = (Date.now() - startTime) / 1000;
    const result = { correct: false, timeTaken, answer, correctAnswer: currentQ.correct_answer };
    const newResults = [...resultsRef.current, result];
    setFlash('wrong');
    setTimeout(() => advanceToNext(newResults), 600);
  };

  // Border color based on flash
  const borderClass = flash === 'correct'
    ? 'border-emerald-500 bg-emerald-500/5'
    : flash === 'wrong'
    ? 'border-red-500 bg-red-500/5'
    : 'border-border bg-surface-2';

  return (
    <div className="min-h-screen bg-background flex flex-col pb-6">
      <MobileHeader title="" onBack={() => { setSessionActive(false); navigate('/'); }} />

      <div className="flex-1 flex flex-col w-full lg:max-w-xl lg:mx-auto lg:w-full">

      {/* Global session timer */}
      <div className="mt-4">
        <GlobalTimer
          totalSeconds={totalSeconds}
          onExpire={handleTimerExpire}
          isActive={sessionActive}
        />
      </div>

      {/* Question counter */}
      <div className="flex items-center justify-between px-5 mb-5">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Question {questionCount + 1}</span>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {resultsRef.current.filter(r => r.correct).length}
          <span className="text-muted-foreground/40"> correct so far</span>
        </span>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col px-5 relative">
        <div className="bg-surface-1 border border-border rounded-3xl p-6 mb-5 min-h-[160px] flex items-center">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={`${questionCount}-${currentQ.prompt}`}
              question={currentQ}
              questionNumber={questionCount + 1}
              total={null}
            />
          </AnimatePresence>
        </div>

        {/* Correct-answer flash banner */}
        <AnimatePresence>
          {flash === 'correct' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-2xl px-4 py-3 text-center bg-emerald-500/10 border border-emerald-500/30"
            >
              <p className="font-grotesk font-bold text-base text-emerald-400">
                ✓ Correct
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wrong-answer flash banner */}
        <AnimatePresence>
          {flash === 'wrong' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-2xl px-4 py-3 text-center bg-red-500/10 border border-red-500/30"
            >
              <p className="font-grotesk font-bold text-base text-red-400">
                ✗ Answer: {currentQ.correct_answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer input — auto-advances on correct */}
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className={`relative transition-colors duration-150 rounded-2xl ${borderClass} ${shake ? 'animate-shake' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={answer}
              onChange={handleChange}
              placeholder="Type your answer..."
              autoComplete="off"
              className="w-full bg-transparent rounded-2xl px-5 py-4 text-xl font-grotesk font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none border-none"
            />
          </div>

        </form>
      </div>

      </div>
    </div>
  );
}