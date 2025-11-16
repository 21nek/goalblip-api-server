## Amaç
Match detail ekranında hâlâ Türkçe kalan veya kaynaktan gelen metinleri, yeni i18n altyapısıyla uyumlu hale getirmek. Bu plan, hangi bileşenlerde çeviri ihtiyacı olduğunu, hangi anahtarların sözlük dosyalarına eklenmesi gerektiğini ve nasıl test edileceğini listeler.

## Faz 1 – UI & Analiz Metin Temizliği
### Hedef
Client tarafında render edilen tüm statik stringleri i18n sözlüklerine taşımak; maç analiz cümleleri dahil bütün metinlerin locale’ye göre değişmesini sağlamak.

### Yapılacaklar
1. **Bileşen Taraması ve Envanter**  
   - `rg -n "[ıİçÇöÖşŞğĞ]" clientv3/app clientv3/components -g'*.tsx'` ile kalan TR literal’lerini listele.  
   - `fikir.txt`/`I18N_IMPLEMENTATION_PLAN.md` notlarıyla karşılaştırıp eksik ekranları işaretle (HomeScreen, favorites, profile, settings, onboarding, EmptyState, vs.).
2. **Translation JSON Genişletmesi**  
   - matchDetail: teams.*, analysis.insights.*, analysis.quickSummary.*, goalAnalysisCard, riskAnalysisCard, strengthsWeaknessesCard, visualComparisonCard, recentFormCard, formStatsCard, oddsTrendCard.  
   - matchesScreen, favoritesScreen, profile, initialSetup, settings.* (locale/timezone label’ları).  
   - errors.*, common.* (minutes/hours kısaltmaları, “Unknown” fallback’leri).
3. **Analiz Mantığı Refaktörü**  
   - `match-analysis.ts`: tüm mesajları `key + params` modeliyle üret, UI t(key, params) ile çevirecek.  
   - `match-helpers.ts`: highlight predictions & timeSince için translator destekle.  
   - `app/matches/[matchId].tsx`: quickSummary, insights, form fallback’leri, upcoming/odds title’ları `t()` üzerinden gelsin.
4. **Genel UI Temizliği**  
   - AppShell + bottom nav, FilterSection, LeagueSelectionModal, MatchCard, AIShortlistCard, TopLeagueCard, Favorites, Matches list vb. bileşenlerin tüm metinlerini i18n’e bağla.  
   - Hata mesajları: `lib/api.ts` kodlu error’lar, `matches-provider`, `EmptyState` mesajları translation key’leri kullansın.
5. **Yerelleştirilmiş Tarih/Saat**  
   - `match.kickoffTimeDisplay`, “Son güncelleme” gibi alanları `Intl.DateTimeFormat(locale, { timeZone })` ile formatla.  
   - `timeSince` fonksiyonu `Intl.RelativeTimeFormat` ile yazılıp `locale` parametresi almalı.
6. **Test & QA**  
   - Profil > Dil: TR→EN→ES geçişinde Home, Favorites, Match Detail, Settings ekranları manuel kontrol.  
   - `npx tsc --noEmit` (tasarlanan type fix’leri sonrası temiz olmalı).  
   - `npm start` ile Expo Go’da iki platformda smoke test.

### Çıktılar
- Tüm client metinleri translation JSON’larına taşınmış olacak.
- Analiz cümleleri (Key Insights, Quick Summary, fallback isimler) seçilen dilde üretilecek.
- TYPE CHECK (tsc) ve manuel QA ile doğrulanmış Faz 1 tamamlanmış olacak.

## Faz 2 – Dinamik Veri & Scraper Entegrasyonu
### Hedef
Sunucudan gelen verilerin (scoreboard, odds, upcoming, status label’ları) seçilen locale ile uyumlu gelmesini sağlamak; gerekirse client tarafında mapping tablosu ile TR kalıntılarını çevirmek.

### Yapılacaklar
1. **Status/Badge Normalizasyonu**  
   - Golsinyali TR’den dönen status label’larını (`Canlı`, `Maç Bitti`, `Hazırlık`) `statusTranslations.ts` gibi bir tabloda EN/ES karşılıklarına map et.  
   - `MatchCard`, `MatchesScreen`, `MatchDetail` scoreboard header’ı bu map’i kullanarak label gösterir.  
   - Backend tarafında (Faz 2b) scraper heading/label yakalama logic’i locale-specific olmalı ki uzun vadede mapping’e ihtiyaç kalmasın.
