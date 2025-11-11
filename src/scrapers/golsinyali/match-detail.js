import puppeteer from 'puppeteer';
import {
  BASE_URL,
  DEFAULT_NAVIGATION_TIMEOUT,
  DEFAULT_USER_AGENT,
  DEFAULT_VIEWPORT,
  MATCH_LIST_PATH,
} from './constants.js';

function buildDetailUrl(locale, matchId, slug) {
  const safeLocale = (locale || 'tr').toString().trim().replace(/^\/+|\/+$|\s+/g, '') || 'tr';
  const matchSegment = slug ? `${matchId}/${slug}` : `${matchId}`;
  return `${BASE_URL}/${safeLocale}/${MATCH_LIST_PATH}/${matchSegment}`;
}

function sanitizeSlug(value) {
  if (!value) {
    return null;
  }
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export async function scrapeMatchDetail(options = {}) {
  const {
    matchId,
    slug,
    homeTeamName,
    awayTeamName,
    locale = 'tr',
    headless = 'new',
    navigationTimeoutMs = DEFAULT_NAVIGATION_TIMEOUT,
    userAgent = DEFAULT_USER_AGENT,
    logger = console,
  } = options;

  if (!matchId) {
    throw new Error('matchId parametresi zorunludur.');
  }

  const fallbackSlug =
    slug || createMatchSlug(homeTeamName, awayTeamName) || createMatchSlugFromId(matchId);
  const targetUrl = buildDetailUrl(locale, matchId, fallbackSlug);

  const browser = await puppeteer.launch({ headless });

  try {
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.setUserAgent(userAgent);
    page.setDefaultNavigationTimeout?.(navigationTimeoutMs);
    page.setDefaultTimeout?.(navigationTimeoutMs);

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: navigationTimeoutMs });
    await page.waitForSelector('main', { timeout: navigationTimeoutMs });

    const detail = await page.evaluate(() => {
      const text = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();
      const toNumber = (value) => {
        if (value === null || value === undefined) {
          return null;
        }
        const match = value.toString().replace(',', '.').match(/-?\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : null;
      };

      const findHeading = (query) => {
        const lower = query.toLowerCase();
        return Array.from(document.querySelectorAll('h2')).find((node) =>
          text(node).toLowerCase().includes(lower),
        );
      };

      const findGridAfterHeading = (heading) => {
        if (!heading) {
          return null;
        }
        let parent = heading.parentElement;
        while (parent) {
          let sibling = parent.nextElementSibling;
          while (sibling) {
            if (sibling.classList?.contains('grid')) {
              return sibling;
            }
            const nestedGrid = sibling.querySelector?.('.grid');
            if (nestedGrid) {
              return nestedGrid;
            }
            sibling = sibling.nextElementSibling;
          }
          parent = parent.parentElement;
        }
        return null;
      };

      const normalizeUrl = (img) => {
        if (!img) {
          return null;
        }
        const src = img.getAttribute('src') || img.getAttribute('data-src');
        if (!src) {
          return null;
        }
        return src.startsWith('http') ? src : `${location.origin}${src}`;
      };

      const structuredData = Array.from(
        document.querySelectorAll('script[type="application/ld+json"]'),
      )
        .map((script) => {
          try {
            return JSON.parse(script.textContent);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const sportsEvent = structuredData.find((item) => item?.['@type'] === 'SportsEvent') || null;

      const scoreboardGrid = document.querySelector('main .grid.grid-cols-3.items-center');
      const scoreboardCard = scoreboardGrid?.closest('div');
      const scoreboardHeader = scoreboardCard?.querySelector(
        '.flex.items-center.justify-between.mb-4',
      );
      const scoreboardInfoRow = scoreboardCard?.querySelector(
        '.flex.flex-wrap.items-center.justify-center',
      );

      const scoreboard = scoreboardGrid
        ? (() => {
            const [homeCol, centerCol, awayCol] = Array.from(scoreboardGrid.children);
            const centerScores = centerCol
              ? Array.from(centerCol.querySelectorAll('.text-3xl, .text-5xl')).map((node) =>
                  text(node),
                )
              : [];
            const halftime = text(
              centerCol?.querySelector('[class*="text-[10px]"], .text-xs, [class*="text-xs"]'),
            );
            const infoChips = scoreboardInfoRow
              ? Array.from(scoreboardInfoRow.children)
                  .map((chip) => text(chip))
                  .filter(Boolean)
              : [];

            return {
              leagueLabel: text(scoreboardHeader?.querySelector('.text-gray-300')),
              statusBadges: Array.from(
                scoreboardHeader?.querySelectorAll('.px-3.py-1, .px-3.py-1\\.5') || [],
              )
                .map((badge) => text(badge))
                .filter(Boolean),
              homeTeam: {
                name: text(homeCol?.querySelector('.text-center')),
                logo: normalizeUrl(homeCol?.querySelector('img')),
                score: centerScores[0] ? toNumber(centerScores[0]) : null,
              },
              awayTeam: {
                name: text(awayCol?.querySelector('.text-center')),
                logo: normalizeUrl(awayCol?.querySelector('img')),
                score: centerScores[1] ? toNumber(centerScores[1]) : null,
              },
              halftimeScore: halftime?.replace(/^Devre:\s*/i, '') || null,
              info: infoChips,
            };
          })()
        : null;

      const extractHighlightCard = (card, index) => {
        const content =
          card.querySelector('.relative.p-3, .relative.p-4, .relative.p-5') ?? card.querySelector('.relative');
        if (!content) {
          return null;
        }
        const ratingSpans = Array.from(content.querySelectorAll('span')).filter((span) =>
          span.textContent?.includes('★'),
        );
        const rating = ratingSpans.filter((span) => span.className?.includes('bet-yellow')).length;
        const ratingMax = ratingSpans.length || 5;
        const successRate = text(
          content.querySelector('.font-bold.text-bet-green, .font-bold.text-bet-yellow'),
        );

        return {
          position: index + 1,
          title: text(content.querySelector('h3')),
          pickCode: text(
            content.querySelector('.text-3xl, .text-4xl, .text-5xl, .text-2xl.font-bold'),
          ),
          successRate: successRate ? toNumber(successRate) : null,
          rating,
          ratingMax,
          locked: Boolean(card.querySelector('.absolute.inset-0')),
        };
      };

      const extractDetailedCard = (card, index) => {
        const outcomes = Array.from(card.querySelectorAll('.space-y-2')).map((row) => {
          const label = text(row.querySelector('.text-sm'));
          const value = text(row.querySelector('.font-bold'));
          if (!label || !/[0-9]/.test(value || '')) {
            return null;
          }
          return {
            label,
            valuePercent: toNumber(value),
          };
        });

        return {
          position: index + 1,
          title: text(card.querySelector('h3')),
          confidence: toNumber(text(card.querySelector('.px-3.py-1, .px-3.py-1\\.5'))),
          outcomes: outcomes.filter(Boolean),
        };
      };

      const extractCards = (headingText, parser) => {
        const heading = findHeading(headingText);
        const grid = findGridAfterHeading(heading);
        if (!grid) {
          return [];
        }
        return Array.from(grid.children)
          .map((card, idx) => parser(card, idx))
          .filter(Boolean);
      };

      const highlightPredictions = extractCards('Öne Çıkan Tahminler', extractHighlightCard);
      const detailPredictions = extractCards('Detaylı Tahminler', extractDetailedCard);

      const extractOddsSection = () => {
        const heading = findHeading('Oran Trend Analizi');
        if (!heading) {
          return [];
        }
        const container = heading.closest('.space-y-6') || heading.parentElement?.parentElement;
        if (!container) {
          return [];
        }
        const groups = Array.from(container.children).filter((child) =>
          child.querySelector(':scope > h3'),
        );
        return groups.map((group) => {
          const groupTitle = text(group.querySelector(':scope > h3'));
          const grid =
            group.querySelector(':scope > .grid') || group.querySelector('.grid') || document.createElement('div');
          const cards = Array.from(grid.children).map((card) => {
            const rows = Array.from(card.querySelectorAll('.flex.items-center.justify-between')).map(
              (row) => {
                const label = text(row.querySelector('span'));
                const valueContainer = row.querySelector('.flex.items-center');
                const values = valueContainer
                  ? Array.from(valueContainer.querySelectorAll('span')).map((span) => text(span))
                  : [];
                return {
                  label,
                  values,
                };
              },
            );
            return {
              title: text(card.querySelector(':scope > h3')),
              rows,
            };
          });
          return {
            title: groupTitle,
            cards,
          };
        });
      };

      const oddsTrends = extractOddsSection();

      const extractUpcomingMatches = () => {
        const heading = findHeading('Gelecek Maçlar');
        if (!heading) {
          return [];
        }
        const container = heading.closest('.space-y-6') || heading.parentElement?.parentElement;
        const grid = container?.querySelector('.grid');
        if (!grid) {
          return [];
        }
        return Array.from(grid.children).map((column) => {
          const matches = Array.from(column.querySelectorAll('.group.relative')).map((card) => {
            const footer = card.querySelector('.flex.items-center.justify-between.pt-3');
            const footerSpans = footer
              ? Array.from(footer.querySelectorAll('span')).map((span) => text(span))
              : [];
            return {
              badge: text(card.querySelector('.inline-flex')),
              opponent: text(card.querySelector('h4')),
              competition: text(card.querySelector('p.text-xs')),
              dateText: footerSpans[0] || null,
              tag: footerSpans[1] || null,
            };
          });
          return {
            team: text(column.querySelector('h3')),
            role: text(column.querySelector('p.text-xs')),
            matches,
          };
        });
      };

      const upcomingMatches = extractUpcomingMatches();

      return {
        scoreboard,
        highlightPredictions,
        detailPredictions,
        oddsTrends,
        upcomingMatches,
        structuredData: {
          sportsEvent,
        },
      };
    });

    return {
      locale,
      matchId: Number(matchId),
      url: targetUrl,
      scrapedAt: new Date().toISOString(),
      ...detail,
    };
  } catch (error) {
    logger?.error?.('Match detail scraping error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

function createMatchSlug(home, away) {
  if (!home || !away) {
    return null;
  }
  return [home, away].map(sanitizeSlug).filter(Boolean).join('-');
}

function createMatchSlugFromId(matchId) {
  return sanitizeSlug(String(matchId));
}
