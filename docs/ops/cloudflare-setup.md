# Cloudflare Setup Guide

## API Sunucusunu Cloudflare'e Bağlama

### 1. DNS Ayarları

Cloudflare dashboard'da DNS ayarları:

```
Type: A
Name: api
Content: [Sunucu IP adresi]
Proxy: ✅ Proxied (Cloudflare CDN aktif)
TTL: Auto
```

**Önemli**: Proxy'yi aktif et (turuncu bulut) - böylece Cloudflare HTTPS sağlar.

### 2. SSL/TLS Ayarları

Cloudflare dashboard → SSL/TLS → Overview:

**Önerilen**: **Full (strict)** veya **Full**

- **Full**: Cloudflare ↔ Sunucu arası HTTPS (sunucuda SSL sertifikası gerekli)
- **Full (strict)**: Full + geçerli sertifika kontrolü
- **Flexible**: Cloudflare ↔ Sunucu arası HTTP (sadece kullanıcı ↔ Cloudflare HTTPS)

**En kolay**: **Flexible** (sunucuda SSL sertifikası gerekmez, ama güvenlik açısından Full önerilir)

### 3. Sunucu Tarafı (Nginx/Express)

#### Seçenek A: Flexible SSL (Kolay)
- Sunucuda SSL sertifikası gerekmez
- Express direkt `http://localhost:4000` çalışabilir
- Cloudflare HTTPS'i handle eder

#### Seçenek B: Full SSL (Önerilen)
- Sunucuda da SSL sertifikası gerekli
- Let's Encrypt ile ücretsiz sertifika:
  ```bash
  sudo certbot --nginx -d api.goalblip.com
  ```
- Nginx reverse proxy kullan (DEPLOYMENT.md'de var)

### 4. Client Config

`clientv3/lib/config.ts`:

```typescript
// Production
export const API_BASE_URL = 'https://api.goalblip.com';

// Development (local)
// export const API_BASE_URL = 'http://192.168.1.110:4000';
```

### 5. Cloudflare Ayarları

#### Firewall Rules (Opsiyonel)
Rate limiting için Cloudflare Firewall Rules kullanabilirsin:
- IP bazlı rate limiting
- Country blocking (opsiyonel)
- Bot protection

#### Page Rules (Opsiyonel)
- Cache ayarları (API için genelde cache kapalı)
- SSL ayarları

### 6. Test

```bash
# HTTPS çalışıyor mu?
curl https://api.goalblip.com/api/health

# SSL sertifikası doğru mu?
openssl s_client -connect api.goalblip.com:443 -servername api.goalblip.com
```

### 7. iOS ATS Uyumluluğu

Cloudflare HTTPS kullandığında:
- ✅ iOS ATS uyumlu
- ✅ `app.json`'daki ATS config çalışacak
- ✅ App Store onayı alınacak

### 8. CORS Ayarları

`src/server/index.js`'de CORS ayarları:

```javascript
CORS_ORIGINS=https://goalblip.com,https://app.goalblip.com
```

Cloudflare domain'ini de ekle (gerekirse):
```javascript
CORS_ORIGINS=https://api.goalblip.com,https://goalblip.com
```

## Özet

1. ✅ DNS'de `api.goalblip.com` → Sunucu IP (Proxy aktif)
2. ✅ SSL/TLS: Full veya Flexible
3. ✅ Client config: `https://api.goalblip.com`
4. ✅ CORS ayarları güncelle
5. ✅ Test et

**Sonuç**: Cloudflare HTTPS sağlayacak, iOS ve Android uyumlu olacak! 🎉

