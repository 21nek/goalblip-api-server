import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

interface LeagueRailProps {
  leagues: string[];
  current: string;
  onChange: (league: string) => void;
}

export function LeagueRail({ leagues, current, onChange }: LeagueRailProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Tümü', ...leagues].map((league) => (
          <Button
            key={league}
            size="sm"
            variant={current === league || (current === 'Tümü' && league === 'Tümü') ? 'default' : 'outline'}
            className="rounded-full whitespace-nowrap"
            onClick={() => onChange(league)}
          >
            {league}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
