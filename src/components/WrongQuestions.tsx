import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WrongQuestion, Subject, SUBJECT_LABELS } from '../types';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Filter,
  ChevronDown,
  Trash2,
  BookOpen
} from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function WrongQuestions({ onBack }: Props) {
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    loadWrongQuestions();
  }, [selectedSubject]);

  const loadWrongQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('quiz_answers')
        .select(`
          id,
          question_text,
          options,
          correct_answer,
          user_answer,
          explanation,
          created_at,
          session_id
        `)
        .eq('is_correct', false)
        .order('created_at', { ascending: false });

      const { data: answers, error } = await query;

      if (error) throw error;

      if (answers && answers.length > 0) {
        const sessionIds = answers.map(a => a.session_id);
        const { data: sessions } = await supabase
          .from('quiz_sessions')
          .select('id, subject')
          .in('id', sessionIds);

        const sessionMap = new Map(sessions?.map(s => [s.id, s.subject]));

        const wrongQuestions: WrongQuestion[] = answers.map(a => ({
          id: a.id,
          question_text: a.question_text,
          options: a.options,
          correct_answer: a.correct_answer,
          user_answer: a.user_answer,
          explanation: a.explanation,
          subject: sessionMap.get(a.session_id) || 'data_structures',
          created_at: a.created_at,
        }));

        const filtered = selectedSubject === 'all'
          ? wrongQuestions
          : wrongQuestions.filter(q => q.subject === selectedSubject);

        setQuestions(filtered);
      } else {
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('quiz_answers').delete().eq('id', id);
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.subject]) acc[q.subject] = [];
    acc[q.subject].push(q);
    return acc;
  }, {} as Record<Subject, WrongQuestion[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-primary-900">错题本</h2>
          <p className="text-xs text-gray-500">{questions.length} 道错题</p>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-xl border transition-colors ${showFilter ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
        >
          <Filter size={18} className={showFilter ? 'text-primary-600' : 'text-gray-600'} />
        </button>
      </div>

      {/* Filter */}
      {showFilter && (
        <div className="card p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">筛选科目：</span>
            {(['all', 'data_structures', 'os', 'computer_org', 'networks'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${selectedSubject === s
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {s === 'all' ? '全部' : SUBJECT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && questions.length === 0 && (
        <div className="card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">太棒了！</h3>
          <p className="text-xs text-gray-500">暂无错题，继续保持！</p>
        </div>
      )}

      {/* Questions List */}
      {!loading && questions.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedQuestions).map(([subject, qs]) => (
            <div key={subject}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {SUBJECT_LABELS[subject as Subject]} ({qs.length})
                </span>
              </div>
              <div className="space-y-2">
                {qs.map(q => (
                  <div key={q.id} className="card overflow-hidden">
                    <div
                      className="p-4 flex items-start gap-3 cursor-pointer hover:bg-primary-50/50 transition-colors"
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    >
                      <div className="shrink-0 mt-0.5">
                        <XCircle size={18} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug line-clamp-2">{q.question_text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(q.created_at)}
                          <span className="text-red-400 ml-2">你选: {['A', 'B', 'C', 'D'][q.user_answer]}</span>
                          <span className="text-emerald-500 ml-2">正确: {['A', 'B', 'C', 'D'][q.correct_answer]}</span>
                        </p>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 shrink-0 transition-transform ${expandedId === q.id ? 'rotate-180' : ''}`}
                      />
                    </div>

                    {expandedId === q.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-blue-50 bg-gradient-to-b from-primary-50/30 to-white">
                        <div className="pt-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">选项</p>
                          <div className="space-y-1.5">
                            {(q.options as string[]).map((opt, i) => (
                              <div
                                key={i}
                                className={`text-xs px-3 py-2 rounded-lg ${
                                  i === q.correct_answer
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : i === q.user_answer
                                      ? 'bg-red-100 text-red-700 border border-red-200'
                                      : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                <span className="font-semibold mr-1.5">{['A', 'B', 'C', 'D'][i]}.</span>
                                {opt}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-gray-600 mt-3 mb-1.5 flex items-center gap-1">
                            <BookOpen size={12} /> 解析
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed bg-primary-50 p-3 rounded-lg">
                            {q.explanation}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(q.id);
                            }}
                            className="mt-3 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={13} /> 从错题本移除
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
