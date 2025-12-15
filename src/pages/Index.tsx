import { useEffect } from 'react';
import { Code2, Users, Zap, Shield } from 'lucide-react';
import { CreateRoomDialog } from '@/components/CreateRoomDialog';
import { JoinRoomDialog } from '@/components/JoinRoomDialog';
import { useRoom } from '@/hooks/useRoom';
import { preloadPyodide } from '@/services/codeExecution';

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
  const { createRoom, joinRoom, isLoading } = useRoom();

  // Preload Pyodide for faster Python execution
  useEffect(() => {
    preloadPyodide();
  }, []);

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
              <CreateRoomDialog onCreateRoom={createRoom} isLoading={isLoading} />
              <JoinRoomDialog onJoinRoom={joinRoom} isLoading={isLoading} />
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
