const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  status: Status;
  due_date: string | null;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  status?: Status;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string;
  status?: Status;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getTasks: (status?: "completed" | "pending") =>
    request<Task[]>(`/api/tasks${status ? `?status=${status}` : ""}`),

  createTask: (payload: CreateTaskPayload) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(payload) }),

  updateTask: (id: string, payload: UpdateTaskPayload) =>
    request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteTask: (id: string) =>
    request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
