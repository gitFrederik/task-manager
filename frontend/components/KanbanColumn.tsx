'use client';

import { useDroppable } from '@dnd-kit/core';
import { Task } from '@/lib/api';
import TaskCard from './TaskCard';

export type ColumnId = 'todo' | 'in_progress' | 'completed';

const STYLES: Record<ColumnId, {
  dot: string;
  badge: string;
  dropBg: string;
  idleBg: string;
  ring: string;
}> = {
  todo: {
    dot:    'bg-slate-400',
    badge:  'bg-slate-100 text-slate-600',
    idleBg: 'bg-slate-100/60',
    dropBg: 'bg-slate-200/80',
    ring:   'ring-slate-300',
  },
  in_progress: {
    dot:    'bg-blue-400',
    badge:  'bg-blue-100 text-blue-700',
    idleBg: 'bg-blue-50/60',
    dropBg: 'bg-blue-100/80',
    ring:   'ring-blue-300',
  },
  completed: {
    dot:    'bg-emerald-400',
    badge:  'bg-emerald-100 text-emerald-700',
    idleBg: 'bg-emerald-50/60',
    dropBg: 'bg-emerald-100/80',
    ring:   'ring-emerald-300',
  },
};

interface Props {
  id: ColumnId;
  label: string;
  tasks: Task[];
  onDelete: (id: string) => void;
}

export default function KanbanColumn({ id, label, tasks, onDelete }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const s = STYLES[id];

  return (
    <div className="flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <span className="text-sm font-semibold text-slate-700 truncate">{label}</span>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-48 transition-colors duration-150 ${
          isOver
            ? `${s.dropBg} ring-2 ring-inset ${s.ring}`
            : s.idleBg
        }`}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} />
        ))}

        {tasks.length === 0 && (
          <div className={`flex items-center justify-center h-24 text-xs transition-colors ${
            isOver ? 'text-slate-600 font-medium' : 'text-slate-400'
          }`}>
            {isOver ? 'Drop here' : 'No tasks'}
          </div>
        )}
      </div>
    </div>
  );
}
