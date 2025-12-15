export interface User {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  cursorPosition?: CursorPosition;
}

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface Room {
  id: string;
  code: string;
  language: Language;
  participants: User[];
  createdAt: string;
  hostId: string;
}

export type Language = 'javascript' | 'python';

export interface CodeExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

export interface RoomState {
  room: Room | null;
  currentUser: User | null;
  isConnected: boolean;
  isExecuting: boolean;
  executionResult: CodeExecutionResult | null;
}

export type WebSocketMessage =
  | {
    type: 'code_update';
    payload: { code?: string; language?: Language };
    userId: string;
    timestamp: number;
  }
  | {
    type: 'cursor_update';
    payload: CursorPosition;
    userId: string;
    timestamp: number;
  }
  | {
    type: 'user_joined' | 'user_left';
    payload: User;
    userId: string;
    timestamp: number;
  }
  | {
    type: 'execution_result';
    payload: CodeExecutionResult;
    userId: string;
    timestamp: number;
  };

export interface CreateRoomRequest {
  hostName: string;
  language?: Language;
}

export interface JoinRoomRequest {
  roomId: string;
  userName: string;
}

export interface CreateRoomResponse {
  room: Room;
  user: User;
}

export interface JoinRoomResponse {
  room: Room;
  user: User;
}
