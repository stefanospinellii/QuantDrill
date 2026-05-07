import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { generateQuestion, calculateScore, getSpeedRating, getPercentile } from '@/lib/questionGenerator';
import TimerRing from '@/components/drill/TimerRing';
import QuestionCard from '@/components/drill/QuestionCard';

const TIMER_DURATIONS = { easy: 15, medium: 12, hard: 8 };
const QUESTIONS_PER_SESSION = 10;

export default function Drill() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'medium';
  const category = searchParams.get('category') || 'daily';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const qs = [];
    for (let i = 0; i < QUESTIONS_PER_SESSION; i++) {
      qs.push(generateQuestion(difficulty, category));
    }
    setQuestions(qs);
  }, []);

  const timerDuration = TIMER_DURATIONS[difficulty] || 12;
  const currentQuestion = questions[currentIndex];

  const handleAnswer = (option, timeLeft) => {
    if (selected !== null) return;
    setSelected(option);

    const isCorrect = option === currentQuestion?.correct;
    const timeTaken = timerDuration - timeLeft;

    setTimeout(() => {
      const newAnswers = [...answers, { isCorrect, timeTaken, option }];
      if (currentIndex + 1 >= QUESTIONS_PER_SESSION) {
        finishSession(newAnswers);
      } else {
        setAnswers(newAnswers);
        setCurrentIndex(i => i + 1);
        setSelected(null);
        setTimerKey(k => k + 1);
      }
    }, 600);
  };

  const handleExpire = () => {
    handleAnswer(null, 0);
  };

  const finishSession = async (finalAnswers) => {
    setSaving(true);
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const avgTime = finalAnswers.reduce((s, a) => s + (a.timeTaken || 0), 0) / finalAnswers.length;
    const accuracy = Math.round((correctCount / finalAnswers.length) * 100);
    const score = calculateScore(finalAnswers.map(a => ({ correct: a.isCorrect, timeTaken: a.timeTaken, timeLimit: 12 })), difficulty);
    const speedRating = getSpeedRating(avgTime, difficulty);
    const percentile = getPercentile(score, difficulty);
    const result = { score, accuracy, avgTime, correctCount, speedRating, percentile };
    const today = new Date().toISOString().split('T')[0];

    try {
      await base44.entities.Session.create({
        date: today,
        score: result.score,
        accuracy: result.accuracy,
        avg_time: result.avgTime,
        difficulty,
        category,
        questions_answered: QUESTIONS_PER_SESSION,
        correct_count: result.correctCount,
        speed_rating: result.speedRating,
        percentile: result.percentile,
      });

      const user = await base44.auth.me();
      const lastActive = user?.last_active_date;
      const isNewDay = lastActive !== today;

      let streakCount = user?.streak_count || 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (isNewDay) {
        streakCount = (lastActive === yesterdayStr || lastActive === today) ? streakCount + 1 : 1;
        await base44.auth.updateMe({ last_active_date: today, streak_count: streakCount });
      }
    } catch (e) {}

    navigate(`/results?score=${Math.round(result.score)}&accuracy=${Math.round(result.accuracy)}&difficulty=${difficulty}&category=${category}`);
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = ((currentIndex) / QUESTIONS_PER_SESSION) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 bg-surface-2 rounded-xl flex items-center justify-center border border-border no-select"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-neon-cyan" />
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {currentIndex + 1} / {QUESTIONS_PER_SESSION}
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="mx-5 h-1 bg-surface-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Timer */}
      <div className="flex justify-center mt-8 mb-6">
        <TimerRing
          key={timerKey}
          duration={timerDuration}
          onExpire={handleExpire}
          active={selected === null}
        />
      </div>

      {/* Question */}
      <div className="flex-1 px-5 flex flex-col gap-5">
        <AnimatePresence mode="wait">
          <QuestionCard key={currentIndex} question={currentQuestion} />
        </AnimatePresence>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion?.options?.map((opt, i) => {
            const isSelected = selected === opt;
            const isCorrect = opt === currentQuestion.correct;
            let bg = 'bg-surface-2 border-border';
            if (isSelected && isCorrect) bg = 'bg-green-500/20 border-green-500';
            else if (isSelected && !isCorrect) bg = 'bg-red-500/20 border-red-500 animate-shake';
            else if (selected !== null && isCorrect) bg = 'bg-green-500/10 border-green-500/50';

            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt, 0)}
                disabled={selected !== null}
                className={`border rounded-2xl px-4 py-4 text-center text-sm font-semibold text-foreground transition-all no-select ${bg}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}