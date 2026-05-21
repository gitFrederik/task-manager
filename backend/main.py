import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Literal
from uuid import UUID

from database import get_db
from models import TaskCreate, TaskUpdate, TaskResponse

app = FastAPI(title="Task Manager API", version="1.0.0")

_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/tasks", response_model=list[TaskResponse])
async def list_tasks(
    status: Optional[Literal["completed", "pending"]] = Query(default=None),
):
    db = get_db()
    query = db.table("tasks").select("*").order("created_at", desc=True)
    if status == "completed":
        query = query.eq("completed", True)
    elif status == "pending":
        query = query.eq("completed", False)
    result = query.execute()
    return result.data


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID):
    db = get_db()
    result = db.table("tasks").select("*").eq("id", str(task_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return result.data[0]


@app.post("/api/tasks", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    db = get_db()
    payload = task.model_dump(exclude_none=True)
    if "due_date" in payload:
        payload["due_date"] = str(payload["due_date"])
    # Keep completed in sync with status
    payload["completed"] = payload.get("status") == "completed"
    result = db.table("tasks").insert(payload).execute()
    return result.data[0]


@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: UUID, task: TaskUpdate):
    db = get_db()
    updates = task.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "due_date" in updates:
        updates["due_date"] = str(updates["due_date"])

    # Sync status ↔ completed in both directions
    if "status" in updates and "completed" not in updates:
        updates["completed"] = updates["status"] == "completed"
    elif "completed" in updates and "status" not in updates:
        updates["status"] = "completed" if updates["completed"] else "todo"

    result = db.table("tasks").update(updates).eq("id", str(task_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return result.data[0]


@app.delete("/api/tasks/{task_id}", status_code=204)
async def delete_task(task_id: UUID):
    db = get_db()
    result = db.table("tasks").delete().eq("id", str(task_id)).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Task not found")
