# Store Submission Readiness Report - GoalBlip

**Tarih:** 2025-01-XX  
**Durum:** %75 Hazır - Bazı kritik eksikler var

---

## ✅ TAMAMLANANLAR

### Teknik Gereksinimler
- ✅ **App Icon**: `assets/icon.png` mevcut
- ✅ **Splash Screen**: `assets/splash.png` mevcut
- ✅ **Bundle Identifier**: `com.goalblip.app` (iOS)
- ✅ **Package Name**: `com.goalblip.app` (Android)
- ✅ **App Description**: `app.json`'da mevcut
- ✅ **Privacy Policy Link**: `app.json`'da mevcut (`https://goalblip.com/privacy-policy`)
- ✅ **Permissions**: Hiçbir izin istenmiyor ✅
- ✅ **Data Collection**: Sadece local storage (AsyncStorage)
- ✅ **Third-party Tracking**: Yok ✅

### Uygulama Özellikleri
- ✅ Çoklu dil desteği (TR, EN, ES, DE)
- ✅ Responsive tasarım
- ✅ Favori maç takibi
- ✅ Timezone desteği

---

## ⚠️ KRİTİK EKSİKLER (Store Submission İçin Zorunlu)

### 1. **Privacy Policy Web Sayfası** 🔴
- **Durum**: Link `app.json`'da var ama gerçek sayfa yayınlanmış mı?
- **Gereksinim**: `https://goalblip.com/privacy-policy` sayfası aktif olmalı
- **Çözüm**: 
  - `PRIVACY_POLICY_TEMPLATE.md` dosyasını kullan
  - Web'de yayınla
  - Link'i test et

### 2. **iOS App Transport Security (ATS)** 🔴
- **Sorun**: `app.json`'da placeholder domain var: `"your-api-domain.com"`
- **Gereksinim**: Production API domain'i eklenmeli
- **Çözüm**: 
  ```json
  "NSExceptionDomains": {
    "api.goalblip.com": {
      "NSExceptionAllowsInsecureHTTPLoads": false,
      "NSIncludesSubdomains": true
    }
  }
  ```
- **Not**: Production'da HTTPS zorunlu

### 3. **HTTPS (Production API)** 🔴
- **Durum**: Şu an local IP kullanılıyor (`http://192.168.137.63:4000`)
- **Gereksinim**: Production'da HTTPS zorunlu
- **Çözüm**: 
  - API'yi sunucuya taşı
  - Cloudflare SSL kurulumu yap
  - `config.ts`'de production URL'i aktif et

### 4. **Support URL/Email** 🔴
- **Durum**: `app.json`'da yok
- **Gereksinim**: App Store ve Play Store için zorunlu
- **Çözüm**: 
  - Support email: `support@goalblip.com` oluştur
  - Support URL: `https://goalblip.com/support` oluştur
  - `app.json`'a ekle

### 5. **Age Rating** 🔴
- **Durum**: `app.json`'da yok
- **Gereksinim**: Her iki store için zorunlu
- **Önerilen**: 
  - iOS: `4+` (Spor içeriği, şiddet yok)
  - Android: `Everyone` (PEGI 3)
- **Çözüm**: `app.json`'a ekle

### 6. **Category** 🔴
- **Durum**: `app.json`'da yok
- **Gereksinim**: Her iki store için zorunlu
- **Önerilen**: `Sports`
- **Çözüm**: `app.json`'a ekle

### 7. **Screenshots** 🔴
- **Durum**: Kontrol edilmeli
- **Gereksinim**: 
  - iOS: En az 1 screenshot (iPhone 6.7" veya 6.5")
  - Android: En az 2 screenshot (Phone: 1080x1920+)
- **Çözüm**: Uygulamadan screenshot'lar al ve hazırla

---

## ⚠️ ÖNERİLEN EKSİKLER (Submission İçin Zorunlu Değil Ama Önerilir)

