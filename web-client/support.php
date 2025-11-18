<?php
require_once __DIR__ . '/includes/header.php';
?>

    <main class="page-content">
        <div class="container">
            <div class="content-wrapper">
                <h1 class="page-title"><?php echo t('nav.support'); ?></h1>
                <p class="page-description"><?php echo t('support.description', 'Need help? We\'re here for you. Contact us or check out our frequently asked questions.'); ?></p>

                <section class="content-section">
                    <h2><?php echo t('support.contact.title', 'Contact Us'); ?></h2>
                    <div class="contact-methods">
                        <div class="contact-method">
                            <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                            <div>
                                <h3><?php echo t('support.contact.email', 'Email'); ?></h3>
                                <p><?php echo t('support.contact.emailDesc', 'Send us an email and we\'ll get back to you as soon as possible.'); ?></p>
                                <a href="mailto:support@goalblip.com" class="btn-primary"><i class="fas fa-envelope-open"></i> support@goalblip.com</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="content-section">
                    <h2><?php echo t('support.faq.title', 'Frequently Asked Questions'); ?></h2>
                    
                    <div class="faq-item">
                        <h3><?php echo t('support.faq.q1', 'Is GoalBlip free?'); ?></h3>
                        <p><?php echo t('support.faq.a1', 'Yes, GoalBlip is completely free to use. There are no premium features or subscriptions.'); ?></p>
                    </div>

                    <div class="faq-item">
                        <h3><?php echo t('support.faq.q2', 'What data does GoalBlip collect?'); ?></h3>
                        <p><?php echo t('support.faq.a2', 'GoalBlip does not collect any personal data. All information (favorites, language preferences, timezone) is stored locally on your device only.'); ?></p>
                    </div>

                    <div class="faq-item">
                        <h3><?php echo t('support.faq.q3', 'Which languages are supported?'); ?></h3>
                        <p><?php echo t('support.faq.a3', 'GoalBlip currently supports Turkish, English, Spanish, and German. More languages may be added in the future.'); ?></p>
                    </div>

                    <div class="faq-item">
                        <h3><?php echo t('support.faq.q4', 'How do I delete my data?'); ?></h3>
                        <p><?php echo t('support.faq.a4', 'Simply uninstall the app from your device. All locally stored data will be removed. You can also clear app data through your device settings.'); ?></p>
                    </div>

                    <div class="faq-item">
                        <h3><?php echo t('support.faq.q5', 'Where can I download the app?'); ?></h3>
                        <p><?php echo t('support.faq.a5', 'GoalBlip will be available on the App Store (iOS) and Play Store (Android) soon. Stay tuned for updates!'); ?></p>
                    </div>

                    <div class="faq-item">
                        <h3><?php echo t('support.faq.q6', 'How accurate are the match analyses?'); ?></h3>
                        <p><?php echo t('support.faq.a6', 'GoalBlip uses advanced data analysis and AI algorithms to provide comprehensive match statistics. However, these are analytical insights and should not be considered as predictions or guarantees.'); ?></p>
                    </div>
                </section>

                <section class="content-section">
                    <h2><?php echo t('support.resources.title', 'Additional Resources'); ?></h2>
                    <ul class="resources-list">
                        <li><a href="<?php echo getLangUrl($currentLang, 'privacy-policy'); ?>"><?php echo t('nav.privacy'); ?></a></li>
                        <li><a href="<?php echo getLangUrl($currentLang); ?>"><?php echo t('nav.home'); ?></a></li>
                    </ul>
                </section>
            </div>
        </div>
    </main>

<?php
require_once __DIR__ . '/includes/footer.php';
?>

