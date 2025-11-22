# GoalBlip Web Client

SEO uyumlu, çok dilli landing page.

## 🌍 URL Yapısı

- `/` → `/en/` (301 redirect, default İngilizce)
- `/en/` - İngilizce (ana dil, SEO için)
- `/tr/` - Türkçe
- `/es/` - İspanyolca
- `/de/` - Almanca
- `/tr/privacy-policy` - Sayfa bazlı URL'ler

## 🚀 Kurulum

### Apache Server (Production)

1. `.htaccess` dosyası Apache mod_rewrite gerektirir
2. Dosyaları web root'a kopyala
3. Apache'de mod_rewrite aktif olmalı

### Test

```bash
# Apache'de:
https://goalblip.com/          → /en/ (redirect)
https://goalblip.com/en/       → İngilizce
https://goalblip.com/tr/       → Türkçe
```

## 📋 SEO Özellikleri

✅ Canonical URLs  
✅ hreflang tags (tüm diller)  
✅ Open Graph meta tags  
✅ Twitter Card meta tags  
✅ Proper lang attributes  
✅ Meta descriptions  

## 📁 Dosya Yapısı

- `index.php` - Ana sayfa
- `includes/header.php` - Header (SEO meta tags)
- `includes/footer.php` - Footer
- `includes/lang.php` - Dil yönetimi
- `.htaccess` - URL routing
- `translations/` - Çeviri dosyaları

## ⚙️ Ayarlar

`includes/lang.php` dosyasında domain'i güncelle:
```php
$baseUrl = 'https://goalblip.com'; // Kendi domain'in
```
