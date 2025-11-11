'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MatchDetailResponse,
  MatchListResponse,
  MatchSummary,
  MatchView,
} from '@/types/golsinyali';
import MatchDetailPanel from './match-detail-panel';

interface Props {
  today: MatchListResponse | null;
  tomorrow: MatchListResponse | null;
  initialDetail: MatchDetailResponse | null;
  apiBaseUrl: string;
}

export default function MatchExplorer({ today, tomorrow, initialDetail, apiBaseUrl }: Props) {
  const [activeView, setActiveView] = useState<MatchView>('today');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(
    initialDetail?.matchId ?? today?.matches?.[0]?.matchId ?? null,
  );
  const [detail, setDetail] = useState(initialDetail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    const payload = activeView === 'today' ? today : tomorrow;
    return payload?.matches ?? [];
  }, [activeView, today, tomorrow]);

  const handleSelect = useCallback(
    async (match: MatchSummary) => {
      setSelectedMatchId(match.matchId);
      setError(null);
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/api/match/${match.matchId}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Maç detayı alınamadı.');
        }
        const data = (await res.json()) as MatchDetailResponse;
        setDetail(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl],
  );

  useEffect(() => {
    if (!matches.length) {
      return;
    }
    if (!selectedMatchId || !matches.some((match) => match.matchId === selectedMatchId)) {
      handleSelect(matches[0]);
    }
  }, [matches, selectedMatchId, handleSelect]);

  if (!today && !tomorrow) {
    return (
      <div className="panel">
        <p>API henüz veri döndürmedi. Sunucuyu çalıştırıp maç listesi oluşturman gerekiyor.</p>
      </div>
    );
  }

  return (
    <div className="explorer">
      <aside className="panel">
        <div className="toggle-group">
          <button
            type="button"
            className={activeView === 'today' ? 'active' : ''}
            onClick={() => setActiveView('today')}
          >
            Bugün ({today?.totalMatches ?? today?.matches?.length ?? 0})
          </button>
          <button
            type="button"
            className={activeView === 'tomorrow' ? 'active' : ''}
            onClick={() => setActiveView('tomorrow')}
          >
            Yarın ({tomorrow?.totalMatches ?? tomorrow?.matches?.length ?? 0})
          </button>
        </div>
        <div className="match-list">
          {matches.length === 0 && <p>Bu görünüm için maç bulunamadı.</p>}
          {matches.map((match) => {
            const isActive = selectedMatchId === match.matchId;
            return (
              <article
                key={match.matchId}
                className={`match-row ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(match)}
              >
                <header>
                  <span>{match.league}</span>
                  <time>{match.kickoffTime ?? '--'}</time>
                </header>
                <p>
                  <strong>{match.homeTeam}</strong>
                  <span>vs</span>
                  <strong>{match.awayTeam}</strong>
                </p>
              </article>
            );
          })}
        </div>
      </aside>
      <MatchDetailPanel detail={detail} loading={loading} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
