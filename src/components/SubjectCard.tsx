import { Subject, SUBJECT_LABELS, SUBJECT_DESCRIPTIONS } from '../types';
import { BookOpen, Cpu, Globe, HardDrive } from 'lucide-react';

interface Props {
  subject: Subject;
  selected: boolean;
  onClick: () => void;
}

const icons: Record<Subject, React.ReactNode> = {
  data_structures: <BookOpen size={22} />,
  os: <HardDrive size={22} />,
  computer_org: <Cpu size={22} />,
  networks: <Globe size={22} />,
};

const colors: Record<Subject, { bg: string; border: string; icon: string; ring: string }> = {
  data_structures: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    icon: 'text-sky-600 bg-sky-100',
    ring: 'ring-sky-400',
  },
  os: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: 'text-emerald-600 bg-emerald-100',
    ring: 'ring-emerald-400',
  },
  computer_org: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600 bg-amber-100',
    ring: 'ring-amber-400',
  },
  networks: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: 'text-rose-600 bg-rose-100',
    ring: 'ring-rose-400',
  },
};

export default function SubjectCard({ subject, selected, onClick }: Props) {
  const c = colors[subject];
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-5 rounded-xl border-2 transition-all duration-200
        ${selected ? `${c.bg} ${c.border} ring-2 ${c.ring} shadow-sm` : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'}
      `}
    >
      <div className="flex items-start gap-3">
        <span className={`p-2 rounded-lg ${selected ? c.icon : 'text-gray-500 bg-gray-100'} transition-colors`}>
          {icons[subject]}
        </span>
        <div>
          <div className={`font-semibold text-sm ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
            {SUBJECT_LABELS[subject]}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {SUBJECT_DESCRIPTIONS[subject]}
          </div>
        </div>
      </div>
    </button>
  );
}
