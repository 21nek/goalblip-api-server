import type { ReactNode } from 'react';
import { defaultLocale, isLocale, type Locale } from '@/src/lib/i18n';
import { SiteHeader } from '@/src/components/site-header';
import { SiteFooter } from '@/src/components/site-footer';

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : defaultLocale;

  return (
    <div className="page-shell">
      <SiteHeader locale={locale} />
      {children}
      <SiteFooter />
    </div>
  );
}
