# GoalBlip Client v3

Expo Go ile tam uyumlu, mobil öncelikli React Native uygulaması. Android ve iOS'ta sorunsuz çalışır.

## Özellikler

- ✅ Expo Go uyumlu (rowGap/columnGap gibi web-only özellikler kullanılmaz)
- ✅ Android ve iOS desteği
- ✅ Koyu tema (Bilyoner/iddaa tarzı)
- ✅ Maç listesi ve detay sayfaları
- ✅ AI tahminleri ve oran trendleri
- ✅ Lig filtreleme ve arama

## Kurulum

```bash
cd clientv3
npm install
```

## Çalıştırma

```bash
# Expo Go için
npm start

# Android emulator için
npm run android

# iOS simulator için
npm run ios

# Web için (opsiyonel)
npm run web
```

## API Konfigürasyonu

**ÖNEMLİ:** Expo Go mobil cihazda çalışırken `localhost` çalışmaz! Bilgisayarının IP adresini kullanmalısın.

### Hızlı Kurulum

1. `.env` dosyası oluştur (proje kök dizininde):
```bash
cd clientv3
echo "EXPO_PUBLIC_API_BASE_URL=http://192.168.1.106:4000" > .env
```

2. IP adresini güncelle (terminal'deki QR kodundan IP'yi görebilirsin)

3. Metro bundler'ı yeniden başlat:
```bash
npm start -- --clear
```

### IP Adresini Öğrenme

**Linux/Mac:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# veya
hostname -I
```

**Windows:**
```bash
ipconfig
# "IPv4 Address" değerini bul
```

### Manuel Ayarlama (Opsiyonel)

```bash
# Environment variable ile
export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.106:4000
npm start
```

**Not:** 
- API sunucusunun (`npm run server`) çalıştığından ve aynı ağda olduğundan emin ol!
- `.env` dosyası kullanıyorsan, Metro bundler'ı yeniden başlatman gerekebilir (`npm start -- --clear`)

## Yapı

```
clientv3/
├── app/                    # Expo Router sayfaları
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Ana sayfa
│   └── matches/           # Maç sayfaları
├── components/             # UI bileşenleri
├── hooks/                  # Custom hooks
├── lib/                    # API & helpers
├── providers/              # Context providers
└── types/                  # TypeScript tipleri
```

## Teknolojiler

- Expo SDK 52
- React Native 0.76.5
- Expo Router 4.0
- TypeScript
- React 18.3.1

## Notlar

- Tüm stiller React Native uyumludur (web-only özellikler yok)
- Expo Go'da test edilmiştir
- SafeAreaView kullanılarak notch/status bar uyumluluğu sağlanmıştır

