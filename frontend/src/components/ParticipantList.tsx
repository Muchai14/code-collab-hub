import { Users, Crown } from 'lucide-react';
import type { User } from '@/services/types';
import { cn } from '@/lib/utils';

interface ParticipantListProps {
  participants: User[];
  currentUserId?: string;
}

export function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Participants ({participants.length})
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5',
              participant.id === currentUserId && 'bg-muted'
            )}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: participant.color }}
            />
            <span className="flex-1 truncate text-sm text-foreground">
              {participant.name}
              {participant.id === currentUserId && (
                <span className="ml-1 text-muted-foreground">(you)</span>
              )}
            </span>
            {participant.isHost && (
              <Crown className="h-3.5 w-3.5 text-warning" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
