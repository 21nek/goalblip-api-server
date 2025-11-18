# App Store & Play Store Compliance Check

## ✅ Uyumlu Olanlar

1. **Permissions**: Hiçbir izin istenmiyor (Location, Camera, Contacts, etc.) ✅
2. **Data Collection**: 
   - Sadece AsyncStorage kullanılıyor (favoriler, locale, timezone)
   - Veriler sadece kullanıcının cihazında saklanıyor
   - Sunucuya kişisel veri gönderilmiyor ✅
3. **Third-party Tracking**: Analytics, tracking, crash reporting yok ✅
4. **Content**: Spor verileri ve tahminler (yasak içerik yok) ✅

## ⚠️ Eksikler ve Sorunlar

### 1. **Privacy Policy Linki** (KRİTİK)
- **Sorun**: App Store ve Play Store Privacy Policy linki zorunlu
- **Çözüm**: `app.json`'a `privacy` field ekle
- **Gereksinim**: Privacy Policy sayfası oluştur ve yayınla

### 2. **Terms of Service** (Önerilir)
- **Sorun**: Terms of Service linki yok
- **Çözüm**: `app.json`'a `terms` field ekle (opsiyonel ama önerilir)

### 3. **iOS App Transport Security (ATS)** (KRİTİK)
- **Sorun**: API HTTP kullanıyor, iOS ATS HTTPS zorunlu kılıyor
- **Çözüm**: 
  - Production'da HTTPS kullan (SSL sertifikası)
  - Veya `Info.plist`'te ATS exception ekle (önerilmez)

### 4. **Age Rating** (ÖNEMLİ)
- **Sorun**: Bahis/tahmin içeriği var, yaş sınırlaması gerekebilir
- **Çözüm**: `app.json`'a `ios.infoPlist` ve `android.rating` ekle
- **Önerilen**: 17+ (iOS), Teen (Android)

### 5. **App Store Metadata Eksik**
- **Sorun**: `app.json`'da eksikler:
  - `description` (uzun açıklama)
  - `keywords` (arama kelimeleri)
  - `category` (kategori)
  - `primaryColor` (tema rengi)
  - `android.package` (package name)
  - `ios.bundleIdentifier` (bundle ID)

### 6. **EAS Project ID**
- **Sorun**: Placeholder UUID kullanılıyor (`00000000-0000-0000-0000-000000000000`)
- **Çözüm**: Gerçek EAS project ID oluştur veya kaldır

### 7. **Screenshots & App Icons**
- **Kontrol**: `assets/icon.png` ve `assets/splash.png` var mı?
- **Gereksinim**: 
  - iOS: 1024x1024 icon, çeşitli screenshot boyutları
  - Android: 512x512 icon, çeşitli screenshot boyutları

## 🔧 Yapılması Gerekenler

### Öncelik 1 (Zorunlu):
1. Privacy Policy sayfası oluştur ve link ekle
2. HTTPS'e geç (production API için SSL)
3. Age rating belirle ve ekle
4. app.json metadata'ları doldur

### Öncelik 2 (Önerilir):
1. Terms of Service ekle
2. EAS project ID düzelt
3. App icons ve screenshots hazırla

## 📝 Privacy Policy Örneği

Privacy Policy'de şunlar olmalı:
- Hangi veriler toplanıyor (favoriler, locale, timezone - sadece cihazda)
- Veriler nerede saklanıyor (sadece cihazda, AsyncStorage)
- Veriler kimlerle paylaşılıyor (kimseyle paylaşılmıyor)
- Kullanıcı hakları (verileri silme, uygulamayı kaldırma)

## 🎯 Sonuç

**Genel Durum**: %70 uyumlu
- Temel güvenlik ve privacy iyi
- Metadata ve dokümantasyon eksik
- HTTPS zorunlu (production için)

**Tahmini Süre**: 2-4 saat (Privacy Policy yazma + app.json düzenleme + HTTPS setup)

