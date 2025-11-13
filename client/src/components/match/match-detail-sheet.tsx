import { Loader2, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMatchDetail } from '../../hooks/useMatchData';
import type { MatchSummary } from '../../types';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

interface MatchDetailSheetProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  match: MatchSummary | null;
}

export function MatchDetailSheet({ open, onOpenChange, match }: MatchDetailSheetProps) {
  const matchId = match?.matchId ?? null;
  const { data, loading, error } = useMatchDetail(matchId);
  const [title, setTitle] = useState('Maç Detayı');

  useEffect(() => {
    if (match) {
      setTitle(`${match.homeTeam} vs ${match.awayTeam}`);
    }
  }, [match]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full flex-col gap-4 p-0 sm:p-0">
        <div className="px-6 pb-4 pt-10">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <p className="text-sm text-muted-foreground">#{matchId}</p>
          </SheetHeader>
        </div>
        <ScrollArea className="flex-1 px-6 pb-10">
          {loading && <DetailSkeleton />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && data && <DetailContent detail={data} />}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

function DetailContent({ detail }: { detail: ReturnType<typeof useMatchDetail>['data'] }) {
  if (!detail) return null;
  const { scoreboard, highlightPredictions, detailPredictions, oddsTrends } = detail;

  return (
    <div className="space-y-6">
      {scoreboard && <ScoreboardPanel scoreboard={scoreboard} detail={detail} />}
      {highlightPredictions && highlightPredictions.length > 0 && (
        <PredictionPanel title="Öne Çıkan Tahminler" items={highlightPredictions.map((item) => ({
          label: item.title ?? 'Tahmin',
          value: item.pickCode ?? '—',
          meta: item.rating !== undefined && item.ratingMax ? `${item.rating}/${item.ratingMax}` : null,
          locked: item.locked,
        }))} />
      )}
      {detailPredictions && detailPredictions.length > 0 && (
        <DetailedPredictionPanel items={detailPredictions} />
      )}
      {oddsTrends && oddsTrends.length > 0 && <OddsPanel trends={oddsTrends} />}
    </div>
  );
}

function ScoreboardPanel({
  scoreboard,
  detail,
}: {
  scoreboard: NonNullable<ReturnType<typeof useMatchDetail>['data']>['scoreboard'];
  detail: NonNullable<ReturnType<typeof useMatchDetail>['data']>;
}) {
  const status = scoreboard?.statusBadges?.join(' • ');

  return (
    <Card className="bg-gradient-to-br from-indigo-600 to-purple-500 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>{scoreboard?.leagueLabel || 'Lig bilgisi yok'}</span>
          {status && <Badge variant="secondary" className="bg-white/20 text-white">{status}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="grid grid-cols-3 items-center gap-2 text-lg font-bold">
          <TeamColumn team={scoreboard?.homeTeam} alignment="end" />
          <div className="space-y-1 text-4xl">
            <p>
              {(scoreboard?.homeTeam?.score ?? '—')}
              <span className="mx-2 text-base font-normal">-</span>
              {(scoreboard?.awayTeam?.score ?? '—')}
            </p>
            {scoreboard?.halftimeScore && <p className="text-sm text-white/80">İY: {scoreboard.halftimeScore}</p>}
          </div>
          <TeamColumn team={scoreboard?.awayTeam} alignment="start" />
        </div>
        <div className="text-xs uppercase tracking-wide text-white/80">
          {scoreboard?.kickoff} {scoreboard?.kickoffTimezone && `(${scoreboard.kickoffTimezone})`}
        </div>
        <div className="text-xs text-white/70">
          Güncellendi: {detail.lastUpdatedAt || new Date(detail.scrapedAt).toLocaleString('tr-TR')}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamColumn({ team, alignment }: { team?: { name?: string | null; logo?: string | null }; alignment: 'start' | 'end' }) {
  if (!team) return null;
  return (
    <div className={cn('flex flex-col items-center gap-2 text-base', alignment === 'start' ? 'items-start' : 'items-end')}>
      {team.logo && <img src={team.logo} alt={team.name ?? ''} className="h-12 w-12 rounded-full border border-white/30" />}
      <p>{team.name}</p>
    </div>
  );
}

function PredictionPanel({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string; meta?: string | null; locked?: boolean }>;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Trophy className="h-4 w-4 text-amber-500" />
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.label} className="border-muted bg-white">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                <span>{item.label}</span>
                {item.meta && <Badge variant="outline">{item.meta}</Badge>}
              </div>
              <p className="text-2xl font-bold">{item.value}</p>
              {item.locked && <Badge variant="secondary">Kilitlemeli</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function DetailedPredictionPanel({
  items,
}: {
  items: NonNullable<ReturnType<typeof useMatchDetail>['data']>['detailPredictions'];
}) {
  if (!items) return null;
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Detaylı Tahminler</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.position}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{item.title}</span>
                {item.confidence && <Badge variant="success">%{item.confidence}</Badge>}
              </div>
              <div className="space-y-2">
                {item.outcomes?.map((outcome, idx) => (
                  <div key={`${outcome.label}-${idx}`} className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{outcome.label}</span>
                    <span className="font-semibold text-foreground">%{outcome.valuePercent ?? '—'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function OddsPanel({ trends }: { trends: NonNullable<ReturnType<typeof useMatchDetail>['data']>['oddsTrends'] }) {
  if (!trends) return null;
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Oran Trendleri</h3>
      <div className="space-y-4">
        {trends.map((trend, index) => (
          <Card key={`${trend.title}-${index}`} className="border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{trend.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trend.cards?.map((card, idx) => (
                <div key={`${card.title}-${idx}`} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-sm font-semibold">{card.title}</p>
                  <div className="mt-2 space-y-2">
                    {card.rows?.map((row, rowIdx) => (
                      <div key={`${row.label}-${rowIdx}`} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium">{row.values?.join(' · ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
