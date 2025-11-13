import { useMemo, useState } from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { useMatchList } from './hooks/useMatchData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { MatchCard } from './components/match/match-card';
import { LeagueRail } from './components/match/league-rail';
import { MatchDetailSheet } from './components/match/match-detail-sheet';
import type { MatchSummary } from './types';
import { ScrollArea } from './components/ui/scroll-area';
import { Skeleton } from './components/ui/skeleton';
import { cn } from './lib/utils';

const views: Array<{ label: string; value: 'today' | 'tomorrow' }> = [
  { label: 'Bugün', value: 'today' },
  { label: 'Yarın', value: 'tomorrow' },
];

export default function App() {
  const [view, setView] = useState<'today' | 'tomorrow'>('today');
  const { data, leagues, loading, error, refresh } = useMatchList(view);
  const [activeLeague, setActiveLeague] = useState('Tümü');
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [isDetailOpen, setDetailOpen] = useState(false);

  const filteredMatches = useMemo(() => {
    if (!leagues.length) return [] as MatchSummary[];
    if (activeLeague === 'Tümü') {
      return leagues.flatMap((group) => group.matches);
    }
    return leagues.find((group) => group.name === activeLeague)?.matches ?? [];
  }, [activeLeague, leagues]);

  const uniqueLeagueNames = useMemo(() => leagues.map((group) => group.name), [leagues]);

  const handleSelectMatch = (match: MatchSummary) => {
    setSelectedMatch(match);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-10 pt-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">GoalBlip Companion</p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Maç Veri Merkezi</h1>
            <p className="text-sm text-muted-foreground">
              {data ? `${data.totalMatches} maç listelendi (${data.dataDate})` : 'Veriler yükleniyor…'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refresh()} disabled={loading}>
              <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
              Yenile
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              {view === 'today' ? 'Bugünün Programı' : 'Yarının Programı'}
            </Button>
          </div>
        </header>

        <Tabs value={view} onValueChange={(val) => setView(val as 'today' | 'tomorrow')}>
          <TabsList className="w-full justify-start">
            {views.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="flex-1">
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {views.map((item) => (
            <TabsContent key={item.value} value={item.value}>
              {view === item.value && (
                <section className="space-y-5">
                  <LeagueRail
                    leagues={uniqueLeagueNames}
                    current={activeLeague}
                    onChange={setActiveLeague}
                  />
                  {loading && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-36 rounded-2xl" />
                      ))}
                    </div>
                  )}
                  {!loading && error && (
                    <Card className="border-destructive/40">
                      <CardContent className="p-6 text-sm text-destructive">
                        {error}
                      </CardContent>
                    </Card>
                  )}
                  {!loading && !error && (
                    <ScrollArea className="h-[70vh] rounded-3xl border bg-white/70 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        {filteredMatches.map((match) => (
                          <MatchCard
                            key={match.matchId}
                            match={match}
                            onSelect={handleSelectMatch}
                            isActive={selectedMatch?.matchId === match.matchId}
                          />
                        ))}
                      </div>
                      {filteredMatches.length === 0 && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          Seçili lig için maç bulunamadı.
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </section>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <MatchDetailSheet open={isDetailOpen} onOpenChange={setDetailOpen} match={selectedMatch} />
    </div>
  );
}
