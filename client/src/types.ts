export type MatchSummary = {
  order: number;
  matchId: number;
  league: string;
  kickoffTime: string | null;
  statusLabel: string | null;
  homeTeam: string;
  homeSideCode?: string | null;
  awayTeam: string;
  awaySideCode?: string | null;
};

export type MatchListResponse = {
  view: 'today' | 'tomorrow';
  dataDate: string;
  locale: string;
  url: string;
  scrapedAt: string;
  totalMatches: number;
  matches: MatchSummary[];
};

export type MatchDetail = {
  locale: string;
  matchId: number;
  url: string;
  scrapedAt: string;
  scoreboard?: {
    leagueLabel?: string | null;
    statusBadges?: string[];
    homeTeam?: { name?: string | null; score?: number | null; logo?: string | null };
    awayTeam?: { name?: string | null; score?: number | null; logo?: string | null };
    halftimeScore?: string | null;
    kickoff?: string | null;
    kickoffTimezone?: string | null;
    info?: string[];
  };
  highlightPredictions?: Array<{
    position: number;
    title?: string | null;
    pickCode?: string | null;
    successRate?: number | null;
    rating?: number | null;
    ratingMax?: number | null;
    locked?: boolean;
  }>;
  detailPredictions?: Array<{
    position: number;
    title?: string | null;
    confidence?: number | null;
    outcomes?: Array<{ label?: string | null; valuePercent?: number | null }>;
  }>;
  oddsTrends?: Array<{
    title?: string | null;
    cards?: Array<{
      title?: string | null;
      rows?: Array<{ label?: string | null; values?: string[] }>;
    }>;
  }>;
  upcomingMatches?: Array<{
    team?: string | null;
    role?: string | null;
    matches?: Array<{
      badge?: string | null;
      opponent?: string | null;
      competition?: string | null;
      dateText?: string | null;
      tag?: string | null;
    }>;
  }>;
  lastUpdatedAt?: string | null;
};
