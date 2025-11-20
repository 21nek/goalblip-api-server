# Yapılacaklar (Server / Scraper Mimarisı)

Bu dosya, GoalBlip API sunucusunun uzun vadeli performans, stabilite ve bakım açısından geliştirilmesi için notları içerir.

## 1. Maç listesi scraping stratejisi

- **Günlük batch scrape (listeler)**
  - Yap: `today` ve `tomorrow` maç listelerini günde 1–2 kere (örn. sabah + maçlardan önce) cron/scheduler ile otomatik çek.
  - Sebep:
    - Liste JSON’ları (`data/lists/`) güncel kalır.
    - `GET /api/matches` istekleri neredeyse her zaman diskten, çok hızlı döner.
    - API isteği sırasında Puppeteer çalıştırmaya gerek kalmaz; CPU yükü job zamanlarına toplanır.

- **API’de liste için scraping’i istisna yapmak**
  - Yap: `GET /api/matches` içinde scrape’i sadece şu durumlarda çalıştır:
    - İlgili view için `data/lists/*.json` **hiç yoksa** (ilk deploy vb.).
    - Admin endpoint’iyle (veya `refresh=true`) bilerek tetiklenmişse.
  - Sebep:
    - Kullanıcı trafiği ve ağır scraping işleri birbirinden ayrılır.
    - Sunucu stabil kalır; Puppeteer patlarsa da API tarafı mümkün olduğunca etkilenmez.

## 2. Maç detayı için cache + TTL + “stale-while-revalidate”

- **Detayları disk cache’e dayandırmak**
  - Yap: `data/matches/<id>.json` mevcutsa her zaman önce bu dosyadan dön.
  - Sebep:
    - Detay endpoint’i (`/api/match/:id`) çoğu istek için sadece disk + JSON parse ile çalışır.
    - Puppeteer çağrıları minimuma iner.

- **Cache miss durumunda scraping’e izin vermek**
  - Yap: `data/matches/<id>.json` yoksa:
    - İstek sırasında **bloklayıcı** `scrapeMatchDetail` çalıştır, diske yaz, sonucu döndür.
  - Sebep:
    - Maçın datası hiç yoksa, client’ın isteği doğal olarak scraper’ı tetikleyebilmeli.
    - Kullanıcı “hiç veri yok” yerine ilk seferde biraz bekleyip taze veri alır.

- **TTL tanımlamak (maç durumuna göre)**
  - Yap: Her detay JSON’undaki `scrapedAt`’e göre TTL uygula, örnek:
    - Maça daha çok varsa: TTL 1–2 saat.
    - Maç zamanı / canlı iken: TTL 15–30 dakika.
    - Maç bittikten sonra: TTL 12–24 saat.
  - Sebep:
    - Çok sık güncellenen maçlar (özellikle canlıya yakın) daha taze tutulur.
    - Gereksiz yere aynı maçı dakikada bir yeniden scrape etmeye gerek kalmaz.

- **Stale-while-revalidate davranışı**
  - Yap: TTL dolsa bile:
    - Kullanıcı isteğinde önce **mevcut JSON’u hemen döndür** (stale olabilir).
    - Arkadan, async bir iş olarak aynı `matchId` için yeni scrape başlat ve sonucu diske yaz.
  - Sebep:
    - Kullanıcı beklemiyor, sunucu da her istekte ağır iş yapmıyor.
    - Özellikle popüler maçlarda, gelen trafik cache’i sürekli sıcak tutuyor; refresh işlemleri kontrollü kalıyor.

## 3. “Her 2 saatte bir tüm maçları scrape” fikrinin sınırları

- **Neden tüm maçları 2 saatte bir çekmek agresif?**
  - 500 maç * 5–10 sn scrape süresi:
    - Tek sayfa ile 40–80 dakika süre boyunca sürekli yüksek CPU kullanımı anlamına gelir.
  - Sebep:
    - VDS üzerindeki CPU/RAM’e ciddi yük bindirir, Node + Chromium çakışmaları riskini artırır.
    - Veri kaynağına (golsinyali) çok agresif trafik gönderir; engellenme/limitlenme riski doğar.

- **Daha mantıklı yaklaşım: öncelikli maçlar**
  - Yap:
    - Günlük listeden yalnızca belirli bir alt kümeyi (büyük ligler, öne çıkan maçlar, bugün oynanacak maçlar vb.) 2 saatte bir otomatik detay scrape et.
    - Kalan maçların detaylarını sadece:
      - İlk istek geldiğinde (lazy load),
      - Ve TTL dolup istek geldikçe arka planda tazele.
  - Sebep:
    - Önemli maçlar her zaman hızlı ve güncel olur.
    - Toplam scraping yükü kontrol altında tutulur, VDS kaynakları dengeli kullanılır.

## 4. Scraper concurrency ve stabilite

- **Concurrency limit koymak**
  - Yap:
    - Batch job’larda aynı anda en fazla X tane (ör. 2–3) Puppeteer instance / sayfa çalıştır.
    - Diğer maç scraping’lerini kuyruğa al.
  - Sebep:
    - CPU ve RAM ani patlamalarını engeller.
    - Sistem yükünün öngörülebilir ve yönetilebilir kalmasını sağlar.

- **Hata yönetimi**
  - Yap:
    - Scraping sırasında timeout/hata olduğunda job’u tamamen çökertme; sadece ilgili maçı atla ve logla.
    - Bir sonraki job’ta aynı maçı tekrar dene.
  - Sebep:
    - Tek bir maçtaki problem bütün batch’i çökerterek cache’in bayat kalmasına yol açmaz.

