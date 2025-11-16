# Faz 2 – Golsinyali Detay Scraper Çok Dillilik

## Amaç
Golsinyali match detail scraper’ının ( `src/scrapers/golsinyali/match-detail.js` ) sadece Türkçe başlıklara bağımlı olmayan, tüm desteklenen locale’lerde (tr, en, es, es-ES, es-AR) aynı veri bloklarını çıkartabilmesini sağlamak. Bu fazla birlikte client’te `locale=en/es` seçildiğinde detay response’unda `highlightPredictions`, `detailPredictions`, `oddsTrends`, `upcomingMatches`, `lastUpdatedAt` gibi alanlar boş kalmayacak.

## Kapsam
- Scraper’daki heading/section seçimlerini i18n/structure odaklı hale getirmek.
- Detail endpoint storage’ının locale-aware olduğu kısımları **TR fallback** ile tutarlı hale getirmek (önceki JSON’lar okunabilir kalsın).
- Scraper queue & API log’larını locale bazlı raporlamak (hata ayıklaması kolay olsun).

## Yapılacaklar

### 1. Heading i18n Haritaları
- `src/scrapers/golsinyali/i18n/headings.js` oluştur.
  - Örnek mapping:
    ```js
    const HEADINGS = {
      highlight: {
        tr: ['Öne Çıkan Tahminler'],
        en: ['Highlighted Predictions'],
        es: ['Pronósticos Destacados'],
        // ... es-ES, es-AR → aynı array
      },
      detailed: { ... },
      odds: { ... },
      upcoming: { ... },
      lastUpdatedRegex: {
        tr: /G[üu]ncelleme/, en: /Update|Updated/, es: /Actualización/,
      }
    };
    ```
- `match-detail.js`’deki `findHeading('Öne Çıkan Tahminler')` çağrılarını `findHeading(HEADINGS.highlight[locale])` ile değiştir.
- `normalizeLocale` fonksiyonunu kullanarak `es`/`es-ES`/`es-AR` aynı array’e map et.

### 2. Yapısal Selector Alternatifleri
- Sadece heading text’e güvenemediğimiz durumlar için `class`/layout bazlı fallback:
  - Highlight grid: `.grid.grid-cols-1 md:grid-cols-2` + kart içindeki rating span’leri (`class*="bet-yellow"`).
  - Detailed predictions: `.space-y-2` bloklar vb.
  - Odds bölümü: `.odds` class’ları, ikonlar.
- Strategy: önce heading listesi → bulamazsa class tabanlı fallback.

### 3. Last Updated Parsing
- Şu an regex `/G[üu]ncelleme/` → EN/ES için `Updated`, `Actualización` regex’leri eklenmeli.
- `scoreboard.footer` gibi structural fallback’ler kontrol edilmeli; her locale’de aynı DOM var mı (inspect script’leri kullan).

### 4. Inspect / Test Script’leri
- Halihazırda repo’da `inspect-headings.mjs`, `inspect-language-buttons.mjs` vb. script’ler var. Bunları:
  - Her locale için heading listesini dump eden bir script (ör. `inspect-headings.mjs --locale=en`).
  - Bu script’lerin output’unu commit’e dahil et (doc/reference için).

### 5. Storage / API Kontrolü
- `saveMatchDetail` şu an `locale` + `dataDate` path’ine yazıyor (örn. `data/matches/en/2025-11-15/12345.json`).
- `loadMatchDetail` fallback sırası:
  1. `locale + date`
  2. `locale + view alias`
  3. `locale + root`
  4. TR fallback (bb.
- Bu faz boyunca JSON formatını değiştirmiyoruz; sadece data doldurmasını (non-empty) sağlıyoruz.

### 6. Logging & Monitoring
- Scraper queue log’ları şu an `[scrape-queue] starting match:12345@2025-11-15`. Log’a locale ekle:
  - `label: match:12345@2025-11-15:es`
- API log (kendi monitoring): `console.log`/winston vs. ile `locale/view/queue time` bilgisi kaydedilebilir.

### 7. Test Planı
- Manuel test: `npm run scrape:detail -- --locale=en 2758845` (ve es/es-ES/es-AR). Alanların dolu olduğunu doğrula (`highlightPredictions.length > 0`).
- API test: `curl /api/match/2758845?locale=en&timezone=UTC` → scoreboard + predictions dolu mu?
- Eski TR dataset’lerini `loadMatchDetail` ile tekrar okuyup, `locale=tr` fallback’in bozulmadığını doğrula.
- Queue test: `POST /api/match/:id/scrape` body’sine `locale=en` verilip, diskte `data/matches/en/...` dosyasının oluştuğunu kontrol et.

## Gerekenler & Notlar
- Bu faz server odaklı; client sadece yeni JSON verilerini kullanacak (Faz 1 ile UI i18n bitmiş olacak).
- Hem heading dictionary hem de structural fallback’leri inspect script’leriyle doğrulamak önemli; Golsinyali sayfaları SSR/CSR mix olduğu için (Next.js), buton/heading text’leri runtime’da load olabilir → `ensureView` / `waitForSelector` logic’i locale başına tekrar test edilmeli.
- Faz 2 bitince client’te “Bu bölüm şu an sadece Türkçe’de mevcut” uyarıları da kaldırılabilir.
