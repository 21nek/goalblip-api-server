# Client-Side Cache Sistemi Planı (Telefon Hafızası Dostu)

## 📊 Mevcut Durum Analizi

### Şu Anki Cache Yapısı
- ✅ **Memory Cache**: `matchDetails` ve `matchAssets` useState ile tutuluyor
- ✅ **Request Deduplication**: Aynı matchId için aynı anda birden fazla request yapılmıyor
- ❌ **Persistent Storage**: Yok (uygulama kapanınca cache kayboluyor)
- ❌ **TTL (Time To Live)**: Yok (cache ne zaman expire olacak belli değil)
- ❌ **Match List Cache**: Today/tomorrow listeleri cache'lenmiyor
- ❌ **Cache Invalidation**: Strateji yok
- ❌ **Size Management**: Yok (telefon hafızası şişebilir)
- ❌ **Smart Eviction**: Yok

### Veri Tipleri ve Boyutları
1. **MatchListResponse** (~50-200 KB)
   - Bugün/Yarın maç listesi
   - Her maç için: matchId, takım isimleri, skor, lig bilgisi
   - Sık güncellenir (her saat başı değişebilir)

2. **MatchDetail** (~100-500 KB)
   - Tek maçın detaylı analizi
   - Scoreboard, predictions, form stats, odds trends, vb.
   - Daha az sık güncellenir (maç başlamadan önce sabit)

3. **MatchAssets** (~1-5 KB)
   - Logo URL'leri, takım isimleri
   - Çok küçük, sık kullanılır

### 🚨 Telefon Hafızası Sorunları
- ❌ Sınırsız cache büyümesi → RAM/Storage dolar
- ❌ Eski maçlar cache'de kalıyor → Gereksiz yer kaplıyor
- ❌ Logo'lar ve büyük JSON'lar → Storage şişiyor
- ❌ Background'da cache temizlenmiyor → Memory leak riski

---

## 🎯 Cache Stratejisi

### 1. Katmanlı Cache Sistemi (Multi-Layer)

```
┌─────────────────────────────────────┐
│   Memory Cache (Hızlı, Geçici)      │
│   - Instant access                   │
│   - TTL: 5 dakika                    │
└─────────────────────────────────────┘
           ↓ (miss)
┌─────────────────────────────────────┐
│   Persistent Cache (AsyncStorage)   │
│   - Uygulama kapanınca da kalır     │
│   - TTL: 1 saat (match list)        │
│   - TTL: 24 saat (match detail)     │
└─────────────────────────────────────┘
           ↓ (miss)
┌─────────────────────────────────────┐
│   API Request                       │
└─────────────────────────────────────┘
```

### 2. Cache Katmanları

