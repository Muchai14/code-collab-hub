from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base
import datetime
from models import Language

class DBRoom(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    code = Column(Text, default="")
    language = Column(SAEnum(Language), default=Language.javascript)
    createdAt = Column("created_at", DateTime, default=datetime.datetime.utcnow)
    hostId = Column("host_id", String)

    participants = relationship("DBUser", back_populates="room", cascade="all, delete-orphan", lazy="selectin")

class DBUser(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    roomId = Column("room_id", String, ForeignKey("rooms.id"))
    name = Column(String)
    color = Column(String)
    isHost = Column("is_host", Boolean, default=False)
    
    # Cursor position is not persisted
    
    room = relationship("DBRoom", back_populates="participants")
