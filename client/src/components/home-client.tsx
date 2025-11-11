'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MatchExplorer from './match-explorer';
import { fetchMatchDetail, fetchMatchList, getApiBaseUrl } from '@/lib/api';
import type { MatchDetailResponse, MatchListResponse } from '@/types/golsinyali';

const STORAGE_KEY = 'goalblip-demo-api-base';

export default function HomeClient() {
  const [apiField, setApiField] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [status, setStatus] = useState<{ kind: 'idle' | 'loading' | 'error' | 'success'; message?: string }>({
    kind: 'idle',
  });
  const [today, setToday] = useState<MatchListResponse | null>(null);
  const [tomorrow, setTomorrow] = useState<MatchListResponse | null>(null);
  const [initialDetail, setInitialDetail] = useState<MatchDetailResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const fallback = saved || getApiBaseUrl();
    setApiField(fallback);
    setApiBase(fallback);
  }, []);

  const handleLoad = useCallback(async () => {
    if (!apiField) {
      setStatus({ kind: 'error', message: 'Önce API adresini girmelisin.' });
      return;
    }

    setStatus({ kind: 'loading', message: 'Veriler çekiliyor...' });
    try {
      const [todayList, tomorrowList] = await Promise.all([
        fetchMatchList('today', apiField),
        fetchMatchList('tomorrow', apiField),
      ]);

      if (!todayList && !tomorrowList) {
        throw new Error('API yanıt vermedi.');
      }

      setToday(todayList);
      setTomorrow(tomorrowList);

      const featuredId =
        todayList?.matches?.[0]?.matchId ?? tomorrowList?.matches?.[0]?.matchId ?? null;

      if (featuredId) {
        const detail = await fetchMatchDetail(featuredId, apiField);
        setInitialDetail(detail);
      } else {
        setInitialDetail(null);
      }

      setApiBase(apiField);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, apiField);
      }

      setReloadKey(Date.now());
      setStatus({ kind: 'success', message: 'Veriler güncellendi.' });
    } catch (error) {
      console.error(error);
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.',
      });
    }
  }, [apiField]);

  const helperText = useMemo(() => {
    if (status.kind === 'loading') {
      return status.message ?? 'Yükleniyor...';
    }
    if (status.kind === 'error') {
      return status.message;
    }
    if (status.kind === 'success') {
      return status.message;
    }
    return 'Örn: http://localhost:4000';
  }, [status]);

  return (
    <>
      <section className="panel">
        <h2>API Sunucusu</h2>
        <p>Demo istemci hangi API tabanına bağlanacağını bilsin diye adres gir.</p>
        <div className="api-form">
          <input
            type="text"
            placeholder="http://localhost:4000"
            value={apiField}
            onChange={(event) => setApiField(event.target.value)}
          />
          <button type={status.kind === 'loading' ? 'button' : 'submit'} onClick={handleLoad} disabled={status.kind === 'loading'}>
            {status.kind === 'loading' ? 'Yükleniyor...' : 'Verileri Yükle'}
          </button>
        </div>
        <small className={`helper ${status.kind}`}>{helperText}</small>
      </section>

      {apiBase && (today || tomorrow) ? (
        <MatchExplorer
          today={today}
          tomorrow={tomorrow}
          initialDetail={initialDetail}
          apiBaseUrl={apiBase}
          reloadKey={reloadKey}
        />
      ) : (
        <section className="panel">
          <p>Önce API adresini girip verileri yükle.</p>
        </section>
      )}
    </>
  );
}
