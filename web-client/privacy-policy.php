<?php
require_once __DIR__ . '/includes/header.php';
?>

    <main class="page-content">
        <div class="container">
            <div class="content-wrapper">
                <h1 class="page-title"><?php echo t('nav.privacy'); ?></h1>
                <p class="last-updated"><?php echo t('privacy.lastUpdated', 'Last Updated'); ?>: <?php echo date('F j, Y'); ?></p>

                <section class="content-section">
                    <h2><?php echo t('privacy.intro.title', 'Introduction'); ?></h2>
                    <p><?php echo t('privacy.intro.text', 'GoalBlip ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.collect.title', 'Information We Collect'); ?></h2>
                    
                    <h3><?php echo t('privacy.collect.local.title', 'Information Stored Locally on Your Device'); ?></h3>
                    <p><?php echo t('privacy.collect.local.intro', 'GoalBlip stores the following information only on your device using local storage (AsyncStorage):'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.collect.local.favorites', 'Favorite Matches'); ?>:</strong> <?php echo t('privacy.collect.local.favoritesDesc', 'Match IDs that you mark as favorites'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.language', 'Language Preference'); ?>:</strong> <?php echo t('privacy.collect.local.languageDesc', 'Your selected language (Turkish, English, Spanish, German)'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.timezone', 'Timezone Preference'); ?>:</strong> <?php echo t('privacy.collect.local.timezoneDesc', 'Your selected timezone'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.timeFormat', 'Time Format Preference'); ?>:</strong> <?php echo t('privacy.collect.local.timeFormatDesc', 'Your preferred time format (12h/24h)'); ?></li>
                    </ul>
                    <p class="important-note">
                        <strong><?php echo t('privacy.collect.local.important', 'Important'); ?>:</strong> 
                        <?php echo t('privacy.collect.local.importantDesc', 'This information is stored locally on your device and is never transmitted to our servers or any third parties.'); ?>
                    </p>

                    <h3><?php echo t('privacy.collect.not.title', 'Information We Do NOT Collect'); ?></h3>
                    <p><?php echo t('privacy.collect.not.intro', 'We do NOT collect:'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.collect.not.personal', 'Personal identification information (name, email, phone number)'); ?></li>
                        <li><?php echo t('privacy.collect.not.location', 'Location data'); ?></li>
                        <li><?php echo t('privacy.collect.not.device', 'Device identifiers'); ?></li>
                        <li><?php echo t('privacy.collect.not.analytics', 'Usage analytics or tracking data'); ?></li>
                        <li><?php echo t('privacy.collect.not.identifiable', 'Any data that can identify you personally'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.use.title', 'How We Use Your Information'); ?></h2>
                    <p><?php echo t('privacy.use.intro', 'The information stored locally on your device is used solely to:'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.use.favorites', 'Remember your favorite matches'); ?></li>
                        <li><?php echo t('privacy.use.preferences', 'Maintain your language and timezone preferences'); ?></li>
                        <li><?php echo t('privacy.use.experience', 'Provide a personalized experience within the app'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.storage.title', 'Data Storage and Security'); ?></h2>
                    <ul>
                        <li><?php echo t('privacy.storage.local', 'All data is stored locally on your device using secure local storage'); ?></li>
                        <li><?php echo t('privacy.storage.noTransmit', 'No data is transmitted to external servers'); ?></li>
                        <li><?php echo t('privacy.storage.noShare', 'No data is shared with third parties'); ?></li>
                        <li><?php echo t('privacy.storage.delete', 'You can delete all stored data by uninstalling the app'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.thirdParty.title', 'Third-Party Services'); ?></h2>
                    <p><?php echo t('privacy.thirdParty.intro', 'GoalBlip connects to our own API server to fetch match data and statistics. This connection:'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.thirdParty.noPersonal', 'Does not transmit any personal information'); ?></li>
                        <li><?php echo t('privacy.thirdParty.public', 'Only requests publicly available match data'); ?></li>
                        <li><?php echo t('privacy.thirdParty.https', 'Uses standard HTTPS encryption (in production)'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.rights.title', 'Your Rights'); ?></h2>
                    <p><?php echo t('privacy.rights.intro', 'You have the right to:'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.rights.delete', 'Delete all stored data by uninstalling the app'); ?></li>
                        <li><?php echo t('privacy.rights.clear', 'Clear app data through your device settings'); ?></li>
                        <li><?php echo t('privacy.rights.stop', 'Stop using the app at any time'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.children.title', 'Children\'s Privacy'); ?></h2>
                    <p><?php echo t('privacy.children.text', 'GoalBlip is not intended for children under the age of 13. We do not knowingly collect information from children.'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.changes.title', 'Changes to This Privacy Policy'); ?></h2>
                    <p><?php echo t('privacy.changes.text', 'We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date.'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.contact.title', 'Contact Us'); ?></h2>
                    <p><?php echo t('privacy.contact.text', 'If you have questions about this Privacy Policy, please contact us at:'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.contact.email', 'Email'); ?>: <a href="mailto:support@goalblip.com">support@goalblip.com</a></li>
                        <li><?php echo t('privacy.contact.website', 'Website'); ?>: <a href="<?php echo getLangUrl($currentLang, 'support'); ?>"><?php echo t('nav.support'); ?></a></li>
                    </ul>
                </section>

                <section class="content-section summary-box">
                    <h2><?php echo t('privacy.summary.title', 'Quick Summary'); ?></h2>
                    <ul class="summary-list">
                        <li>✅ <strong><?php echo t('privacy.summary.what', 'What we store'); ?>:</strong> <?php echo t('privacy.summary.whatDesc', 'Only your favorites and preferences (on your device)'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.where', 'Where it\'s stored'); ?>:</strong> <?php echo t('privacy.summary.whereDesc', 'Only on your device'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.who', 'Who sees it'); ?>:</strong> <?php echo t('privacy.summary.whoDesc', 'Only you'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.thirdParty', 'Third parties'); ?>:</strong> <?php echo t('privacy.summary.thirdPartyDesc', 'None'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.tracking', 'Tracking'); ?>:</strong> <?php echo t('privacy.summary.trackingDesc', 'None'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.personal', 'Personal data'); ?>:</strong> <?php echo t('privacy.summary.personalDesc', 'None collected'); ?></li>
                    </ul>
                </section>
            </div>
        </div>
    </main>

<?php
require_once __DIR__ . '/includes/footer.php';
?>

