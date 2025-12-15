import socketio
import uvicorn
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import uuid4
from datetime import datetime
from models import *
from db_models import DBRoom, DBUser
from database import get_db, engine, Base, SessionLocal

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: (Optional cleanup if needed)

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Initialize FastAPI application
fastapi_app = FastAPI(title="Code Collaboration Hub API", lifespan=lifespan)

# Add CORS middleware
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
DEFAULT_JS_CODE = '// Start coding...\nconsole.log("Hello");'
DEFAULT_PY_CODE = '# Start coding...\nprint("Hello")'

@fastapi_app.get("/api")
async def api_root():
    return {"message": "Code Collaboration Hub API is running", "docs": "/docs"}

@fastapi_app.get("/health")
async def health_check():
    return {"status": "ok"}

@fastapi_app.post("/api/rooms", response_model=CreateRoomResponse, status_code=201)
async def create_room(request: CreateRoomRequest, db: AsyncSession = Depends(get_db)):
    room_id = str(uuid4())[:8]
    user_id = str(uuid4())
    
    initial_code = DEFAULT_PY_CODE if request.language == Language.python else DEFAULT_JS_CODE
    
    db_room = DBRoom(
        id=room_id,
        code=initial_code,
        language=request.language,
        hostId=user_id,
        createdAt=datetime.now()
    )
    db.add(db_room)
    
    db_user = DBUser(
        id=user_id,
        roomId=room_id,
        name=request.hostName,
        color="#22c55e",
        isHost=True
    )
    db.add(db_user)
    
    await db.commit()
    await db.refresh(db_room)
    # Refresh to load participants (though we just added one, relations might be null until refresh/access)
    # Actually, we can just construct the response manually or refresh. 
    # To ensure participants relationship is loaded:
    result = await db.execute(select(DBRoom).options(selectinload(DBRoom.participants)).filter(DBRoom.id == room_id))
    room = result.scalars().first()
    
    return CreateRoomResponse(room=Room.model_validate(room), user=User.model_validate(db_user))

@fastapi_app.post("/api/rooms/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(room_id: str, request: JoinRoomRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBRoom).options(selectinload(DBRoom.participants)).filter(DBRoom.id == room_id))
    room = result.scalars().first()
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    user_id = str(uuid4())
    db_user = DBUser(
        id=user_id,
        roomId=room_id,
        name=request.userName,
        color="#3b82f6",
        isHost=False
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(room) # Refresh room to include new participant in the list
    
    # We need to return the created user object, and the updated room
    return JoinRoomResponse(room=Room.model_validate(room), user=User.model_validate(db_user))

@fastapi_app.get("/api/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBRoom).options(selectinload(DBRoom.participants)).filter(DBRoom.id == room_id))
    room = result.scalars().first()
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return Room.model_validate(room)

from pydantic import BaseModel

class ExecuteCodeRequest(BaseModel):
    code: str
    language: str

import subprocess
import tempfile
import asyncio

@fastapi_app.post("/api/execute")
async def execute_code_endpoint(request: ExecuteCodeRequest):
    start_time = datetime.now()
    
    # Simple execution logic (MVP - NOT SANDBOXED)
    # WARNING: This allows arbitrary code execution.
    # For production, use a secure sandbox like execution-engine or Docker-in-Docker.
    
    output = ""
    error = ""
    
    try:
        if request.language == "python":
            # Run python code in a separate process
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(request.code)
                f_path = f.name
            
            try:
                proc = await asyncio.create_subprocess_exec(
                    "python", f_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=5.0)
                
                output = stdout.decode() if stdout else ""
                error = stderr.decode() if stderr else ""
            except asyncio.TimeoutError:
                error = "Execution timed out (5s limit)"
            finally:
                if os.path.exists(f_path):
                    os.unlink(f_path)
                    
        elif request.language == "javascript":
            # Run JS using node
            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
                f.write(request.code)
                f_path = f.name
                
            try:
                proc = await asyncio.create_subprocess_exec(
                    "node", f_path,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=5.0)
                
                output = stdout.decode() if stdout else ""
                error = stderr.decode() if stderr else ""
            except asyncio.TimeoutError:
                error = "Execution timed out (5s limit)"
            except FileNotFoundError:
                error = "Node.js not found in backend container"
            finally:
                if os.path.exists(f_path):
                    os.unlink(f_path)
        else:
            return {"error": "Unsupported language", "executionTime": 0}

    except Exception as e:
        error = str(e)

    execution_time = (datetime.now() - start_time).total_seconds() * 1000
    
    return {
        "output": output,
        "error": error,
        "executionTime": execution_time
    }

# Socket.IO Events
@sio.event
async def connect(sid, environ):
    # print(f"Client connected: {sid}")
    pass

@sio.event
async def disconnect(sid):
    # print(f"Client disconnected: {sid}")
    pass

@sio.on("join-room")
async def handle_join_room(sid, room_id):
    # Just socket join, verification could be added
    await sio.enter_room(sid, room_id)

@sio.on("code-update")
async def handle_code_update(sid, data):
    room_id = data.get("roomId")
    code = data.get("code")
    
    async with SessionLocal() as db:
        result = await db.execute(select(DBRoom).filter(DBRoom.id == room_id))
        room = result.scalars().first()
        if room:
            room.code = code
            await db.commit()
            await sio.emit("code-update", {"code": code}, room=room_id, skip_sid=sid)

@sio.on("cursor-update")
async def handle_cursor_update(sid, data):
    room_id = data.get("roomId")
    # Broadcast to room except sender
    await sio.emit("cursor-update", data, room=room_id, skip_sid=sid)

@sio.on("language-update")
async def handle_language_update(sid, data):
    room_id = data.get("roomId")
    language = data.get("language")
    
    async with SessionLocal() as db:
        result = await db.execute(select(DBRoom).filter(DBRoom.id == room_id))
        room = result.scalars().first()
        if room:
            room.language = language
            await db.commit()
            await sio.emit("language-update", {"language": language}, room=room_id, skip_sid=sid)

@sio.on("execution-result")
async def handle_execution_result(sid, data):
    room_id = data.get("roomId")
    result = data.get("result")
    await sio.emit("execution-result", {"result": result}, room=room_id, skip_sid=sid)

# Check if static directory exists (for production deployments)
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    # Serve index.html at root
    @fastapi_app.get("/")
    async def serve_root():
        index_file = STATIC_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "Frontend not found (build missing)"}

    # Mount static files
    fastapi_app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")
    
    # Serve index.html for all non-API routes (SPA fallback)
    @fastapi_app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API, health, docs, or socket.io routes
        if full_path.startswith(("api/", "health", "docs", "redoc", "openapi.json", "socket.io")):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Serve index.html for all other routes (SPA routing)
        index_file = STATIC_DIR / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend not found")

# Mount the socket app to the FastAPI app
app = socketio.ASGIApp(sio, fastapi_app)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
