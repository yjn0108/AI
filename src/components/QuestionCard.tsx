import { Question } from '../types';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  question: Question;
  index: number;
  total: number;
  userAnswer: number | null;
  submitted: boolean;
  onAnswer: (optionIndex: number) => void;
  onSubmit: () => void;
}

const optionLetters = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  index,
  total,
  userAnswer,
  submitted,
  onAnswer,
  onSubmit,
}: Props) {
  const isCorrect = submitted && userAnswer === question.correct;
  const isWrong = submitted && userAnswer !== null && userAnswer !== question.correct;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          第 <span className="text-gray-900 font-bold text-base">{index + 1}</span> / {total} 题
        </span>
        {submitted && (
          <span className={`flex items-center gap-1.5 text-sm font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
            {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {isCorrect ? '回答正确' : '回答错误'}
          </span>
        )}
      </div>

      {/* Question */}
      <div className="px-6 py-5">
        <p className="text-gray-900 font-medium leading-relaxed text-base">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="px-6 pb-5 space-y-2.5">
        {question.options.map((opt, i) => {
          let state: 'default' | 'selected' | 'correct' | 'wrong' | 'reveal' = 'default';
          if (submitted) {
            if (i === question.correct) state = 'correct';
            else if (i === userAnswer && userAnswer !== question.correct) state = 'wrong';
            else state = 'reveal';
          } else if (userAnswer === i) {
            state = 'selected';
          }

          const styles: Record<typeof state, string> = {
            default: 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 cursor-pointer',
            selected: 'border-blue-500 bg-blue-50 cursor-pointer',
            correct: 'border-emerald-500 bg-emerald-50',
            wrong: 'border-red-400 bg-red-50',
            reveal: 'border-gray-200 bg-white opacity-60',
          };

          const letterStyles: Record<typeof state, string> = {
            default: 'bg-gray-100 text-gray-600',
            selected: 'bg-blue-500 text-white',
            correct: 'bg-emerald-500 text-white',
            wrong: 'bg-red-400 text-white',
            reveal: 'bg-gray-100 text-gray-400',
          };

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onAnswer(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${styles[state]}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${letterStyles[state]}`}>
                {optionLetters[i]}
              </span>
              <span className={`text-sm leading-relaxed ${state === 'reveal' ? 'text-gray-400' : 'text-gray-800'}`}>
                {opt}
              </span>
              {submitted && i === question.correct && (
                <CheckCircle size={16} className="ml-auto text-emerald-500 shrink-0" />
              )}
              {state === 'wrong' && (
                <XCircle size={16} className="ml-auto text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && (
        <div className="mx-6 mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 mb-1">解析</p>
          <p className="text-sm text-amber-900 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <div className="px-6 pb-6">
          <button
            onClick={onSubmit}
            disabled={userAnswer === null}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
              bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98]"
          >
            提交答案
          </button>
        </div>
      )}
    </div>
  );
}
