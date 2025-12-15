import type { WebSocketMessage, CursorPosition, Language } from './types';

type MessageHandler = (message: WebSocketMessage) => void;

/**
 * WebSocket Service - Mock implementation for real-time collaboration
 * In production, this would connect to a Socket.io server
 */
class WebSocketService {
  private handlers: Set<MessageHandler> = new Set();
  private isConnected = false;
  private roomId: string | null = null;
  private userId: string | null = null;

  /**
   * Connect to a room
   */
  connect(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.roomId = roomId;
        this.userId = userId;
        this.isConnected = true;
        console.log(`[WebSocket] Connected to room ${roomId}`);
        resolve();
      }, 200);
    });
  }

  /**
   * Disconnect from current room
   */
  disconnect(): void {
    if (this.isConnected) {
      console.log(`[WebSocket] Disconnected from room ${this.roomId}`);
      this.isConnected = false;
      this.roomId = null;
      this.userId = null;
    }
  }

  /**
   * Send code update to all participants
   */
  sendCodeUpdate(code: string): void {
    if (!this.isConnected || !this.userId) return;

    const message: WebSocketMessage = {
      type: 'code_update',
      payload: { code },
      userId: this.userId,
      timestamp: Date.now(),
    };

    // In mock mode, we don't need to broadcast - the state is shared
    console.log('[WebSocket] Code update sent', message.timestamp);
  }

  /**
   * Send cursor position update
   */
  sendCursorUpdate(position: CursorPosition): void {
    if (!this.isConnected || !this.userId) return;

    const message: WebSocketMessage = {
      type: 'cursor_update',
      payload: position,
      userId: this.userId,
      timestamp: Date.now(),
    };

    this.broadcast(message);
  }

  /**
   * Send language change
   */
  sendLanguageChange(language: Language): void {
    if (!this.isConnected || !this.userId) return;

    const message: WebSocketMessage = {
      type: 'code_update',
      payload: { language },
      userId: this.userId,
      timestamp: Date.now(),
    };

    this.broadcast(message);
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
