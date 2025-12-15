import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomHeader } from '@/components/RoomHeader';
import { CodeEditor } from '@/components/CodeEditor';
import { OutputPanel } from '@/components/OutputPanel';
import { ParticipantList } from '@/components/ParticipantList';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const {
    room,
    currentUser,
    isConnected,
    isExecuting,
    executionResult,
    isLoading,
    joinRoom,
    leaveRoom,
    updateCode,
    updateLanguage,
    runCode,
    clearOutput,
  } = useRoom();

  // If user is not in room, show join form
  const needsToJoin = !room || !currentUser;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !name.trim()) return;
    setIsJoining(true);
    await joinRoom(roomId, name.trim());
    setIsJoining(false);
  };

  // Redirect if no room ID
  useEffect(() => {
    if (!roomId) {
      navigate('/');
    }
  }, [roomId, navigate]);

  if (needsToJoin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-lg font-bold text-primary-foreground">&lt;/&gt;</span>
            </div>
            <CardTitle>Join Interview Room</CardTitle>
            <CardDescription>
              Enter your name to join room <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{roomId}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!name.trim() || isJoining || isLoading}
              >
                {isJoining || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <RoomHeader
        roomId={room.id}
        language={room.language}
        isConnected={isConnected}
        isExecuting={isExecuting}
        onLanguageChange={updateLanguage}
        onRunCode={runCode}
        onLeaveRoom={leaveRoom}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 border-r border-border bg-card p-4 lg:block">
          <ParticipantList
            participants={room.participants}
            currentUserId={currentUser.id}
          />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden p-4 pb-2">
            <CodeEditor
              code={room.code}
              language={room.language}
              onChange={updateCode}
            />
          </div>

          {/* Output */}
          <div className="h-64 flex-shrink-0 p-4 pt-2">
            <OutputPanel
              result={executionResult}
              isExecuting={isExecuting}
              onClear={clearOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
