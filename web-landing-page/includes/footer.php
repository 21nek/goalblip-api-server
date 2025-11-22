    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">
                        <a href="<?php echo getLangUrl($currentLang); ?>">
                            <img src="/assets/logo.png" alt="GoalBlip" class="logo-img">
                            <span>GoalBlip</span>
                        </a>
                    </div>
                    <p><?php echo t('footer.description'); ?></p>
                </div>
                <div class="footer-links">
                    <div class="footer-column">
                        <h4><?php echo t('footer.quickLinks'); ?></h4>
                        <a href="<?php echo getLangUrl($currentLang); ?>"><?php echo t('nav.home'); ?></a>
                        <a href="<?php echo getLangUrl($currentLang, 'privacy-policy'); ?>"><?php echo t('footer.privacy'); ?></a>
                        <a href="<?php echo getLangUrl($currentLang, 'support'); ?>"><?php echo t('footer.support'); ?></a>
                    </div>
                    <div class="footer-column">
                        <h4><?php echo t('footer.legal'); ?></h4>
                        <a href="<?php echo getLangUrl($currentLang, 'privacy-policy'); ?>"><?php echo t('footer.privacy'); ?></a>
                        <a href="#"><?php echo t('footer.terms'); ?></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p><?php echo t('footer.copyright'); ?></p>
            </div>
        </div>
    </footer>

    <script src="/particles.js"></script>
<script src="/script.js"></script>
</body>
</html>
