# API Bağlantı Kurulumu

## Sorun: API'den Veri Çekilemiyor

### 1. API Sunucusunu Başlat

Ana dizinde API sunucusunu başlat:

```bash
cd /home/nek/Projects/goalblip-api-server
npm run server
# veya
node server.js
# veya başka bir komut (package.json'a bak)
```

API sunucusu `http://localhost:4000` adresinde çalışmalı.

### 2. Mobil Cihazda IP Adresi Kullan

**ÖNEMLİ:** Expo Go mobil cihazda çalışırken `localhost` çalışmaz! Bilgisayarının IP adresini kullanmalısın.

#### IP Adresini Öğren:

```bash
# Linux/Mac
ip addr show | grep "inet " | grep -v 127.0.0.1
# veya
hostname -I

# Windows
ipconfig
# "IPv4 Address" değerini bul
```

#### API URL'i Ayarla:

```bash
cd clientv3

# Örnek: IP adresin 192.168.1.106 ise (terminal'deki QR kodundan görüyorum)
export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.106:4000

# Sonra uygulamayı başlat
npm start
```

### 3. API Sunucusunun Ağa Açık Olduğundan Emin Ol

API sunucusu sadece `localhost`'a bağlıysa, mobil cihazdan erişilemez. Sunucunun `0.0.0.0` veya IP adresine bağlı olduğundan emin ol.

### 4. Test Et

1. API sunucusunun çalıştığını kontrol et:
   ```bash
   curl http://localhost:4000/api/matches?view=today&locale=tr
   ```

2. Mobil cihazdan erişilebilirliği test et (IP adresini kullan):
   ```bash
   curl http://192.168.1.106:4000/api/matches?view=today&locale=tr
   ```

### 5. Firewall Kontrolü

Firewall'un 4000 portunu engellemediğinden emin ol:

```bash
# Linux (ufw)
sudo ufw allow 4000

# veya iptables
sudo iptables -A INPUT -p tcp --dport 4000 -j ACCEPT
```

## Debug

Console log'larında şunları göreceksin:

- `[Config] API Base URL: ...` - Hangi URL kullanılıyor
- `[API] Fetching: ...` - Hangi endpoint'e istek atılıyor
- `[API] Response received in Xms: ...` - Yanıt geldi mi, ne kadar sürdü
- `[API] Success: ...` - Başarılı
- `[API] Error: ...` - Hata var

Eğer "Network error" görüyorsan, API sunucusuna ulaşılamıyor demektir.

