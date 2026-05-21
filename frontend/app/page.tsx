'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, CreateTaskPayload, Task } from '@/lib/api';
import TaskCard from '@/components/TaskCard';
import NewTaskForm from '@/components/NewTaskForm';

type Filter = 'all' | 'pending' | 'completed';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.getTasks()
      .then(data => setTasks(data.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    all:       tasks.length,
    pending:   tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t =>  t.completed).length,
  }), [tasks]);

  const filtered = useMemo(() =>
    filter === 'all' ? tasks : tasks.filter(t => filter === 'completed' ? t.completed : !t.completed),
    [tasks, filter],
  );

  async function handleCreate(payload: CreateTaskPayload) {
    const task = await api.createTask(payload);
    setTasks(prev => [task, ...prev]);
    setShowForm(false);
  }

  async function handleToggle(id: string, completed: boolean) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    try {
      const updated = await api.updateTask(id, { completed });
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  }

  function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
    api.deleteTask(id).catch(() => {
      api.getTasks().then(setTasks);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
            {!loading && !error && (
              <p className="text-sm text-slate-400 mt-0.5">
                {counts.pending} pending · {counts.completed} completed
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

        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl mb-5">
          {(['all', 'pending', 'completed'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
              <span className={`px-1.5 py-0.5 rounded-full tabular-nums ${
                filter === f ? 'bg-slate-100 text-slate-600' : 'text-slate-400'
              }`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Inline create form */}
        {showForm && (
          <NewTaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* States */}
        {loading ? (
          <div className="space-y-2">
            {[72, 56, 64].map((h, i) => (
              <div key={i} style={{ height: h }} className="bg-slate-200/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-14">
            <p className="text-sm font-medium text-rose-500">Couldn&apos;t load tasks</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {filter === 'all' ? 'Hit "New Task" to get started' : 'Switch filters or create a new task'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
