# i18n (Yerelleştirme) Uygulama Planı

## ✅ Tamamlananlar

### 1. Temel i18n Sistemi
- ✅ Translation dosyaları oluşturuldu (`tr.json`, `en.json`, `es.json`)
- ✅ `useTranslation` hook'u oluşturuldu
- ✅ `getTranslation` fonksiyonu (nested key desteği, parametre desteği)
- ✅ LocaleProvider ile entegrasyon
- ✅ TypeScript JSON import desteği (`resolveJsonModule`)

### 2. Güncellenen Dosyalar
- ✅ `app/index.tsx` - Ana sayfa metinleri
- ✅ `app/profile.tsx` - Profil sayfası metinleri
- ✅ `app/initial-setup.tsx` - İlk kurulum metinleri
- ✅ `components/home/filter-section.tsx` - Filtre bölümü metinleri
- ✅ `components/home/league-selection-modal.tsx` - Lig seçim modal metinleri
- ✅ `components/settings/locale-selector.tsx` - Dil seçici metinleri
- ✅ `components/settings/timezone-selector.tsx` - Timezone seçici metinleri

## 📋 Kalan İşler

### 3. Component'lerde Kalan Metinler

#### `components/home/match-card.tsx`
- [ ] "Canlı" → `t('match.live')`
- [ ] "vs" → `t('match.vs')`
- [ ] Time badge'deki saat formatı (zaten `kickoffTimeDisplay` kullanılıyor, sadece fallback)

#### `components/home/league-header.tsx`
- [ ] "Lig Bilinmiyor" → `t('common.unknownLeague')` (translation dosyasına ekle)

#### `app/matches/[matchId].tsx`
- [ ] Tüm section başlıkları (`matchDetail.*`)
- [ ] Error mesajları
- [ ] Empty state mesajları
- [ ] Button metinleri
- [ ] Scoreboard metinleri

#### Match Detail Component'leri
- [ ] `components/match/quick-summary-card.tsx` - "AI Analiz", "Ana Tahmin", "Önerilen Seçim", etc.
- [ ] `components/match/prediction-summary-card.tsx` - "Tahmin Özeti", "Önerilen:", etc.
- [ ] `components/match/form-stats-card.tsx` - İstatistik label'ları
- [ ] `components/match/key-insights-card.tsx` - "Önemli İçgörüler"
- [ ] Diğer match component'leri

### 4. Translation Dosyalarına Eklenecek Key'ler

```json
{
  "common": {
    "unknownLeague": "Lig Bilinmiyor"
  },
  "matchCard": {
    "live": "Canlı"
  },
  "matchDetail": {
    "aiAnalysis": "AI Analiz",
    "mainPrediction": "Ana Tahmin",
    "recommendedPick": "Önerilen Seçim",
    "allProbabilities": "Tüm Olasılıklar",
    "highest": "En Yüksek",
    "probability": "olasılık",
    "summary": "Özet",
    "recommended": "Önerilen:",
    "formStats": {
      "winRate": "Galibiyet Oranı",
      "drawRate": "Beraberlik Oranı",
      "lossRate": "Yenilgi Oranı",
      "avgGoalsFor": "Gol Ort.",
      "avgGoalsAgainst": "Yenilen"
    }
  }
}
```

## 🎯 Uygulama Stratejisi

### Adım 1: Translation Dosyalarını Genişlet
1. Tüm eksik key'leri ekle (yukarıdaki liste)
2. Her dil için çevirileri ekle

### Adım 2: Component'leri Güncelle
1. `match-card.tsx` - Basit, sadece birkaç string
2. `league-header.tsx` - Tek bir string
3. `[matchId].tsx` - En çok metin burada
4. Match detail component'leri - Her biri ayrı ayrı

### Adım 3: Test
1. Dil değiştirip tüm ekranları kontrol et
2. Eksik translation'ları tespit et
3. Fallback mekanizmasını test et (key bulunamazsa key'i göster)

## 📝 Kullanım Örnekleri

### Basit Kullanım
```tsx
const t = useTranslation();
<Text>{t('home.today')}</Text>
```

### Parametreli Kullanım
```tsx
<Text>{t('filter.leaguesSelected', { count: 3 })}</Text>
// TR: "3 lig seçili"
// EN: "3 leagues selected"
```

### Nested Key Kullanımı
```tsx
<Text>{t('matchDetail.formStats.winRate')}</Text>
```

## ⚠️ Dikkat Edilmesi Gerekenler

1. **API'den gelen metinler**: API'den gelen metinler (lig adları, takım adları, etc.) zaten locale'e göre geliyor, bunları çevirmeye gerek yok.

2. **Dinamik metinler**: Tarih/saat formatları için `Intl` API kullanılabilir, ama şimdilik API'den gelen `kickoffTimeDisplay` kullanılıyor.

3. **Fallback**: Eğer bir key bulunamazsa, sistem otomatik olarak Türkçe'ye fallback yapıyor ve key'i gösteriyor (console warning ile).

4. **Performance**: `useTranslation` hook'u `useMemo` kullanıyor, her render'da yeni fonksiyon oluşturmuyor.

## 🚀 Sonraki Adımlar

1. Kalan component'leri güncelle
2. Eksik translation key'lerini ekle
3. Test et ve eksikleri tamamla
4. Production'a hazır!

