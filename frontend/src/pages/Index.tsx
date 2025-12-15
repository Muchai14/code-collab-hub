import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Shield } from 'lucide-react';
import { CreateRoomDialog } from '@/components/CreateRoomDialog';
import { JoinRoomDialog } from '@/components/JoinRoomDialog';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { preloadPyodide } from '@/services/codeExecution';
import type { Language } from '@/services/types';

const FEATURES = [
  {
    icon: Code2,
    title: 'Monaco Editor',
    description: 'Full VSCode-like experience with syntax highlighting and IntelliSense',
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'See code changes instantly as your team types together',
  },
  {
    icon: Zap,
    title: 'In-Browser Execution',
    description: 'Run JavaScript and Python code safely using WebAssembly',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'All code execution happens in your browser, never on our servers',
  },
];

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Preload Pyodide for faster Python execution
  useEffect(() => {
    preloadPyodide();
  }, []);

  const handleCreateRoom = async (hostName: string, language: Language) => {
    setIsLoading(true);
    try {
      // Direct API call to avoid hook state management
      const { room, user } = await api.createRoom({ hostName, language });

      toast({
        title: 'Room created!',
        description: 'Share the link with others to start the interview.',
      });

      // Navigate with state so we don't have to fetch/join again
      navigate(`/room/${room.id}`, { state: { room, currentUser: user } });
    } catch (error) {
      toast({
        title: 'Failed to create room',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (roomId: string, userName: string) => {
    setIsLoading(true);
    try {
      const { room, user } = await api.joinRoom({ roomId, userName });

      toast({
        title: 'Joined room!',
        description: `Welcome to the interview, ${userName}.`,
      });

      navigate(`/room/${room.id}`, { state: { room, currentUser: user } });
    } catch (error) {
      toast({
        title: 'Failed to join room',
        description: error instanceof Error ? error.message : 'Room not found',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-base font-bold text-primary-foreground">&lt;/&gt;</span>
            </div>
            <span className="text-xl font-bold text-foreground">CodeInterview</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center py-24 text-center">
          <div className="animate-fade-in space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Collaborative Coding
              <br />
              <span className="text-primary">Interview Platform</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Create shareable interview rooms for real-time collaborative coding.
              Run JavaScript and Python directly in the browser with WebAssembly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <CreateRoomDialog onCreateRoom={handleCreateRoom} isLoading={isLoading} />
              <JoinRoomDialog onJoinRoom={handleJoinRoom} isLoading={isLoading} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-card py-20">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary/50"
                >
                  <feature.icon className="mb-4 h-10 w-10 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Built with React, Monaco Editor, and Pyodide</p>
        </div>
      </footer>
    </div>
  );
}