## 5. API güvenliği ve rate limit

- **Global API key (basit auth)**
  - Yap:
    - `.env` içinde `API_KEY=...` tut.
    - Middleware ile `Authorization: Bearer <key>` veya `x-api-key` header’ını kontrol et.
    - clientv3 sadece bu key ile istek atsın; dışarıya açık dokümantasyon paylaşma.
  - Sebep:
    - API’nin URL’si sızsa bile herkesin kafasına göre data çekmesini engeller.
    - İleride kullanıcı bazlı auth’a geçmek istenirse temel bir güvenlik katmanı zaten hazır olur.

- **Rate limiting**
  - Yap:
    - IP başına basit bir rate limit ekle (örn. `express-rate-limit`):
      - `/api/matches` için dakikada X istek,
      - `/api/match/:id` için daha sıkı limit.
  - Sebep:
    - Yanlış yapılandırılmış/bug’lı bir client ya da kötü niyetli biri sunucuyu aşırı istekle boğamaz.
    - Arka plandaki scraping logic’i beklenmedik şekilde tetiklenmez.

## 6. Deploy ve process yönetimi

- **VDS kaynak planı**
  - Önerilen başlangıç:
    - 2 vCPU
    - 4 GB RAM
    - 40 GB SSD
  - Sebep:
    - Puppeteer (Chromium) ve Node aynı anda çalışırken stabilite için makul alt sınır.

- **Process supervise**
  - Yap:
    - Prod’da `npm run server`’ı pm2 veya systemd ile yönet:
      - Crash olduğunda otomatik restart,
      - Log takibi ve basic monitoring.
  - Sebep:
    - Manuel müdahale olmadan API’nin ayakta kalma süresi (uptime) artar.

## 7. Client (mobil) ve güvenlik dengesi

- **Mobil client’in “public” olması gerçeği**
  - Not:
    - clientv3 bir mobil uygulama; build alındıktan sonra APK/IPA veya JS bundle decompile edilebilir.
    - Uygulamaya gömülen her türlü API key/token yeterince uğraşan biri tarafından **mutlaka** okunabilir.
  - Sebep:
    - Bu yüzden mobil client’teki hiçbir key “gerçek secret” olarak tasarlanmamalı.
    - Asıl güvenlik ve yetki kontrolü her zaman sunucu tarafında olmalıdır.

- **Client’te neler durabilir / durmamalı**
  - Yapılmaması gerekenler:
    - DB kullanıcı adı/şifre, upstream ücretli API token’ları, “her şeye yetkili” admin key’leri gibi kritik bilgiler app içine gömülmemeli.
  - Kabul edilebilir olanlar:
    - `BASE_API_URL` (sunucu adresi),
    - public bir `x-client-id` veya “zor ama kırılırsa da dünyanın sonu olmayan” bir `x-api-key`.
  - Sebep:
    - Bunlar çalınabilir, ama tek başına sınırsız yetki vermedikleri sürece “tanımlayıcı” olarak kullanılabilir.

- **Basit global API key’in rolü**
  - Yap:
    - clientv3 her isteğe bir `x-api-key` veya `x-client-id` gömsün.
    - Server bu değeri `.env` içindeki referans ile karşılaştırarak *ilk filtre* olarak kullansın.
  - Sebep:
    - Script kiddie seviyesindeki basit istekleri (tarayıcıdan rastgele vurma, basit bot’lar) eler.
    - Loglar üzerinden “kim bu istekleri atıyor?” sorusuna temel cevap sağlar.
  - Sınırlama:
    - Bu key hiçbir zaman tek başına güvenlik garantisi değildir; çalınabilir kabul edilip öyle tasarlanmalıdır.

- **Kullanıcı bazlı auth (ileride)**
  - Yap:
    - İleride daha güçlü güvenlik istenirse:
      - `/auth/login` benzeri endpoint ile kullanıcı girişi (email/şifre vb.),
      - Başarılı login sonrası JWT/access token üretimi,
      - Sonraki isteklerde `Authorization: Bearer <token>` kontrolü.
  - Sebep:
    - “API’yi sadece benim kullanıcılarım kullanabilsin” ihtiyacını çözer.
    - Kötü kullanım tespit edilirse kullanıcı bazlı veya IP bazlı olarak erişim kesilebilir.

- **Rate limit ile birleşik güvenlik**
  - Yap:
    - API key + (ileride) kullanıcı token + IP bazlı rate limit kombinasyonu kullan:
      - Örn. user başına / IP başına dakikada belirli sayıda `match/:id` isteği.
  - Sebep:
    - App içinde bir key sızsa bile:
      - Saldırgan “normal kullanıcı” seviyesini aşamaz,
      - Sınırsız scraping yapamaz; limitleri zorladığında ban/engelleme uygulanabilir.

- **Genel hedef**
  - Kullanıcı deneyimine zarar vermeden:
    - clientv3’ün rahat ve hızlı data çekebilmesini sağlamak,
    - Aynı anda API’nin “herkese açık ve sınırsız sömürülebilen” bir uç nokta haline gelmesini engellemek.
  - Önerilen denge:
    - Kısa vadede: global `x-api-key` + IP rate limit.
    - Orta vadede: kullanıcı bazlı login + token + daha ince rate limit politikaları.

