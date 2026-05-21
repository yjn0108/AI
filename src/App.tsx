import { useState, useCallback } from 'react';
import { supabase, FUNCTIONS_URL, ANON_KEY } from './lib/supabase';
import { Subject, Question, SUBJECT_LABELS } from './types';
import SubjectCard from './components/SubjectCard';
import QuestionCard from './components/QuestionCard';
import ScoreBoard from './components/ScoreBoard';
import { GraduationCap, Loader2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

type Phase = 'setup' | 'quiz' | 'result';

const SUBJECTS: Subject[] = ['data_structures', 'os', 'computer_org', 'networks'];
const COUNTS = [5, 10, 15];

export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [subject, setSubject] = useState<Subject>('data_structures');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState<boolean[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${FUNCTIONS_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ subject, count }),
      });
      const { questions: qs } = await res.json() as { questions: Question[] };

      const { data: session } = await supabase
        .from('quiz_sessions')
        .insert({ subject, total_questions: qs.length })
        .select('id')
        .single();

      setSessionId(session?.id ?? null);
      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(null));
      setSubmitted(new Array(qs.length).fill(false));
      setCurrent(0);
      setScore(0);
      setPhase('quiz');
    } finally {
      setLoading(false);
    }
  }, [subject, count]);

  const handleAnswer = (optionIdx: number) => {
    if (submitted[current]) return;
    setUserAnswers(prev => {
      const next = [...prev];
      next[current] = optionIdx;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (userAnswers[current] === null) return;
    const correct = userAnswers[current] === questions[current].correct;
    const newScore = correct ? score + 1 : score;

    const newSubmitted = submitted.map((s, i) => i === current ? true : s);
    setSubmitted(newSubmitted);
    setScore(newScore);

    if (sessionId) {
      await supabase.from('quiz_answers').insert({
        session_id: sessionId,
        question_index: current,
        question_text: questions[current].question,
        options: questions[current].options,
        correct_answer: questions[current].correct,
        user_answer: userAnswers[current],
        explanation: questions[current].explanation,
        is_correct: correct,
      });
    }

    const allDone = newSubmitted.every(Boolean);
    if (allDone) {
      if (sessionId) {
        await supabase.from('quiz_sessions').update({ correct_count: newScore, completed: true }).eq('id', sessionId);
      }
      setTimeout(() => setPhase('result'), 600);
    }
  };

  const answeredCount = submitted.filter(Boolean).length;
  const allSubmitted = submitted.length > 0 && submitted.every(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/80 to-slate-50">
      {/* Header */}
      <header className="gradient-header sticky top-0 z-10 shadow-lg shadow-primary-900/10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">考研408练习系统</h1>
            <p className="text-xs text-primary-200 leading-none mt-0.5">数据结构 · 操作系统 · 组成原理 · 计算机网络</p>
          </div>
          {phase === 'quiz' && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-primary-200 font-medium">{answeredCount}/{questions.length}</span>
              <div className="w-24 h-1.5 bg-primary-800/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Setup Phase */}
        {phase === 'setup' && (
          <div className="space-y-6 fade-in">
            {/* Hero section */}
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
                <BookOpen size={28} className="text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-primary-900 mb-2">考研408 智能练习</h2>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                选择科目与题量，系统随机抽取题目，每题含详细解析
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary-500 rounded-full" />
                选择科目
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUBJECTS.map(s => (
                  <SubjectCard
                    key={s}
                    subject={s}
                    selected={subject === s}
                    onClick={() => setSubject(s)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary-500 rounded-full" />
                题目数量
              </h3>
              <div className="flex gap-2">
                {COUNTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200
                      ${count === c
                        ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-600/25'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                      }`}
                  >
                    {c} 题
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> AI 生成题目中...</> : '开始练习'}
            </button>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === 'quiz' && questions.length > 0 && (
          <div className="space-y-4 fade-in">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                {SUBJECT_LABELS[subject]}
              </span>
              {allSubmitted && (
                <button
                  onClick={() => setPhase('result')}
                  className="text-sm font-semibold text-primary-600 hover:text-primary-800 hover:underline transition-colors"
                >
                  查看总结果 →
                </button>
              )}
            </div>

            <QuestionCard
              question={questions[current]}
              index={current}
              total={questions.length}
              userAnswer={userAnswers[current]}
              submitted={submitted[current]}
              onAnswer={handleAnswer}
              onSubmit={handleSubmit}
            />

            {/* Navigation */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-primary-200 text-sm font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> 上一题
              </button>
              <div className="flex-1 flex gap-1.5 items-center justify-center flex-wrap">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-7 h-7 rounded-full text-xs font-semibold transition-all duration-200 ${
                      i === current
                        ? 'bg-primary-600 text-white scale-110 shadow-md shadow-primary-600/30'
                        : submitted[i]
                          ? userAnswers[i] === questions[i].correct
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-red-100 text-red-600 border border-red-300'
                          : userAnswers[i] !== null
                            ? 'bg-primary-100 text-primary-600 border border-primary-300'
                            : 'bg-white text-gray-400 border border-gray-200 hover:border-primary-300 hover:text-primary-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                disabled={current === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-primary-200 text-sm font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                下一题 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <div className="fade-in">
            <ScoreBoard
              questions={questions}
              userAnswers={userAnswers}
              score={score}
              onRestart={startQuiz}
              onHome={() => setPhase('setup')}
            />
          </div>
        )}
      </main>
    </div>
  );
}
