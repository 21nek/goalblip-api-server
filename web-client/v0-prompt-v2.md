# v0.dev Prompt v2 - GoalBlip Landing Page (Detaylı)

```
Create a modern, dark-themed landing page for GoalBlip, a football analysis mobile app. The design should be professional, clean, and conversion-focused.

=== COLOR PALETTE ===
- Primary Background: #181818 (main page background, very dark gray)
- Secondary Background: #212121 (cards, sections, header when scrolled)
- Accent Color: #cbe043 (primary CTA buttons, highlights, links)
- Accent Dark: #a8c030 (hover states for accent)
- Primary Text: #f8fafc (headings, main text - white)
- Secondary Text: #cbd5f5 (subheadings, secondary content - light blue)
- Tertiary Text: #94a3b8 (captions, less important text - gray blue)
- Muted Text: #64748b (disabled, very subtle text)
- Border: rgba(255, 255, 255, 0.1) (card borders, dividers)
- Border Light: rgba(255, 255, 255, 0.15) (hover borders)
- Card Hover: rgba(255, 255, 255, 0.05) (card hover background)
- Shadow: rgba(0, 0, 0, 0.1) to rgba(0, 0, 0, 0.15) (card shadows)

=== TYPOGRAPHY ===
- Font Family: System fonts (Inter, SF Pro, or -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
- H1: 48px (mobile: 32px), font-weight: 700, line-height: 1.2, letter-spacing: -0.5px
- H2: 36px (mobile: 28px), font-weight: 600, line-height: 1.3
- H3: 24px (mobile: 20px), font-weight: 600, line-height: 1.4
- Body Large: 18px, font-weight: 400, line-height: 1.6
- Body: 16px, font-weight: 400, line-height: 1.6
- Body Small: 14px, font-weight: 400, line-height: 1.5
- Caption: 12px, font-weight: 400, line-height: 1.4

=== LAYOUT & SPACING ===
- Max Content Width: 1200px (centered)
- Section Padding: 80px vertical (mobile: 60px), 24px horizontal (mobile: 16px)
- Card Padding: 24px (mobile: 20px)
- Gap Between Cards: 24px (mobile: 16px)
- Border Radius: 12px (cards), 8px (buttons), 999px (pills/badges)

=== HEADER ===
- Height: 80px (mobile: 64px)
- Background: Transparent on hero section, #212121 with backdrop-blur when scrolled
- Position: Fixed, sticky at top
- Z-index: 1000
- Layout: 
  * Left: Logo (40px height, clickable to scroll to top)
  * Center: Navigation links (Home, Privacy Policy, Support) - hidden on mobile, shown in hamburger menu
  * Right: Language selector (TR | EN | ES | DE) - dropdown on desktop, button group on mobile
- Navigation Links: 
  * Color: #cbd5f5
  * Hover: #cbe043
  * Font: 14px, font-weight: 500
  * Spacing: 32px between links
- Language Selector:
  * Active language: #cbe043, font-weight: 600
  * Inactive: #94a3b8
  * Hover: #cbd5f5
  * Font: 12px, uppercase, letter-spacing: 0.5px

=== HERO SECTION ===
- Full viewport height (100vh) on desktop, min-height: 600px on mobile
- Background: Gradient from #181818 to #0f172a, or subtle pattern overlay
- Content: Centered, max-width: 800px
- Padding: 120px top (mobile: 80px), 40px bottom
- Elements:
  1. Logo or icon (optional, 80px if included)
  2. H1: "GoalBlip" - large, bold, gradient text effect (accent color)
  3. H2 Subtitle: "Futbol Maçları için AI Destekli Analiz ve İstatistikler" - secondary text color, 24px
  4. Description: "Futbol dünyasını yakından takip edin. Detaylı maç analizleri, takım performans istatistikleri ve kapsamlı veriler ile bilinçli kararlar verin." - tertiary text, 18px, max-width: 600px, centered
  5. CTA Buttons: Two buttons side by side
     - "App Store'dan İndir" - App Store badge/icon (white or accent)
     - "Play Store'dan İndir" - Play Store badge/icon (white or accent)
     - Button style: #cbe043 background, #181818 text, 16px font, 14px padding vertical, 28px padding horizontal, 8px border-radius, font-weight: 600
     - Hover: #d4e85a background, transform: scale(1.05), transition: 0.2s
     - Gap: 16px between buttons
  6. Scroll indicator (optional): Animated arrow or "scroll down" text at bottom

=== HOW IT WORKS SECTION ===
- Title: "Nasıl Çalışır?" - H2, centered, margin-bottom: 48px
- Subtitle: "Birlikte Keşfedelim!" - body large, centered, tertiary text, margin-bottom: 64px
- Layout: 4 columns on desktop (grid), 2 columns on tablet, 1 column on mobile
- Card Style for each step:
  * Background: #212121
  * Border: 1px solid rgba(255, 255, 255, 0.1)
  * Border-radius: 12px
  * Padding: 32px (mobile: 24px)
  * Shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
  * Hover: border-color rgba(255, 255, 255, 0.15), background rgba(255, 255, 255, 0.05), transform: translateY(-4px), transition: 0.3s
- Step Content:
  1. Icon/Number: Large, accent color, 48px size, margin-bottom: 24px
  2. Title: H3, primary text, margin-bottom: 12px
  3. Description: Body, secondary text, line-height: 1.6
- Steps:
  Step 1: "Veri Toplama ve İşleme"
    Description: "GoalBlip, interneti tarayarak futbol takımlarının geçmiş maçları, lig durumu ve çeşitli istatistikler gibi önemli bilgileri toplar. Bu veriler, maçların detaylarını, takım istatistiklerini ve oyuncu bilgilerini içerir."
  Step 2: "Veri Analizi"
    Description: "Toplanan veriler, GoalBlip'in güçlü analiz motorları tarafından işlenir. Ev sahibi ve deplasman performansı, son maçlardaki performans durumu ve oyuncu sağlık durumları gibi çeşitli faktörler dikkate alınır."
  Step 3: "Analiz ve Tablo Oluşturma"
    Description: "Analiz edilen veriler, çeşitli algoritmalar ve modeller kullanılarak işlenir ve potansiyel maç sonuçları, performans tabloları gibi detaylı analizler oluşturulur."
  Step 4: "Kullanıcı Etkileşimi"
    Description: "Kullanıcılar, GoalBlip'in hazırladığı detaylı tablolardan doğrudan sonuçlara bakabilir veya kendi analizlerini yaparak özelleştirilmiş görünümlere erişebilirler."

=== FEATURES SECTION ===
- Title: "Özellikler" - H2, centered, margin-bottom: 48px
- Layout: 3 columns on desktop, 2 columns on tablet, 1 column on mobile
- Card Style: Same as "How It Works" cards
- Feature Content:
  * Icon: 40px, accent color, margin-bottom: 20px
  * Title: H3, primary text, margin-bottom: 8px
  * Description: Body small, secondary text
- Features (6 items):
  1. "Detaylı Maç Analizleri" - "Her maç için kapsamlı istatistikler ve performans metrikleri"
  2. "Takım Karşılaştırmaları" - "Takımların son performansları, form durumu ve karşılaştırmalar"
  3. "Favori Takip" - "İstediğiniz maçları kaydedin ve kolayca erişin"
  4. "Çok Dilli Destek" - "Türkçe, İngilizce, İspanyolca, Almanca"
  5. "Modern Arayüz" - "Kullanıcı dostu, responsive tasarım"
  6. "Gerçek Zamanlı Veriler" - "Anlık güncellenen maç bilgileri ve istatistikler"

=== WHY GOALBLIP SECTION ===
- Background: Slightly different shade (#1a1a1a) or gradient overlay
- Layout: Two columns on desktop (text left, visual/icon right), stacked on mobile
- Left Column:
  * Title: "Maç Analizi Yapmak Bazen Çok Yorucu Olabiliyor" - H2, primary text
  * Description: "Artık saatlerce analiz yapmanıza gerek yok; GoalBlip, veriye dayalı öngörüler sunarak karar verme sürecinizi hızlandırır. Karmaşık veri setleri ve istatistiklerle uğraşmak yerine, yapay zekanın gücünü kullanarak zamanınızı ve enerjinizi koruyun." - Body large, secondary text, margin-top: 24px
  * Bullet points (optional):
    - "Otomatik veri toplama ve işleme"
    - "Gelişmiş analiz algoritmaları"
    - "Kullanıcı dostu arayüz"
- Right Column:
  * Large icon, illustration, or gradient visual
  * Or statistics/metrics cards

=== DATA-DRIVEN ANALYSIS SECTION ===
- Title: "Veri Odaklı Analizler" - H2, centered, margin-bottom: 48px
- Layout: 4 columns on desktop, 2 columns on tablet, 1 column on mobile
- Card Style: Similar to features, but with icon on top, title, and short description
- Benefits:
  1. "Geniş Veri Kaynakları" - "Dünya çapında futbol verilerini anlık olarak toplama"
  2. "Güçlü Analiz Algoritmaları" - "Gelişmiş veri işleme ve istatistiksel analiz"
  3. "Kullanıcı Dostu Arayüz" - "Kolay kullanım ve anlaşılır görselleştirmeler"
  4. "Sürekli Güncelleme" - "En güncel veriler ve sürekli gelişen sistem"

=== CTA SECTION ===
- Background: Accent color gradient (#cbe043 to #d4e85a) or dark with accent border
- Padding: 80px vertical (mobile: 60px)
- Content: Centered, max-width: 600px
- Elements:
  1. Title: "Hemen Ücretsiz Dene!" - H2, dark text (#181818), margin-bottom: 16px
  2. Subtitle: "App Store ve Play Store'dan indir" - Body large, dark text with opacity 0.8
  3. Buttons: Same style as hero section, but with dark background and light text, or vice versa for contrast
  4. App Store and Play Store badges/icons

=== FOOTER ===
- Background: #0f0f0f (darker than main)
- Padding: 60px vertical, 24px horizontal
- Layout: 4 columns on desktop (Logo/About, Links, Legal, Social), stacked on mobile
- Content:
  * Column 1: Logo + short description (body small, tertiary text)
  * Column 2: Quick Links (Privacy Policy, Support, Contact)
  * Column 3: Legal (Terms of Service, if exists)
  * Column 4: Social media links (if exists) or language selector
- Copyright: Centered at bottom, body small, muted text, margin-top: 40px, padding-top: 40px, border-top: 1px solid rgba(255, 255, 255, 0.1)
- Text: "© 2025 GoalBlip. All rights reserved."

=== INTERACTIVE ELEMENTS ===
- Smooth scroll: All anchor links should smoothly scroll to sections
- Scroll animations: Fade-in and slide-up animations when sections come into viewport (using Intersection Observer or CSS animations)
- Hover effects: All cards, buttons, and links should have smooth hover transitions (0.2s to 0.3s)
- Loading states: If any dynamic content, show skeleton loaders
- Mobile menu: Hamburger icon that transforms to X, slide-in menu from right or dropdown

=== RESPONSIVE BREAKPOINTS ===
- Mobile: < 768px (single column, reduced padding, smaller fonts)
- Tablet: 768px - 1024px (2 columns where applicable)
- Desktop: > 1024px (full layout)

=== CRITICAL WORDING RULES ===
- NEVER use: "bahis", "tahmin", "kumar", "betting", "gambling", "predictions", "odds", "wager"
- ONLY use: "futbol maç analizi", "istatistik", "maç sonucu", "veri analizi", "analiz", "performans", "istatistiksel veri", "maç bilgileri"
- NO mention of: AI chat, chatbot, premium features, paid plans, subscriptions (app is completely free)
- Focus on: analysis, statistics, insights, data-driven decisions, team performance, match insights

=== TECHNICAL REQUIREMENTS ===
- Semantic HTML5 (header, nav, main, section, footer)
- CSS3 with modern features (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript for:
  * Language switching (store in localStorage, update via URL param ?lang=tr)
  * Smooth scroll
  * Mobile menu toggle
  * Scroll animations (optional)
- SEO: Meta tags, Open Graph, structured data
- Accessibility: ARIA labels, keyboard navigation, focus states
- Performance: Lazy load images, optimize assets, minify CSS/JS

=== VISUAL STYLE ===
- Modern, clean, professional
- Dark theme with subtle gradients
- Card-based design with depth (shadows, borders)
- Smooth animations and transitions
- Consistent spacing and typography
- High contrast for readability
- Accent color used sparingly for CTAs and highlights

Make it look like a premium mobile app's landing page - clean, modern, and conversion-focused.
```

