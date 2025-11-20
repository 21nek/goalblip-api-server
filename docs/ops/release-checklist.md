## GoalBlip Android Release Checklist

### 1. API / Config
- [ ] `goalblip-mobile/lib/config.ts` fallback URL production’a (`https://df.goalblip.com`) çekildi mi?
- [ ] `EXPO_PUBLIC_API_BASE_URL` `.env` veya EAS profile’da `https://df.goalblip.com` olarak set mi?

### 2. Versiyon & Build Numaraları
- [ ] `app.json` (veya `app.config.ts`) → `"version": "1.0.0"`
- [ ] `android.versionCode` artırıldı (örn. `1`, sonraki release `2` olacak).

### 3. Keystore / İmza
- [ ] `npx eas credentials` ile production keystore oluşturuldu ya da import edildi.
- [ ] Keystore bilgileri güvenli yerde saklandı.

### 4. EAS Build Profilleri
- [ ] `eas.json` içerisinde `production`/`apk` profil mevcut.
- [ ] Komut: `npx eas build --platform android --profile production` ile release alınabiliyor.

### 5. Gizlilik Politikası
- [x] Uygulama Settings ekranında gizlilik politikası linki var.
- [ ] Play Console ve web site açıklamalarında `https://www.goalblip.com/en/privacy-policy` kullanıldı mı?

### 6. Store Metadata & Assetler
- [ ] Uygulama adı, kısa/uzun açıklama hazır.
- [ ] 512x512 ikon, 1024x500 feature graphic tasarlandı.
- [ ] Minimum 2 ekran görüntüsü (telefon boyutu) hazır.

### 7. Test / QA
- [ ] `npx expo start --no-dev --minify` ile local prod mod test edildi, hata yok.
- [ ] Fiziksel cihazda release APK/AAB sideload edilip kritik akışlar (liste, detay, favori, ayarlar) denendi.

### 8. Play Store Formları
- [ ] Hedef kitle + İçerik derecelendirmesi formu dolduruldu.
- [ ] Data Safety (veri güvenliği) formu dolduruldu (toplanan veriler belirtildi).
- [ ] Reklam / IAP kullanımı doğru işaretlendi (şu an yoksa “hayır” seçildi).

### 9. Ek Kontroller
- [ ] API loglarında hata yok (PM2 + Nginx).
- [ ] Domain SSL yenilenme tarihi not edildi (`certbot certificates`).
- [ ] Yedekleme/yapılandırma dosyaları (docs, env notları) güncel.

Bu liste tamamlandığında `npx eas build --platform android --profile production` çıktısını Play Console’a yükleyebilirsin. Checklist her release öncesi güncellenecek şekilde `docs/ops` altında saklanır.

### Keystore & EAS Notlar�
- Keystore olu�turma: `npx eas credentials` -> Android -> Generate keystore.
- Alternatif: mevcut keystore'u import et ve g�venli yerde sakla.
- Prod build: `npx eas build --platform android --profile production` (AAB) veya `--profile apk` test i�in.

### QA / Test Komutlar�
- Local prod test: `npx expo start --no-dev --minify`
- Release buildi cihazda dene: `npx eas build --platform android --profile apk` sonras� APK'y� indir ve sideload et.

### Play Store Formlar� Hat�rlatmas�
- ��erik derecelendirmesi sorular�n� tamamla.
- Data Safety formunda hangi verileri toplad���m�z� (analitik/log vs) belirt.
- Reklam/IAP yoksa ilgili alanlar� "hay�r" olarak i�aretle.

