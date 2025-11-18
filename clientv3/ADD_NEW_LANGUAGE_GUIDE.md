# Yeni Dil Ekleme Rehberi

## 📊 Mevcut Durum Analizi

### ✅ Altyapı Durumu: **ÇOK MÜSAİT** 🎉

Mevcut i18n altyapısı yeni dil eklemek için **tamamen hazır**. Sistem modüler ve genişletilebilir yapıda.

### 📈 İstatistikler:
- **Mevcut Diller:** 3 (Türkçe, İngilizce, İspanyolca)
- **Toplam Translation Key:** ~460 satır
- **Translation Dosyaları:** Her dil için 1 JSON dosyası
- **Dil Seçimi:** Initial setup ve Settings sayfalarında

---

## 🔧 Yeni Dil Eklemek İçin Gereken Adımlar

### 1. **Translation JSON Dosyası Oluştur** ⭐ (EN ÖNEMLİ)

**Dosya:** `clientv3/lib/i18n/translations/[dil-kodu].json`

**Örnek:** Almanca eklemek için `de.json` oluştur

**İçerik:** Mevcut `tr.json` veya `en.json` dosyasını kopyala ve tüm metinleri çevir.

**Yapı:**
```json
{
  "common": {
    "loading": "...",
    "error": "...",
    ...
  },
  "home": {
    ...
  },
  ...
}
```

**⚠️ ÖNEMLİ:** Tüm key'ler aynı olmalı! Eksik key olursa fallback olarak Türkçe gösterilir.

---

### 2. **Locale Provider'a Dil Ekle**

**Dosya:** `clientv3/providers/locale-provider.tsx`

**Değişiklikler:**

#### a) `SUPPORTED_LOCALES` array'ine ekle:
```typescript
export const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'de'] as const; // 'de' eklendi
```

#### b) `LOCALE_LABEL_KEYS` object'ine ekle:
```typescript
export const LOCALE_LABEL_KEYS: Record<Locale, string> = {
  tr: 'settings.localeNames.tr',
  en: 'settings.localeNames.en',
  es: 'settings.localeNames.es',
  de: 'settings.localeNames.de', // YENİ
};
```

#### c) `LOCALE_NATIVE_META` object'ine ekle:
```typescript
export const LOCALE_NATIVE_META: Record<Locale, { nativeName: string; languageWord: string }> = {
  tr: { nativeName: 'Türkçe', languageWord: 'Dil' },
  en: { nativeName: 'English', languageWord: 'Language' },
  es: { nativeName: 'Español', languageWord: 'Idioma' },
  de: { nativeName: 'Deutsch', languageWord: 'Sprache' }, // YENİ
};
```

---

### 3. **i18n Index'e Translation Dosyasını Ekle**

**Dosya:** `clientv3/lib/i18n/index.ts`

**Değişiklikler:**

#### a) Import ekle:
```typescript
import trTranslations from './translations/tr.json';
import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';
import deTranslations from './translations/de.json'; // YENİ
```

#### b) `translations` object'ine ekle:
```typescript
const translations: Record<Locale, typeof trTranslations> = {
  'tr': trTranslations,
  'en': enTranslations,
  'es': esTranslations,
  'de': deTranslations, // YENİ
  // Opsiyonel: Variant'lar için (örneğin de-AT, de-CH)
  'de-AT': deTranslations, // Avusturya Almancası için
  'de-CH': deTranslations, // İsviçre Almancası için
};
```

---

### 4. **Settings Translation'larına Dil Adını Ekle**

