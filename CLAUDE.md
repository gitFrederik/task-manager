# Task Manager — Coding Challenge

## Project Overview

Production-ready Task Manager with CRUD operations. 60-minute challenge target.

**Stack:** FastAPI (backend) · Next.js App Router (frontend) · Supabase (PostgreSQL) · Vercel (deploy)

---

## Architecture

```
task-manager/
├── backend/          # FastAPI app → deployed as Vercel Python function
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── requirements.txt
├── frontend/         # Next.js App Router
│   ├── app/
│   ├── components/
│   └── package.json
└── vercel.json       # monorepo routing
```

Backend lives at `/api/*`, frontend at `/`.

---

## Database (Supabase)

Schema — run once in Supabase SQL editor:

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  completed boolean not null default false,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date date,
  created_at timestamptz not null default now()
);
```

---

## Environment Variables

Never hardcode credentials. All secrets via environment variables.

**Backend** (`backend/.env` locally, Vercel env in production):
```
DATABASE_URL=postgresql://...   # Supabase connection string (Transaction mode, port 6543)
```

**Frontend** (`frontend/.env.local` locally):
```
NEXT_PUBLIC_API_URL=http://localhost:8000   # local dev
# In production this is empty — frontend calls /api (same origin via Vercel routing)
```

Add to Vercel via `vercel env add` or the Vercel dashboard. Never commit `.env` files.

---

## API Endpoints (FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List all tasks (optional `?status=completed\|pending`) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/{id}` | Update task (toggle complete, set priority/due date) |
| DELETE | `/api/tasks/{id}` | Delete task |

---

## MVP Features

- [ ] Create task (title, description)
- [ ] List all tasks
- [ ] Mark task as completed
- [ ] Delete task

## Bonus Features

- [ ] Filter by status (completed / pending)
- [ ] Priority field (low / medium / high)
- [ ] Due date per task

---

## Local Development

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm install
npm run dev
```

---

## Deployment (Vercel)

```bash
vercel link
vercel env add DATABASE_URL          # paste Supabase connection string
vercel deploy --prod
```

Both frontend and backend deploy from the same Vercel project via `vercel.json` routing rules.

---

## Code Quality Checklist

- No hardcoded credentials or URLs
- CORS configured on FastAPI (allow Vercel domain + localhost)
- Input validation via Pydantic models
- Error responses use proper HTTP status codes
- TypeScript types match API response shapes
