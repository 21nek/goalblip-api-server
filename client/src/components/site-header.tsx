'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './site-header.module.css';
import { ThemeToggle } from './theme-toggle';
import { locales, type Locale } from '@/src/lib/i18n';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Insights', href: '#insights' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#blog' }
];

interface Props {
  locale: Locale;
}

export function SiteHeader({ locale }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logoMark} />
        <div>
          <span className={styles.logoText}>Goalblip</span>
          <span className={styles.tagline}>AI match intelligence</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className={styles.actions}>
        <ThemeToggle className={styles.themeToggle} />
        <LanguageSwitcher activeLocale={locale} />
        <a className="cta-ghost" href="#demo">
          Schedule demo
        </a>
        <a className="cta-primary" href="#get-started">
          Launch app
        </a>
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className={styles.mobileToggle}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen ? (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="#demo" onClick={() => setMenuOpen(false)}>
            Schedule demo
          </a>
          <a href="#get-started" onClick={() => setMenuOpen(false)}>
            Launch app
          </a>
        </div>
      ) : null}
    </header>
  );
}

function LanguageSwitcher({ activeLocale }: { activeLocale: Locale }) {
  return (
    <div className={styles.localeSwitcher}>
      {locales.map((loc) => (
        <Link
          key={loc}
          href={`/${loc}`}
          prefetch={false}
          className={loc === activeLocale ? styles.localeActive : undefined}
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
