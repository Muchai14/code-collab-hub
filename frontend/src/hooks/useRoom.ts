import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { websocket } from '@/services/websocket';
import { executeCode } from '@/services/codeExecution';
import type { Room, User, Language, CodeExecutionResult } from '@/services/types';
import { useToast } from '@/hooks/use-toast';

interface UseRoomReturn {
  room: Room | null;
  currentUser: User | null;
  isConnected: boolean;
  isExecuting: boolean;
  executionResult: CodeExecutionResult | null;
  isLoading: boolean;
  createRoom: (hostName: string, language?: Language) => Promise<void>;
  joinRoom: (roomId: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  updateCode: (code: string) => void;
  updateLanguage: (language: Language) => Promise<void>;
  runCode: () => Promise<void>;
  clearOutput: () => void;
}

interface UseRoomProps {
  initialState?: {
    room: Room | null;
    currentUser: User | null;
  };
}

export function useRoom({ initialState }: UseRoomProps = {}): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(initialState?.room || null);
  const [currentUser, setCurrentUser] = useState<User | null>(initialState?.currentUser || null);
  const [isConnected, setIsConnected] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Only disconnect/leave if we were actually connected and part of the room
      if (room && currentUser && isConnected) {
        websocket.disconnect();
        // In a real app, we might not want to leave the room on simple navigation,
        // but for this demo with mock backend, we need to be careful.
        // If we're the host, this might destroy the room in the mock.
        // The fix in Index.tsx prevents this cleanup from running there.
        api.leaveRoom(room.id, currentUser.id);
      }
    };
  }, [room, currentUser, isConnected]);

  // Auto-connect if initialized with state
  useEffect(() => {
    const connect = async () => {
      if (initialState?.room && initialState?.currentUser && !isConnected) {
        await websocket.connect(initialState.room.id, initialState.currentUser.id);
        setIsConnected(true);
      }
    };
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to websocket messages
  useEffect(() => {
    if (!isConnected || !room) return;

    const unsubscribe = websocket.onMessage(async (message) => {
      // Don't process our own messages (BroadcastChannel usually filters, but for safety)
      if (message.userId === currentUser?.id) return;

      if (message.type === 'code_update') {
        if (message.payload.code !== undefined) {
          setRoom((prev) => prev ? { ...prev, code: message.payload.code! } : null);
        }

        if (message.payload.language) {
          // For language change, fetch fresh room data to get default code and ensure consistency
          try {
            const updatedRoom = await api.getRoom(room.id);
            if (updatedRoom) {
              setRoom(updatedRoom);
            }
          } catch (e) {
            console.error('Failed to update room on language change', e);
          }
        }
      }

      if (message.type === 'execution_result') {
        setExecutionResult(message.payload as CodeExecutionResult);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, room, currentUser]);

  const createRoom = useCallback(
    async (hostName: string, language: Language = 'javascript') => {
      setIsLoading(true);
      try {
        const { room: newRoom, user } = await api.createRoom({ hostName, language });
        setRoom(newRoom);
        setCurrentUser(user);

        await websocket.connect(newRoom.id, user.id);
        setIsConnected(true);

        navigate(`/room/${newRoom.id}`);

        toast({
          title: 'Room created!',
          description: 'Share the link with others to start the interview.',
        });
      } catch (error) {
        toast({
          title: 'Failed to create room',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, toast]
  );

  const joinRoom = useCallback(
    async (roomId: string, userName: string) => {
      setIsLoading(true);
      try {
        const { room: joinedRoom, user } = await api.joinRoom({ roomId, userName });
        setRoom(joinedRoom);
        setCurrentUser(user);

        await websocket.connect(joinedRoom.id, user.id);
        setIsConnected(true);

        toast({
          title: 'Joined room!',
          description: `Welcome to the interview, ${userName}.`,
        });
      } catch (error) {
        toast({
          title: 'Failed to join room',
          description: error instanceof Error ? error.message : 'Room not found',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, toast]
  );

  const leaveRoom = useCallback(async () => {
    if (room && currentUser) {
      websocket.disconnect();
      await api.leaveRoom(room.id, currentUser.id);
      setRoom(null);
      setCurrentUser(null);
      setIsConnected(false);
      setExecutionResult(null);
      navigate('/');
    }
  }, [room, currentUser, navigate]);

  const updateCode = useCallback(
    (code: string) => {
      if (room) {
        setRoom({ ...room, code });
        websocket.sendCodeUpdate(code);
        api.updateCode(room.id, code);
      }
    },
    [room]
  );

  const updateLanguage = useCallback(
    async (language: Language) => {
      if (room) {
        // Optimistic update since backend update is via WebSocket only
        const updatedRoom = { ...room, language };
        setRoom(updatedRoom);

        websocket.sendLanguageChange(language);
        // api.updateLanguage is currently a no-op but kept for consistency
        await api.updateLanguage(room.id, language);

        setExecutionResult(null);
      }
    },
    [room]
  );

  const runCode = useCallback(async () => {
    if (!room) return;

    setIsExecuting(true);
    try {
      const result = await executeCode(room.code, room.language);
      console.log('Execution Result:', result);
      setExecutionResult(result);
      websocket.sendExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  }, [room]);

  const clearOutput = useCallback(() => {
    setExecutionResult(null);
  }, []);

  return {
    room,
    currentUser,
    isConnected,
    isExecuting,
    executionResult,
    isLoading,
    createRoom,
    joinRoom,
    leaveRoom,
    updateCode,
    updateLanguage,
    runCode,
    clearOutput,
  };
}
