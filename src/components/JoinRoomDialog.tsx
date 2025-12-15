import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';

interface JoinRoomDialogProps {
  onJoinRoom: (roomId: string, name: string) => Promise<void>;
  isLoading: boolean;
  defaultRoomId?: string;
}

export function JoinRoomDialog({
  onJoinRoom,
  isLoading,
  defaultRoomId = '',
}: JoinRoomDialogProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return;
    await onJoinRoom(roomId.trim(), name.trim());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="lg" className="gap-2 text-base">
          <LogIn className="h-5 w-5" />
          Join with Room ID
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Join Interview Room</DialogTitle>
            <DialogDescription>
              Enter the room ID shared with you to join an existing session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomId">Room ID</Label>
              <Input
                id="roomId"
                placeholder="e.g., abc12345"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="font-mono"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="joinName">Your Name</Label>
              <Input
                id="joinName"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || !roomId.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Room'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
