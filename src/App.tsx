import { useState, useCallback } from 'react';
import { supabase, FUNCTIONS_URL, ANON_KEY } from './lib/supabase';
import { Subject, Question, SUBJECT_LABELS } from './types';
import SubjectCard from './components/SubjectCard';
import QuestionCard from './components/QuestionCard';
import ScoreBoard from './components/ScoreBoard';
import { GraduationCap, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="p-1.5 bg-gray-900 rounded-lg">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">考研408练习系统</h1>
            <p className="text-xs text-gray-500 leading-none mt-0.5">数据结构 · 操作系统 · 组成原理 · 计算机网络</p>
          </div>
          {phase === 'quiz' && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">{answeredCount}/{questions.length}</span>
              <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-900 rounded-full transition-all duration-300"
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">选择练习科目</h2>
              <p className="text-sm text-gray-500">随机抽取题目，含选项与详细解析</p>
            </div>

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

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">题目数量</h3>
              <div className="flex gap-2">
                {COUNTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all
                      ${count === c
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
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
              className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> 生成题目中...</> : '开始练习'}
            </button>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === 'quiz' && questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{SUBJECT_LABELS[subject]}</span>
              {allSubmitted && (
                <button
                  onClick={() => setPhase('result')}
                  className="text-sm font-semibold text-gray-900 hover:underline"
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
            <div className="flex gap-2">
              <button
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> 上一题
              </button>
              <div className="flex-1 flex gap-1.5 items-center justify-center flex-wrap">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                      i === current
                        ? 'bg-gray-900 text-white scale-110'
                        : submitted[i]
                          ? userAnswers[i] === questions[i].correct
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-red-100 text-red-600 border border-red-300'
                          : userAnswers[i] !== null
                            ? 'bg-blue-100 text-blue-600 border border-blue-300'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                disabled={current === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                下一题 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <ScoreBoard
            questions={questions}
            userAnswers={userAnswers}
            score={score}
            onRestart={startQuiz}
            onHome={() => setPhase('setup')}
          />
        )}
      </main>
    </div>
  );
}
