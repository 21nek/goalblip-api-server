import { resolveIcon } from '@/src/lib/icons';
import type { HeroContent } from '@/src/types/home';

interface Props {
  data: HeroContent;
}

export function HeroSection({ data }: Props) {
  const [primaryStat, ...restStats] = data.stats;

  return (
    <section id="hero" className="hero">
      <div className="hero__halo" aria-hidden />
      <div className="hero__shell surface surface--frosted">
        <div className="hero__content">
          <span className="pill hero__badge">
            <span className="pill-dot" />
            <span>{data.badgeLabel}</span>
            <span className="pill-divider" />
            <span>{data.badgeHighlight}</span>
          </span>
          <p className="hero__eyebrow">{data.eyebrow}</p>
          <h1>{data.title}</h1>
          <p className="hero__description">{data.description}</p>
          <div className="hero__ctas">
            <a className="cta-primary" href={data.primaryCta.href}>
              {data.primaryCta.label}
            </a>
            <a className="cta-ghost" href={data.secondaryCta.href}>
              {data.secondaryCta.label}
            </a>
          </div>

          <ul className="hero__highlights">
            {data.highlights.map((highlight) => {
              const Icon = resolveIcon(highlight.icon);
              return (
                <li key={highlight.label}>
                  <span className="hero__highlight-icon">
                    <Icon size={16} />
                  </span>
                  <span>{highlight.label}</span>
                </li>
              );
            })}
          </ul>

          <div className="hero__trust">
            <span>Trusted by</span>
            <div className="hero__trust-logos">
              {data.trustLogos.map((logo) => (
                <span key={logo}>{logo}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__panel">
          {primaryStat ? (
            <article className="hero__primary metric-card">
              <span className="hero__primary-label">Featured metric</span>
              <strong>{primaryStat.value}</strong>
              <p>{primaryStat.label}</p>
              {primaryStat.caption ? <small>{primaryStat.caption}</small> : null}
            </article>
          ) : null}

          {restStats.length ? (
            <div className="hero__stat-grid">
              {restStats.map((stat) => (
                <article key={stat.label} className="metric-card">
                  <p className="metric-label">{stat.label}</p>
                  <strong>{stat.value}</strong>
                  {stat.caption ? <small>{stat.caption}</small> : null}
                </article>
              ))}
            </div>
          ) : null}

          <article className="hero__match-card">
            <div className="hero__match-head">
              <span className="chip">{data.miniMatch.label}</span>
              <span className="hero__match-time">{data.miniMatch.kickoff}</span>
            </div>
            <h3>{data.miniMatch.fixture}</h3>
            <p className="hero__match-meta">{data.miniMatch.meta}</p>
            <div className="hero__probabilities">
              {data.miniMatch.probabilities.map((prob) => (
                <div key={prob.label}>
                  <span>{prob.label}</span>
                  <strong>{prob.value}</strong>
                </div>
              ))}
            </div>
            <a className="cta-link" href={data.miniMatch.cta.href}>
              {data.miniMatch.cta.label}
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
