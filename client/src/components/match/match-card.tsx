import { Clock3, Radio } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import type { MatchSummary } from '../../types';
import { cn } from '../../lib/utils';

interface MatchCardProps {
  match: MatchSummary;
  isActive?: boolean;
  onSelect: (match: MatchSummary) => void;
}

export function MatchCard({ match, onSelect, isActive }: MatchCardProps) {
  const kickoff = match.kickoffTime || 'TBA';

  return (
    <Card
      className={cn(
        'cursor-pointer border-0 bg-white/70 shadow-md backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg',
        isActive && 'ring-2 ring-primary',
      )}
    >
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Clock3 className="h-4 w-4" /> {kickoff}
          </span>
          {match.statusLabel && (
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-primary">
              <Radio className="h-3 w-3" /> {match.statusLabel}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <TeamRow label={match.homeSideCode} team={match.homeTeam} />
          <TeamRow label={match.awaySideCode} team={match.awayTeam} />
        </div>
        <Button variant="secondary" className="w-full" onClick={() => onSelect(match)}>
          Tahmin & Detayları Gör
        </Button>
      </CardContent>
    </Card>
  );
}

function TeamRow({ label, team }: { label?: string | null; team: string }) {
  return (
    <div className="flex items-center justify-between text-base font-semibold">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{team}</span>
    </div>
  );
}
