import { Question, Subject, SUBJECT_LABELS, UserStats } from '../types';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  Trophy,
  Target,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface Props {
  questions: Question[];
  userAnswers: (number | null)[];
  score: number;
  subject: Subject;
  onRestart: () => void;
  onHome: () => void;
}

export default function LearningReport({
  questions,
  userAnswers,
  score,
  subject,
  onRestart,
  onHome
}: Props) {
  const [previousStats, setPreviousStats] = useState<UserStats | null>(null);
  const total = questions.length;
  const accuracy = Math.round((score / total) * 100);

  useEffect(() => {
    loadPreviousStats();
  }, [subject]);

  const loadPreviousStats = async () => {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('subject', subject)
      .single();
    if (data) setPreviousStats(data as UserStats);
  };

  // Generate learning suggestions based on performance
  const generateSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const wrongQuestions = questions.filter((_, i) => userAnswers[i] !== questions[i].correct);

    if (accuracy >= 90) {
      suggestions.push('表现优秀！建议继续挑战更高题量或尝试其他科目。');
    } else if (accuracy >= 70) {
      suggestions.push('基础扎实，建议针对错题中的知识点进行复习巩固。');
    } else if (accuracy >= 50) {
      suggestions.push('需要加强练习，建议重新梳理错题涉及的概念和原理。');
    } else {
      suggestions.push('基础薄弱，建议从基础概念开始系统学习，配合教材复习。');
    }

    // Subject-specific suggestions
    if (subject === 'data_structures' && accuracy < 70) {
      suggestions.push('数据结构建议重点掌握：线性表操作、树的遍历、图的最短路径算法。');
    } else if (subject === 'os' && accuracy < 70) {
      suggestions.push('操作系统建议重点掌握：进程调度算法、页面置换算法、磁盘调度。');
    } else if (subject === 'computer_org' && accuracy < 70) {
      suggestions.push('组成原理建议重点掌握：补码运算、Cache映射、流水线技术。');
    } else if (subject === 'networks' && accuracy < 70) {
      suggestions.push('计算机网络建议重点掌握：OSI七层模型、TCP三次握手、子网划分计算。');
    }

    if (wrongQuestions.length > 3) {
      suggestions.push(`本次${wrongQuestions.length}道错题已收录到错题本，建议定期回顾。`);
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  // Calculate improvement
  const previousAccuracy = previousStats && previousStats.total_questions > 0
    ? Math.round((previousStats.correct_answers / previousStats.total_questions) * 100)
    : null;

  const improvement = previousAccuracy !== null
    ? accuracy - previousAccuracy
    : null;

  // Wrong questions for this session
  const wrongQuestions = questions
    .map((q, i) => ({ ...q, index: i }))
    .filter((q) => userAnswers[q.index] !== q.correct);

  const grade =
    accuracy >= 90 ? { label: '优秀', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: <Trophy size={16} /> } :
    accuracy >= 75 ? { label: '良好', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-200', icon: <Target size={16} /> } :
    accuracy >= 60 ? { label: '及格', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: <Target size={16} /> } :
    { label: '需加强', color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: <AlertTriangle size={16} /> };

  const radius = 45;
  const circ = 2 * Math.PI * radius;
  const dash = (accuracy / 100) * circ;

  const strokeColor =
    accuracy >= 90 ? '#10b981' :
    accuracy >= 75 ? '#2563eb' :
    accuracy >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-4 fade-in">
      {/* Score Header */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative shrink-0">
            <svg width="100" height="100" className="-rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#e0e7ff" strokeWidth="10" />
              <circle
                cx="50" cy="50" r={radius} fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                className="score-ring"
                style={{ strokeDasharray: `${dash} ${circ}` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${grade.color}`}>{accuracy}%</span>
              <span className="text-xs text-gray-500">{score}/{total}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
                {SUBJECT_LABELS[subject]}
              </span>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${grade.bg} ${grade.color}`}>
                {grade.icon} {grade.label}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="text-gray-600">正确 {score}</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle size={14} className="text-red-400" />
                <span className="text-gray-600">错误 {total - score}</span>
              </div>
            </div>

            {/* Improvement indicator */}
            {improvement !== null && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {improvement > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp size={14} /> 较之前提升 {improvement}%
                  </span>
                ) : improvement < 0 ? (
                  <span className="text-red-500 flex items-center gap-0.5">
                    <TrendingDown size={14} /> 较之前下降 {Math.abs(improvement)}%
                  </span>
                ) : (
                  <span className="text-gray-500">与之前持平</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Suggestions */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500" />
          学习建议
        </h3>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 bg-primary-50/50 p-3 rounded-lg">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">{i + 1}</span>
              <p className="leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wrong Questions Summary */}
      {wrongQuestions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-blue-50 bg-gradient-to-r from-red-50/30 to-white">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              错题回顾 ({wrongQuestions.length}道)
            </h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {wrongQuestions.map(q => (
              <div key={q.index} className="px-5 py-3 hover:bg-primary-50/20 transition-colors">
                <p className="text-sm text-gray-800 leading-snug line-clamp-2">{q.question}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="text-red-500">你选: {['A', 'B', 'C', 'D'][userAnswers[q.index] ?? 0]}</span>
                  <span className="mx-2">·</span>
                  <span className="text-emerald-600">正确: {['A', 'B', 'C', 'D'][q.correct]}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject Performance Stats */}
      {previousStats && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-600" />
            {SUBJECT_LABELS[subject]} 累计统计
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-lg font-bold text-primary-700">{previousStats.total_sessions}</div>
              <div className="text-xs text-gray-500">练习次数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-lg font-bold text-gray-700">{previousStats.total_questions}</div>
              <div className="text-xs text-gray-500">答题总数</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-lg font-bold text-emerald-600">{previousStats.correct_answers}</div>
              <div className="text-xs text-gray-500">答对题数</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onHome} className="btn-outline flex-1">
          <Home size={16} /> 返回首页
        </button>
        <button onClick={onRestart} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <RotateCcw size={16} /> 再练一次
        </button>
      </div>
    </div>
  );
}
