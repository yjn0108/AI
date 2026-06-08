export type Subject = 'data_structures' | 'os' | 'computer_org' | 'networks';

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizState {
  sessionId: string | null;
  subject: Subject;
  questions: Question[];
  userAnswers: (number | null)[];
  submitted: boolean[];
  currentIndex: number;
  score: number;
  phase: 'setup' | 'quiz' | 'result';
  loading: boolean;
}

export interface UserStats {
  subject: Subject;
  total_sessions: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
}

export interface WrongQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  user_answer: number;
  explanation: string;
  subject: Subject;
  created_at: string;
}

export interface LearningReport {
  score: number;
  total: number;
  accuracy: number;
  subject: Subject;
  subjectAccuracy: number;
  weakSubjects: Subject[];
  suggestions: string[];
  wrongQuestions: WrongQuestion[];
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  data_structures: '数据结构',
  os: '操作系统',
  computer_org: '计算机组成原理',
  networks: '计算机网络',
};

export const SUBJECT_DESCRIPTIONS: Record<Subject, string> = {
  data_structures: '栈、队列、树、图、排序与查找算法',
  os: '进程管理、内存管理、文件系统、I/O',
  computer_org: '数制与编码、存储器、CPU、指令系统',
  networks: 'OSI模型、TCP/IP、路由与交换、应用层协议',
};
