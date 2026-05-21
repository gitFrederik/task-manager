'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { api, CreateTaskPayload, Status, Task } from '@/lib/api';
import KanbanColumn, { ColumnId } from './KanbanColumn';
import TaskCard from './TaskCard';
import NewTaskForm from './NewTaskForm';

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'todo',        label: 'To Do'       },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Done'        },
];

function taskStatus(task: Task): ColumnId {
  // Fallback for tasks created before the status column was added
  if (!task.status) return task.completed ? 'completed' : 'todo';
  return task.status as ColumnId;
}

export default function KanbanBoard() {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  useEffect(() => {
    api.getTasks()
      .then(data => setTasks(data.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(payload: CreateTaskPayload) {
    const task = await api.createTask({ ...payload, status: 'todo' });
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    api.deleteTask(id).catch(() => api.getTasks().then(setTasks));
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveTask(tasks.find(t => t.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    if (!over) return;

    const taskId   = active.id as string;
    const newStatus = over.id as Status;
    const task = tasks.find(t => t.id === taskId);
    if (!task || taskStatus(task) === newStatus) return;

    // Optimistic update
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: newStatus, completed: newStatus === 'completed' }
          : t
      )
    );

    api.updateTask(taskId, { status: newStatus }).catch(() => {
      setTasks(prev => prev.map(t => (t.id === taskId ? task : t)));
    });
  }

  const pending   = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t =>  t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
            {!loading && !error && (
              <p className="text-sm text-slate-400 mt-0.5">
                {pending} active · {completed} done
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
              showForm
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {showForm
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              }
            </svg>
            {showForm ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-6 max-w-sm">
            <NewTaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div className="grid grid-cols-3 gap-5">
            {COLUMNS.map(col => (
              <div key={col.id} className="space-y-2">
                <div className="h-6 w-24 bg-slate-200/70 rounded-lg animate-pulse mb-3" />
                {[80, 64, 72].map((h, i) => (
                  <div key={i} style={{ height: h }} className="bg-slate-200/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-14">
            <p className="text-sm font-medium text-rose-500">Couldn&apos;t load tasks</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  tasks={tasks.filter(t => taskStatus(t) === col.id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <TaskCard task={activeTask} onDelete={() => {}} isOverlay />
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
