<?php
require_once __DIR__ . '/includes/header.php';
?>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <?php echo t('hero.title'); ?><br>
                        <span class="accent-text"><?php echo t('hero.subtitle'); ?></span>
                    </h1>
                    <p class="hero-description">
                        <?php echo t('hero.description'); ?>
                    </p>
                    <div class="hero-stats">
                        <div class="hero-stat">
                            <div class="stat-number">1000+</div>
                            <div class="stat-label"><?php echo t('hero.stat1', 'Matches Analyzed Daily'); ?></div>
                        </div>
                        <div class="hero-stat">
                            <div class="stat-number">50+</div>
                            <div class="stat-label"><?php echo t('hero.stat2', 'Leagues Tracked'); ?></div>
                        </div>
                        <div class="hero-stat">
                            <div class="stat-number">24/7</div>
                            <div class="stat-label"><?php echo t('hero.stat3', 'Real-Time Updates'); ?></div>
                        </div>
                    </div>
                    <div class="hero-cta">
                        <a href="#" class="btn-primary btn-large"><i class="fab fa-apple"></i> <?php echo t('hero.appStore'); ?></a>
                        <a href="#" class="btn-secondary btn-large"><i class="fab fa-google-play"></i> <?php echo t('hero.playStore'); ?></a>
                    </div>
                    <p class="hero-note"><?php echo t('hero.note', 'Free forever. No ads. No tracking.'); ?></p>
                </div>
                <div class="hero-visual">
                    <div class="phone-mockup">
                        <div class="mockup-screen">
                            <div class="mockup-content">
                                <div class="mockup-header">
                                    <div class="mockup-logo"><i class="fas fa-futbol"></i></div>
                                    <div class="mockup-title"><?php echo t('hero.mockup.title', 'Today\'s Matches'); ?></div>
                                </div>
                                <div class="mockup-match">
                                    <div class="mockup-team"><?php echo t('hero.mockup.team1', 'Team A'); ?></div>
                                    <div class="mockup-vs">vs</div>
                                    <div class="mockup-team"><?php echo t('hero.mockup.team2', 'Team B'); ?></div>
                                </div>
                                <div class="mockup-stats">
                                    <div class="mockup-stat"><?php echo t('hero.mockup.stat1', 'Form: WWDLW'); ?></div>
                                    <div class="mockup-stat"><?php echo t('hero.mockup.stat2', 'H2H: 3-2-1'); ?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section class="section" id="how-it-works">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo t('howItWorks.title'); ?></h2>
                <p class="section-description">
                    <?php echo t('howItWorks.subtitle'); ?>
                </p>
            </div>
            <div class="how-it-works-wrapper">
                <div class="steps-timeline">
                    <div class="step-card step-card-enhanced" data-step="1">
                        <div class="step-connector"></div>
                        <div class="step-content">
                            <div class="step-header">
                                <div class="step-number-badge">01</div>
                                <div class="step-icon-wrapper">
                                    <div class="step-icon"><i class="fas fa-database"></i></div>
                                    <div class="step-icon-glow"></div>
                                </div>
                            </div>
                            <div class="step-body">
                                <h3><?php echo t('howItWorks.step1.title'); ?></h3>
                                <p><?php echo t('howItWorks.step1.description'); ?></p>
                            </div>
                        </div>
                    </div>
                    <div class="step-card step-card-enhanced" data-step="2">
                        <div class="step-connector"></div>
                        <div class="step-content">
                            <div class="step-header">
                                <div class="step-number-badge">02</div>
                                <div class="step-icon-wrapper">
                                    <div class="step-icon"><i class="fas fa-search"></i></div>
                                    <div class="step-icon-glow"></div>
                                </div>
                            </div>
                            <div class="step-body">
                                <h3><?php echo t('howItWorks.step2.title'); ?></h3>
                                <p><?php echo t('howItWorks.step2.description'); ?></p>
                            </div>
                        </div>
                    </div>
                    <div class="step-card step-card-enhanced" data-step="3">
                        <div class="step-connector"></div>
                        <div class="step-content">
                            <div class="step-header">
                                <div class="step-number-badge">03</div>
                                <div class="step-icon-wrapper">
                                    <div class="step-icon"><i class="fas fa-chart-line"></i></div>
                                    <div class="step-icon-glow"></div>
                                </div>
                            </div>
                            <div class="step-body">
                                <h3><?php echo t('howItWorks.step3.title'); ?></h3>
                                <p><?php echo t('howItWorks.step3.description'); ?></p>
                            </div>
                        </div>
                    </div>
                    <div class="step-card step-card-enhanced" data-step="4">
                        <div class="step-connector"></div>
                        <div class="step-content">
                            <div class="step-header">
                                <div class="step-number-badge">04</div>
                                <div class="step-icon-wrapper">
                                    <div class="step-icon"><i class="fas fa-users"></i></div>
                                    <div class="step-icon-glow"></div>
                                </div>
                            </div>
                            <div class="step-body">
                                <h3><?php echo t('howItWorks.step4.title'); ?></h3>
                                <p><?php echo t('howItWorks.step4.description'); ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="section section-dark" id="features">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo t('features.title'); ?></h2>
                <p class="section-description"><?php echo t('features.subtitle', 'Everything you need for comprehensive football match analysis'); ?></p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-chart-bar"></i></div>
                    <h3><?php echo t('features.feature1.title'); ?></h3>
                    <p><?php echo t('features.feature1.description'); ?></p>
                    <ul class="feature-details">
                        <li><?php echo t('features.feature1.detail1', 'Match statistics and performance metrics'); ?></li>
                        <li><?php echo t('features.feature1.detail2', 'Team form analysis (last 5 matches)'); ?></li>
                        <li><?php echo t('features.feature1.detail3', 'Head-to-head comparison'); ?></li>
                    </ul>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-balance-scale"></i></div>
                    <h3><?php echo t('features.feature2.title'); ?></h3>
                    <p><?php echo t('features.feature2.description'); ?></p>
                    <ul class="feature-details">
                        <li><?php echo t('features.feature2.detail1', 'Side-by-side team performance'); ?></li>
                        <li><?php echo t('features.feature2.detail2', 'Recent form visualization'); ?></li>
                        <li><?php echo t('features.feature2.detail3', 'Strength and weakness analysis'); ?></li>
                    </ul>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-star"></i></div>
                    <h3><?php echo t('features.feature3.title'); ?></h3>
                    <p><?php echo t('features.feature3.description'); ?></p>
                    <ul class="feature-details">
                        <li><?php echo t('features.feature3.detail1', 'Save unlimited favorite matches'); ?></li>
                        <li><?php echo t('features.feature3.detail2', 'Quick access from home screen'); ?></li>
                        <li><?php echo t('features.feature3.detail3', 'Sync across devices (coming soon)'); ?></li>
                    </ul>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-globe"></i></div>
                    <h3><?php echo t('features.feature4.title'); ?></h3>
                    <p><?php echo t('features.feature4.description'); ?></p>
                    <ul class="feature-details">
                        <li><?php echo t('features.feature4.detail1', 'Turkish, English, Spanish, German'); ?></li>
                        <li><?php echo t('features.feature4.detail2', 'Automatic language detection'); ?></li>
                        <li><?php echo t('features.feature4.detail3', 'More languages coming soon'); ?></li>
                    </ul>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-mobile-alt"></i></div>
                    <h3><?php echo t('features.feature5.title'); ?></h3>
                    <p><?php echo t('features.feature5.description'); ?></p>
                    <ul class="feature-details">
                        <li><?php echo t('features.feature5.detail1', 'Dark theme optimized for viewing'); ?></li>
                        <li><?php echo t('features.feature5.detail2', 'Responsive design for all screen sizes'); ?></li>
                        <li><?php echo t('features.feature5.detail3', 'Intuitive navigation'); ?></li>
                    </ul>
                </div>
                <div class="feature-card">
                    <div class="feature-icon"><i class="fas fa-bolt"></i></div>
                    <h3><?php echo t('features.feature6.title'); ?></h3>
                    <p><?php echo t('features.feature6.description'); ?></p>
                    <ul class="feature-details">
                        <li><?php echo t('features.feature6.detail1', 'Live match updates'); ?></li>
                        <li><?php echo t('features.feature6.detail2', 'Automatic data refresh'); ?></li>
                        <li><?php echo t('features.feature6.detail3', 'Offline caching support'); ?></li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Why GoalBlip -->
    <section class="section">
        <div class="container">
            <div class="why-section">
                <div class="why-content">
                    <h2 class="section-title"><?php echo t('whyGoalblip.title'); ?></h2>
                    <p class="section-description">
                        <?php echo t('whyGoalblip.description'); ?>
                    </p>
                    <div class="why-list">
                        <div class="why-item">
                            <div class="why-icon"><i class="fas fa-check"></i></div>
                            <div>
                                <h4><?php echo t('whyGoalblip.benefit1.title', 'Automated Data Collection'); ?></h4>
                                <p><?php echo t('whyGoalblip.benefit1.desc', 'No need to manually search for match data. Our system automatically collects and processes information from multiple sources.'); ?></p>
                            </div>
                        </div>
                        <div class="why-item">
                            <div class="why-icon"><i class="fas fa-check"></i></div>
                            <div>
                                <h4><?php echo t('whyGoalblip.benefit2.title', 'Advanced Analysis Algorithms'); ?></h4>
                                <p><?php echo t('whyGoalblip.benefit2.desc', 'Powered by AI and machine learning, our algorithms analyze patterns and provide insights that would take hours to calculate manually.'); ?></p>
                            </div>
                        </div>
                        <div class="why-item">
                            <div class="why-icon"><i class="fas fa-check"></i></div>
                            <div>
                                <h4><?php echo t('whyGoalblip.benefit3.title', 'User-Friendly Interface'); ?></h4>
                                <p><?php echo t('whyGoalblip.benefit3.desc', 'Clean, intuitive design that makes complex data easy to understand. No technical knowledge required.'); ?></p>
                            </div>
                        </div>
                        <div class="why-item">
                            <div class="why-icon"><i class="fas fa-check"></i></div>
                            <div>
                                <h4><?php echo t('whyGoalblip.benefit4.title', '100% Free & Privacy-Focused'); ?></h4>
                                <p><?php echo t('whyGoalblip.benefit4.desc', 'Completely free with no hidden costs. Your data stays on your device - we don\'t track or collect personal information.'); ?></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="why-visual">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                            <div class="stat-value"><?php echo t('whyGoalblip.stat1.value', '1000+'); ?></div>
                            <div class="stat-label"><?php echo t('whyGoalblip.stat1.label', 'Matches Analyzed Daily'); ?></div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-globe"></i></div>
                            <div class="stat-value"><?php echo t('whyGoalblip.stat2.value', '50+'); ?></div>
                            <div class="stat-label"><?php echo t('whyGoalblip.stat2.label', 'Leagues Tracked'); ?></div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-bolt"></i></div>
                            <div class="stat-value"><?php echo t('whyGoalblip.stat3.value', '24/7'); ?></div>
                            <div class="stat-label"><?php echo t('whyGoalblip.stat3.label', 'Real-Time Updates'); ?></div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-lock"></i></div>
                            <div class="stat-value"><?php echo t('whyGoalblip.stat4.value', '0'); ?></div>
                            <div class="stat-label"><?php echo t('whyGoalblip.stat4.label', 'Data Collected'); ?></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Data Analysis -->
    <section class="section section-dark">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo t('dataAnalysis.title'); ?></h2>
            </div>
            <div class="data-grid">
                <div class="data-card">
                    <div class="data-icon"><i class="fas fa-network-wired"></i></div>
                    <h3><?php echo t('dataAnalysis.item1.title'); ?></h3>
                    <p><?php echo t('dataAnalysis.item1.description'); ?></p>
                </div>
                <div class="data-card">
                    <div class="data-icon"><i class="fas fa-brain"></i></div>
                    <h3><?php echo t('dataAnalysis.item2.title'); ?></h3>
                    <p><?php echo t('dataAnalysis.item2.description'); ?></p>
                </div>
                <div class="data-card">
                    <div class="data-icon"><i class="fas fa-palette"></i></div>
                    <h3><?php echo t('dataAnalysis.item3.title'); ?></h3>
                    <p><?php echo t('dataAnalysis.item3.description'); ?></p>
                </div>
                <div class="data-card">
                    <div class="data-icon"><i class="fas fa-sync-alt"></i></div>
                    <h3><?php echo t('dataAnalysis.item4.title'); ?></h3>
                    <p><?php echo t('dataAnalysis.item4.description'); ?></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Screenshots Section -->
    <section class="section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo t('screenshots.title', 'See GoalBlip in Action'); ?></h2>
                <p class="section-description"><?php echo t('screenshots.subtitle', 'Explore the app interface and features'); ?></p>
            </div>
            <div class="screenshots-grid">
                <div class="screenshot-item">
                    <div class="screenshot-placeholder">
                        <div class="screenshot-label"><?php echo t('screenshots.screen1', 'Match List'); ?></div>
                    </div>
                    <p class="screenshot-desc"><?php echo t('screenshots.screen1Desc', 'Browse matches by date and league'); ?></p>
                </div>
                <div class="screenshot-item">
                    <div class="screenshot-placeholder">
                        <div class="screenshot-label"><?php echo t('screenshots.screen2', 'Match Analysis'); ?></div>
                    </div>
                    <p class="screenshot-desc"><?php echo t('screenshots.screen2Desc', 'Detailed statistics and insights'); ?></p>
                </div>
                <div class="screenshot-item">
                    <div class="screenshot-placeholder">
                        <div class="screenshot-label"><?php echo t('screenshots.screen3', 'Team Comparison'); ?></div>
                    </div>
                    <p class="screenshot-desc"><?php echo t('screenshots.screen3Desc', 'Compare team performance side-by-side'); ?></p>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="section section-dark">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title"><?php echo t('faq.title', 'Frequently Asked Questions'); ?></h2>
            </div>
            <div class="faq-grid">
                <div class="faq-item">
                    <h3><?php echo t('faq.q1', 'Is GoalBlip free?'); ?></h3>
                    <p><?php echo t('faq.a1', 'Yes, GoalBlip is completely free to use. There are no premium features, subscriptions, or hidden costs. We believe football analysis should be accessible to everyone.'); ?></p>
                </div>
                <div class="faq-item">
                    <h3><?php echo t('faq.q2', 'What data does GoalBlip collect?'); ?></h3>
                    <p><?php echo t('faq.a2', 'GoalBlip does not collect any personal data. All information (favorites, language preferences, timezone) is stored locally on your device only. We don\'t track you, and we don\'t share your data with anyone.'); ?></p>
                </div>
                <div class="faq-item">
                    <h3><?php echo t('faq.q3', 'Which leagues are supported?'); ?></h3>
                    <p><?php echo t('faq.a3', 'GoalBlip tracks over 50 leagues worldwide, including Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and many more. We continuously add new leagues based on user demand.'); ?></p>
                </div>
                <div class="faq-item">
                    <h3><?php echo t('faq.q4', 'How accurate are the analyses?'); ?></h3>
                    <p><?php echo t('faq.a4', 'GoalBlip uses advanced data analysis and AI algorithms to provide comprehensive match statistics. These are analytical insights based on historical data and should not be considered as predictions or guarantees.'); ?></p>
                </div>
                <div class="faq-item">
                    <h3><?php echo t('faq.q5', 'Do I need an internet connection?'); ?></h3>
                    <p><?php echo t('faq.a5', 'An internet connection is required to fetch the latest match data. However, previously viewed matches are cached locally, so you can access them offline.'); ?></p>
                </div>
                <div class="faq-item">
                    <h3><?php echo t('faq.q6', 'When will the app be available?'); ?></h3>
                    <p><?php echo t('faq.a6', 'GoalBlip will be available on the App Store (iOS) and Play Store (Android) soon. Follow us for updates and be among the first to download!'); ?></p>
                </div>
            </div>
            <div class="faq-cta">
                <p><?php echo t('faq.more', 'Have more questions?'); ?></p>
                <a href="<?php echo getLangUrl($currentLang, 'support'); ?>" class="btn-secondary"><?php echo t('faq.contact', 'Contact Support'); ?></a>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
        <div class="container">
            <div class="cta-content">
                <h2 class="cta-title"><?php echo t('cta.title'); ?></h2>
                <p class="cta-description">
                    <?php echo t('cta.subtitle'); ?>
                </p>
                <div class="cta-buttons">
                    <a href="#" class="btn-primary btn-large"><i class="fab fa-apple"></i> <?php echo t('cta.appStore'); ?></a>
                    <a href="#" class="btn-primary btn-large"><i class="fab fa-google-play"></i> <?php echo t('cta.playStore'); ?></a>
                </div>
                <p class="cta-note"><?php echo t('cta.note', 'Available soon on iOS and Android'); ?></p>
            </div>
        </div>
    </section>

<?php
require_once __DIR__ . '/includes/footer.php';
?>
