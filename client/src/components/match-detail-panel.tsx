'use client';

import type { MatchDetailResponse } from '@/types/golsinyali';

interface Props {
  detail: MatchDetailResponse | null;
  loading?: boolean;
}

export default function MatchDetailPanel({ detail, loading }: Props) {
  if (loading) {
    return <div className="panel detail-panel">Analizler yükleniyor...</div>;
  }

  if (!detail) {
    return <div className="panel detail-panel">Analiz bulunamadı.</div>;
  }

  const { scoreboard, highlightPredictions, detailPredictions, oddsTrends } = detail;

  return (
    <section className="panel detail-panel">
      {scoreboard && (
        <header className="scoreboard">
          <div>
            <p className="league">{scoreboard.leagueLabel ?? 'Lig bilgisi yok'}</p>
            <div className="badges">
              {scoreboard.statusBadges?.map((badge) => (
                <span key={badge} className="badge">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="teams">
            <TeamScore label="Ev Sahibi" team={scoreboard.homeTeam} />
            <div className="score">
              <span>{formatScore(scoreboard.homeTeam?.score)}</span>
              <small>Devre: {scoreboard.halftimeScore ?? '-'}</small>
              <span>{formatScore(scoreboard.awayTeam?.score)}</span>
            </div>
            <TeamScore label="Deplasman" team={scoreboard.awayTeam} />
          </div>
          {!!scoreboard.info?.length && (
            <div className="chips">
              {scoreboard.info.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          )}
        </header>
      )}

      {!!highlightPredictions?.length && (
        <section>
          <h3>Öne Çıkan Tahminler</h3>
          <div className="grid">
            {highlightPredictions.map((prediction) => (
              <article key={prediction.position} className="card">
                <header>
                  <p>{prediction.title}</p>
                  {prediction.ratingMax ? (
                    <span>
                      {prediction.rating}/{prediction.ratingMax}
                    </span>
                  ) : null}
                </header>
                <strong className="pick">{prediction.pickCode ?? '---'}</strong>
                <p>Başarı: {prediction.successRate ?? 0}%</p>
                {prediction.locked && <small className="badge muted">Premium</small>}
              </article>
            ))}
          </div>
        </section>
      )}

      {!!detailPredictions?.length && (
        <section>
          <h3>Detaylı Tahminler</h3>
          <div className="grid">
            {detailPredictions.map((prediction) => (
              <article key={prediction.position} className="card">
                <header>
                  <p>{prediction.title}</p>
                  {prediction.confidence && <small>%{prediction.confidence}</small>}
                </header>
                <ul>
                  {prediction.outcomes?.map((outcome, idx) => (
                    <li key={idx}>
                      <span>{outcome.label}</span>
                      <strong>{outcome.valuePercent ?? '-'}%</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {!!oddsTrends?.length && (
        <section>
          <h3>Oran Trendleri</h3>
          {oddsTrends.map((group, index) => (
            <article key={`${group.title}-${index}`} className="card column">
              <header>
                <p>{group.title}</p>
              </header>
              {group.cards?.map((card) => (
                <div key={card.title} className="odd-card">
                  <h4>{card.title}</h4>
                  <ul>
                    {card.rows?.map((row, idx) => (
                      <li key={`${row.label}-${idx}`}>
                        <span>{row.label}</span>
                        <strong>{row.values?.filter(Boolean).join(' · ') || '-'}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </section>
      )}
    </section>
  );
}

interface TeamScoreProps {
  label: string;
  team?: { name: string | null; score?: number | null } | null;
}

function TeamScore({ label, team }: TeamScoreProps) {
  return (
    <div className="team-score">
      <small>{label}</small>
      <strong>{team?.name ?? '-'}</strong>
    </div>
  );
}

function formatScore(value?: number | null) {
  if (value === null || value === undefined) return '-';
  return Number.isFinite(value) ? value : '-';
}
