export interface CTA {
  label: string;
  href: string;
}

export interface HeroStat {
  label: string;
  value: string;
  caption?: string;
}

export interface HeroHighlight {
  icon: string;
  label: string;
}

export interface HeroMiniMatch {
  label: string;
  fixture: string;
  kickoff: string;
  meta: string;
  probabilities: Array<{ label: string; value: string }>;
  cta: CTA;
}

export interface HeroContent {
  badgeLabel: string;
  badgeHighlight: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: CTA;
  secondaryCta: CTA;
  stats: HeroStat[];
  highlights: HeroHighlight[];
  trustLogos: string[];
  miniMatch: HeroMiniMatch;
}

export interface HomeContent {
  hero: HeroContent;
}
