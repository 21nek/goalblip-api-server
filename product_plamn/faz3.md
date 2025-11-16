# Faz 3 – Prod Sertleştirme, Güvenlik ve Operasyon

## Amaç
Server tarafını prod ortamına uygun hale getirmek: cache/prefetch stratejisi, temel güvenlik (API key + rate limit), scraping job planı ve monitoring/logging. Bu faz tamamlandığında API’yi sunucuya koyup stabil şekilde çalıştırmak mümkün hale gelecek.

## Kapsam
- Batch scraping + cache yönetimi (listeleri önceden çek, istek sırasında Puppeteer tetikleme). 
- Güvenlik: basit API key, rate limit, log sanitizasyonu.
- Operasyon: pm2/systemd setup, log rotation, crash/queue monitoring.
- Config/belgeleme: `.env` / README’de prod yönergeleri.

## Yapılacaklar

### 1. Cache / Prefetch Politikasını Netleştir
- `src/services/match-storage.js` + server routes:
  - `/api/matches` çağrısı anlık scrape etmek yerine diskteki cache’e öncelik versin.
  - `refresh=true` sadece admin için (veya server-side cron), herkese açık endpoint’te 24/48h’de bir override etmesin.
  - Cron job (örn. `node scripts/prefetch-lists.js`) → her 2-3 saatte tr/en/es today+tomorrow listelerini çek.
- Doküman: `product_plamn/faz3.md` altına cron örneği yaz (örn. `0 8,12,18 * * *`).

### 2. Basit Güvenlik Katmanı
- `.env` → `API_KEY=...` tanımla.
- `server/index.js` içinde global middleware: `req.headers['x-api-key'] === process.env.API_KEY` değilse 401.
  - (Opsiyonel: health endpoint’i + admin CLI’ları haricinde zorunlu tut.)
- Rate limiting:
  - `express-rate-limit` ile IP başına `/api/match/:id` için 1dk’da X istek, `/api/matches` için daha yüksek limit.
  - Rate limit hit’lerine 429 dön.
- CORS ayarlarını `.env`’den yönet (sadece client domain’leri).

### 3. Scraper Queue & Monitoring
- `src/services/scrape-queue.js`:
  - Queue metadata’lara `locale`, `view`, `dataDate`, `headless` vs. ekle → log’lar okunaklı.
  - Hata log’larını (TimeOut, NavigationError) hem console’a hem dosyaya yaz.
- Basit monitoring script’i:
  - `npm run queue:status` → queue snapshot (`active`, `queued`, ilk 5 job label).
  - Cron/pm2 ile 10dk’da bir logla (gözlemleme). 

### 4. Deployment Hazırlığı
- `product_plamn/faz3.md` içinde minimum sunucu gereksinimi (2 vCPU / 4GB RAM / 40GB SSD) ve pm2 config anlat.
- PM2 örneği:
  ```sh
  pm2 start src/server/index.js --name goalblip-api --env production
  pm2 save
  pm2 startup
  ```
- Log rotation: pm2-logrotate veya kendi script’in.
- `.env.production` örneği: API_KEY, PORT, CORS_ORIGINS, SCRAPE_CONCURRENCY.

### 5. Observability / Error Handling
- `app.use((err, req, res, next) => { ... })` blokta: 
  - Hata mesajını sanitize et (internal bilgiyi client’a yollama).
  - Opsiyonel: Sentry veya basit webhook entegrasyonu (kritik hataları Discord/Slack’e yolla).
- Request logging: `morgan` veya custom (method, URL, locale, response time).

### 6. Test Planı / Doğrulama
- Rate limit test: aynı IP’den 10 saniyede 50 istek → 429 alıyor mu.
- API key test: key’siz request 401; doğru header gelince 200.
- PM2 restart/day test: `pm2 restart goalblip-api` → otomatik kalkıyor mu, loglar nereye gidiyor.
- Queue status script’i: job sayıları gerçek queue ile tutarlı mı.

## Notlar
- Bu fazda scraping logic’inin kendisine değil, wrapper / operasyona odaklanıyoruz.
- Faz 2 tamamlanmadan (detay i18n) prod’a çıkmak mümkün ama önerilmez; plan dosyasında sırayı hatırlat.
- Prod dokümantasyonu client takımının okuyabileceği şekilde yaz (API key nasıl alınır, hangi header, vs.).