2. **Scoreboard & Upcoming Data**  
   - `scoreboard.info` satırları TR ise, regex ile (örn. `/G[üu]ncelleme/)` yakalanıp `matchDetail.lastUpdate` key’ine map edilir.  
   - `upcomingMatches.matches[].tag` alanları (`Ev`, `Dep`, `Formda`) için translation tablo oluştur, UI t(key) ile gösterir.
3. **Odds/Prediction Titles**  
   - `oddsTrends` JSON’undaki `trend.title`, `card.title`, `row.label` stringlerini locale’e göre bekle. Eğer şu an TR geliyorsa, server scraper’da heading dictionary’leri güncelle (bkz. Faz 2b) veya client fallback tablosu kur.  
   - `detailPredictions` başlıkları TR ise, server scraping pipeline’ında heading/slug yakalama dil bağımsız hale getirilmeli (Faz 2b).
4. **Helper & Date Utils**  
   - `timeSince` → `Intl.RelativeTimeFormat` + locale parametresi. İsteyen component `useLocale()` ile timezone bilgisini de geçebilir.  
   - `formatRecentForm` `teamForm.title` TR ise, regex ile “📈 Ev Sahibi - Son Form” gibi parçaları locale’lere map et.
5. **End-to-End Testler**  
   - `npm run scrape:matches -- --locale=en` ile data üret, sonra `curl /api/matches?locale=en` → UI en locale’de TR text bırakmamalı.  
   - Match detail view’da highlight/odds/upcoming bloklarını kontrol et; mapping tablosu tüm TR varyantlarını kapsıyor mu?

### Çıktılar
- Kaynaktan gelen TR stringler client’ta mapping ile çevrilmiş veya server’da locale aware parse edilmiş olacak.
- Status/kickoff/odds/upcoming alanları seçilen dilde okunabilir hale gelecek.

## Faz 3 – Server-Side i18n ve Veri Kaynağı
### Hedef
GolSinyali scraper’ını tüm desteklenen locale’ler için kararlı hale getirmek; cache/queue katmanını locale-aware tasarlayıp client tarafındaki mapping ihtiyaçlarını minimuma indirmek.

### Yapılacaklar
1. **Scraper I18N Katmanı**  
   - `src/scrapers/golsinyali/i18n/` altında `headings.tr.json`, `headings.en.json`, `headings.es.json` vb. dosyalar oluştur; her bölüm için label listesi (`quickSummary`, `detailedPredictions`, `oddsTrend`, `upcoming`, `recentForm`, `headToHead`).  
   - `match-list.js` → `VIEW_LABELS` dictionary’sini locale bazlı yap (`{'tr': {today:'Bugün'}, 'en': {today:'Today'}}`) ve `ensureView` fonksiyonunu text yerine data attribute varsa onu kullanacak şekilde güçlendir.  
   - `match-detail.js` → heading/güncelleme regex’lerini locale dictionary’sinden oku; attribute/class fallback’leri ekle (ör. heading yoksa section order’ına bak).
2. **Queue ve Storage Revizyonu**  
   - `src/services/scrape-queue.js`: job signature = `{ locale, view }`; queue loglarında locale göster.  
   - `match-storage.js` + `data-store.js`: `data/<locale>/lists/<date>.json`, `data/<locale>/matches/<matchId>.json` yapısını uygula; alias dosyaları da locale bazlı yaz (`latest.json`, `upcoming.json`).  
   - Storage migration script: eski TR dosyalarını `data/tr/...` altına taşıyan küçük bir node script’i yaz.
3. **API & Config**  
   - `src/server/index.js`: `req.query.locale` zorunlu değilse default `tr`, ancak response body’ye `locale` ekle.  
   - `POST /api/matches/scrape` body’sine `locale` alanı ekle; validasyon yap.  
   - Health endpoint’e hangi locale’ler için veri mevcut info’su eklenebilir.
4. **Client/Server Sözleşmesi**  
   - Server artık heading’leri locale’de döndüğünden, Faz 1/2’deki mapping katmanlarının bir kısmı kaldırılabilir; dokümante et.  
   - API versiyonlaması gerekiyorsa (örn. `v2` route) planla.
5. **Testing & Tooling**  
   - `npm run scrape:matches -- --locale=<...>` loop script’i yazarak tüm locale’leri sırasıyla çek.  
   - `inspect-*.mjs` script’lerini locale parametresi alacak şekilde güncelle; DOM değişikliklerini hızlıca görmek için.  
   - Jest/Playwright ile basic scraping unit testleri (DOM stub’ları) ekle.

### Çıktılar
- Çok dilli scraper + locale-name-spaced cache yapısı.
- Client’taki analiz/heading çeviri fallback’leri minimal seviyeye indirgenmiş olacak.

## Faz 4 – QA, Performance ve Dokümantasyon
### Hedef
Çok dilli/tz destekli yapının üretim senaryolarında sağlıklı çalıştığını doğrulamak; otomasyon, dokümantasyon ve izleme katmanını tamamlamak.

### Yapılacaklar
1. **Otomatik Test Suite**  
   - Jest: `match-analysis` fonksiyonları için unit test (TR/EN parametreleriyle Quick Summary & Key Insights).  
   - Playwright/Detox: Home → Match detail → Favorites flow’unu TR/EN/ES locale’leriyle çalıştıran smoke senaryosu.  
   - `npm run lint` + `npx tsc --noEmit` CI’da zorunlu hale getirilir; type hataları sıfırlanır.
2. **Manual QA Matrisi**  
   - Excel/Notion sheet: 5 locale x 16 timezone kombinasyonu için “Liste yükleniyor mu?”, “Maç detayı (AI kartı) lokalize mi?”, “Timezone formatı doğru mu?” gibi checklist maddeleri.  
   - Expo Go’da iOS + Android cihaz/Simulator’da iki tur manuel test (biri TR/Europe/Istanbul, biri ES/America/Mexico_City).
3. **Dokümantasyon & Geliştirici Rehberi**  
   - `README.md` → API parametreleri (`?locale=`, `?timezone=`), CLI komutları, scheduler talimatları.  
   - `CONTRIBUTING.md` ya da `docs/i18n-guide.md`: yeni string ekleme, translation JSON düzeni, fallback kuralları.  
   - `product_plamn` faz dosyaları güncel durumla eşleştirilir.
4. **Monitoring & Logging**  
   - Express middleware ile her request log’una `{ locale, timezone, view }` ekle.  
   - Scraper loglarında locale + view + duration + error reason (Sentry veya simple log file).  
   - Alarm: belirli sayıda consecutive scrape hatası veya API timeout’ı olduğunda Slack/webhook bildirimi.
5. **Performance / Deployment Hazırlığı**  
   - `pm2` config, log rotation (winston + daily rotate).  
   - CDN/cache stratejisi (liste endpoint’i için 1-2 dakikalık HTTP cache, detail endpoint’i için stale-while-revalidate?).  
   - Security: `x-api-key` header zorunlu, CORS whitelist, rate limiting (`express-rate-limit`).

### Çıktılar
- QA raporu + test sonuçları.
- Güncel dokümantasyon (README, i18n guide, deployment notları).
- Loglama/monitoring pipeline’ı ve production sertleştirme tamamlanmış CI/CD süreci.

---

## 1. Kapsam
1. Görsel bileşenlerin tamamı (`components/match/*`).
2. `app/matches/[matchId].tsx` içindeki inline metinler.
3. `lib/match-analysis.ts` ve `lib/match-helpers.ts` gibi yardımcı fonksiyonların döndürdüğü stringler.
4. API'den gelen veri alanlarının (örn. `detail.scoreboard.info`, `oddsTrends`, `upcomingMatches`) client tarafında çevrilebilir hale getirilmesi.

## 2. Mevcut Açıklar
| Alan | Dosya(lar) | Not |
| --- | --- | --- |
| Statü/etiket fallback'leri | `components/home/match-card.tsx`, `app/matches/index.tsx` | Bazıları `t()` kullanıyor, fakat `match.statusLabel` Türkçe ise UI yine Türkçe kalıyor. |
| Scoreboard alt bilgi satırları | `app/matches/[matchId].tsx` | `scoreboard.info` içindeki stringler doğrudan gösteriliyor; veri çok dillendirilmedi. |
| `detail.detailPredictions` başlıkları | API verisi Türkçe geliyor. Eğer GolSinyali farklı dilde başlık dönerse sorun olmaz; aksi halde server tarafında çeviri gerekecek. |
| Yaklaşan maçlar / etiketler | `detail.upcomingMatches[].matches[].tag` Türkçe. |
| Odds kartlarındaki başlıklar | `trend.title`, `card.title`, `row.label` kaynaktan. |
| Recent form başlıkları | `form.title` (örn. `📈 Ev Sahibi - Son Form`). Şu an regex ile temizleniyor ama Türkçe kalıyor. |
| Queue/pending mesajları | `match.pendingMessage` çeviriye taşındı; fakat sunucudan gelen `pendingInfo.message` TR. |
| Takım isimleri/fallback | `matchDetail.teams.homeFallback` vb. TR. Sözlükte var, fakat veriler Türkçe; sunucuya bağlı. |

## 3. Sözlük Güncellemeleri
1. `matchDetail` altında yeni anahtarlar:
   - `scoreboard.statusBadge.playing`, `scoreboard.statusBadge.finished` vs.
   - `scoreboard.timezoneLabel`.
   - `upcomingMatches.title`, `upcomingMatches.empty`.
2. `home.matchCard` bölümüne:
   - `liveBadge`, `kickoffBadge`, `favoriteTooltip`.
3. `matchDetail.predictions` için:
   - `detailCard.pending`, `detailCard.aiUnavailable`.
4. `common` altına:
   - `minutesShort`, `hoursShort`, `justNow`.

## 4. Uygulama Adımları
### A. Bileşen Bazlı Çeviri
1. `components/match/prediction-summary-card.tsx`, `quick-summary-card.tsx`: topOutcome label fallback'leri `t()` ile güncelle.
2. `components/match/match-card.tsx`: `match.statusLabel` içindeki TR kelimeler için dictionary map (örn. `Canlı → Live`). Metin server tarafında çevrilemiyorsa küçük bir mapper oluştur.
3. `app/matches/[matchId].tsx`: 
   - `scoreboard` altındaki etiketleri `t()` ile göster (örn. `"Kickoff yakında"` → `match.kickoff`).
   - `upcomingMatches` bloklarına başlık/fallback ekle.
4. `components/match/recent-form-card.tsx`: Başlık fallback'i translation'dan gelse de `form.title` TR; UI'da `replace(/Son Form/)` yerine `translator` kullan.
5. `components/match/visual-comparison-card.tsx`: metrik `unit` stringlerini translation dosyasına taşı.

### B. Helper ve Provider Güncellemeleri
1. `lib/match-helpers.ts`: `timeSince` fonksiyonunu locale-aware yap (Intl.RelativeTimeFormat).
2. `lib/match-analysis.ts`: `compareTeams`, `extractKeyInsights`, `getQuickSummary` fonksiyonlarının her çıktısı translator ile üretiliyor; veri kaynağından gelen TR stringleri (örn. `form.title`) normalize etmek için regex tablosu ekle.
3. `providers/matches-provider.tsx`: Sunucudan gelen `statusLabel` TR ise, locale'ye göre çevir; config'e `MAPPING_TR_TO_EN` benzeri tablo ekle.

### C. Sunucu ile Koordinasyon
1. GolSinyali scraper'ı multi-locale hale geldiğinde (Faz 2), detail sayfasında gelen `info`, `oddsTrends`, `upcomingMatches` başlıklarının da hedef dilde olacağı varsayılıyor. Eğer hala TR geliyorsa server tarafında `i18n` mapping eklemek gerekecek (örn. `src/scrapers/golsinyali/match-detail.js`).
2. Sunucu cache yapısı locale-aware olduğundan, UI çevirileri bittikten sonra `GET /api/match/:id?locale=en` ile gerçek veriyi test et.

## 5. Test Checklist
1. **Locale toggling**: Profile ekranından `tr/en/es` seçerek match detail ekranında:
   - Header, quick summary, tüm kart başlıkları doğru dilde mi?
   - Status badge ve kickoff tekstleri çeviri alıyor mu?
2. **Server data fallback**: GolSinyali'nden TR gelen alanlar UI'da degrade ediyor mu? (örn. `row.label`).
3. **Timezones**: `scoreboard.kickoffTimeDisplay` yoksa client formatlıyoruz; `Intl.DateTimeFormat` ile locale/timezone test.
4. **TypeScript**: `npx tsc --noEmit` temiz olmalı (mevcut hatalar fix planına alınacak).
5. **RN dev build**: `npm start` + Expo Go ile en az iki dilde manuel doğrulama.

## 6. Sonraki Adımlar
1. Yukarıdaki bileşenlerde kalan literal stringleri tespit etmek için `rg -n "[ıİçÇöÖşŞğĞ]" clientv3/components/match -g'*.tsx'`.
2. Sözlük JSON'larını güncelledikten sonra `useTranslation` kullanan her bileşen için `t()` fallback'leri double-check et.
3. Sunucu tarafında multi-locale scraping tamamlandığında bu planı revize edip, server verisiyle çelişen client çeviri katmanlarını sadeleştir.