**Dosya:** `clientv3/lib/i18n/translations/[her-dil]/settings.json` (aslında `settings.localeNames` key'i)

**Her dil dosyasında (`tr.json`, `en.json`, `es.json`, `de.json` vs.) `settings.localeNames` bölümüne ekle:**

```json
{
  "settings": {
    "localeNames": {
      "tr": "Türkçe",
      "en": "English",
      "es": "Español",
      "de": "Deutsch"  // YENİ - her dil dosyasına ekle
    }
  }
}
```

**⚠️ ÖNEMLİ:** Bu key'i **TÜM DİL DOSYALARINA** eklemen gerekiyor! (tr.json, en.json, es.json, de.json, vs.)

---

## 📝 Örnek: Almanca (de) Ekleme

### Adım 1: `de.json` oluştur
```bash
cp clientv3/lib/i18n/translations/en.json clientv3/lib/i18n/translations/de.json
# Sonra tüm metinleri Almancaya çevir
```

### Adım 2: `locale-provider.tsx` güncelle
```typescript
export const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'de'] as const;

export const LOCALE_LABEL_KEYS: Record<Locale, string> = {
  tr: 'settings.localeNames.tr',
  en: 'settings.localeNames.en',
  es: 'settings.localeNames.es',
  de: 'settings.localeNames.de',
};

export const LOCALE_NATIVE_META: Record<Locale, { nativeName: string; languageWord: string }> = {
  tr: { nativeName: 'Türkçe', languageWord: 'Dil' },
  en: { nativeName: 'English', languageWord: 'Language' },
  es: { nativeName: 'Español', languageWord: 'Idioma' },
  de: { nativeName: 'Deutsch', languageWord: 'Sprache' },
};
```

### Adım 3: `lib/i18n/index.ts` güncelle
```typescript
import deTranslations from './translations/de.json';

const translations: Record<Locale, typeof trTranslations> = {
  'tr': trTranslations,
  'en': enTranslations,
  'es': esTranslations,
  'de': deTranslations,
};
```

### Adım 4: Tüm dil dosyalarına `settings.localeNames.de` ekle
```json
// tr.json, en.json, es.json, de.json - HEPSİNE
{
  "settings": {
    "localeNames": {
      "tr": "Türkçe",
      "en": "English",
      "es": "Español",
      "de": "Deutsch"
    }
  }
}
```

---

## ✅ Test Etme

1. Uygulamayı başlat
2. Initial setup veya Settings'e git
3. Yeni dil seçeneğinin göründüğünü kontrol et
4. Dili seç ve tüm ekranlarda çevirilerin doğru göründüğünü kontrol et

---

## 🎯 Desteklenen Dil Kodları (ISO 639-1)

Yaygın diller için kodlar:
- `de` - Almanca (Deutsch)
- `fr` - Fransızca (Français)
- `it` - İtalyanca (Italiano)
- `pt` - Portekizce (Português)
- `ru` - Rusça (Русский)
- `ar` - Arapça (العربية)
- `zh` - Çince (中文)
- `ja` - Japonca (日本語)
- `ko` - Korece (한국어)
- `pl` - Lehçe (Polski)
- `nl` - Felemenkçe (Nederlands)
- `sv` - İsveççe (Svenska)
- `no` - Norveççe (Norsk)
- `da` - Danca (Dansk)
- `fi` - Fince (Suomi)
- `cs` - Çekçe (Čeština)
- `ro` - Romence (Română)
- `hu` - Macarca (Magyar)
- `el` - Yunanca (Ελληνικά)
- `he` - İbranice (עברית)
- `hi` - Hintçe (हिन्दी)

---

## 🔍 Variant Diller (Opsiyonel)

Bazı dillerin bölgesel varyantları var. Örneğin:
- `es-ES` (İspanya İspanyolcası) → `es.json` kullanılıyor
- `es-AR` (Arjantin İspanyolcası) → `es.json` kullanılıyor
- `pt-BR` (Brezilya Portekizcesi) → `pt.json` kullanılabilir
- `pt-PT` (Portekiz Portekizcesi) → `pt.json` kullanılabilir
- `de-AT` (Avusturya Almancası) → `de.json` kullanılabilir
- `de-CH` (İsviçre Almancası) → `de.json` kullanılabilir

**Variant eklemek için:**
```typescript
// lib/i18n/index.ts
const translations: Record<Locale, typeof trTranslations> = {
  'de': deTranslations,
  'de-AT': deTranslations, // Avusturya variant'ı
  'de-CH': deTranslations, // İsviçre variant'ı
};
```

---

## ⚠️ Önemli Notlar

1. **Fallback Mekanizması:** Eğer bir key bulunamazsa, otomatik olarak Türkçe'ye (`tr`) fallback yapılır.

2. **Key Tutarlılığı:** Tüm dil dosyalarında aynı key yapısı olmalı. Eksik key'ler console'da uyarı verir.

3. **Parameter Support:** `{count}`, `{time}` gibi parametreler destekleniyor. Çevirilerde bunları koru:
   ```json
   {
     "matches": "{count} maç"  // ✅ DOĞRU
     "matches": "maç"          // ❌ YANLIŞ (parametre kayboldu)
   }
   ```

4. **Çoklu Satır:** `\n` ile çoklu satır destekleniyor:
   ```json
   {
     "message": "Satır 1\nSatır 2"
   }
   ```

5. **Özel Karakterler:** JSON'da escape et:
   ```json
   {
     "quote": "Alıntı: \"Merhaba\""
   }
   ```

---

## 📊 Çeviri İstatistikleri

- **Toplam Key Sayısı:** ~460 satır
- **Ana Kategoriler:**
  - `common` - Genel terimler (~20 key)
  - `home` - Ana sayfa (~30 key)
  - `match` - Maç detayları (~50 key)
  - `matchDetail` - Detaylı analiz (~200 key)
  - `settings` - Ayarlar (~30 key)
  - `filter` - Filtreleme (~20 key)
  - `errors` - Hata mesajları (~10 key)
  - Diğerleri...

---

## 🚀 Hızlı Başlangıç

Yeni bir dil eklemek için:

1. ✅ `translations/[dil-kodu].json` oluştur (en.json'dan kopyala)
2. ✅ `locale-provider.tsx`'de 3 yerde güncelle (SUPPORTED_LOCALES, LOCALE_LABEL_KEYS, LOCALE_NATIVE_META)
3. ✅ `lib/i18n/index.ts`'de import ve translations object'ine ekle
4. ✅ Tüm dil dosyalarına `settings.localeNames.[dil-kodu]` ekle
5. ✅ Çevirileri yap
6. ✅ Test et

**Toplam Süre:** ~30 dakika (çeviri hariç)

---

## 💡 İpuçları

1. **Çeviri Kalitesi:** Google Translate veya DeepL kullanabilirsin, ama mutlaka native speaker kontrolü yap.

2. **Futbol Terimleri:** Futbol terimleri bazen çevrilmez (örneğin "kickoff", "match", "league" bazı dillerde aynı kalır).

3. **Kültürel Uyum:** Bazı ifadeler kültürel olarak uyarlanmalı. Örneğin "az önce" → "just now" (İngilizce), "hace un momento" (İspanyolca).

4. **Test:** Her ekranda test et, özellikle:
   - Initial setup
   - Ana sayfa
   - Maç detay sayfası
   - Settings
   - Drawer menu
   - Favoriler

---

**Son Güncelleme:** [Bugünün Tarihi]

