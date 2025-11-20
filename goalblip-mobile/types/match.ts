export type MatchSummary = {
  order: number;
  matchId: number;
  league: string | null;
  kickoffTime: string | null; // Legacy - use kickoffTimeDisplay
  kickoffIsoUtc?: string | null; // Canonical UTC time
  kickoffTimezone?: string | null; // IANA timezone (e.g., "Europe/Istanbul")
  kickoffTimeDisplay?: string | null; // Formatted time for current timezone
  kickoffTimezoneId?: string | null; // Preset ID (e.g., "ISTANBUL")
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
  timezone?: string; // IANA timezone (e.g., "Europe/Istanbul")
  timezoneId?: string; // Preset ID (e.g., "ISTANBUL")
  url: string;
  scrapedAt: string;
  totalMatches: number;
  matches: MatchSummary[];
};

export type MatchDetailPendingResponse = {
  status: 'pending' | 'processing';
  message: string;
  matchId: string | number;
  queuePosition: number;
};

export type MatchDetail = {
  locale: string;
  timezone?: string; // IANA timezone (e.g., "Europe/Istanbul")
  timezoneId?: string; // Preset ID (e.g., "ISTANBUL")
  matchId: number;
  url: string;
  scrapedAt: string;
  lastUpdatedAt?: string | null;
  dataDate: string;
  viewContext: 'today' | 'tomorrow' | 'manual';
  sourceListScrapedAt?: string | null;
  scoreboard?: {
    leagueLabel?: string | null;
    statusBadges?: string[] | null;
    homeTeam?: { name?: string | null; score?: number | null; logo?: string | null };
    awayTeam?: { name?: string | null; score?: number | null; logo?: string | null };
    halftimeScore?: string | null;
    kickoff?: string | null; // Legacy - use kickoffTimeDisplay
    kickoffIsoUtc?: string | null; // Canonical UTC time
    kickoffTimezone?: string | null; // IANA timezone (e.g., "Europe/Istanbul")
    kickoffTimeDisplay?: string | null; // Formatted time for current timezone
    kickoffTimezoneId?: string | null; // Preset ID (e.g., "ISTANBUL")
    info?: string[] | null;
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
      opponent?: string | null;
      badge?: string | null;
      competition?: string | null;
      dateText?: string | null;
      tag?: string | null;
    }>;
  }>;
  recentForm?: Array<{
    title?: string | null;
    matches?: Array<{
      result?: string | null;
      opponent?: string | null;
      competition?: string | null;
      date?: string | null;
      score?: string | null;
    }>;
  }>;
  headToHead?: Array<{
    date?: string | null;
    competition?: string | null;
    homeTeam?: string | null;
    awayTeam?: string | null;
    score?: string | null;
  }>;
};

export type MatchReanalysisResponse = {
  status: 'pending' | 'processing';
  message?: string;
  matchId: number | string;
  queuePosition?: number;
  alreadyQueued?: boolean;
  nextAllowedAt?: string | null;
  intervalMs?: number;
};

