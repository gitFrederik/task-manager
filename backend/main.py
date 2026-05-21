from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from uuid import UUID

from database import get_db
from models import TaskCreate, TaskUpdate, TaskResponse

app = FastAPI(title="Task Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/tasks", response_model=list[TaskResponse])
async def list_tasks(status: Optional[str] = None):
    db = get_db()
    query = db.table("tasks").select("*").order("created_at", desc=True)
    if status == "completed":
        query = query.eq("completed", True)
    elif status == "pending":
        query = query.eq("completed", False)
    result = query.execute()
    return result.data


@app.post("/api/tasks", response_model=TaskResponse, status_code=201)
async def create_task(task: TaskCreate):
    db = get_db()
    result = db.table("tasks").insert(task.model_dump(exclude_none=True)).execute()
    return result.data[0]


@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: UUID, task: TaskUpdate):
    db = get_db()
    updates = task.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
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
