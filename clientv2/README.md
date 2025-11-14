# GoalBlip Client v2 (Expo + Web)

Mobil öncelikli ama Expo sayesinde web üzerinde de çalışan yeni arayüz. Tasarımda Bilyoner/iddaa tarzı koyu tema, büyük kartlar ve maç listesi deneyimi hedeflenir. Veri kaynağı `http://localhost:4000` adresindeki GoalBlip API'dir.

## Kurulum
```bash
cd clientv2
npm install
```

İsteğe bağlı olarak `.env` veya shell ortamına `EXPO_PUBLIC_API_BASE_URL=https://my-api.example.com` yazarak farklı bir GoalBlip API originine işaret edebilirsiniz. Üretimde sunucu ve istemci ayrı makinelerde çalışacağı için bu değişkeni her ortamda doğru host/port ile set etmek yeterlidir (istemci tarafında ek cache yoktur).

## Çalıştırma
- `npm start` → Expo CLI (QR kod / web / emulator)
- `npm run web` → Tarayıcıda React Native Web
- `npm run android` / `npm run ios` → Native build (Expo Go veya run:android/ios)

> API'nin `npm run server` komutu ile 4000 portunda çalıştığından emin olun. Mobile cihazla aynı ağda olacaksanız bilgisayar IP adresini `EXPO_PUBLIC_API_BASE_URL` olarak belirtin.

## Sayfalar
- `/` (Home): Bugünün/yarının maç sayıları, lig spotlight ve highlight tahmin kartları.
- `/matches`: Today/Tomorrow sekmeleri, lig filtresi, kart bazlı maç satırları.
- `/matches/[matchId]`: Skorboard, highlight tahminleri ve meta bilgiler.

## Yapı
```
clientv2/
  app/                # Expo Router ekranları
  components/         # RN UI kartları
  lib/                # API & helper fonksiyonlar
  types/              # API responce tipleri
```

## Sonraki Adımlar
- `components` altında daha fazla reusable atom (buton, chip) ekleyip tema sistemini genişlet.
- Expo için ikon/splash görsellerini `assets/` altında doldur.
- Offline cache veya Zustand/React Query gibi state yönetimi entegre et.
