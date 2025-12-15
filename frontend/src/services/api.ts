import type {
  Room,
  User,
  Language,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
} from './types';

const API_URL = '/api';

/**
 * API Service - Communicates with the backend
 */
export const api = {
  /**
   * Create a new interview room
   */
  async createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  /**
   * Join an existing room
   */
  async joinRoom(request: JoinRoomRequest): Promise<JoinRoomResponse> {
    const response = await fetch(`${API_URL}/rooms/${request.roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) throw new Error('Failed to join room');
    return response.json();
  },

  /**
   * Get room by ID
   */
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  /**
   * Update room code (Frontend only pushes to websocket mainly, but API exists if needed)
   * The backend currently doesn't have a specific REST endpoint for code update in the snippet provided,
   * it handles it via socket. But we can leave this as a no-op or implement it if the backend had it.
   * Looking at server.ts, there is NO rest endpoint for updating code, only creating/joining/getting.
   * Code updates are WS only.
   */
  async updateCode(roomId: string, code: string): Promise<void> {
    // No-op for REST, handled by WebSocket
  },

  /**
   * Update room language (Not implemented in backend REST API based on server.ts snippet)
   * server.ts only has room creation, join, get.
   * We will handle this via WebSocket for now or just assume it updates local state until backend supports it.
   */
  async updateLanguage(roomId: string, language: Language): Promise<void> {
    // No-op for REST
  },

  /**
   * Leave room - No backend endpoint for this in server.ts
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    // No-op
  },

  /**
   * Get shareable room link
   */
  getRoomLink(roomId: string): string {
    return `${window.location.origin}/room/${roomId}`;
  },
};
