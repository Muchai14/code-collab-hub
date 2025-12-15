import socketio
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4
from datetime import datetime
from models import *

# Initialize Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Initialize FastAPI application
fastapi_app = FastAPI(title="Code Collaboration Hub API")

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

# Mock Database
rooms: dict[str, Room] = {}

# Populate with some fake data for testing
fake_room_id = "test-room"
fake_host_id = "host-123"
rooms[fake_room_id] = Room(
    id=fake_room_id,
    code=DEFAULT_PY_CODE,
    language=Language.python,
    participants=[
        User(id=fake_host_id, name="Alice (Host)", color="#22c55e", isHost=True),
        User(id="user-456", name="Bob", color="#3b82f6", isHost=False)
    ],
    createdAt=datetime.now(),
    hostId=fake_host_id
)

@fastapi_app.get("/")
async def root():
    return {"message": "Code Collaboration Hub API is running", "docs": "/docs"}

@fastapi_app.get("/health")
async def health_check():
    return {"status": "ok"}

@fastapi_app.post("/api/rooms", response_model=CreateRoomResponse, status_code=201)
async def create_room(request: CreateRoomRequest):
    room_id = str(uuid4())[:8]
    user_id = str(uuid4())
    
    initial_code = DEFAULT_PY_CODE if request.language == Language.python else DEFAULT_JS_CODE
    
    host_user = User(
        id=user_id,
        name=request.hostName,
        color="#22c55e",
        isHost=True
    )
    
    room = Room(
        id=room_id,
        code=initial_code,
        language=request.language,
        participants=[host_user],
        createdAt=datetime.now(),
        hostId=user_id
    )
    
    rooms[room_id] = room
    return CreateRoomResponse(room=room, user=host_user)

@fastapi_app.post("/api/rooms/{room_id}/join", response_model=JoinRoomResponse)
async def join_room(room_id: str, request: JoinRoomRequest):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    user_id = str(uuid4())
    user = User(
        id=user_id,
        name=request.userName,
        color="#3b82f6",
        isHost=False
    )
    
    rooms[room_id].participants.append(user)
    return JoinRoomResponse(room=rooms[room_id], user=user)

@fastapi_app.get("/api/rooms/{room_id}", response_model=Room)
async def get_room(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    return rooms[room_id]

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
    await sio.enter_room(sid, room_id)

@sio.on("code-update")
async def handle_code_update(sid, data):
    room_id = data.get("roomId")
    code = data.get("code")
    if room_id in rooms:
        rooms[room_id].code = code
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
    if room_id in rooms:
        rooms[room_id].language = language
        await sio.emit("language-update", {"language": language}, room=room_id, skip_sid=sid)

@sio.on("execution-result")
async def handle_execution_result(sid, data):
    room_id = data.get("roomId")
    result = data.get("result")
    await sio.emit("execution-result", {"result": result}, room=room_id, skip_sid=sid)

# Mount the socket app to the FastAPI app
app = socketio.ASGIApp(sio, fastapi_app)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3001, reload=True)
