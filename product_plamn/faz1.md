# Faz 1 – Çok Dilli UI ve Analiz Altyapısı

## Amaç
Mobil uygulamanın (GoalBlip clientv3) tüm kullanıcı-facing metinlerini i18n altyapısına taşımak, maç detayındaki analiz cümlelerini de seçilen dilde üretmek. Bu faz tamamlandığında kullanıcı hangi dili seçerse, liste ekranı, hata mesajları ve maç detayındaki analiz blokları o dilde görünecek.

## Kapsam
- `LocaleProvider` + `useTranslation` mevcut yapısını kullanmak.
- Tüm hard-coded Türkçe stringleri `t('...')` çağrılarına taşımak.
- `match-analysis.ts` gibi hesaplayıcı modüllerin string yerine çeviri key/param döndürmesini sağlamak.
- Tarih/saat formatlarını seçilen locale’e göre göstermek.
- Hata/empty state mesajlarının tamamını i18n’e almak.

## Yapılacaklar

### 1. Translation Dosyalarını Genişlet
- `clientv3/lib/i18n/translations/` altında:
  - `tr.json`: Mevcut stringler + analiz cümleleri için yeni keyler.
  - `en.json` ve `es.json`: Aynı key setine karşılık gelen çeviriler.
- Yeni namespace önerileri:
  - `matchDetail.insights.*` (yüksek galibiyet, streak vs.)
  - `matchDetail.quickSummary.*` (ana tahmin, güven seviyesi ifadeleri)
  - `matchDetail.teams.fallbackHome`, `.fallbackAway`
  - `matchDetail.messages.cache`, `.pending`, `.locked`

### 2. `match-analysis.ts` Refaktoru
- `KeyInsight` tipini güncelle: `message: string` yerine `translationKey: string` + `params`.
- `extractKeyInsights`, `getQuickSummary`, `compareTeams` gibi fonksiyonlar:
  - Hard-coded TR string üretimi yerine, hangi cümlenin gösterileceğini key/param olarak döndürsün.
  - UI’da `const t = useTranslation();` → `t(insight.translationKey, insight.params)` şeklinde render edilsin.
- Quick Summary örneği:
  ```ts
  return {
    mainPredictionKey: comparison.prediction === 'home'
      ? 'matchDetail.quickSummary.home'
      : comparison.prediction === 'away'
      ? 'matchDetail.quickSummary.away'
      : 'matchDetail.quickSummary.balanced',
    confidenceKey: confidence >= 75
      ? 'matchDetail.quickSummary.highConfidence'
      : ...,
    suffixKey: comparison.homeAdvantage > 10
      ? 'matchDetail.quickSummary.homeAdvantageSuffix'
      : comparison.homeAdvantage < -10
      ? 'matchDetail.quickSummary.awayAdvantageSuffix'
      : null,
    params: { team: homeTeamName ?? t('matchDetail.teams.fallbackHome') },
    outcomes: ...,
  };
  ```

### 3. Match Detail UI Güncellemeleri
- `app/matches/[matchId].tsx`:
  - Tarih/saat formatı: `new Date(...).toLocaleDateString(locale, ...)`.
  - Fallback takım adları `t('matchDetail.teams.fallbackHome')`.
  - Quick Summary, Insights, Team Comparison kartlarına gelen veriler artık `key + params`; hepsi `t(...)` ile render edilcek.
  - “Tahmin analizi Türkçe’de mevcut” gibi mesajlar translation’dan gelsin.

### 4. Liste / HomeScreen Stringleri
- Tabs (“Bugün”, “Yarın”), boş state mesajları, filtre butonları vs. halihazırda JSON’da var; `.tsx` dosyalarında hepsi `t('home.*')` kullanacak şekilde temizle (hard-coded string kalmasın).

### 5. Hata Mesajları & Hata Logları
- `lib/api.ts`, `matches-provider.tsx`, `match-detail` ekranındaki hata/empty state mesajlarını i18n’den çek:
  - `t('errors.timeout', { timeoutMs })`
  - `t('errors.network')`
  - `t('home.dataLoadErrorMessage')`

### 6. Test Planı
- Dil değiştirme (Initial Setup ekranı + Settings) → TR/EN/ES.
- Liste ekranı tabs + filtreler + hata durumları.
- Maç detayında:
  - Scoreboard fallback metinleri.
  - Quick summary, Key insights, prediction blokları.
  - “Analiz Türkçe’de” uyarısı (diğer dillerde de çevirisi).
- Tarih/saat meta info: locale değişince format değişiyor mu?
- Device restart sonrası dil/timezone ayarlarının sürmesi (AsyncStorage).

## Notlar
- Faz 1 tamamen client tarafında; server değişikliği gerekmiyor.
- Key oluşturmada parametre isimlerine dikkat ( `{team}`, `{winRate}` ) — translation JSON’larında bire bir uyuşmalı.
- Çevirileri önce TR → EN → ES sırayla ekle; eksik key olduğunda `console.warn`’dan takip edebilirsin.
- Sonraki fazda (Faz 2) server tarafında detail scraper heading i18n, Faz 3’te güvenlik/rate limit vb. ele alınacak.
