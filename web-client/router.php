<?php
/**
 * Router for PHP Built-in Server
 * Mimics .htaccess routing behavior
 */

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove query string from path
$path = strtok($path, '?');

// Static files - serve directly (let PHP built-in server handle)
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'woff', 'woff2', 'ttf', 'eot', 'json'];
$extension = pathinfo($path, PATHINFO_EXTENSION);
if (in_array(strtolower($extension), $staticExtensions)) {
    // Check if file exists
    $filePath = __DIR__ . $path;
    if (file_exists($filePath) && is_file($filePath)) {
        return false; // Let PHP built-in server serve it
    }
}

// Assets directory - serve directly
if (strpos($path, '/assets/') === 0) {
    $filePath = __DIR__ . $path;
    if (file_exists($filePath) && is_file($filePath)) {
        return false; // Let PHP built-in server serve it
    }
}

// Root redirect to /en/
if ($path === '/') {
    header('Location: /en/', true, 301);
    exit;
}

// Parse path segments
$segments = explode('/', trim($path, '/'));
$lang = null;
$page = null;

// Check if first segment is a language code
if (!empty($segments[0]) && in_array($segments[0], ['tr', 'en', 'es', 'de', 'zh', 'ja', 'it'])) {
    $lang = $segments[0];
    $page = !empty($segments[1]) ? $segments[1] : null;
} else {
    // No language prefix - default to English
    $lang = 'en';
    $page = !empty($segments[0]) ? $segments[0] : null;
}

// Set language parameter
$_GET['lang'] = $lang;

// Determine which PHP file to serve
if (empty($page)) {
    // Language root: /en/, /tr/, etc.
    require __DIR__ . '/index.php';
} else {
    // Language + page: /en/support, /tr/privacy-policy, etc.
    $phpFile = __DIR__ . '/' . $page . '.php';
    if (file_exists($phpFile)) {
        require $phpFile;
    } else {
        // 404 - file not found
        http_response_code(404);
        echo "404 - Page not found: " . htmlspecialchars($path);
    }
}

