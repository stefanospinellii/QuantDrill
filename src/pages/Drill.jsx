import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { generateQuestion, checkAnswer, calculateSessionScore, getSpeedRating, getSpeedPercentile } from '@/lib/questionGenerator';
import { calculateNewStreak, getTodayDate } from '@/lib/streakUtils';
import GlobalTimer from '@/components/drill/GlobalTimer';
import QuestionCard from '@/components/drill/QuestionCard';
import { ArrowRight } from 'lucide-react';
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
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('question'); // question | feedback
  const [isCorrect, setIsCorrect] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [shake, setShake] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const inputRef = useRef(null);
  const resultsRef = useRef([]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    if (phase === 'question') {
      setStartTime(Date.now());
      setAnswer('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [phase, currentQ]);

  const nextQuestion = useCallback((newResults) => {
    resultsRef.current = newResults;
    setCurrentQ(generateQuestion(difficulty, category));
    setQuestionCount(c => c + 1);
    setPhase('question');
  }, [difficulty, category]);

  const submitAnswer = useCallback((userAnswer) => {
    if (phase !== 'question') return;
    const timeTaken = (Date.now() - startTime) / 1000;
    const correct = checkAnswer(userAnswer, currentQ.correct_answer);
    setIsCorrect(correct);
    setPhase('feedback');

    const result = { correct, timeTaken, answer: userAnswer, correctAnswer: currentQ.correct_answer };
    const newResults = [...resultsRef.current, result];

    setTimeout(() => nextQuestion(newResults), 700);
  }, [phase, startTime, currentQ, nextQuestion]);

  const handleTimerExpire = useCallback(() => {
    setSessionActive(false);
    finishSession(resultsRef.current);
  }, []);

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
      } catch (e) {}
    })();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-6">
      <MobileHeader title="" onBack={() => { setSessionActive(false); navigate('/'); }} />

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
      <div className="flex-1 flex flex-col px-5">
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

        {/* Feedback */}
        <AnimatePresence>
          {phase === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-4 rounded-2xl px-4 py-3 text-center ${
                isCorrect
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <p className={`font-grotesk font-bold text-base ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? '✓ Correct' : `✗ Answer: ${currentQ.correct_answer}`}
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