'use client';

import { useState } from 'react';
import { CreateTaskPayload, Priority } from '@/lib/api';

interface Props {
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  onCancel: () => void;
}

export default function NewTaskForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-3"
    >
      <input
        autoFocus
        required
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none mb-2"
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full text-sm text-slate-500 placeholder:text-slate-400 outline-none resize-none mb-3"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 outline-none bg-white focus:border-slate-400 cursor-pointer"
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input
          type="date"
          value={dueDate}
          min={today}
          onChange={e => setDueDate(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 outline-none focus:border-slate-400 cursor-pointer"
        />
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="text-xs bg-slate-900 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-40 transition-colors"
          >
            {submitting ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </div>
    </form>
  );
}
