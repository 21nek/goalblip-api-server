<?php
require_once __DIR__ . '/lang.php';

$currentPage = getCurrentPage();
$canonicalUrl = getCanonicalUrl();
$alternateUrls = getAlternateUrls();
?>
<!DOCTYPE html>
<html lang="<?php echo $langCodes[$currentLang]; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title><?php echo t('hero.title', 'GoalBlip'); ?> - <?php echo t('hero.subtitle'); ?></title>
    <meta name="title" content="<?php echo t('hero.title', 'GoalBlip'); ?> - <?php echo t('hero.subtitle'); ?>">
    <meta name="description" content="<?php echo t('hero.description'); ?>">
    <meta name="keywords" content="football analysis, match statistics, football data, AI analysis, goalblip">
    <meta name="author" content="GoalBlip">
    <meta name="robots" content="index, follow">
    <meta name="language" content="<?php echo $langCodes[$currentLang]; ?>">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="<?php echo $canonicalUrl; ?>">
    
    <!-- Alternate Language URLs (hreflang) -->
    <?php foreach ($alternateUrls as $lang => $url): ?>
        <link rel="alternate" hreflang="<?php echo $langCodes[$lang]; ?>" href="<?php echo $url; ?>">
    <?php endforeach; ?>
    <link rel="alternate" hreflang="x-default" href="<?php echo $alternateUrls['en']; ?>">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="og:title" content="<?php echo t('hero.title', 'GoalBlip'); ?> - <?php echo t('hero.subtitle'); ?>">
    <meta property="og:description" content="<?php echo t('hero.description'); ?>">
    <meta property="og:image" content="https://goalblip.com/assets/logo.png">
    <meta property="og:locale" content="<?php echo $langCodes[$currentLang]; ?>">
    <?php foreach ($alternateUrls as $lang => $url): ?>
        <?php if ($lang !== $currentLang): ?>
            <meta property="og:locale:alternate" content="<?php echo $langCodes[$lang]; ?>">
        <?php endif; ?>
    <?php endforeach; ?>
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="<?php echo $canonicalUrl; ?>">
    <meta property="twitter:title" content="<?php echo t('hero.title', 'GoalBlip'); ?> - <?php echo t('hero.subtitle'); ?>">
    <meta property="twitter:description" content="<?php echo t('hero.description'); ?>">
    <meta property="twitter:image" content="https://goalblip.com/assets/logo.png">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/icon.png">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    
    <!-- Three.js for subtle animations -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" integrity="sha512-dLxUelApnYxpLt6B2BOrf3qnfTYgXTCHs1yKbKBsJ+9ZfT0nm4E0QfF8SLK8GxL/7YyS6Qo5Z4U6fh7dZ3DdgQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    
    <link rel="stylesheet" href="/styles.css">
    <?php if ($currentPage === 'how-it-works'): ?>
    <link rel="stylesheet" href="/how-it-works.css">
    <?php endif; ?>
</head>
<body>
    <!-- Header -->
    <header class="header" id="header">
        <div class="container">
            <div class="nav-wrapper">
                <div class="logo">
                    <a href="<?php echo getLangUrl($currentLang); ?>">
                        <img src="/assets/logo.png" alt="GoalBlip" class="logo-img">
                        <span>GoalBlip</span>
                    </a>
                </div>
                
                <nav class="nav-menu" id="navMenu">
                    <a href="<?php echo getLangUrl($currentLang); ?>"><?php echo t('nav.home'); ?></a>
                    <a href="<?php echo getLangUrl($currentLang, 'how-it-works'); ?>"><?php echo t('nav.howItWorks', 'How It Works'); ?></a>
                    <a href="<?php echo getLangUrl($currentLang, 'support'); ?>"><?php echo t('nav.support'); ?></a>
                </nav>

                <div class="header-actions">
                    <div class="language-selector">
                        <?php foreach (SUPPORTED_LANGS as $lang): ?>
                            <a href="<?php echo getLangUrl($lang, $currentPage); ?>" 
                               class="lang-btn <?php echo $currentLang === $lang ? 'active' : ''; ?>"
                               hreflang="<?php echo $langCodes[$lang]; ?>">
                                <?php echo strtoupper($lang); ?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                </div>

                <button class="mobile-menu-toggle" id="mobileMenuToggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
    </header>
