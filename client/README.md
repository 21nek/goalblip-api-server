# GoalBlip Companion (shadcn)

Mobil öncelikli, shadcn tabanlı React (Vite) uygulaması. API `http://localhost:4000` adresindeki GoalBlip sunucusuna bağlanır ve maç listesi + maç detaylarını gösterir.

## Özellikler
- `today` / `tomorrow` sekmeleri arasında geçiş.
- Lig filtreleri (yatay kaydırmalı chip'ler).
- Maç kartları ve detay drawer'ı (Radix Sheet) ile skor, tahmin ve oran verileri.
- PWA manifest + responsive tasarım ⇒ mobil tarayıcılarda “uygulama” gibi çalışır.

## Kurulum
```bash
cd client
npm install
```

## Geliştirme
```bash
npm run dev
```
Vite dev sunucusu varsayılan olarak `http://localhost:5175` üzerinde çalışır.

> API için GoalBlip sunucusunu `npm run server` ile `http://localhost:4000` adresinde çalıştırmayı unutmayın.

## Üretim Derlemesi
```bash
npm run build
npm run preview
```

## Yapı
- `src/App.tsx`: Sekmeler, lig filtresi, maç kartları ve detay sheet'ini yönetir.
- `src/hooks/useMatchData.ts`: Liste ve detay için veri çekme hook'ları.
- `src/components/match/*`: MatchCard, LeagueRail, MatchDetailSheet vb.
- `src/components/ui/*`: shadcn uyumlu Button, Card, Tabs, Sheet, Badge vb.

`tailwind.config.js` shadcn preset'ine göre ayarlanmıştır; isteğe göre tema renkleri güncellenebilir.
