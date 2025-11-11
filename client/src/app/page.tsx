import MatchExplorer from '@/components/match-explorer';
import { fetchMatchDetail, fetchMatchList, getApiBaseUrl } from '@/lib/api';
import type { MatchListResponse } from '@/types/golsinyali';

export const dynamic = 'force-dynamic';

async function loadListOrNull(view: 'today' | 'tomorrow'): Promise<MatchListResponse | null> {
  return fetchMatchList(view);
}

export default async function Page() {
  const [today, tomorrow] = await Promise.all([loadListOrNull('today'), loadListOrNull('tomorrow')]);

  let initialDetail = null;
  const featuredMatchId =
    today?.matches?.[0]?.matchId ?? tomorrow?.matches?.[0]?.matchId ?? null;

  if (featuredMatchId) {
    initialDetail = await fetchMatchDetail(featuredMatchId);
  }

  const apiBaseUrl = getApiBaseUrl();

  return (
    <main>
      <header>
        <h1>GoalBlip Demo Client</h1>
        <p>Tüm maçları gez, anlık analiz kartlarını incele.</p>
      </header>
      <MatchExplorer
        today={today}
        tomorrow={tomorrow}
        initialDetail={initialDetail}
        apiBaseUrl={apiBaseUrl}
      />
    </main>
  );
}
