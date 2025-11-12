import type { Metadata } from 'next';
import { getHomeContent } from '@/src/lib/content';
import { defaultLocale, isLocale, locales } from '@/src/lib/i18n';
import { HeroSection } from '@/src/components/hero-section';

type Params = { locale: string };

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const data = await getHomeContent(locale);

  return {
    title: data.hero.title,
    description: data.hero.description
  };
}

export default async function HomePage({ params }: { params: Promise<Params> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;
  const content = await getHomeContent(locale);

  return (
    <main className="landing">
      <HeroSection data={content.hero} />
    </main>
  );
}
