from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class Language(str, Enum):
    javascript = "javascript"
    python = "python"

class CursorPosition(BaseModel):
    lineNumber: int
    column: int

class User(BaseModel):
    id: str
    name: str
    color: str
    isHost: bool
    cursorPosition: Optional[CursorPosition] = None

class Room(BaseModel):
    id: str
    code: str
    language: Language
    participants: List[User]
    createdAt: datetime
    hostId: str

class CreateRoomRequest(BaseModel):
    hostName: str
    language: Language = Language.javascript

class CreateRoomResponse(BaseModel):
    room: Room
    user: User

class JoinRoomRequest(BaseModel):
    userName: str

class JoinRoomResponse(BaseModel):
    room: Room
    user: User
