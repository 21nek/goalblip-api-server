<?php
require_once __DIR__ . '/includes/header.php';
?>

    <main class="page-content">
        <div class="container">
            <div class="content-wrapper">
                <h1 class="page-title"><?php echo t('nav.privacy'); ?></h1>
                <p class="last-updated">
                    <?php echo t('privacy.lastUpdated', 'Last Updated'); ?>: <?php echo date('F j, Y'); ?><br>
                    <?php echo t('privacy.effectiveDate', 'Effective Date'); ?>: <?php echo date('F j, Y'); ?>
                </p>

                <section class="content-section">
                    <h2><?php echo t('privacy.intro.title', 'Introduction'); ?></h2>
                    <p><?php echo t('privacy.intro.text'); ?></p>
                    <p><?php echo t('privacy.intro.scope'); ?></p>
                    <p><strong><?php echo t('privacy.intro.compliance'); ?></strong></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.collect.title', 'Information We Collect'); ?></h2>
                    <p><?php echo t('privacy.collect.intro'); ?></p>
                    
                    <h3><?php echo t('privacy.collect.local.title', 'Information Stored Locally on Your Device'); ?></h3>
                    <p><?php echo t('privacy.collect.local.intro'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.collect.local.favorites', 'Favorite Matches'); ?>:</strong> <?php echo t('privacy.collect.local.favoritesDesc'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.language', 'Language Preference'); ?>:</strong> <?php echo t('privacy.collect.local.languageDesc'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.timezone', 'Timezone Preference'); ?>:</strong> <?php echo t('privacy.collect.local.timezoneDesc'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.timeFormat', 'Time Format Preference'); ?>:</strong> <?php echo t('privacy.collect.local.timeFormatDesc'); ?></li>
                        <li><strong><?php echo t('privacy.collect.local.cache', 'Cached Match Data'); ?>:</strong> <?php echo t('privacy.collect.local.cacheDesc'); ?></li>
                    </ul>
                    <p class="important-note">
                        <strong><?php echo t('privacy.collect.local.important', 'Important'); ?>:</strong> 
                        <?php echo t('privacy.collect.local.importantDesc'); ?>
                    </p>

                    <h3><?php echo t('privacy.collect.network.title', 'Network Requests'); ?></h3>
                    <p><?php echo t('privacy.collect.network.intro'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.collect.network.noPersonal'); ?></li>
                        <li><?php echo t('privacy.collect.network.noAccount'); ?></li>
                        <li><?php echo t('privacy.collect.network.publicData'); ?></li>
                        <li><?php echo t('privacy.collect.network.anonymous'); ?></li>
                    </ul>
                    <p><strong><?php echo t('privacy.collect.network.logs', 'Server Logs'); ?>:</strong> <?php echo t('privacy.collect.network.logsDesc'); ?></p>

                    <h3><?php echo t('privacy.collect.not.title', 'Information We Do NOT Collect'); ?></h3>
                    <p><?php echo t('privacy.collect.not.intro'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.collect.not.personal'); ?></li>
                        <li><?php echo t('privacy.collect.not.location'); ?></li>
                        <li><?php echo t('privacy.collect.not.device'); ?></li>
                        <li><?php echo t('privacy.collect.not.analytics'); ?></li>
                        <li><?php echo t('privacy.collect.not.identifiable'); ?></li>
                        <li><?php echo t('privacy.collect.not.biometric'); ?></li>
                        <li><?php echo t('privacy.collect.not.contacts'); ?></li>
                        <li><?php echo t('privacy.collect.not.photos'); ?></li>
                        <li><?php echo t('privacy.collect.not.calendar'); ?></li>
                        <li><?php echo t('privacy.collect.not.files'); ?></li>
                    </ul>

                    <h3><?php echo t('privacy.collect.permissions.title', 'App Permissions'); ?></h3>
                    <p><?php echo t('privacy.collect.permissions.intro'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.collect.permissions.internet', 'Internet Access'); ?>:</strong> <?php echo t('privacy.collect.permissions.internetDesc'); ?></li>
                        <li><strong><?php echo t('privacy.collect.permissions.networkState', 'Network State'); ?>:</strong> <?php echo t('privacy.collect.permissions.networkStateDesc'); ?></li>
                    </ul>
                    <p><strong><?php echo t('privacy.collect.permissions.noOther', 'No Other Permissions'); ?>:</strong> <?php echo t('privacy.collect.permissions.noOtherDesc'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.use.title', 'How We Use Your Information'); ?></h2>
                    <p><?php echo t('privacy.use.intro'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.use.favorites'); ?></li>
                        <li><?php echo t('privacy.use.preferences'); ?></li>
                        <li><?php echo t('privacy.use.cache'); ?></li>
                    </ul>
                    <p><strong><?php echo t('privacy.use.noOther'); ?></strong></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.storage.title', 'Data Storage and Security'); ?></h2>
                    <p><?php echo t('privacy.storage.intro'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.storage.local'); ?></li>
                        <li><?php echo t('privacy.storage.noTransmit'); ?></li>
                        <li><?php echo t('privacy.storage.noShare'); ?></li>
                        <li><?php echo t('privacy.storage.encryption'); ?></li>
                    </ul>
                    <h3><?php echo t('privacy.storage.retention', 'Data Retention'); ?></h3>
                    <p><?php echo t('privacy.storage.retentionDesc'); ?></p>
                    <p><?php echo t('privacy.storage.delete'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.thirdParty.title', 'Third-Party Services and Data Sharing'); ?></h2>
                    <p><?php echo t('privacy.thirdParty.intro'); ?></p>
                    
                    <h3><?php echo t('privacy.thirdParty.api', 'Our API Server'); ?></h3>
                    <p><?php echo t('privacy.thirdParty.apiDesc'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.thirdParty.noPersonal'); ?></li>
                        <li><?php echo t('privacy.thirdParty.public'); ?></li>
                        <li><?php echo t('privacy.thirdParty.https'); ?></li>
                        <li><?php echo t('privacy.thirdParty.anonymous'); ?></li>
                    </ul>

                    <h3><?php echo t('privacy.thirdParty.noThirdParty', 'No Third-Party Services'); ?></h3>
                    <p><?php echo t('privacy.thirdParty.noThirdPartyDesc'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.thirdParty.noAnalytics'); ?></li>
                        <li><?php echo t('privacy.thirdParty.noAds'); ?></li>
                        <li><?php echo t('privacy.thirdParty.noSocial'); ?></li>
                        <li><?php echo t('privacy.thirdParty.noCrash'); ?></li>
                        <li><?php echo t('privacy.thirdParty.noPayment'); ?></li>
                        <li><?php echo t('privacy.thirdParty.noCloud'); ?></li>
                        <li><?php echo t('privacy.thirdParty.noOther'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.rights.title', 'Your Privacy Rights'); ?></h2>
                    <p><?php echo t('privacy.rights.intro'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.rights.access', 'Right to Access'); ?>:</strong> <?php echo t('privacy.rights.accessDesc'); ?></li>
                        <li><strong><?php echo t('privacy.rights.delete', 'Right to Deletion'); ?>:</strong> <?php echo t('privacy.rights.deleteDesc'); ?></li>
                        <li><strong><?php echo t('privacy.rights.correction', 'Right to Correction'); ?>:</strong> <?php echo t('privacy.rights.correctionDesc'); ?></li>
                        <li><strong><?php echo t('privacy.rights.portability', 'Right to Data Portability'); ?>:</strong> <?php echo t('privacy.rights.portabilityDesc'); ?></li>
                        <li><strong><?php echo t('privacy.rights.objection', 'Right to Object'); ?>:</strong> <?php echo t('privacy.rights.objectionDesc'); ?></li>
                        <li><strong><?php echo t('privacy.rights.withdraw', 'Right to Withdraw Consent'); ?>:</strong> <?php echo t('privacy.rights.withdrawDesc'); ?></li>
                        <li><strong><?php echo t('privacy.rights.complaint', 'Right to Lodge a Complaint'); ?>:</strong> <?php echo t('privacy.rights.complaintDesc'); ?></li>
                    </ul>
                    <h3><?php echo t('privacy.rights.california', 'California Privacy Rights (CCPA)'); ?></h3>
                    <p><?php echo t('privacy.rights.californiaDesc'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.children.title', 'Children\'s Privacy (COPPA Compliance)'); ?></h2>
                    <p><?php echo t('privacy.children.intro'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.children.age', 'Age Restriction'); ?>:</strong> <?php echo t('privacy.children.ageDesc'); ?></li>
                        <li><strong><?php echo t('privacy.children.verification', 'No Age Verification'); ?>:</strong> <?php echo t('privacy.children.verificationDesc'); ?></li>
                        <li><strong><?php echo t('privacy.children.parental', 'Parental Controls'); ?>:</strong> <?php echo t('privacy.children.parentalDesc'); ?></li>
                        <li><strong><?php echo t('privacy.children.noCollection', 'No Collection from Children'); ?>:</strong> <?php echo t('privacy.children.noCollectionDesc'); ?></li>
                    </ul>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.changes.title', 'Changes to This Privacy Policy'); ?></h2>
                    <p><?php echo t('privacy.changes.intro'); ?></p>
                    <h3><?php echo t('privacy.changes.notification', 'Notification of Changes'); ?></h3>
                    <p><?php echo t('privacy.changes.notificationDesc'); ?></p>
                    <ul>
                        <li><?php echo t('privacy.changes.dateUpdate'); ?></li>
                        <li><?php echo t('privacy.changes.appUpdate'); ?></li>
                        <li><?php echo t('privacy.changes.website'); ?></li>
                    </ul>
                    <p><?php echo t('privacy.changes.review'); ?></p>
                    <p><strong><?php echo t('privacy.changes.continued', 'Continued Use'); ?>:</strong> <?php echo t('privacy.changes.continuedDesc'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.contact.title', 'Contact Us'); ?></h2>
                    <p><?php echo t('privacy.contact.intro'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.contact.email', 'Email'); ?>:</strong> <a href="mailto:<?php echo t('privacy.contact.emailAddress', 'support@goalblip.com'); ?>"><?php echo t('privacy.contact.emailAddress', 'support@goalblip.com'); ?></a><br>
                        <span style="font-size: 0.9em; color: #888;"><?php echo t('privacy.contact.emailDesc'); ?></span></li>
                        <li><strong><?php echo t('privacy.contact.website', 'Website'); ?>:</strong> <a href="<?php echo getLangUrl($currentLang, 'support'); ?>"><?php echo t('nav.support'); ?></a><br>
                        <span style="font-size: 0.9em; color: #888;"><?php echo t('privacy.contact.websiteDesc'); ?></span></li>
                    </ul>
                    <h3><?php echo t('privacy.contact.dataProtection', 'Data Protection Officer'); ?></h3>
                    <p><?php echo t('privacy.contact.dataProtectionDesc'); ?></p>
                </section>

                <section class="content-section">
                    <h2><?php echo t('privacy.legal.title', 'Legal Basis and Compliance'); ?></h2>
                    <p><?php echo t('privacy.legal.intro'); ?></p>
                    <ul>
                        <li><strong><?php echo t('privacy.legal.gdpr', 'GDPR Compliance (European Economic Area)'); ?>:</strong> <?php echo t('privacy.legal.gdprDesc'); ?></li>
                        <li><strong><?php echo t('privacy.legal.ccpa', 'CCPA Compliance (California)'); ?>:</strong> <?php echo t('privacy.legal.ccpaDesc'); ?></li>
                        <li><strong><?php echo t('privacy.legal.coppa', 'COPPA Compliance (United States)'); ?>:</strong> <?php echo t('privacy.legal.coppaDesc'); ?></li>
                        <li><strong><?php echo t('privacy.legal.international', 'International Data Transfers'); ?>:</strong> <?php echo t('privacy.legal.internationalDesc'); ?></li>
                        <li><strong><?php echo t('privacy.legal.lawEnforcement', 'Law Enforcement Requests'); ?>:</strong> <?php echo t('privacy.legal.lawEnforcementDesc'); ?></li>
                    </ul>
                </section>

                <section class="content-section summary-box">
                    <h2><?php echo t('privacy.summary.title', 'Quick Summary'); ?></h2>
                    <p><?php echo t('privacy.summary.intro'); ?></p>
                    <ul class="summary-list">
                        <li>✅ <strong><?php echo t('privacy.summary.what', 'What we store'); ?>:</strong> <?php echo t('privacy.summary.whatDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.where', 'Where it\'s stored'); ?>:</strong> <?php echo t('privacy.summary.whereDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.who', 'Who sees it'); ?>:</strong> <?php echo t('privacy.summary.whoDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.thirdParty', 'Third parties'); ?>:</strong> <?php echo t('privacy.summary.thirdPartyDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.tracking', 'Tracking and analytics'); ?>:</strong> <?php echo t('privacy.summary.trackingDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.personal', 'Personal data'); ?>:</strong> <?php echo t('privacy.summary.personalDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.ads', 'Advertising'); ?>:</strong> <?php echo t('privacy.summary.adsDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.selling', 'Data selling'); ?>:</strong> <?php echo t('privacy.summary.sellingDesc'); ?></li>
                        <li>✅ <strong><?php echo t('privacy.summary.security', 'Security'); ?>:</strong> <?php echo t('privacy.summary.securityDesc'); ?></li>
                    </ul>
                </section>
            </div>
        </div>
    </main>

<?php
require_once __DIR__ . '/includes/footer.php';
?>