### 8. **Keywords (iOS)** 🟡
- **Durum**: `app.json`'da yok
- **Gereksinim**: App Store'da arama için önemli
- **Önerilen**: `futbol,maç,analiz,istatistik,takım,lig,skor,premier,la liga,champions`
- **Çözüm**: `app.json`'a ekle

### 9. **EAS Project ID** 🟡
- **Durum**: Placeholder UUID kullanılıyor (`00000000-0000-0000-0000-000000000000`)
- **Gereksinim**: EAS build için gerekli
- **Çözüm**: 
  - `eas init` çalıştır
  - Gerçek project ID'yi al
  - `app.json`'a ekle

### 10. **Terms of Service** 🟡
- **Durum**: Yok
- **Gereksinim**: Zorunlu değil ama önerilir
- **Çözüm**: Terms of Service sayfası oluştur ve link ekle

### 11. **Feature Graphic (Android)** 🟡
- **Durum**: Yok
- **Gereksinim**: Play Store'da üstte gösterilir
- **Boyut**: 1024x500 PNG
- **Çözüm**: Tasarım hazırla

---

## 📋 YAPILMASI GEREKENLER CHECKLIST

### Öncelik 1 (Store Submission İçin Zorunlu):
- [ ] Privacy Policy web sayfasını yayınla ve test et
- [ ] iOS ATS config'deki placeholder domain'i düzelt
- [ ] API'yi HTTPS'e geçir (production için)
- [ ] Support email oluştur (`support@goalblip.com`)
- [ ] Support URL oluştur (`https://goalblip.com/support`)
- [ ] Age rating ekle (`app.json`)
- [ ] Category ekle (`app.json`)
- [ ] Screenshots hazırla (iOS: 1+, Android: 2+)

### Öncelik 2 (Önerilir):
- [ ] Keywords ekle (`app.json`)
- [ ] EAS project ID oluştur ve ekle
- [ ] Terms of Service sayfası oluştur
- [ ] Feature Graphic hazırla (Android)

### Öncelik 3 (İsteğe Bağlı):
- [ ] Marketing website oluştur
- [ ] App preview video hazırla
- [ ] Social media hesapları oluştur

---

## 🎯 SONUÇ

**Genel Durum**: %75 Hazır

**Store Submission İçin:**
- ✅ Teknik altyapı hazır
- ✅ Privacy ve güvenlik uyumlu
- ⚠️ Metadata eksikleri var
- ⚠️ Web sayfaları (Privacy Policy, Support) eksik
- ⚠️ HTTPS production için gerekli

**Tahmini Süre**: 4-6 saat
- Privacy Policy yazma ve yayınlama: 1 saat
- Support sayfası/email: 1 saat
- Metadata doldurma: 30 dakika
- Screenshots hazırlama: 1 saat
- HTTPS/SSL kurulumu: 1-2 saat
- Test ve düzeltmeler: 30 dakika

**Önerilen Sıra:**
1. Privacy Policy ve Support sayfalarını yayınla
2. `app.json` metadata'larını doldur
3. Screenshots hazırla
4. API'yi production'a taşı ve HTTPS kur
5. Test et ve submit et

---

## 📝 NOTLAR

1. **"Bahis/Tahmin" Kelimeleri**: Metadata'larda "bahis", "tahmin", "kumar" kelimelerini KULLANMA. Sadece "analiz", "istatistik" kullan.

2. **Age Rating**: Eğer "tahmin" kelimesi kullanılırsa 17+ olur. Bu yüzden sadece "analiz" kullan.

3. **Category**: "Sports" kategorisinde kal, "Entertainment" veya "Games" kategorisine geçme.

4. **HTTPS**: Production'da mutlaka HTTPS kullan. iOS ATS HTTP'ye izin vermez.

5. **Privacy Policy**: Gerçekten yayınlanmış olmalı, sadece link yeterli değil.

