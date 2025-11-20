import type { MatchDetail, MatchListResponse } from '@/types/match';
import type { TranslateFn } from '@/lib/match-analysis';

export function aggregateDashboardMetrics(
  today?: MatchListResponse | null,
  tomorrow?: MatchListResponse | null,
  options?: { translator?: TranslateFn; locale?: string },
) {
  const totalToday = today?.totalMatches ?? 0;
  const totalTomorrow = tomorrow?.totalMatches ?? 0;
  const combined = (today?.matches || []).concat(tomorrow?.matches || []);
  const leagues = new Set(combined.map((match) => match.league || 'Unknown'));
  
  return {
    totalToday,
    totalTomorrow,
    totalLeagues: leagues.size,
    refreshedAgo: today?.scrapedAt ? timeSince(today.scrapedAt, options) : null,
  };
}

export function computeLeagueStats(list?: MatchListResponse | null) {
  if (!list) return [];
  
  const grouped = list.matches.reduce(
    (acc, match) => {
      const league = match.league || 'Unknown League';
      acc[league] = acc[league] || [];
      acc[league].push(match);
      return acc;
    },
    {} as Record<string, typeof list.matches>
  );
  
  return Object.keys(grouped)
    .map((league) => ({ league, matches: grouped[league] }))
    .sort((a, b) => b.matches.length - a.matches.length);
}

export function extractHighlightPredictions(
  detail?: MatchDetail | null,
  limit = 3,
  translator?: TranslateFn,
) {
  if (!detail?.highlightPredictions) return [];
  const predictionFallback = translator ? translator('common.prediction') : 'Tahmin';
  const unknownFallback = translator ? translator('common.unknown') : '—';
  
  return detail.highlightPredictions
    .slice(0, limit)
    .map((item) => ({
      title: item.title ?? predictionFallback,
      pick: item.pickCode ?? unknownFallback,
      success: item.successRate ?? null,
      rating: item.rating ?? null,
      ratingMax: item.ratingMax ?? null,
    }));
}

export function timeSince(
  timestamp: string,
  options?: { translator?: TranslateFn; locale?: string },
): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diffMinutes = Math.max(0, Math.floor((now - past) / (1000 * 60)));
  const translator = options?.translator;
  
  if (diffMinutes < 1) {
    if (translator) return translator('common.time.justNow');
    return 'just now';
  }
  if (diffMinutes < 60) {
    if (translator) return translator('common.time.minutes', { count: diffMinutes });
    return `${diffMinutes}m`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) {
    if (translator) return translator('common.time.hours', { count: hours });
    return `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (translator) return translator('common.time.days', { count: days });

  return `${days}d`;
}

/**
 * Format time until kickoff (e.g., "2s 15d" = 2 hours 15 minutes)
 */
export function formatTimeUntilKickoff(kickoffTime: string | null | undefined): string | null {
  if (!kickoffTime) return null;
  
  try {
    // Parse kickoff time (format: "20:00" or ISO string)
    let kickoffDate: Date;
    if (kickoffTime.includes('T') || kickoffTime.includes('Z')) {
      kickoffDate = new Date(kickoffTime);
    } else {
      // Assume today with the given time
      const [hours, minutes] = kickoffTime.split(':').map(Number);
      kickoffDate = new Date();
      kickoffDate.setHours(hours, minutes || 0, 0, 0);
    }
    
    const now = new Date();
    const diffMs = kickoffDate.getTime() - now.getTime();
    
    if (diffMs < 0) return null; // Already started or passed
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}s ${minutes}d` : `${hours}s`;
    }
    return `${minutes}d`;
  } catch {
    return null;
  }
}

/**
 * Convert recent form matches to W-D-L-W-W format string
 */
export function formatRecentForm(recentForm?: Array<{
  title?: string | null;
  matches?: Array<{
    result?: string | null;
    opponent?: string | null;
    competition?: string | null;
    date?: string | null;
    score?: string | null;
  }>;
}> | null, teamName?: string | null): string | null {
  if (!recentForm || recentForm.length === 0) return null;
  
  // Find the form for the specific team, or use the first one
  const teamForm = teamName
    ? recentForm.find((f) => f.title?.includes(teamName)) || recentForm[0]
    : recentForm[0];
  
  if (!teamForm?.matches || teamForm.matches.length === 0) return null;
  
  // Get last 5 matches
  const last5 = teamForm.matches.slice(0, 5);
  const formString = last5
    .map((match) => {
      const result = match.result;
      if (result === 'W') return 'W';
      if (result === 'D') return 'D';
      if (result === 'L') return 'L';
      return '?';
    })
    .join('-');
  
  return formString || null;
}
