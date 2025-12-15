import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';

interface ShareDialogProps {
  roomId: string;
}

export function ShareDialog({ roomId }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareLink = api.getRoomLink(roomId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Interview Room</DialogTitle>
          <DialogDescription>
            Share this link with candidates or interviewers to join the room.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input
            value={shareLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Room ID</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center">
          <code className="rounded bg-muted px-3 py-1.5 font-mono text-lg font-bold tracking-wider">
            {roomId}
          </code>
        </div>
      </DialogContent>
    </Dialog>
  );
}
