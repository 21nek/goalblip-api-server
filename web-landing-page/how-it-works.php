<?php
require_once __DIR__ . '/includes/header.php';
?>

    <main class="page-content how-it-works-page">
        <div class="container">
            <!-- Progress Indicator -->
            <div class="progress-indicator">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            
            <div class="content-wrapper">
                <h1 class="page-title"><?php echo t('howItWorks.title'); ?></h1>
                <p class="page-subtitle"><?php echo t('howItWorks.subtitle'); ?></p>
                
                <section class="content-section intro-section" id="intro">
                    <div class="intro-content">
                        <div class="intro-icon">
                            <i class="fas fa-brain"></i>
                        </div>
                        <p class="intro-text"><?php echo t('howItWorks.intro'); ?></p>
                        <div class="intro-stats">
                            <div class="stat-item">
                                <div class="stat-number">6</div>
                                <div class="stat-label"><?php echo t('howItWorks.introStats.analysisPhases'); ?></div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">50+</div>
                                <div class="stat-label"><?php echo t('howItWorks.introStats.mlModels'); ?></div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">1000+</div>
                                <div class="stat-label"><?php echo t('howItWorks.introStats.features'); ?></div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">99.9%</div>
                                <div class="stat-label"><?php echo t('howItWorks.introStats.uptime'); ?></div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Phase 1 -->
                <section class="content-section phase-section phase-1" id="phase-1" data-phase="1">
                    <div class="phase-header">
                        <div class="phase-number-wrapper">
                            <div class="phase-number">01</div>
                            <div class="phase-icon"><i class="fas fa-database"></i></div>
                        </div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.phase1.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.phase1.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.phase1.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase1.features.title'); ?></h3>
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-stream"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase1.features.feature1Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase1.features.feature1'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-code-branch"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase1.features.feature2Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase1.features.feature2'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-layer-group"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase1.features.feature3Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase1.features.feature3'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase1.features.feature4Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase1.features.feature4'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-server"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase1.features.feature5Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase1.features.feature5'); ?></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Phase 2 -->
                <section class="content-section phase-section phase-2" id="phase-2" data-phase="2">
                    <div class="phase-header">
                        <div class="phase-number-wrapper">
                            <div class="phase-number">02</div>
                            <div class="phase-icon"><i class="fas fa-cogs"></i></div>
                        </div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.phase2.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.phase2.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.phase2.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase2.features.title'); ?></h3>
                        <div class="features-grid">
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-chart-line"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase2.features.feature1Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase2.features.feature1'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-chart-bar"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase2.features.feature2Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase2.features.feature2'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-project-diagram"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase2.features.feature3Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase2.features.feature3'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-map-marked-alt"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase2.features.feature4Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase2.features.feature4'); ?></p>
                                </div>
                            </div>
                            <div class="feature-card">
                                <div class="feature-icon"><i class="fas fa-compress-arrows-alt"></i></div>
                                <div class="feature-content">
                                    <h4><?php echo t('howItWorks.phase2.features.feature5Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase2.features.feature5'); ?></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Phase 3 -->
                <section class="content-section phase-section phase-3" id="phase-3" data-phase="3">
                    <div class="phase-header">
                        <div class="phase-number-wrapper">
                            <div class="phase-number">03</div>
                            <div class="phase-icon"><i class="fas fa-robot"></i></div>
                        </div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.phase3.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.phase3.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.phase3.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase3.models.title'); ?></h3>
                        <div class="models-showcase">
                            <div class="model-card highlight">
                                <div class="model-badge"><?php echo t('howItWorks.phase3.models.badgeCore'); ?></div>
                                <div class="model-icon"><i class="fas fa-network-wired"></i></div>
                                <h4><?php echo t('howItWorks.phase3.models.model1Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.models.model1'); ?></p>
                            </div>
                            <div class="model-card">
                                <div class="model-icon"><i class="fas fa-brain"></i></div>
                                <h4><?php echo t('howItWorks.phase3.models.model2Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.models.model2'); ?></p>
                            </div>
                            <div class="model-card">
                                <div class="model-icon"><i class="fas fa-project-diagram"></i></div>
                                <h4><?php echo t('howItWorks.phase3.models.model3Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.models.model3'); ?></p>
                            </div>
                            <div class="model-card highlight">
                                <div class="model-badge"><?php echo t('howItWorks.phase3.models.badgeSpecial'); ?></div>
                                <div class="model-icon"><i class="fas fa-chart-area"></i></div>
                                <h4><?php echo t('howItWorks.phase3.models.model4Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.models.model4'); ?></p>
                            </div>
                            <div class="model-card">
                                <div class="model-icon"><i class="fas fa-layer-group"></i></div>
                                <h4><?php echo t('howItWorks.phase3.models.model5Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.models.model5'); ?></p>
                            </div>
                        </div>
                    </div>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase3.algorithms.title'); ?></h3>
                        <div class="algorithms-grid">
                            <div class="algorithm-item">
                                <div class="algorithm-icon"><i class="fas fa-dice"></i></div>
                                <h4><?php echo t('howItWorks.phase3.algorithms.algo1Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.algorithms.algo1'); ?></p>
                            </div>
                            <div class="algorithm-item">
                                <div class="algorithm-icon"><i class="fas fa-link"></i></div>
                                <h4><?php echo t('howItWorks.phase3.algorithms.algo2Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.algorithms.algo2'); ?></p>
                            </div>
                            <div class="algorithm-item">
                                <div class="algorithm-icon"><i class="fas fa-clock"></i></div>
                                <h4><?php echo t('howItWorks.phase3.algorithms.algo3Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.algorithms.algo3'); ?></p>
                            </div>
                            <div class="algorithm-item">
                                <div class="algorithm-icon"><i class="fas fa-exclamation-triangle"></i></div>
                                <h4><?php echo t('howItWorks.phase3.algorithms.algo4Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.algorithms.algo4'); ?></p>
                            </div>
                            <div class="algorithm-item">
                                <div class="algorithm-icon"><i class="fas fa-sync-alt"></i></div>
                                <h4><?php echo t('howItWorks.phase3.algorithms.algo5Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase3.algorithms.algo5'); ?></p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Phase 4 -->
                <section class="content-section phase-section phase-4" id="phase-4" data-phase="4">
                    <div class="phase-header">
                        <div class="phase-number-wrapper">
                            <div class="phase-number">04</div>
                            <div class="phase-icon"><i class="fas fa-chart-pie"></i></div>
                        </div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.phase4.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.phase4.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.phase4.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase4.scoring.title'); ?></h3>
                        <div class="confidence-metrics">
                            <div class="metric-card">
                                <div class="metric-progress">
                                    <div class="progress-circle" data-percent="95">
                                        <span>95%</span>
                                    </div>
                                </div>
                                <h4><?php echo t('howItWorks.phase4.scoring.metric1Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase4.scoring.metric1'); ?></p>
                            </div>
                            <div class="metric-card">
                                <div class="metric-progress">
                                    <div class="progress-circle" data-percent="88">
                                        <span>88%</span>
                                    </div>
                                </div>
                                <h4><?php echo t('howItWorks.phase4.scoring.metric2Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase4.scoring.metric2'); ?></p>
                            </div>
                            <div class="metric-card">
                                <div class="metric-progress">
                                    <div class="progress-circle" data-percent="92">
                                        <span>92%</span>
                                    </div>
                                </div>
                                <h4><?php echo t('howItWorks.phase4.scoring.metric3Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase4.scoring.metric3'); ?></p>
                            </div>
                            <div class="metric-card">
                                <div class="metric-progress">
                                    <div class="progress-circle" data-percent="97">
                                        <span>97%</span>
                                    </div>
                                </div>
                                <h4><?php echo t('howItWorks.phase4.scoring.metric4Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase4.scoring.metric4'); ?></p>
                            </div>
                            <div class="metric-card">
                                <div class="metric-progress">
                                    <div class="progress-circle" data-percent="90">
                                        <span>90%</span>
                                    </div>
                                </div>
                                <h4><?php echo t('howItWorks.phase4.scoring.metric5Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase4.scoring.metric5'); ?></p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Phase 5 -->
                <section class="content-section phase-section phase-5" id="phase-5" data-phase="5">
                    <div class="phase-header">
                        <div class="phase-number-wrapper">
                            <div class="phase-number">05</div>
                            <div class="phase-icon"><i class="fas fa-sync-alt"></i></div>
                        </div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.phase5.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.phase5.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.phase5.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase5.learning.title'); ?></h3>
                        <div class="learning-timeline">
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <h4><i class="fas fa-bolt"></i> <?php echo t('howItWorks.phase5.learning.learn1Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase5.learning.learn1'); ?></p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <h4><i class="fas fa-exchange-alt"></i> <?php echo t('howItWorks.phase5.learning.learn2Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase5.learning.learn2'); ?></p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <h4><i class="fas fa-bullseye"></i> <?php echo t('howItWorks.phase5.learning.learn3Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase5.learning.learn3'); ?></p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <h4><i class="fas fa-rocket"></i> <?php echo t('howItWorks.phase5.learning.learn4Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase5.learning.learn4'); ?></p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-marker"></div>
                                <div class="timeline-content">
                                    <h4><i class="fas fa-network-wired"></i> <?php echo t('howItWorks.phase5.learning.learn5Title'); ?></h4>
                                    <p><?php echo t('howItWorks.phase5.learning.learn5'); ?></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Phase 6 -->
                <section class="content-section phase-section phase-6" id="phase-6" data-phase="6">
                    <div class="phase-header">
                        <div class="phase-number-wrapper">
                            <div class="phase-number">06</div>
                            <div class="phase-icon"><i class="fas fa-desktop"></i></div>
                        </div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.phase6.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.phase6.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.phase6.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.phase6.presentation.title'); ?></h3>
                        <div class="presentation-features">
                            <div class="presentation-card">
                                <div class="presentation-icon"><i class="fas fa-mouse-pointer"></i></div>
                                <h4><?php echo t('howItWorks.phase6.presentation.pres1Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase6.presentation.pres1'); ?></p>
                            </div>
                            <div class="presentation-card">
                                <div class="presentation-icon"><i class="fas fa-chart-line"></i></div>
                                <h4><?php echo t('howItWorks.phase6.presentation.pres2Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase6.presentation.pres2'); ?></p>
                            </div>
                            <div class="presentation-card">
                                <div class="presentation-icon"><i class="fas fa-history"></i></div>
                                <h4><?php echo t('howItWorks.phase6.presentation.pres3Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase6.presentation.pres3'); ?></p>
                            </div>
                            <div class="presentation-card">
                                <div class="presentation-icon"><i class="fas fa-satellite-dish"></i></div>
                                <h4><?php echo t('howItWorks.phase6.presentation.pres4Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase6.presentation.pres4'); ?></p>
                            </div>
                            <div class="presentation-card">
                                <div class="presentation-icon"><i class="fas fa-sliders-h"></i></div>
                                <h4><?php echo t('howItWorks.phase6.presentation.pres5Title'); ?></h4>
                                <p><?php echo t('howItWorks.phase6.presentation.pres5'); ?></p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Technical Infrastructure -->
                <section class="content-section phase-section technical-section" id="technical">
                    <div class="phase-header">
                        <div class="phase-number">∞</div>
                        <div class="phase-title-group">
                            <h2><?php echo t('howItWorks.technical.title'); ?></h2>
                            <p class="phase-subtitle"><?php echo t('howItWorks.technical.subtitle'); ?></p>
                        </div>
                    </div>
                    <p class="phase-description"><?php echo t('howItWorks.technical.description'); ?></p>
                    <div class="phase-features">
                        <h3><?php echo t('howItWorks.technical.infrastructure.title'); ?></h3>
                        <ul class="feature-list">
                            <li><?php echo t('howItWorks.technical.infrastructure.comp1'); ?></li>
                            <li><?php echo t('howItWorks.technical.infrastructure.comp2'); ?></li>
                            <li><?php echo t('howItWorks.technical.infrastructure.comp3'); ?></li>
                            <li><?php echo t('howItWorks.technical.infrastructure.comp4'); ?></li>
                            <li><?php echo t('howItWorks.technical.infrastructure.comp5'); ?></li>
                        </ul>
                    </div>
                </section>

                <!-- Conclusion -->
                <section class="content-section conclusion-section">
                    <h2><?php echo t('howItWorks.conclusion.title'); ?></h2>
                    <p class="conclusion-text"><?php echo t('howItWorks.conclusion.description'); ?></p>
                </section>
            </div>
        </div>
    </main>

<?php
require_once __DIR__ . '/includes/footer.php';
?>

