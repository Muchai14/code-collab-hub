import { Play, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from './LanguageSelector';
import { ShareDialog } from './ShareDialog';
import { ConnectionStatus } from './ConnectionStatus';
import type { Language } from '@/services/types';

interface RoomHeaderProps {
  roomId: string;
  language: Language;
  isConnected: boolean;
  isExecuting: boolean;
  onLanguageChange: (language: Language) => void;
  onRunCode: () => void;
  onLeaveRoom: () => void;
}

export function RoomHeader({
  roomId,
  language,
  isConnected,
  isExecuting,
  onLanguageChange,
  onRunCode,
  onLeaveRoom,
}: RoomHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">&lt;/&gt;</span>
          </div>
          <span className="text-lg font-semibold text-foreground">CodeInterview</span>
        </div>

        <div className="h-6 w-px bg-border" />

        <LanguageSelector
          language={language}
          onLanguageChange={onLanguageChange}
        />

        <ConnectionStatus isConnected={isConnected} />
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onRunCode}
          disabled={isExecuting}
          size="sm"
          className="gap-2"
        >
          {isExecuting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Code
            </>
          )}
        </Button>

        <ShareDialog roomId={roomId} />

        <div className="h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onLeaveRoom}
          className="gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Leave
        </Button>
      </div>
    </header>
  );
}
