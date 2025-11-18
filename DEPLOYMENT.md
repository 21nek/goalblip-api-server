# Production Deployment Guide

## Minimum Gereksinimler

- **CPU**: 2 vCPU
- **RAM**: 4GB (Puppeteer için yeterli)
- **Disk**: 40GB SSD
- **Node.js**: 18+
- **PM2**: Process manager (önerilir)

## Hızlı Kurulum

### 1. Sunucuya Bağlan ve Projeyi Kopyala

```bash
# Git ile
git clone <repo-url>
cd goalblip-api-server

# veya dosya transferi ile
scp -r goalblip-api-server user@server:/path/to/
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Environment Variables Ayarla

`.env` dosyası oluştur:

```bash
cp .env.example .env
nano .env
```

Minimum yapılandırma:

```env
PORT=4000
HOST=0.0.0.0
NODE_ENV=production
CORS_ORIGINS=*
API_KEY=your-secret-api-key-here
```

**Önemli:**
- `API_KEY` boş bırakılırsa, admin endpoint'ler API key kontrolü yapmaz
- `CORS_ORIGINS` için client domain'lerini virgülle ayır: `https://goalblip.com,https://app.goalblip.com`

### 4. PM2 ile Başlat

```bash
# PM2'yi global olarak yükle (eğer yoksa)
npm install -g pm2

# PM2 log dizinini oluştur
mkdir -p logs

# Uygulamayı başlat
pm2 start ecosystem.config.cjs --env production

# PM2'yi kaydet (sunucu restart'tan sonra otomatik başlasın)
pm2 save

# PM2 startup script'i oluştur
pm2 startup
# (Çıkan komutu çalıştır)
```

### 5. PM2 Komutları

```bash
# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs goalblip-api

# Yeniden başlat
pm2 restart goalblip-api

# Durdur
pm2 stop goalblip-api

# Sil
pm2 delete goalblip-api
```

## Nginx Reverse Proxy (Opsiyonel)

Nginx ile reverse proxy kurulumu:

```nginx
server {
    listen 80;
    server_name api.goalblip.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSL için Let's Encrypt:

```bash
sudo certbot --nginx -d api.goalblip.com
```

## Rate Limiting

API'de rate limiting aktif:

- **Public endpoint'ler** (`/api/matches`, `/api/matches/:date`): Dakikada 60 istek/IP
- **Match detail** (`/api/match/:id`): Dakikada 20 istek/IP
- **Admin endpoint'ler**: API key gerekli

## API Key Kullanımı

Admin endpoint'ler için API key gerekli:

```bash
# Örnek: Manuel scrape
curl -X POST http://localhost:4000/api/matches/scrape \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-api-key-here" \
  -d '{"view": "today", "locale": "tr"}'
```

**Not:** Mobil uygulama için API key gerekmez! Sadece admin endpoint'ler için.

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process info
pm2 info goalblip-api
```

### Log Rotation

PM2 log rotation için:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health Check

```bash
curl http://localhost:4000/api/health
```

## Troubleshooting

### Port Zaten Kullanılıyor

```bash
# Port'u kullanan process'i bul
sudo lsof -i :4000

# Process'i öldür
kill -9 <PID>
```

### Puppeteer Chromium Hatası

```bash
# Chromium bağımlılıklarını yükle (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### Memory Sorunları

PM2 config'de `max_memory_restart` ayarını düşür:

```javascript
max_memory_restart: '500M', // 1G yerine
```

## Güvenlik Notları

1. **Firewall**: Sadece gerekli port'ları aç (4000 veya 80/443)
2. **API Key**: Güçlü, rastgele bir API key kullan
3. **CORS**: Production'da `CORS_ORIGINS`'i spesifik domain'lere ayarla
4. **HTTPS**: Production'da mutlaka HTTPS kullan (Let's Encrypt)
5. **Environment Variables**: `.env` dosyasını git'e commit etme!

## Backup

Data dizinini düzenli yedekle:

```bash
# Cron job örneği (günlük backup)
0 2 * * * tar -czf /backup/goalblip-data-$(date +\%Y\%m\%d).tar.gz /path/to/goalblip-api-server/data
```

