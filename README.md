# GoalBlip API Server

GoalBlip API sunucusu, [golsinyali.com](https://www.golsinyali.com) kaynağından maç listesi ve maç detayı verilerini Puppeteer ile kazıyıp `data/` altında JSON dosyalarına kaydeder ve Express tabanlı bir REST API üzerinden sunar. Bu repo yalnızca sunucu tarafını kapsar; `client/` dizini ayrı bir Next.js arayüzüdür ve burada dokümante edilmez.

---

## İçindekiler
1. [Özellikler](#özellikler)
2. [Mimari Genel Bakış](#mimari-genel-bakış)
3. [Dizin Yapısı](#dizin-yapısı)
4. [Gereksinimler & Kurulum](#gereksinimler--kurulum)
5. [Çevre Değişkenleri](#çevre-değişkenleri)
6. [Çalıştırma & Geliştirme Akışı](#çalıştırma--geliştirme-akışı)
7. [Veri Yaşam Döngüsü](#veri-yaşam-döngüsü)
8. [API Referansı](#api-referansı)
9. [Veri Şeması](#veri-şeması)
10. [Scraper & Script Komutları](#scraper--script-komutları)
11. [Hata Yönetimi ve İzleme](#hata-yönetimi-ve-izleme)
12. [Test & Doğrulama Stratejisi](#test--doğrulama-stratejisi)
13. [Dağıtım Notları](#dağıtım-notları)
14. [Faydalı İpuçları](#faydalı-ipuçları)

---

## Dok�man Ar�ivi
Da��t��m, ��r�n ve yol haritas�� notlar�� docs/ alt��nda toplan��r:

- docs/ops/deployment-guide.md – Sunucu kurulum/da��t��m ak��lar�� ve Cloudflare proxy detaylar�� (docs/ops/cloudflare-setup.md).
- docs/product/product-research.md & docs/product/i18n-cleanup-plan.md – ��r�n gereksinimleri, pazar notlar�� ve i18n refakt�r planlar��.
- docs/roadmap/todo.md – G�ncel backlog / yap��lacaklar listesi.

Yeni dok�manlar eklerken ayn�� dizin yap��s��n�� kullan��n.

---



## Özellikler
- ⚽️ **Maç listesi kazıma**: `today` ve `tomorrow` görünümleri için sonsuz kaydırmalı listeyi tarar, normalize eder ve sıralar.
- 📊 **Maç detayı kazıma**: Skor tablosu, öne çıkan tahminler, detaylı tahminler, oran trendleri, yaklaşan maçlar ve structured data bloklarını çıkarır.
- 💾 **Yerel JSON deposu**: `data/lists` ve `data/matches` dizinlerinde tarih bazlı veya alias dosyaları saklanır; API çağrıları diskten okunur.
- 🛣️ **Express 5 API**: Listeyi tarihe veya görünüme göre döndürür, gerektiğinde yeniden kazıma tetikler ve match detail endpoint'i sağlar.
- 🧰 **CLI ve yardımcı scriptler**: Manuel kazıma, örnek veri üretimi ve statik UI sunucusu için npm script'leri.
- ♻️ **Otomatik fallback'ler**: Veri bulunamadığında API, scraper'ı otomatik tetikleyerek taze veri üretir.

## Mimari Genel Bakış
Sunucu akışı üç ana katmandan oluşur:

```
┌──────────┐      ┌──────────────┐      ┌─────────────┐      ┌────────────┐
│ Scrapers │ ---> │ Match Storage│ ---> │ Express API │ ---> │ Consumers  │
└──────────┘      └──────────────┘      └─────────────┘      └────────────┘
   (Puppeteer)         (JSON)                (REST)             (UI, Cron)
```

1. **Scrapers (`src/scrapers/golsinyali/…`)**: Puppeteer ile GolSinyali sayfalarını açar, içerikleri DOM üzerinden parse eder; liste ve detay için ayrı modüller bulunur.
2. **Storage Servisi (`src/services/match-storage.js`)**: Scraper çıktısını diske yazar, alias dosyaları (latest/upcoming) günceller ve okuma işlemlerini üstlenir.
3. **Express API (`src/server/index.js`)**: HTTP katmanı; gelen isteğe göre önce diski yoklar, gerekirse scraper tetikler, sonuçları döndürür.

Ek olarak `src/utils/data-store.js` klasör yapısını oluşturur ve JSON okuma/yazma yardımcılarını sağlar. `src/cli` script'leri doğrudan scraper modüllerini kullanır. `src/gui/server.js` ise `ui/` klasöründeki statik çıktıyı ve `data/` içeriğini servisler.

## Dizin Yapısı
```text
.
├── data/                 # JSON veri deposu (otomatik oluşturulur)
│   ├── lists/            # Tarih bazlı ve alias maç listeleri
│   └── matches/          # Match detail JSON dosyaları
├── src/
│   ├── cli/              # Manuel kazıma için komut satırı araçları
│   ├── gui/              # Statik UI servisleyicisi (client verilerini gösterir)
│   ├── scrapers/         # GolSinyali list & detail scraper'ları
│   ├── scripts/          # Yardımcı scriptler (ör. örnek veri üretimi)
│   ├── server/           # Express API
│   ├── services/         # Dosya tabanlı depo servisleri
│   └── utils/            # Ortak yardımcılar (örn. data-store)
└── ui/                   # Derlenmiş istemci çıktısı (doküman kapsamı dışında)
```

## Gereksinimler & Kurulum
- Node.js 18+ (Puppeteer 24 ile uyumlu)
- NPM 9+ (veya pnpm/yarn; örnekler npm ile)
- Chromium bağımlılıkları (Puppeteer ilk kurulumda indirir)
- macOS, Linux veya WSL 2 ortamı; Windows yerel kurulumu için ek Chromium bağımlılıklarını yüklemek gerekebilir.

Kurulum:
```bash
npm install
```

Puppeteer Chromium indirirken ağ erişimi gerektiğinden kapalı ortamlarda `PUPPETEER_SKIP_DOWNLOAD=1` geçirip kendi Chromium path'inizi ayarlamalısınız (`puppeteer.launch({ executablePath })`).

## Çevre Değişkenleri
| Ad | Açıklama | Varsayılan |
| --- | --- | --- |
| `PORT` | API sunucu portu | `4000` |
| `HOST` | Bind adresi | `0.0.0.0` |
| `CORS_ORIGINS` | Virgülle ayrılmış izinli origin listesi. `*` desteklenir. | `*` |

GUI sunucusu (`npm run gui`) de `PORT` değişkenini kullanır fakat fallback değeri `4173`tür; aynı anda çalıştıracaksanız GUI için `PORT=4173` gibi bir override verin.

## Çalıştırma & Geliştirme Akışı
```bash
# Express API'yi başlatır
npm run server

# Aynı komut start alias'ıdır
npm start
```

Sunucu açıldığında `data/` dizinini oluşturur ve log'da örnek `curl` komutlarını gösterir:
```
curl http://localhost:4000/api/health
curl http://localhost:4000/api/matches?view=today
curl -X POST http://localhost:4000/api/matches/scrape -H 'Content-Type: application/json' -d '{"view":"today"}'
curl http://localhost:4000/api/match/<id>
```

Başlıca geliştirme akışı:
1. `npm run data:sample` ile lokal veri oluştur (opsiyonel).
2. `npm start` ile API'yi çalıştır.
3. CLI komutları ile manuel kazıma veya debug yap.
4. Gerekirse `npm run gui` ile statik UI'yi açıp `http://localhost:4173/data/…` üzerinden JSON dosyalarını görüntüle.

## Veri Yaşam Döngüsü
1. **Kazıma**: `scrapeMatchList`/`scrapeMatchDetail` Puppeteer tarayıcı açar, DOM'dan veri toplar, normalize eder.
2. **Kaydetme**: `saveMatchList`/`saveMatchDetail` `data/` altında ilgili JSON dosyalarına yazar; alias dosyaları (latest/upcoming) güncellenir.
3. **Sunma**: Express API talep geldiğinde önce diskten (`loadMatchListByDate`, `loadMatchListByView`, `loadMatchDetail`) okur.
4. **Mecburi Yenileme**: Veri yoksa veya `refresh=true` parametresi gelirse scraper tekrar çalışır, sonuçlar kaydedilir ve yanıt döner.
5. **İstemci Kullanımı**: UI veya üçüncü parti servisler JSON'u tüketir; `client/` uygulaması bu API'yi kullanır.

Disk tabanlı saklama sayesinde sunucu restart'larında veri korunur. Production ortamda `data/` dizinini kalıcı depolama (ör. volume) olarak bağlayın.

## API Referansı

### GET `/api/health`
Temel sağlık bilgisi döner.

```json
{
  "status": "ok",
  "timestamp": "2025-11-11T01:00:00.000Z",
  "uptime": 123.456
}
```

### GET `/api/matches`
Parametreler:
- `view`: `today` (varsayılan) veya `tomorrow`.
- `date`: `YYYY-MM-DD` formatında spesifik gün. `view` verilmezse alias dosyalarından okunur.
- `refresh`: `true` gönderilirse canlı kazıma yapar.
- `locale`: GolSinyali dil segmenti (`tr`, `en` vb.).

Davranış:
1. `refresh=true` ise anlık kazıma yapıp veriyi kaydeder.
2. `date` varsa ilgili tarih dosyası okunur.
3. Aksi halde alias (`latest`/`upcoming`) dosyası okunur.
4. Hiç veri yoksa otomatik kazıma fallback'i devreye girer.

Yanıt örneği (`data/lists/2025-11-11.json`):
```json
{
  "view": "today",
  "dataDate": "2025-11-11",
  "locale": "tr",
  "totalMatches": 171,
  "matches": [
    {
      "order": 1,
      "matchId": 2776277,
      "league": "Argentine Division 1",
      "kickoffTime": "01:00",
      "statusLabel": null,
      "homeTeam": "Deportivo Riestra",
      "homeSideCode": "E",
      "awayTeam": "Independiente",
      "awaySideCode": "D"
    }
  ]
}
```

### POST `/api/matches/scrape`
Body:
```json
{
  "view": "today",
  "locale": "tr",
  "headless": "new"
}
```
Formattı `scrapeMatchList` parametreleriyle aynıdır. Kazınan veri kaydedilir, özet bilgi döner:
```json
{
  "message": "Maç listesi güncellendi.",
  "view": "today",
  "dataDate": "2025-11-11",
  "total": 171
}
```

### GET `/api/matches/:date`
`/api/matches/2025-11-11` gibi spesifik tarih dosyasını döner. Dosya yoksa 404.

### GET `/api/match/:matchId`
Önce `data/matches/<id>.json` okunur. Yoksa ilgili maç meta verisi (`today`/`tomorrow` listeleri) taranır, `scrapeMatchDetail` ile canlı veri çekilip kaydedilir.

Yanıt şeması (`data/matches/2776277.json`):
```json
{
  "locale": "tr",
  "matchId": 2776277,
  "url": "https://www.golsinyali.com/tr/match/2776277/deportivo-riestra-independiente",
  "scrapedAt": "2025-11-11T00:57:49.576Z",
  "scoreboard": {
    "leagueLabel": "",
    "statusBadges": [],
    "homeTeam": { "name": "Deportivo Riestra", "score": 0, "logo": "…" },
    "awayTeam": { "name": "Independiente", "score": 1, "logo": "…" },
    "halftimeScore": "0-0",
    "info": []
  },
  "highlightPredictions": [ { "position": 1, "title": "Maç Sonucu", "pickCode": "MSX" } ],
  "detailPredictions": [ { "position": 1, "title": "Maç Sonucu (1X2)", "confidence": 87 } ],
  "oddsTrends": [ { "title": "Maç Sonucu", "cards": [ … ] } ],
  "upcomingMatches": [],
  "structuredData": {
    "sportsEvent": { "@type": "SportsEvent", … },
    "faqPage": null,
    "article": null,
    "breadcrumbs": null,
    "raw": [ … ]
  },
  "lastUpdatedAt": "11.11.2025 00:25"
}
```

### POST `/api/match/:matchId/scrape`
Body alanları:
- `locale`, `slug`, `headless`
- `homeTeamName`, `awayTeamName` (slug üretiminde yardımcı, özellikle aksanlı karakterler için)

Kazıma sonrası dosya güncellenir ve 201 döner.

## Veri Şeması
### Listeler (`data/lists/*.json`)
| Alan | Açıklama |
| --- | --- |
| `view` | `today` veya `tomorrow` |
| `dataDate` | `YYYY-MM-DD` |
| `locale` | GolSinyali dil kodu |
| `url` | Kaynağın tam URL'si |
| `scrapedAt` | ISO tarih |
| `totalMatches` | Tam sayı |
| `matches` | Aşağıdaki alanlara sahip dizi |

`matches[]` alanları: `order`, `matchId`, `league`, `kickoffTime`, `statusLabel`, `homeTeam`, `homeSideCode`, `awayTeam`, `awaySideCode`.

### Match detail (`data/matches/*.json`)
- `scoreboard`: Lig etiketi, rozetler, skor, kickoff bilgileri.
- `highlightPredictions`: Kart başlığı, pick kodu, başarı yüzdesi, rating, kilitli olup olmadığı.
- `detailPredictions`: Tahmin adı, güven puanı, her outcome için yüzdeler.
- `oddsTrends`: Grup/kart yapısında oran trend tablosu.
- `upcomingMatches`: Takıma göre yaklaşan maç kartları.
- `structuredData`: Sayfadaki `application/ld+json` blokları (SportsEvent, FAQ, Article vb.).
- `lastUpdatedAt`: Sayfa footer'ındaki güncelleme etiketi.

## Scraper & Script Komutları
| Komut | Açıklama |
| --- | --- |
| `npm run scrape:matches -- --view=tomorrow --locale=en --pretty` | CLI çıktısı olarak maç listesi döner. Ek bayraklar: `--headless=false`, `--timeout=60000`, `--scroll-delay=200`, `--max-scrolls=500`. |
| `npm run scrape:detail -- <matchId> --slug=deportivo-riestra-independiente --pretty` | Tek maç detayını stdout'a basar. Opsiyonel `--home`, `--away`, `--headless=false`. |
| `npm run data:sample` | Bugünün ve yarının listelerini kazır, alias dosyalarını doldurur, ilk maçın detayını kaydeder. |
| `npm run gui` | `ui/` dizinini ve `data/` içeriğini servisleyen basit HTTP sunucu (static viewer). |

> CLI komutları doğrudan `src/scrapers/golsinyali` modüllerini çağırır; bu yüzden API sunucusu çalışmadan da veri toplayabilirsiniz.

## Hata Yönetimi ve İzleme
- Express middleware'i tüm hataları yakalayıp 500 yanıtı döner (`src/server/index.js`). Hata mesajı JSON olarak iletilir, ayrıntı log'a basılır.
- Dosya okuma/yazma sırasında ENOENT hataları `readJsonFile` içinde `null` dönecek şekilde ele alınır; böylece API fallback başlatabilir.
- Scraper hataları CLI seviyesinde `process.exit(1)` ile çıkar; API içinde yakalanıp `next(error)` ile middleware'e iletilir.
- Üretimde aşağıdakileri eklemeniz önerilir:
  - Bunyan/Pino tarzı bir logger ile yapılandırılmış loglar.
  - Puppeteer tarafında `logger` parametresi ile özel log forward'ı.
  - Process manager (PM2/systemd) ile restart politikaları ve health check entegrasyonu.

## Test & Doğrulama Stratejisi
Projede otomatik test bulunmuyor. Aşağıdaki manuel akış önerilir:
1. `npm run scrape:matches -- --view=today --pretty` çalıştır; çıktı JSON'unu `jq` ile doğrula.
2. `npm run scrape:detail -- <matchId> --pretty` çalıştır; kritik alanların boş gelmediğini kontrol et.
3. API'yi açıp `curl /api/matches?view=today` ve `curl /api/match/<id>` istekleriyle diskten okuma + fallback yollarını test et.
4. `refresh=true` parametresi ile zorla kazıma tetikleyip `data/` dizininde dosyanın güncellendiğini doğrula (örn. `stat data/lists/latest.json`).

İleriye dönük test önerileri:
- Scraper çıktılarını fixture'larla karşılaştıran jest testleri (DOM snapshot'ı zorluğu göz önüne alınarak).
- `data-store` yardımcıları için dosya okuma/yazma birim testleri.
- Express API için supertest tabanlı uç testleri (Puppeteer yerine mock storage ile).

## Dağıtım Notları
- **Durable storage**: `data/` klasörünü volume olarak bağlayın; aksi halde pod/container yeniden başlayınca veri kaybolur.
- **Concurrency**: Aynı anda birden fazla scraper tetiklemek dosya çakışması yaratabilir; queue/lock mekanizması eklemeyi düşünebilirsiniz.
- **Cron**: `npm run scrape:matches -- --view=today` ve `--view=tomorrow` komutlarını ayrı cron job olarak tetikleyip API'yi sadece dosyadan okutmak mümkün.
- **Ortam**: Puppeteer kullanıldığı için Alpine tabanlı imajlar yerine Debian/Ubuntu tabanlı Node imajı tercih edin veya gerekli paketleri kurun (`chromium`, `nss`, `freetype2`, `ca-certificates` vb.).
- **Reverse proxy**: Express API ve GUI aynı makinede koşacaksa farklı portlar veya path bazlı proxy kullanın; GUI statik dosya servislediğinden caching enable edilebilir.

## Faydalı İpuçları
1. Yeni bir ortamda önce `npm run data:sample` çalıştırarak yerel veri gövdesi oluşturun; böylece API ilk çağrıda dosya bulur.
2. Cron benzeri bir görevle `npm run scrape:matches -- --view=today` komutunu tetikleyip sonuçları API üzerinden servis edebilirsiniz.
3. GUI sunucusu (`npm run gui`) yalnızca statik dosyaları sunar; gerçek zamanlı değil. API ile birlikte reverse proxy arkasında koştururken yolları ayırın.
4. `maxScrolls` ve `scrollDelayMs` değerlerini maç yoğunluğuna göre ayarlayın; gereksiz yüksek değerler kazıma süresini uzatırken düşük değerler eksik maçla sonuçlanabilir.
5. Match detail slug'ları için `homeTeamName`/`awayTeamName` parametreleri kullanmak aksanlı karakterleri normalize ettiği için 404 riskini azaltır.

## Privacy Policy
GoalBlip uygulamasi ve API altyapisinin gizlilik politikasi icin https://www.goalblip.com/en/privacy-policy adresini kullanabilirsiniz.

