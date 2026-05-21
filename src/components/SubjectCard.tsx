import { Subject, SUBJECT_LABELS, SUBJECT_DESCRIPTIONS } from '../types';
import { BookOpen, Cpu, Globe, HardDrive } from 'lucide-react';

interface Props {
  subject: Subject;
  selected: boolean;
  onClick: () => void;
}

const icons: Record<Subject, React.ReactNode> = {
  data_structures: <BookOpen size={20} />,
  os: <HardDrive size={20} />,
  computer_org: <Cpu size={20} />,
  networks: <Globe size={20} />,
};

const accents: Record<Subject, { icon: string; iconBg: string; selectedIconBg: string; border: string; bg: string; ring: string }> = {
  data_structures: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-50',
    selectedIconBg: 'bg-blue-100',
    border: 'border-blue-300',
    bg: 'bg-blue-50/60',
    ring: 'ring-blue-400',
  },
  os: {
    icon: 'text-cyan-600',
    iconBg: 'bg-cyan-50',
    selectedIconBg: 'bg-cyan-100',
    border: 'border-cyan-300',
    bg: 'bg-cyan-50/60',
    ring: 'ring-cyan-400',
  },
  computer_org: {
    icon: 'text-sky-600',
    iconBg: 'bg-sky-50',
    selectedIconBg: 'bg-sky-100',
    border: 'border-sky-300',
    bg: 'bg-sky-50/60',
    ring: 'ring-sky-400',
  },
  networks: {
    icon: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    selectedIconBg: 'bg-indigo-100',
    border: 'border-indigo-300',
    bg: 'bg-indigo-50/60',
    ring: 'ring-indigo-400',
  },
};

export default function SubjectCard({ subject, selected, onClick }: Props) {
  const a = accents[subject];
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group
        ${selected
          ? `${a.bg} ${a.border} ring-2 ${a.ring} shadow-sm`
          : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-start gap-3">
        <span className={`p-2.5 rounded-xl transition-colors duration-200 ${selected ? a.selectedIconBg : a.iconBg} ${a.icon}`}>
          {icons[subject]}
        </span>
        <div className="min-w-0">
          <div className={`font-semibold text-sm transition-colors ${selected ? 'text-primary-900' : 'text-gray-700 group-hover:text-primary-700'}`}>
            {SUBJECT_LABELS[subject]}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {SUBJECT_DESCRIPTIONS[subject]}
          </div>
        </div>
        {selected && (
          <div className="ml-auto shrink-0 mt-1">
            <span className="w-2 h-2 bg-primary-500 rounded-full pulse-soft" />
          </div>
        )}
      </div>
    </button>
  );
}
