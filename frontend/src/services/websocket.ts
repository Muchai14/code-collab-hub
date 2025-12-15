import { io, Socket } from 'socket.io-client';
import type { WebSocketMessage, CursorPosition, Language, CodeExecutionResult } from './types';

type MessageHandler = (message: WebSocketMessage) => void;

/**
 * WebSocket Service - Real implementation using Socket.IO
 */
class WebSocketService {
  private socket: Socket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private isConnected = false;
  private roomId: string | null = null;
  private userId: string | null = null;

  /**
   * Connect to a room
   */
  connect(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Initialize socket connection
      const API_URL = import.meta.env.VITE_API_URL;
      const url = API_URL || undefined;

      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.roomId = roomId;
        this.userId = userId;
        console.log(`[WebSocket] Connected to server, joining room ${roomId}`);

        this.socket?.emit('join-room', roomId);
        resolve();
      });

      this.socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        reject(err);
      });

      // Handle incoming messages
      this.socket.on('code-update', (data: { code?: string; language?: string }) => {
        this.broadcast({
          type: 'code_update',
          payload: { code: data.code, language: data.language as Language },
          userId: 'server', // The server or other user sent this
          timestamp: Date.now(),
        });
      });

      this.socket.on('language-update', (data: { language: string }) => {
        this.broadcast({
          type: 'code_update',
          payload: { language: data.language as Language },
          userId: 'server',
          timestamp: Date.now(),
        });
      });

      this.socket.on('execution-result', (data: { result: CodeExecutionResult }) => {
        this.broadcast({
          type: 'execution_result',
          payload: data.result,
          userId: 'server', // originating user info lost in simpler backend relay, but fine for now
          timestamp: Date.now(),
        });
      });

      this.socket.on('cursor-update', (data: { position: CursorPosition; userId: string }) => {
        this.broadcast({
          type: 'cursor_update',
          payload: data.position,
          userId: data.userId,
          timestamp: Date.now(),
        });
      });
    });
  }

  /**
   * Disconnect from current room
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.roomId = null;
    this.userId = null;
  }

  /**
   * Send code update to all participants
   */
  sendCodeUpdate(code: string): void {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('code-update', { roomId: this.roomId, code });
  }

  /**
   * Send cursor position update
   */
  sendCursorUpdate(position: CursorPosition): void {
    if (!this.socket || !this.roomId || !this.userId) return;
    this.socket.emit('cursor-update', { roomId: this.roomId, position, userId: this.userId });
  }

  /**
   * Send language change
   */
  sendLanguageChange(language: Language): void {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('language-update', { roomId: this.roomId, language });
  }

  /**
   * Send execution result
   */
  sendExecutionResult(result: CodeExecutionResult): void {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('execution-result', { roomId: this.roomId, result });
  }

  /**
   * Subscribe to messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Broadcast message to all handlers
   */
  private broadcast(message: WebSocketMessage): void {
    this.handlers.forEach((handler) => handler(message));
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const websocket = new WebSocketService();
