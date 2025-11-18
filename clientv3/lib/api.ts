import { API_BASE_URL } from './config';
import type {
  MatchDetail,
  MatchDetailPendingResponse,
  MatchListResponse,
  MatchReanalysisResponse,
} from '@/types/match';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const target = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  
  // Match detail için timeout - artık 202 dönebilir, bu yüzden daha kısa timeout yeterli
  const isMatchDetail = path.includes('/api/match/');
  // Liste isteklerinde Puppeteer bazen 60sn'yi aşabiliyor; ilk scraping için daha geniş tut.
  // Rate limit değil, scraping işlemi uzun sürebilir.
  const timeoutMs = isMatchDetail ? 15000 : 90000; // Match detail: 15s, listeler: 90s (ilk scraping için)
  
  try {
    if (__DEV__) {
      console.log('[API] Fetching:', target);
    }
    const startTime = Date.now();
    
    // Timeout için AbortController kullan (React Native'de AbortSignal.timeout yok)
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      if (!timeoutController.signal.aborted) {
        timeoutController.abort('Request timeout');
      }
    }, timeoutMs);
    
    // Eğer init'te signal varsa ve abort edilmemişse, onu kullan
    // Aksi halde timeout signal'ı kullan
    let finalSignal: AbortSignal;
    let abortHandlers: Array<() => void> = [];
    
    if (init?.signal && !init.signal.aborted) {
      // İki signal'ı birleştir: hem init signal hem timeout signal abort edilirse request iptal olsun
      const combinedController = new AbortController();
      const abortHandler = () => {
        if (!combinedController.signal.aborted) {
          combinedController.abort('Request aborted');
        }
      };
      init.signal.addEventListener('abort', abortHandler);
      timeoutController.signal.addEventListener('abort', abortHandler);
      abortHandlers.push(() => {
        init.signal?.removeEventListener('abort', abortHandler);
        timeoutController.signal.removeEventListener('abort', abortHandler);
      });
      finalSignal = combinedController.signal;
    } else {
      finalSignal = timeoutController.signal;
    }
    
    try {
      const response = await fetch(target, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
        signal: finalSignal,
      });
      
      // Başarılı response geldi, timeout'u ve listener'ları temizle
      clearTimeout(timeoutId);
      abortHandlers.forEach(cleanup => cleanup());
    
      const duration = Date.now() - startTime;
      if (__DEV__) {
        console.log(`[API] Response received in ${duration}ms:`, response.status, path);
      }
      
      // Handle 202 Accepted (pending queue response)
      if (response.status === 202) {
        const data = await response.json();
        if (__DEV__) {
          console.log('[API] Pending (202):', path, `(${duration}ms)`, data);
        }
        return data as T;
      }
      
      if (!response.ok) {
        let rawBody = '';
        let parsedBody: any = null;
        try {
          rawBody = await response.text();
          if (rawBody) {
            parsedBody = JSON.parse(rawBody);
          }
        } catch {
          parsedBody = null;
        }
        const errorMsg = parsedBody?.error || rawBody || `API error ${response.status}`;
        if (__DEV__) {
          console.error('[API] Error:', response.status, errorMsg);
        }
        const apiError = new Error(errorMsg);
        apiError.name = 'API_ERROR';
        (apiError as any).code = parsedBody?.code || 'API_ERROR';
        (apiError as any).status = response.status;
        (apiError as any).meta = { url: target };
        (apiError as any).body = parsedBody ?? rawBody;
        throw apiError;
      }
      
      const data = await response.json();
      if (__DEV__) {
        console.log('[API] Success:', path, `(${duration}ms)`);
      }
      return data as T;
    } catch (fetchError) {
      // Fetch hatası oldu, timeout'u ve listener'ları temizle
      clearTimeout(timeoutId);
      abortHandlers.forEach(cleanup => cleanup());
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
      abortHandlers.forEach(cleanup => cleanup());
    }
  } catch (error) {
    if (error instanceof TypeError) {
      if (__DEV__) {
        console.error('[API] Network error:', error.message, 'URL:', target);
      }
      const networkError = new Error(error.message);
      networkError.name = 'NETWORK_ERROR';
      (networkError as any).code = 'NETWORK_ERROR';
      (networkError as any).meta = { url: target };
      throw networkError;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      if (__DEV__) {
        console.error('[API] Request timeout:', target);
      }
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'REQUEST_TIMEOUT';
      (timeoutError as any).code = 'REQUEST_TIMEOUT';
      (timeoutError as any).meta = { timeoutMs, url: target };
      throw timeoutError;
    }
    
    if (error instanceof Error) {
      const fallback = error;
      if (!(fallback as any).code) {
        (fallback as any).code = fallback.name || 'UNKNOWN_ERROR';
      }
      throw fallback;
    }

    throw error;
  }
}

export function fetchMatchList(
  view: 'today' | 'tomorrow' = 'today',
  init?: RequestInit,
  options?: { locale?: string; timezone?: string }
): Promise<MatchListResponse> {
  const params = new URLSearchParams({ view });
  
  // Add locale (default to 'tr' if not provided)
  const locale = options?.locale || 'tr';
  params.append('locale', locale);
  
  // Add timezone (use IANA ID)
  if (options?.timezone) {
    params.append('timezone', options.timezone);
  }
  
  return fetchJson<MatchListResponse>(`/api/matches?${params.toString()}`, init);
}

export function fetchMatchDetail(
  matchId: number | string,
  init?: RequestInit,
  options?: { 
    date?: string; 
    view?: 'today' | 'tomorrow' | 'manual';
    locale?: string;
    timezone?: string;
  }
): Promise<MatchDetail | MatchDetailPendingResponse> {
  let url = `/api/match/${matchId}`;
  const params = new URLSearchParams();
  
  // Add locale (default to 'tr' if not provided)
  const locale = options?.locale || 'tr';
  params.append('locale', locale);
  
  // Add timezone (use IANA ID)
  if (options?.timezone) {
    params.append('timezone', options.timezone);
  }
  
  if (options?.date) {
    params.append('date', options.date);
  }
  if (options?.view) {
    params.append('view', options.view);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return fetchJson<MatchDetail | MatchDetailPendingResponse>(url, init);
}

export function requestMatchReanalysis(
  matchId: number | string,
  options?: {
    locale?: string;
    date?: string;
    view?: 'today' | 'tomorrow' | 'manual';
  },
): Promise<MatchReanalysisResponse> {
  const body: Record<string, string> = {};
  body.locale = options?.locale || 'tr';
  if (options?.date) {
    body.date = options.date;
  }
  if (options?.view) {
    body.view = options.view;
  }
  return fetchJson<MatchReanalysisResponse>(`/api/match/${matchId}/reanalyze`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
