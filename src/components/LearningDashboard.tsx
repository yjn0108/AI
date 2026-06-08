import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subject, UserStats, SUBJECT_LABELS } from '../types';
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  AlertTriangle,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Props {
  onStartQuiz: (subject: Subject) => void;
  onViewWrongQuestions: () => void;
}

export default function LearningDashboard({ onStartQuiz, onViewWrongQuestions }: Props) {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsRes, wrongRes] = await Promise.all([
        supabase.from('user_stats').select('*'),
        supabase.from('quiz_answers').select('id', { count: 'exact' }).eq('is_correct', false)
      ]);

      if (statsRes.data) {
        setStats(statsRes.data as UserStats[]);
      }
      if (wrongRes.count !== null) {
        setWrongCount(wrongRes.count);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = stats.reduce((sum, s) => sum + s.total_questions, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct_answers, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalSessions = stats.reduce((sum, s) => sum + s.total_sessions, 0);

  const subjectAccuracies: Record<Subject, number> = {
    data_structures: 0,
    os: 0,
    computer_org: 0,
    networks: 0,
  };

  stats.forEach(s => {
    if (s.total_questions > 0) {
      subjectAccuracies[s.subject] = Math.round((s.correct_answers / s.total_questions) * 100);
    }
  });

  const weakSubjects = Object.entries(subjectAccuracies)
    .filter(([_, acc]) => acc < 60 && acc > 0)
    .map(([subj]) => subj as Subject);

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'bg-emerald-500';
    if (acc >= 60) return 'bg-primary-500';
    if (acc >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getAccuracyTextColor = (acc: number) => {
    if (acc >= 80) return 'text-emerald-600';
    if (acc >= 60) return 'text-primary-600';
    if (acc >= 40) return 'text-amber-600';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100 mb-2">
            <BarChart3 size={20} className="text-primary-600" />
          </div>
          <div className="text-2xl font-bold text-primary-900">{totalSessions}</div>
          <div className="text-xs text-gray-500">练习次数</div>
        </div>
        <div className="card p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 mb-2">
            <Target size={20} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{overallAccuracy}%</div>
          <div className="text-xs text-gray-500">总体正确率</div>
        </div>
        <div className="card p-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 mb-2">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
          <div className="text-xs text-gray-500">答题总数</div>
        </div>
      </div>

      {/* Subject Accuracy */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary-600" />
          各科目正确率
        </h3>
        <div className="space-y-4">
          {Object.entries(subjectAccuracies).map(([subj, acc]) => {
            const subject = subj as Subject;
            const hasData = stats.some(s => s.subject === subject && s.total_questions > 0);
            return (
              <div key={subj}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{SUBJECT_LABELS[subject]}</span>
                  <span className={`text-sm font-semibold ${getAccuracyTextColor(acc)}`}>
                    {hasData ? `${acc}%` : '暂无数据'}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getAccuracyColor(acc)}`}
                    style={{ width: hasData ? `${acc}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Subjects Alert */}
      {weakSubjects.length > 0 && (
        <div className="card p-4 border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-800 mb-1">薄弱科目提示</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                {weakSubjects.map(s => SUBJECT_LABELS[s]).join('、')} 正确率低于60%，建议重点复习。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wrong Questions Quick Access */}
      {wrongCount > 0 && (
        <button
          onClick={onViewWrongQuestions}
          className="card w-full p-4 flex items-center justify-between hover:border-primary-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-800">错题本</div>
              <div className="text-xs text-gray-500">共 {wrongCount} 道错题待复习</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
        </button>
      )}

      {/* Quick Start */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">快速开始</h3>
        <div className="grid grid-cols-2 gap-2">
          {(['data_structures', 'os', 'computer_org', 'networks'] as Subject[]).map(subj => (
            <button
              key={subj}
              onClick={() => onStartQuiz(subj)}
              className="p-3 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all text-left group"
            >
              <div className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                {SUBJECT_LABELS[subj]}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {stats.find(s => s.subject === subj)?.total_sessions || 0} 次练习
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
