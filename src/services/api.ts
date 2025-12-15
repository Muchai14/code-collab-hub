import { v4 as uuidv4 } from 'uuid';
import type {
  Room,
  User,
  Language,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
} from './types';

// Mock storage for rooms (simulates backend)
const mockRooms = new Map<string, Room>();

const USER_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#06b6d4', // cyan
];

const getRandomColor = (): string => {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
};

const DEFAULT_CODE: Record<Language, string> = {
  javascript: `// Welcome to CodeInterview!
// Start coding your solution here

function solution(input) {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  python: `# Welcome to CodeInterview!
# Start coding your solution here

def solution(input):
    # Your code here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
};

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * API Service - Centralized backend calls
 * All functions here are mocked but structured for easy backend integration
 */
export const api = {
  /**
   * Create a new interview room
   */
  async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    await delay(300); // Simulate network delay

    const roomId = uuidv4().slice(0, 8);
    const userId = uuidv4();
    const language = request.language || 'javascript';

    const user: User = {
      id: userId,
      name: request.hostName,
      color: getRandomColor(),
      isHost: true,
    };

    const room: Room = {
      id: roomId,
      code: DEFAULT_CODE[language],
      language,
      participants: [user],
      createdAt: new Date().toISOString(),
      hostId: userId,
    };

    mockRooms.set(roomId, room);

    return { room, user };
  },

  /**
   * Join an existing room
   */
  async joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
    await delay(300);

    const room = mockRooms.get(request.roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    const userId = uuidv4();
    const user: User = {
      id: userId,
      name: request.userName,
      color: getRandomColor(),
      isHost: false,
    };

    room.participants.push(user);
    mockRooms.set(room.id, room);

    return { room, user };
  },

  /**
   * Get room by ID
   */
  async getRoom(roomId: string): Promise<Room | null> {
    await delay(100);
    return mockRooms.get(roomId) || null;
  },

  /**
   * Update room code
   */
  async updateCode(roomId: string, code: string): Promise<void> {
    await delay(50);
    const room = mockRooms.get(roomId);
    if (room) {
      room.code = code;
      mockRooms.set(roomId, room);
    }
  },

  /**
   * Update room language
   */
  async updateLanguage(roomId: string, language: Language): Promise<void> {
    await delay(100);
    const room = mockRooms.get(roomId);
    if (room) {
      room.language = language;
      room.code = DEFAULT_CODE[language];
      mockRooms.set(roomId, room);
    }
  },

  /**
   * Leave room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await delay(100);
    const room = mockRooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter((p) => p.id !== userId);
      if (room.participants.length === 0) {
        mockRooms.delete(roomId);
      } else {
        mockRooms.set(roomId, room);
      }
    }
  },

  /**
   * Get shareable room link
   */
  getRoomLink(roomId: string): string {
    return `${window.location.origin}/room/${roomId}`;
  },
};
