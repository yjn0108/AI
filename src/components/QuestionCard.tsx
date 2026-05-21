import { Question } from '../types';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

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
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-primary-50/50 to-white">
        <span className="text-sm font-medium text-gray-500">
          第 <span className="text-primary-700 font-bold text-base">{index + 1}</span> / {total} 题
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
            default: 'border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer',
            selected: 'border-primary-500 bg-primary-50 cursor-pointer shadow-sm shadow-primary-500/10',
            correct: 'border-emerald-500 bg-emerald-50',
            wrong: 'border-red-400 bg-red-50',
            reveal: 'border-gray-100 bg-gray-50/50 opacity-50',
          };

          const letterStyles: Record<typeof state, string> = {
            default: 'bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-600',
            selected: 'bg-primary-500 text-white',
            correct: 'bg-emerald-500 text-white',
            wrong: 'bg-red-400 text-white',
            reveal: 'bg-gray-100 text-gray-400',
          };

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onAnswer(i)}
              className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-150 ${styles[state]}`}
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
        <div className="mx-6 mb-5 p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <p className="text-xs font-semibold text-primary-700 mb-1.5 flex items-center gap-1.5">
            <Lightbulb size={13} /> 解析
          </p>
          <p className="text-sm text-primary-900 leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <div className="px-6 pb-6">
          <button
            onClick={onSubmit}
            disabled={userAnswer === null}
            className="btn-primary"
          >
            提交答案
          </button>
        </div>
      )}
    </div>
  );
}
