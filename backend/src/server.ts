import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

interface Room {
  id: string;
  code: string;
  language: 'javascript' | 'python';
  participants: { id: string; name: string; color: string; isHost: boolean }[];
  hostId: string;
  createdAt: string;
}

const rooms = new Map<string, Room>();

// REST API
app.post('/api/rooms', (req, res) => {
  const { hostName, language = 'javascript' } = req.body;
  const roomId = uuidv4().slice(0, 8);
  const userId = uuidv4();
  const room: Room = {
    id: roomId,
    code: language === 'python' ? '# Start coding...\nprint("Hello")' : '// Start coding...\nconsole.log("Hello");',
    language,
    participants: [{ id: userId, name: hostName, color: '#22c55e', isHost: true }],
    hostId: userId,
    createdAt: new Date().toISOString(),
  };
  rooms.set(roomId, room);
  res.json({ room, user: room.participants[0] });
});

app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { userName } = req.body;
  const room = rooms.get(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const user = { id: uuidv4(), name: userName, color: '#3b82f6', isHost: false };
  room.participants.push(user);
  res.json({ room, user });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

// WebSocket
io.on('connection', (socket) => {
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
  });

  socket.on('code-update', ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (room) room.code = code;
    socket.to(roomId).emit('code-update', { code });
  });

  socket.on('cursor-update', ({ roomId, position, userId }) => {
    socket.to(roomId).emit('cursor-update', { position, userId });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export { app, httpServer };
