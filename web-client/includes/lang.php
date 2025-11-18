<?php
/**
 * Language Management for GoalBlip Web Client
 * SEO-friendly URL structure: /tr/, /en/, /es/, /de/
 * Supports: TR, EN, ES, DE
 */

// Supported languages
define('SUPPORTED_LANGS', ['tr', 'en', 'es', 'de']);
define('DEFAULT_LANG', 'en'); // English as default for SEO

// Get language from URL parameter (set by .htaccess) or URL path
function getCurrentLang() {
    // Check URL parameter first (set by .htaccess)
    if (isset($_GET['lang']) && in_array($_GET['lang'], SUPPORTED_LANGS)) {
        $lang = $_GET['lang'];
        setcookie('lang', $lang, time() + (365 * 24 * 60 * 60), '/'); // 1 year
        return $lang;
    }
    
    // Check URL path
    $requestUri = $_SERVER['REQUEST_URI'];
    $path = parse_url($requestUri, PHP_URL_PATH);
    
    // Remove leading slash and get first segment
    $path = trim($path, '/');
    $segments = explode('/', $path);
    
    // Check if first segment is a valid language code
    if (!empty($segments[0]) && in_array($segments[0], SUPPORTED_LANGS)) {
        $lang = $segments[0];
        setcookie('lang', $lang, time() + (365 * 24 * 60 * 60), '/'); // 1 year
        return $lang;
    }
    
    // Check cookie
    if (isset($_COOKIE['lang']) && in_array($_COOKIE['lang'], SUPPORTED_LANGS)) {
        return $_COOKIE['lang'];
    }
    
    // Check browser language
    if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        $browserLang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        if (in_array($browserLang, SUPPORTED_LANGS)) {
            return $browserLang;
        }
    }
    
    // Default (English)
    return DEFAULT_LANG;
}

// Get current language
$currentLang = getCurrentLang();

// Load translations
function loadTranslations($lang) {
    $file = __DIR__ . '/../translations/' . $lang . '.json';
    if (file_exists($file)) {
        $content = file_get_contents($file);
        return json_decode($content, true);
    }
    // Fallback to English if translation file doesn't exist
    $fallbackFile = __DIR__ . '/../translations/en.json';
    if (file_exists($fallbackFile)) {
        $content = file_get_contents($fallbackFile);
        return json_decode($content, true);
    }
    return [];
}

$translations = loadTranslations($currentLang);

// Translation function
function t($key, $default = '') {
    global $translations;
    
    $keys = explode('.', $key);
    $value = $translations;
    
    foreach ($keys as $k) {
        if (isset($value[$k])) {
            $value = $value[$k];
        } else {
            return $default ?: $key;
        }
    }
    
    return is_string($value) ? $value : $default;
}

// Get language URL (creates /lang/page format)
function getLangUrl($lang, $page = '') {
    // English is default, no language prefix
    if ($lang === DEFAULT_LANG) {
        if ($page) {
            return '/' . $page;
        }
        return '/';
    }
    
    // Other languages: /lang/ or /lang/page
    $base = '/' . $lang . '/';
    if ($page) {
        return $base . $page;
    }
    return $base;
}

// Get current page name (without language prefix)
function getCurrentPage() {
    $requestUri = $_SERVER['REQUEST_URI'];
    $path = parse_url($requestUri, PHP_URL_PATH);
    $path = trim($path, '/');
    $segments = explode('/', $path);
    
    // Remove language segment
    if (!empty($segments[0]) && in_array($segments[0], SUPPORTED_LANGS)) {
        array_shift($segments);
    }
    
    // Get page name
    $page = !empty($segments[0]) ? $segments[0] : '';
    
    // Map to actual PHP file
    if (empty($page) || $page === 'index') {
        return '';
    }
    
    return $page;
}

// Get canonical URL
function getCanonicalUrl() {
    global $currentLang;
    $page = getCurrentPage();
    $baseUrl = 'https://goalblip.com'; // Change to your actual domain
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'goalblip.com';
    $baseUrl = $protocol . '://' . $host;
    
    if ($currentLang === DEFAULT_LANG) {
        // English is default, no language prefix
        return $baseUrl . ($page ? '/' . $page : '');
    }
    
    return $baseUrl . '/' . $currentLang . ($page ? '/' . $page : '');
}

// Get alternate language URLs (for hreflang)
function getAlternateUrls() {
    global $currentLang;
    $page = getCurrentPage();
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'goalblip.com';
    $baseUrl = $protocol . '://' . $host;
    $urls = [];
    
    foreach (SUPPORTED_LANGS as $lang) {
        if ($lang === DEFAULT_LANG) {
            $urls[$lang] = $baseUrl . ($page ? '/' . $page : '');
        } else {
            $urls[$lang] = $baseUrl . '/' . $lang . ($page ? '/' . $page : '');
        }
    }
    
    return $urls;
}

// Language names in their native language
$langNames = [
    'tr' => 'Türkçe',
    'en' => 'English',
    'es' => 'Español',
    'de' => 'Deutsch'
];

// Language codes for hreflang
$langCodes = [
    'tr' => 'tr-TR',
    'en' => 'en-US',
    'es' => 'es-ES',
    'de' => 'de-DE'
];
?>
