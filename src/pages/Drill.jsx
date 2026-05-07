import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { generateSession, checkAnswer, getTimerSeconds, calculateScore, getSpeedRating, getPercentile } from '@/lib/questionGenerator';
import { calculateNewStreak, getTodayDate } from '@/lib/streakUtils';
import TimerRing from '@/components/drill/TimerRing';
import QuestionCard from '@/components/drill/QuestionCard';
import { X, ArrowRight } from 'lucide-react';

const TOTAL_QUESTIONS = 10;

export default function Drill() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const difficulty = urlParams.get('difficulty') || 'medium';
  const timerSeconds = getTimerSeconds(difficulty);

  const [questions] = useState(() => generateSession(difficulty, TOTAL_QUESTIONS));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('question'); // question | feedback
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timerKey, setTimerKey] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    setStartTime(Date.now());
    setAnswer('');
    setPhase('question');
    setTimerKey(k => k + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIdx]);

  const submitAnswer = useCallback((userAnswer) => {
    if (phase !== 'question') return;
    const timeTaken = (Date.now() - startTime) / 1000;
    const correct = checkAnswer(userAnswer, currentQ.correct_answer);
    setIsCorrect(correct);
    setPhase('feedback');

    const result = {
      correct,
      timeTaken,
      timeLimit: timerSeconds,
      answer: userAnswer,
      correctAnswer: currentQ.correct_answer,
    };

    const newResults = [...results, result];

    setTimeout(() => {
      if (currentIdx < TOTAL_QUESTIONS - 1) {
        setResults(newResults);
        setCurrentIdx(i => i + 1);
        setPhase('question');
      } else {
        finishSession(newResults);
      }
    }, 600);
  }, [phase, currentIdx, results, startTime, timerSeconds, currentQ]);

  const handleTimerExpire = useCallback(() => {
    submitAnswer('');
  }, [submitAnswer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    submitAnswer(answer);
  };

  const finishSession = async (finalResults) => {
    const score = calculateScore(finalResults, difficulty);
    const correct = finalResults.filter(r => r.correct).length;
    const accuracy = Math.round((correct / TOTAL_QUESTIONS) * 100);
    const avgTime = parseFloat((finalResults.reduce((s, r) => s + r.timeTaken, 0) / finalResults.length).toFixed(1));
    const speedRating = getSpeedRating(avgTime, difficulty);
    const percentile = getPercentile(score, difficulty);
    const today = getTodayDate();

    // Navigate immediately (optimistic) — save in background
    navigate('/results', {
      state: { score, accuracy, avgTime, speedRating, percentile, difficulty, correct, total: TOTAL_QUESTIONS },
    });

    // Fire-and-forget persistence
    (async () => {
      try {
        await base44.entities.Session.create({
          date: today,
          score,
          accuracy,
          avg_time: avgTime,
          difficulty,
          questions_answered: TOTAL_QUESTIONS,
          correct_count: correct,
          speed_rating: speedRating,
          percentile,
        });

        const user = await base44.auth.me();
        const newStreak = calculateNewStreak(user.streak_count || 0, user.last_active_date);
        await base44.auth.updateMe({
          streak_count: newStreak,
          last_active_date: today,
        });
      } catch (e) {
        console.error('Could not save session:', e);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-8 pb-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 bg-surface-2 rounded-xl flex items-center justify-center border border-border"
        >
          <X size={16} className="text-muted-foreground" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < currentIdx
                  ? 'bg-primary w-4'
                  : i === currentIdx
                  ? 'bg-primary/60 w-4'
                  : 'bg-surface-3 w-1.5'
              }`}
            />
          ))}
        </div>

        <span className="text-sm font-grotesk font-semibold text-muted-foreground tabular-nums">
          {currentIdx + 1}<span className="text-muted-foreground/40">/{TOTAL_QUESTIONS}</span>
        </span>
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-8">
        <TimerRing
          key={timerKey}
          duration={timerSeconds}
          onExpire={handleTimerExpire}
          isActive={phase === 'question'}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <div className="bg-surface-1 border border-border rounded-3xl p-6 mb-6 min-h-[140px] flex items-center">
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentIdx}
              question={currentQ}
              questionNumber={currentIdx + 1}
              total={TOTAL_QUESTIONS}
            />
          </AnimatePresence>
        </div>

        {/* Feedback overlay */}
        <AnimatePresence>
          {phase === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`mb-4 rounded-2xl px-4 py-3 text-center ${
                isCorrect
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <p className={`font-grotesk font-bold text-lg ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ Correct!' : `✗ Answer: ${currentQ.correct_answer}`}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer input */}
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className={`relative ${shake ? 'animate-shake' : ''}`}>
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={phase === 'feedback'}
              placeholder="Your answer..."
              className="w-full bg-surface-2 border border-border rounded-2xl px-5 py-4 text-xl font-grotesk font-semibold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={phase === 'feedback' || !answer.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center disabled:opacity-30 transition-opacity"
            >
              <ArrowRight size={18} className="text-primary-foreground" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">Press Enter or tap → to submit</p>
        </form>
      </div>
    </div>
  );
}