#### A. Memory Cache (L1 - En Hızlı) ⚡
- **Amaç**: Instant access, zero latency
- **Storage**: React state (useState/useRef)
- **TTL**: 
  - Match List: 5 dakika
  - Match Detail: 10 dakika
  - Match Assets: 30 dakika (logo'lar değişmez)
- **Size Limit**: 
  - Match Details: Max 20 maç (telefon hafızası için optimize)
  - Match Lists: 2 (today + tomorrow)
  - Max Memory: ~10-15 MB
- **Eviction**: 
  - LRU (Least Recently Used)
  - Otomatik cleanup (component unmount)
  - AppState change'de temizlik

#### B. Persistent Cache (L2 - AsyncStorage) 💾
- **Amaç**: Uygulama kapanınca da veri kalsın (ama hafif!)
- **Storage**: `@react-native-async-storage/async-storage`
- **TTL**:
  - Match List: 30 dakika (daha kısa, sık güncellenir)
  - Match Detail: 6 saat (sadece bugün/yarın maçları)
  - Match Assets: 3 gün (logo'lar nadir değişir)
- **Size Limit**: 
  - Toplam: Max 5 MB (telefon hafızası için optimize)
  - Match Details: Max 30 maç (sadece yakın tarihli)
  - Otomatik size monitoring
- **Eviction**: 
  - LRU + TTL
  - Eski maçlar otomatik silinir (kickoff time geçmişse)
  - Size limit aşılırsa en eski silinir

#### C. API Cache Headers (L3 - İsteğe Bağlı)
- **Amaç**: API'den gelen cache headers'ı kullan
- **Implementation**: Response headers kontrol et
- **Fallback**: Manuel TTL kullan

---

## 🔄 Cache Invalidation Stratejisi

### 1. Time-Based Invalidation (TTL)
```typescript
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
};

function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}
```

### 2. Event-Based Invalidation
- **Match Started**: Maç başladığında detail'i invalidate et
- **Match Finished**: Maç bittiğinde detail'i invalidate et
- **Manual Refresh**: Kullanıcı pull-to-refresh yaptığında
- **App Foreground**: Uygulama foreground'a geldiğinde (opsiyonel)

### 3. Stale-While-Revalidate Pattern
```typescript
// Cache'den hemen döndür, arka planda güncelle
async function getWithStaleRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await getFromCache<T>(key);
  
  if (cached && !isExpired(cached)) {
    // Fresh data, return immediately
    return cached.data;
  }
  
  if (cached && isStale(cached)) {
    // Stale but usable, return and refresh in background
    fetcher().then(updateCache).catch(console.error);
    return cached.data;
  }
  
  // No cache, fetch and wait
  const fresh = await fetcher();
  await updateCache(key, fresh);
  return fresh;
}
```

---

## 📦 Cache Key Yapısı

```typescript
// Match List
'match-list:today:2024-01-15'
'match-list:tomorrow:2024-01-16'

// Match Detail
'match-detail:12345'
'match-detail:67890'

// Match Assets
'match-assets:12345'

// Metadata
'cache-metadata:match-list:today'
'cache-metadata:match-detail:12345'
```

### Metadata Format
```typescript
type CacheMetadata = {
  key: string;
  timestamp: number;
  ttl: number;
  size: number; // bytes
  version: number; // API version, cache invalidation için
};
```

---

## 🚀 Prefetching Stratejisi

### 1. Proactive Prefetching
- **Match List**: Kullanıcı "Bugün" sekmesindeyken, "Yarın" listesini prefetch et
- **Match Details**: Kullanıcı listeyi scroll ederken, görünür maçların detail'lerini prefetch et
- **Match Assets**: Match detail fetch edildiğinde, assets'i de otomatik kaydet

### 2. Predictive Prefetching
- **User Behavior**: Kullanıcı genelde hangi maçlara tıklıyor?
- **Popular Matches**: En çok görüntülenen maçları prefetch et
- **Upcoming Matches**: Yakında başlayacak maçları prefetch et

### 3. Prefetch Priority
```typescript
enum PrefetchPriority {
  HIGH = 1,    // Görünür maçlar, yakında başlayacak
  MEDIUM = 2,  // Aynı ligdeki diğer maçlar
  LOW = 3      // Diğer maçlar
}
```

---

## 🔧 Implementation Plan

### Phase 1: Core Cache Infrastructure
1. **Cache Manager Service** (`lib/cache/cache-manager.ts`)
   - Generic cache interface
   - Memory + Persistent storage
   - TTL management
   - LRU eviction

2. **Cache Types** (`lib/cache/types.ts`)
   - CacheEntry<T>
   - CacheMetadata
   - CacheConfig

3. **Storage Adapter** (`lib/cache/storage-adapter.ts`)
   - AsyncStorage wrapper
   - Size management
   - Compression (opsiyonel)

### Phase 2: Match-Specific Cache
1. **Match List Cache** (`lib/cache/match-list-cache.ts`)
   - Today/tomorrow cache
   - TTL: 1 saat
   - Auto-refresh on foreground

2. **Match Detail Cache** (`lib/cache/match-detail-cache.ts`)
   - Individual match cache
   - TTL: 24 saat
   - Event-based invalidation

3. **Match Assets Cache** (`lib/cache/match-assets-cache.ts`)
   - Logo/name cache
   - TTL: 7 gün
   - Long-term storage

### Phase 3: Advanced Features
1. **Background Refresh**
   - AppState listener
   - Foreground'da stale data'yı refresh et
   - Network-aware (WiFi'de daha agresif)

2. **Prefetching Service**
   - Intersection Observer (web) / FlatList onViewableItemsChanged (native)
   - Predictive prefetching
   - Priority queue

3. **Cache Analytics**
   - Hit/miss ratio
   - Average load time
   - Cache size monitoring

---

## 📐 Cache Configuration (Telefon Hafızası Optimize)

```typescript
const CACHE_CONFIG = {
  // Memory Cache (RAM - Çok hızlı ama sınırlı)
  memory: {
    matchList: { 
      ttl: 5 * 60 * 1000, // 5 dakika
      maxEntries: 2, // today + tomorrow
    },
    matchDetail: { 
      ttl: 10 * 60 * 1000, // 10 dakika
      maxEntries: 20, // max 20 maç (RAM için optimize)
      maxSizeBytes: 10 * 1024 * 1024, // 10 MB max
    },
    matchAssets: { 
      ttl: 30 * 60 * 1000, // 30 dakika
      maxEntries: 50, // logo'lar küçük
    },
  },
  
  // Persistent Cache (Storage - Daha yavaş ama kalıcı)
  persistent: {
    matchList: { 
      ttl: 30 * 60 * 1000, // 30 dakika (daha kısa)
      maxEntries: 2,
    },
    matchDetail: { 
      ttl: 6 * 60 * 60 * 1000, // 6 saat (sadece bugün/yarın)
      maxEntries: 30, // max 30 maç (storage için optimize)
      // Sadece yakın tarihli maçları cache'le
      onlyUpcoming: true, // Geçmiş maçları cache'leme
      maxAgeHours: 48, // Max 48 saat sonraki maçlar
    },
    matchAssets: { 
      ttl: 3 * 24 * 60 * 60 * 1000, // 3 gün
      maxEntries: 100,
    },
    maxTotalSize: 5 * 1024 * 1024, // 5 MB max (telefon için optimize)
  },
  
  // Prefetching (Hafif, sadece görünür maçlar)
  prefetch: {
    enabled: true,
    matchList: true, // Prefetch tomorrow when on today
    matchDetails: {
      enabled: true,
      maxConcurrent: 3, // Aynı anda max 3 maç prefetch
      onlyVisible: true, // Sadece görünür maçlar
      priority: {
        visible: 'HIGH',
        upcoming: 'MEDIUM',
        others: 'LOW',
      },
    },
  },
  
  // Background Refresh (Hafif, network-aware)
  backgroundRefresh: {
    enabled: true,
    onForeground: true, // Refresh stale data when app comes to foreground
    networkAware: true, // Only on WiFi (mobil data koruması)
    maxConcurrent: 2, // Aynı anda max 2 refresh
  },
  
  // Cleanup (Telefon hafızası koruması)
  cleanup: {
    onAppBackground: true, // App background'a gidince memory cache temizle
    onLowMemory: true, // Low memory warning'de agresif temizlik
    expiredEntries: true, // Expired entry'leri otomatik sil
    oldMatches: true, // Geçmiş maçları otomatik sil (kickoff time geçmişse)
    interval: 5 * 60 * 1000, // Her 5 dakikada bir cleanup check
  },
};
```

---

## 🎨 API Design

### Cache Manager
```typescript
class CacheManager {
  // Get with automatic fallback
  async get<T>(key: string, fetcher?: () => Promise<T>): Promise<T | null>;
  
  // Set cache
  async set<T>(key: string, data: T, ttl?: number): Promise<void>;
  
  // Check if exists and valid
  has(key: string): Promise<boolean>;
  
  // Delete
  delete(key: string): Promise<void>;
  
  // Clear all
  clear(): Promise<void>;
  
  // Get stats
  getStats(): Promise<CacheStats>;
}

// Match-specific helpers
class MatchCache {
  // Match List
  async getMatchList(view: 'today' | 'tomorrow'): Promise<MatchListResponse | null>;
  async setMatchList(view: 'today' | 'tomorrow', data: MatchListResponse): Promise<void>;
  
  // Match Detail
  async getMatchDetail(matchId: number): Promise<MatchDetail | null>;
  async setMatchDetail(matchId: number, data: MatchDetail): Promise<void>;
  
  // Match Assets
  async getMatchAssets(matchId: number): Promise<MatchAssets | null>;
  async setMatchAssets(matchId: number, data: MatchAssets): Promise<void>;
}
```

---

## 🔍 Monitoring & Debugging

### Cache Metrics
- Hit rate (cache'den dönen / toplam istek)
- Miss rate (API'den çekilen / toplam istek)
- Average load time (cache vs API)
- Cache size (memory + persistent)
- Eviction count

### Debug Tools
- Cache inspector (development mode)
- Clear cache button (settings)
- Cache stats display
- Network request logger

---

## ⚡ Performance Optimizations (Telefon Hafızası İçin)

1. **Selective Caching**: 
   - Sadece bugün/yarın maçlarını cache'le
   - Geçmiş maçları cache'leme
   - Sadece görüntülenen maçların detail'lerini cache'le

2. **Data Minimization**:
   - Match Detail'den gereksiz alanları çıkar (sadece UI'da kullanılanlar)
   - Logo URL'lerini cache'le, base64 değil
   - Büyük array'leri lazy load et

3. **Aggressive Cleanup**:
   - AppState change'de memory cache temizle
   - Low memory warning'de agresif temizlik
   - Geçmiş maçları otomatik sil (kickoff time kontrolü)

4. **Size Monitoring**:
   - Her cache entry'nin size'ını track et
   - Toplam size limit aşılırsa en eski silinir
   - Storage size'ı düzenli kontrol et

5. **Smart Eviction**:
   - LRU + TTL + Size-based eviction
   - Priority-based: Yakında başlayacak maçlar öncelikli
   - Geçmiş maçlar otomatik silinir

6. **Batch Operations**: AsyncStorage batch read/write (performans için)

7. **Debouncing**: Aynı key için multiple request'i debounce et

---

## 🧪 Testing Strategy

1. **Unit Tests**: Cache manager, TTL, eviction
2. **Integration Tests**: Memory + Persistent cache flow
3. **E2E Tests**: Full user flow with cache
4. **Performance Tests**: Cache hit/miss scenarios
5. **Stress Tests**: Large cache size, many concurrent requests

---

## 📅 Implementation Timeline

### Week 1: Core Infrastructure
- [ ] Cache manager service
- [ ] Storage adapter
- [ ] Basic TTL implementation
- [ ] Unit tests

### Week 2: Match-Specific Cache
- [ ] Match list cache
- [ ] Match detail cache
- [ ] Match assets cache
- [ ] Integration with existing provider

### Week 3: Advanced Features
- [ ] Background refresh
- [ ] Prefetching service
- [ ] Cache analytics
- [ ] Debug tools

### Week 4: Polish & Optimization
- [ ] Performance optimization
- [ ] Compression
- [ ] Monitoring
- [ ] Documentation

---

## 🚨 Risk & Mitigation (Telefon Hafızası Odaklı)

### Risk 1: Telefon Hafızası Dolması
- **Risk**: Cache büyüyüp telefon RAM/Storage'ını doldurur
- **Mitigation**: 
  - ✅ Küçük size limitleri (5 MB persistent, 10 MB memory)
  - ✅ Max 20-30 maç detail cache
  - ✅ Geçmiş maçları cache'leme
  - ✅ AppState change'de otomatik temizlik
  - ✅ Size monitoring ve otomatik eviction
  - ✅ Low memory warning'de agresif temizlik

### Risk 2: AsyncStorage Size Limit
- **Risk**: iOS/Android'de AsyncStorage limiti var (~6-10 MB)
- **Mitigation**: 
  - ✅ 5 MB max limit (güvenli margin)
  - ✅ Size monitoring
  - ✅ Aggressive eviction (LRU + TTL)
  - ✅ Sadece kritik verileri cache'le

### Risk 3: Stale Data
- **Risk**: Kullanıcı eski veriyi görebilir
- **Mitigation**:
  - ✅ Stale-while-revalidate pattern
  - ✅ Kısa TTL'ler (30 dk - 6 saat)
  - ✅ Manual refresh option
  - ✅ Visual indicator for stale data

### Risk 4: Memory Leaks
- **Risk**: Cache büyüyüp memory leak yapabilir
- **Mitigation**:
  - ✅ Strict size limits (max 20 maç memory'de)
  - ✅ LRU eviction
  - ✅ Memory monitoring
  - ✅ Cleanup on unmount
  - ✅ AppState listener ile otomatik temizlik

### Risk 5: Background'da Cache Büyümesi
- **Risk**: Uygulama background'dayken cache büyümeye devam eder
- **Mitigation**:
  - ✅ AppState change'de memory cache temizle
  - ✅ Background'da prefetch yapma
  - ✅ Interval-based cleanup (her 5 dakika)

---

## 📚 Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^1.21.0",
  // Optional: For better performance
  "react-native-mmkv": "^2.10.0" // Alternative to AsyncStorage
}
```

---

## 🎯 Success Metrics (Telefon Hafızası İçin)

- **Cache Hit Rate**: > 60% (hedef - telefon için yeterli)
- **Average Load Time**: < 100ms (cache hit), < 2s (cache miss)
- **Memory Usage**: < 15 MB (memory cache) ⚡
- **Storage Usage**: < 5 MB (persistent cache) 💾
- **Cache Size**: Max 20-30 maç detail (telefon için optimize)
- **User Experience**: Instant load for cached data, smooth transitions
- **Battery Impact**: Minimal (sadece görünür maçlar prefetch)
- **Data Usage**: Minimal (sadece WiFi'de agresif refresh)

---

## 🔄 Future Enhancements

1. **Service Worker Cache** (Web): Offline support
2. **IndexedDB** (Web): Larger storage
3. **SQLite** (Native): Structured cache queries
4. **CDN Integration**: Static assets (logos) için CDN cache
5. **Smart Prefetching**: ML-based prediction
6. **Cache Sharing**: Multiple tabs/instances arası cache sync

---

## 📝 Notes (Telefon Hafızası Odaklı)

- ✅ **iOS/Android first**: AsyncStorage her iki platformda da çalışır
- ✅ **Web support**: AsyncStorage web'de localStorage kullanır
- ✅ **Backward compatibility**: Mevcut provider yapısını bozmadan entegre et
- ✅ **Gradual rollout**: Önce memory cache, sonra persistent cache
- ✅ **Telefon hafızası koruması**: 
  - Küçük size limitleri
  - Agresif cleanup
  - Sadece kritik verileri cache'le
  - Geçmiş maçları cache'leme
- ✅ **Battery-friendly**: 
  - Sadece WiFi'de agresif refresh
  - Background'da minimal işlem
  - Prefetch sadece görünür maçlar

