'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/api';

const PRIORITY: Record<string, { label: string; classes: string }> = {
  low:    { label: 'Low',    classes: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', classes: 'bg-amber-100  text-amber-700'   },
  high:   { label: 'High',   classes: 'bg-rose-100   text-rose-700'    },
};

function isOverdue(due: string, completed: boolean) {
  return !completed && due < new Date().toISOString().split('T')[0];
}

function formatDate(due: string) {
  const [y, m, d] = due.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  task: Task;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export default function TaskCard({ task, onDelete, isOverlay = false }: Props) {
  const done = task.status === 'completed' || task.completed;
  const p = PRIORITY[task.priority] ?? PRIORITY.medium;
  const overdue = !!task.due_date && isOverdue(task.due_date, done);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-xl border px-3.5 py-3 select-none transition-all duration-100 ${
        isOverlay
          ? 'border-slate-300 shadow-2xl rotate-2 cursor-grabbing'
          : isDragging
          ? 'opacity-25 shadow-none border-slate-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-grab active:cursor-grabbing'
      }`}
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag grip dots */}
        <svg
          className={`mt-0.5 w-3 h-3 flex-shrink-0 transition-colors ${
            isOverlay ? 'text-slate-400' : 'text-slate-300 group-hover:text-slate-400'
          }`}
          fill="currentColor"
          viewBox="0 0 8 14"
        >
          <circle cx="2" cy="2"  r="1.2" /><circle cx="6" cy="2"  r="1.2" />
          <circle cx="2" cy="7"  r="1.2" /><circle cx="6" cy="7"  r="1.2" />
          <circle cx="2" cy="12" r="1.2" /><circle cx="6" cy="12" r="1.2" />
        </svg>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${p.classes}`}>
              {p.label}
            </span>
            {task.due_date && (
              <span className={`text-xs flex items-center gap-0.5 ${overdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
                {overdue && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
                {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>

        {/* Delete — stopPropagation so it doesn't start a drag */}
        {!isOverlay && (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="mt-0.5 text-slate-200 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
