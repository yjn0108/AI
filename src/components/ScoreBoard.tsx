import { Question } from '../types';
import { CheckCircle, XCircle, RotateCcw, Home, Trophy, Target } from 'lucide-react';

interface Props {
  questions: Question[];
  userAnswers: (number | null)[];
  score: number;
  onRestart: () => void;
  onHome: () => void;
}

export default function ScoreBoard({ questions, userAnswers, score, onRestart, onHome }: Props) {
  const total = questions.length;
  const pct = Math.round((score / total) * 100);

  const grade =
    pct >= 90 ? { label: '优秀', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: <Trophy size={16} /> } :
    pct >= 75 ? { label: '良好', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200', icon: <Target size={16} /> } :
    pct >= 60 ? { label: '及格', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: <Target size={16} /> } :
    { label: '需加强', color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: <Target size={16} /> };

  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  const strokeColor =
    pct >= 90 ? '#10b981' :
    pct >= 75 ? '#2563eb' :
    pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="card p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">本次练习结果</h2>

        {/* Ring */}
        <div className="flex justify-center mb-5 relative">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e0e7ff" strokeWidth="12" />
            <circle
              cx="70" cy="70" r={radius} fill="none"
              stroke={strokeColor}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              className="score-ring"
              style={{ strokeDasharray: `${dash} ${circ}` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${grade.color}`}>{pct}<span className="text-2xl">%</span></span>
            <span className="text-sm text-gray-500">{score}/{total} 题</span>
          </div>
        </div>

        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-semibold ${grade.bg} ${grade.color} mb-2`}>
          {grade.icon} {grade.label}
        </div>
        <p className="text-gray-500 text-sm">答对 {score} 题，答错 {total - score} 题</p>
      </div>

      {/* Answer breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-blue-50 bg-gradient-to-r from-primary-50/30 to-white">
          <h3 className="text-sm font-semibold text-gray-700">答题详情</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {questions.map((q, i) => {
            const ua = userAnswers[i];
            const correct = ua === q.correct;
            return (
              <div key={i} className="px-5 py-4 flex items-start gap-3 hover:bg-primary-50/20 transition-colors">
                <span className={`mt-0.5 shrink-0 ${correct ? 'text-emerald-500' : 'text-red-400'}`}>
                  {correct ? <CheckCircle size={17} /> : <XCircle size={17} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug line-clamp-2">{q.question}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {!correct && ua !== null && (
                      <span className="text-red-500">你选: {['A','B','C','D'][ua]} &nbsp;·&nbsp; </span>
                    )}
                    <span className="text-emerald-600">正确: {['A','B','C','D'][q.correct]}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="btn-outline flex-1"
        >
          <Home size={16} /> 更换科目
        </button>
        <button
          onClick={onRestart}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> 再练一次
        </button>
      </div>
    </div>
  );
}
