# GoalBlip Web Client - PHP Setup (SEO Optimized)

## ✅ Tamamlananlar

1. **PHP Yapısı**
   - `index.php` - Ana landing page
   - `includes/header.php` - Header component (SEO meta tags)
   - `includes/footer.php` - Footer component
   - `includes/lang.php` - Dil yönetimi
   - `.htaccess` - URL routing

2. **Çeviri Dosyaları**
   - `translations/tr.json` - Türkçe
   - `translations/en.json` - İngilizce
   - `translations/es.json` - İspanyolca
   - `translations/de.json` - Almanca

3. **SEO Uyumlu URL Yapısı**
   - `/` → `/en/` (301 redirect, default English)
   - `/tr/` - Türkçe
   - `/en/` - İngilizce (default)
   - `/es/` - İspanyolca
   - `/de/` - Almanca
   - `/tr/privacy-policy` - Sayfa bazlı URL'ler
   - Cookie desteği (1 yıl)
   - Browser language detection

4. **SEO Özellikleri**
   - Canonical URLs
   - hreflang tags (tüm diller)
   - Open Graph meta tags
   - Twitter Card meta tags
   - Proper lang attributes
   - Meta descriptions ve keywords

## 📁 Dosya Yapısı

```
web-client/
├── index.php              # Ana sayfa
├── privacy-policy.php     # (Oluşturulacak)
├── support.php            # (Oluşturulacak)
├── styles.css             # CSS dosyası
├── script.js              # JavaScript dosyası
├── includes/
│   ├── header.php         # Header component
│   ├── footer.php         # Footer component
│   └── lang.php           # Dil yönetimi
└── translations/
    ├── tr.json            # Türkçe çeviriler
    ├── en.json            # İngilizce çeviriler
    ├── es.json            # İspanyolca çeviriler
    └── de.json            # Almanca çeviriler
```

## 🚀 Kullanım

### Apache Server (Önerilen)

`.htaccess` dosyası Apache'de çalışır. Apache mod_rewrite aktif olmalı.

```bash
# Apache'de test
# URL'ler:
https://goalblip.com/          → /en/ (redirect)
https://goalblip.com/en/       → İngilizce
https://goalblip.com/tr/       → Türkçe
https://goalblip.com/es/       → İspanyolca
https://goalblip.com/de/       → Almanca
https://goalblip.com/tr/privacy-policy → Türkçe Privacy Policy
```

### PHP Built-in Server (Test için)

PHP built-in server `.htaccess` desteklemez, manuel routing gerekir:

```bash
cd web-client
php -S localhost:8000 router.php
```

`router.php` dosyası oluşturulmalı (basit routing için).

### Çeviri Kullanımı

PHP dosyalarında:
```php
<?php echo t('hero.title'); ?>
<?php echo t('nav.home'); ?>
<?php echo t('features.feature1.title'); ?>
```

### Dil Değiştirme

URL parametresi ile:
```
index.php?lang=en
index.php?lang=tr
```

Header'daki dil butonları otomatik olarak doğru URL'leri oluşturur.

## 📝 Yapılacaklar

- [ ] `privacy-policy.php` sayfası oluştur
- [ ] `support.php` sayfası oluştur
- [ ] Privacy Policy çevirilerini ekle
- [ ] Support sayfası çevirilerini ekle
- [ ] JavaScript'i PHP ile uyumlu hale getir (dil değiştirme)

## 🔧 Notlar

- Tüm çeviriler JSON formatında
- `t()` fonksiyonu nested key'leri destekler: `features.feature1.title`
- Fallback: Eğer çeviri bulunamazsa, key veya default değer gösterilir
- Cookie 1 yıl süreyle saklanır

