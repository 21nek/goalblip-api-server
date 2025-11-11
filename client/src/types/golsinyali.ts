export type MatchView = 'today' | 'tomorrow';

export interface MatchSummary {
  order: number;
  matchId: number;
  league: string;
  kickoffTime: string | null;
  statusLabel: string | null;
  homeTeam: string;
  homeSideCode?: string | null;
  awayTeam: string;
  awaySideCode?: string | null;
}

export interface MatchListResponse {
  view: MatchView;
  dataDate: string | null;
  locale?: string;
  totalMatches?: number;
  matches: MatchSummary[];
}

export interface TeamInfo {
  name: string | null;
  logo?: string | null;
  score?: number | null;
}

export interface Scoreboard {
  leagueLabel?: string | null;
  statusBadges?: string[];
  homeTeam?: TeamInfo | null;
  awayTeam?: TeamInfo | null;
  halftimeScore?: string | null;
  info?: string[];
}

export interface HighlightPrediction {
  position: number;
  title?: string | null;
  pickCode?: string | null;
  successRate?: number | null;
  rating?: number | null;
  ratingMax?: number | null;
  locked?: boolean;
}

export interface DetailedPrediction {
  position: number;
  title?: string | null;
  confidence?: number | null;
  outcomes?: Array<{
    label?: string | null;
    valuePercent?: number | null;
  }>;
}

export interface MatchDetailResponse {
  matchId: number;
  scoreboard?: Scoreboard;
  highlightPredictions?: HighlightPrediction[];
  detailPredictions?: DetailedPrediction[];
  oddsTrends?: Array<{
    title?: string | null;
    cards?: Array<{
      title?: string | null;
      rows?: Array<{
        label?: string | null;
        values?: string[];
      }>;
    }>;
  }>;
  upcomingMatches?: Array<{
    team?: string | null;
    role?: string | null;
    matches?: Array<{
      opponent?: string | null;
      competition?: string | null;
      dateText?: string | null;
      tag?: string | null;
    }>;
  }>;
}
