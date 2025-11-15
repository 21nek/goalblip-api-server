import { API_BASE_URL } from './config';
import type { MatchDetail, MatchDetailPendingResponse, MatchListResponse } from '@/types/match';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const target = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  
  // Match detail için timeout - artık 202 dönebilir, bu yüzden daha kısa timeout yeterli
  const isMatchDetail = path.includes('/api/match/');
  const timeoutMs = isMatchDetail ? 15000 : 20000; // Match detail: 15s (202 hızlı döner), diğerleri: 20s
  
  try {
    console.log('[API] Fetching:', target);
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
      console.log(`[API] Response received in ${duration}ms:`, response.status, path);
      
      // Handle 202 Accepted (pending queue response)
      if (response.status === 202) {
        const data = await response.json();
        console.log('[API] Pending (202):', path, `(${duration}ms)`, data);
        return data as T;
      }
      
      if (!response.ok) {
        const message = await response.text().catch(() => 'Unknown error');
        const errorMsg = message || `API error ${response.status}`;
        console.error('[API] Error:', response.status, errorMsg);
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('[API] Success:', path, `(${duration}ms)`);
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
      const errorMsg = error.message;
      console.error('[API] Network error:', errorMsg, 'URL:', target);
      
      // Daha açıklayıcı hata mesajları
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network request failed')) {
        throw new Error(
          `API'ye bağlanılamıyor. Lütfen kontrol edin:\n` +
          `1. API sunucusu çalışıyor mu? (http://localhost:4000)\n` +
          `2. Mobil cihazda iseniz IP adresini kullanın: export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:4000\n` +
          `3. URL: ${target}`
        );
      }
      throw new Error(`Bağlantı hatası: ${errorMsg}. URL: ${target}`);
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[API] Request timeout:', target);
      throw new Error(
        `İstek zaman aşımına uğradı (${timeoutMs}ms). URL: ${target}\n` +
        `Lütfen kontrol edin:\n` +
        `1. API sunucusu çalışıyor mu? (http://192.168.1.106:4000)\n` +
        `2. Mobil cihaz ve bilgisayar aynı WiFi ağında mı?\n` +
        `3. Firewall API portunu engelliyor mu? (4000)`
      );
    }
    
    throw error;
  }
}

export function fetchMatchList(
  view: 'today' | 'tomorrow' = 'today',
  init?: RequestInit
): Promise<MatchListResponse> {
  const params = new URLSearchParams({ view, locale: 'tr' });
  return fetchJson<MatchListResponse>(`/api/matches?${params.toString()}`, init);
}

export function fetchMatchDetail(
  matchId: number | string,
  init?: RequestInit,
  options?: { date?: string; view?: 'today' | 'tomorrow' | 'manual' }
): Promise<MatchDetail | MatchDetailPendingResponse> {
  let url = `/api/match/${matchId}`;
  const params = new URLSearchParams();
  
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

