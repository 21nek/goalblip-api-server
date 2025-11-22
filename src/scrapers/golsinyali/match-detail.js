import puppeteer from 'puppeteer';
import {
  BASE_URL,
  DEFAULT_NAVIGATION_TIMEOUT,
  DEFAULT_USER_AGENT,
  DEFAULT_VIEWPORT,
  MATCH_LIST_PATH,
} from './constants.js';
import { normalizeLocale } from '../../config/locales.js';
import { buildHeadingConfig } from './i18n/headings.js';

const ALLOWED_HOST = new URL(BASE_URL).hostname;
const TRACKING_HOST_PATTERNS = [
  'google-analytics.com',
  'analytics.google.com',
  'googletagmanager.com',
  'doubleclick.net',
  'facebook.com',
  'fbcdn.net',
  'hotjar.com',
  'segment.io',
  'mixpanel.com',
  'amplitude.com',
];

async function setupRequestInterception(page, logger = console) {
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const type = request.resourceType();
    const url = request.url();
    try {
      const hostname = new URL(url).hostname;
      const isAllowedHost = hostname === ALLOWED_HOST || hostname.endsWith('.golsinyali.com');

      if (TRACKING_HOST_PATTERNS.some((pat) => hostname.includes(pat))) {
        return request.abort();
      }

      // Allow images (logos) from target host, block third-party images/media/fonts
      if (['image', 'font', 'media'].includes(type)) {
        return isAllowedHost ? request.continue() : request.abort();
      }

      // Keep only first-party stylesheets
      if (type === 'stylesheet') {
        return isAllowedHost ? request.continue() : request.abort();
      }

      if (['other', 'beacon', 'prefetch', 'preflight'].includes(type)) {
        return request.abort();
      }

      if (type === 'script' || type === 'xhr' || type === 'fetch' || type === 'document') {
        if (hostname !== ALLOWED_HOST && !hostname.endsWith('.golsinyali.com')) {
          return request.abort();
        }
      }
      return request.continue();
    } catch (err) {
      logger?.warn?.('[scrape] request interception error, continuing', err?.message ?? err);
      return request.continue();
    }
  });
}

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

  const normalizedLocale = normalizeLocale(locale);
  const fallbackSlug =
    slug || createMatchSlug(homeTeamName, awayTeamName) || createMatchSlugFromId(matchId);
  const targetUrl = buildDetailUrl(normalizedLocale, matchId, fallbackSlug);
  const headingConfig = buildHeadingConfig(normalizedLocale);

  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(DEFAULT_VIEWPORT);
    await page.setUserAgent(userAgent);
    page.setDefaultNavigationTimeout?.(navigationTimeoutMs);
    page.setDefaultTimeout?.(navigationTimeoutMs);
    await setupRequestInterception(page, logger);

    await page.evaluateOnNewDocument(() => {
      const noopFn = () => {};
      const noopObj = new Proxy(
        {},
        {
          get: () => noopFn,
          set: () => true,
        },
      );
      // @ts-ignore
      window.dataLayer = [];
      // @ts-ignore
      window.gtag = noopFn;
      // @ts-ignore
      window.ga = noopFn;
      // @ts-ignore
      window.fbq = noopFn;
      // @ts-ignore
      window._gaq = [];
      // @ts-ignore
      navigator.sendBeacon = noopFn;
      const blockedHosts = [
        'google-analytics.com',
        'googletagmanager.com',
        'doubleclick.net',
        'facebook.com',
        'fbcdn.net',
        'hotjar.com',
        'segment.io',
        'mixpanel.com',
        'amplitude.com',
      ];
      const shouldBlock = (url) => {
        try {
          const h = new URL(url).hostname;
          return blockedHosts.some((p) => h.includes(p));
        } catch {
          return false;
        }
      };
      const origFetch = window.fetch;
      // @ts-ignore
      window.fetch = (...args) => {
        if (args[0] && shouldBlock(args[0])) return Promise.resolve(new Response(null, { status: 204 }));
        return origFetch(...args);
      };
      const origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (...args) {
        if (args[1] && shouldBlock(args[1])) {
          this.send = () => {};
        }
        return origOpen.apply(this, args);
      };
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: navigationTimeoutMs });

    // 404 check
    const pageTitle = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (
      /sayfa bulunamadı|page not found|404/i.test(pageTitle) ||
      /aradığınız sayfa bulunamadı/i.test(bodyText)
    ) {
      throw new Error('Match page not found (404)');
    }

    // main elementi bulunamazsa alternatif selector'ları dene
    try {
      await page.waitForSelector('main', { timeout: 10000 }); // 10 saniye dene
    } catch (mainError) {
      // main bulunamadı, body veya başka bir container'ı bekle
      try {
        await page.waitForSelector('body', { timeout: 5000 });
        logger?.warn?.(`main selector not found for ${matchId}, continuing with body`);
      } catch (bodyError) {
        // Hiçbir şey bulunamadı, yine de devam et
        logger?.warn?.(`No main or body selector found for ${matchId}, continuing anyway`);
      }
    }

    const detail = await page.evaluate(async (headingConfig) => {
      const text = (node) => (node?.textContent || '').replace(/\s+/g, ' ').trim();
      const toNumber = (value) => {
        if (value === null || value === undefined) {
          return null;
        }
        const match = value.toString().replace(',', '.').match(/-?\d+(?:\.\d+)?/);
        return match ? Number(match[0]) : null;
      };

      const findHeading = (candidates) => {
        const texts = Array.isArray(candidates) ? candidates : [candidates].filter(Boolean);
        const lowered = texts.map((value) => value.toString().toLowerCase());
        if (!lowered.length) {
          return null;
        }
        return (
          Array.from(document.querySelectorAll('h1, h2, h3')).find((node) => {
            const content = text(node).toLowerCase();
            return lowered.some((needle) => needle && content.includes(needle));
          }) || null
        );
      };

      const findSectionAfterHeading = (heading) => {
        if (!heading) {
          return null;
        }
        const isCandidate = (node) => {
          if (!node) return false;
          if (node.querySelector?.('table, ul, ol, .grid')) {
            return true;
          }
          const className = node.className || '';
          return /grid|space-y|divide-y|flex|list|table/i.test(className);
        };
        let context = heading.parentElement;
        while (context) {
          let sibling = context.nextElementSibling;
          while (sibling) {
            if (isCandidate(sibling)) {
              return sibling;
            }
            if (isCandidate(sibling.firstElementChild)) {
              return sibling.firstElementChild;
            }
            sibling = sibling.nextElementSibling;
          }
          context = context.parentElement;
        }
        return null;
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

      const structuredDataList = Array.from(
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

      const pickByType = (type) =>
        structuredDataList.find((item) => {
          const entryType = item?.['@type'];
          if (Array.isArray(entryType)) {
            return entryType.includes(type);
          }
          return entryType === type;
        }) || null;

      const sportsEvent = pickByType('SportsEvent');
      const faqPage = pickByType('FAQPage');
      const article = pickByType('Article');
      const breadcrumbs = pickByType('BreadcrumbList');

      // main yoksa body veya doğrudan grid'i ara
      const scoreboardGrid = document.querySelector('main .grid.grid-cols-3.items-center')
        || document.querySelector('body .grid.grid-cols-3.items-center')
        || document.querySelector('.grid.grid-cols-3.items-center');
      const scoreboardCard =
        scoreboardGrid?.closest('[class*="relative"]') ?? scoreboardGrid?.closest('div');
      const scoreboardHeader =
        scoreboardCard?.querySelector(
          '.flex.items-center.justify-between.mb-3, .flex.items-center.justify-between.mb-4',
        ) ?? null;
      const scoreboardInfoRow =
        scoreboardCard?.querySelector(
          '.flex.flex-wrap.items-center.justify-center, .flex.flex-wrap.items-center.gap-x-4',
        ) ?? null;

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
          const kickoffContainer =
            scoreboardCard?.querySelector('.border-t .text-gray-400') ?? null;
          const kickoffTimezone = kickoffContainer
            ? text(kickoffContainer.querySelector('span'))
            : null;
          const kickoffTextRaw = kickoffContainer
            ? text(kickoffContainer).replace(kickoffTimezone || '', '').trim()
            : null;
          const kickoffText = kickoffTextRaw
            ? kickoffTextRaw.replace(/^[^0-9A-Za-z]+/, '').trim()
            : null;
          const kickoffIsoUtc = sportsEvent?.startDate || null;

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
            kickoff: kickoffText || null,
            kickoffTimezone: kickoffTimezone || null,
            kickoffIsoUtc: kickoffIsoUtc || null,
          };
        })()
        : null;

      const extractHighlightCard = (card, index) => {
        const content =
          card.querySelector('.relative.p-3, .relative.p-4, .relative.p-5') ??
          card.querySelector('.relative');
        if (!content) {
          return null;
        }
        const ratingContainer = content.querySelector(
          '[class*="gap-0.5"], [class*="gap-1"], [class*="gap-2"]',
        );
        const ratingSpans = ratingContainer
          ? Array.from(ratingContainer.querySelectorAll('span'))
          : [];
        const rating = ratingSpans.filter((span) => span.className?.includes('bet-yellow')).length;
        const ratingMax = ratingSpans.length || 5;
        const successNode =
          content.querySelector(
            '.flex.items-center.justify-between .font-bold.text-bet-green, .flex.items-center.justify-between .font-bold.text-bet-yellow',
          ) ?? null;
        const successRate = successNode ? toNumber(text(successNode)) : null;

        return {
          position: index + 1,
          title: text(content.querySelector('h3')),
          pickCode: text(
            content.querySelector('.text-3xl, .text-4xl, .text-5xl, .text-2xl.font-bold'),
          ),
          successRate,
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

      const extractCards = (headingTexts, parser) => {
        const heading = findHeading(headingTexts);
        const grid = findGridAfterHeading(heading);
        if (!grid) {
          return [];
        }
        return Array.from(grid.children)
          .map((card, idx) => parser(card, idx))
          .filter(Boolean);
      };

      const highlightPredictions = extractCards(
        headingConfig?.highlight ?? ['Öne Çıkan Tahminler'],
        extractHighlightCard,
      );
      const detailPredictions = extractCards(
        headingConfig?.detailed ?? ['Detaylı Tahminler'],
        extractDetailedCard,
      );

      const extractTableRows = (table) => {
        if (!table) return [];
        const headers = Array.from(table.querySelectorAll('thead th')).map((cell) => text(cell));
        return Array.from(table.querySelectorAll('tbody tr'))
          .map((row) => {
            const cells = Array.from(row.querySelectorAll('th, td')).map((cell) => text(cell));
            if (!cells.some(Boolean)) {
              return null;
            }
            if (headers.length && headers.length === cells.length) {
              const entry = {};
              headers.forEach((header, index) => {
                const key = header || `column${index + 1}`;
                entry[key] = cells[index] || null;
              });
              return entry;
            }
            return { columns: cells };
          })
          .filter(Boolean);
      };

      const extractFormColumns = () => {
        const headings = Array.from(document.querySelectorAll('h3')).filter((node) =>
          /form/i.test(text(node)),
        );
        if (!headings.length) {
          return null;
        }

        const resolveScore = (row) => {
          const scoreCandidate = Array.from(row.querySelectorAll('span, div'))
            .map((node) => text(node))
            .find((value) => /\d+\s*-\s*\d+/i.test(value));
          return scoreCandidate || null;
        };

        const parseColumn = (headingNode) => {
          const columnRoot =
            headingNode.closest('.bg-card-bg, .rounded-xl, .rounded-lg') || headingNode.parentElement;
          if (!columnRoot) {
            return null;
          }

          const listRoot =
            columnRoot.querySelector('.space-y-2, .space-y-3') ||
            columnRoot.querySelector('ul, ol') ||
            columnRoot;
          let rowNodes = Array.from(
            listRoot.matches?.('ul, ol')
              ? listRoot.querySelectorAll(':scope > li')
              : listRoot.querySelectorAll(':scope > div'),
          ).filter((node) => node && node.tagName !== 'H3');

          if (!rowNodes.length) {
            rowNodes = Array.from(
              columnRoot.querySelectorAll(
                '.flex.items-center.gap-2, .flex.items-center.gap-3, .list-disc > li',
              ),
            );
          }

          const rows = rowNodes
            .map((row) => {
              const scopedSpans = Array.from(row.querySelectorAll(':scope > span'));
              const resultBadge = text(scopedSpans[0]);
              let score = text(scopedSpans[scopedSpans.length - 1]);
              if (!/\d+\s*-\s*\d+/.test(score || '')) {
                score = resolveScore(row);
              }

              const detailWrapper =
                row.querySelector('.flex-1, .flex-auto, .min-w-0') || row.querySelector('div');
              const detailLines = detailWrapper
                ? Array.from(
                  detailWrapper.querySelectorAll(
                    '.text-gray-300, .text-sm.text-gray-300, .truncate, .text-xs.text-gray-500, .text-gray-500.text-xs',
                  ),
                )
                  .map((node) => text(node))
                  .filter(Boolean)
                : [];
              const opponent = detailLines.shift() || null;
              const competition = detailLines.shift() || null;
              const date = detailLines.shift() || null;

              if (!(opponent || score || competition || resultBadge || date)) {
                return null;
              }
              return {
                result: resultBadge || null,
                opponent,
                competition: competition || null,
                date: date || null,
                score: score || null,
              };
            })
            .filter(Boolean);

          if (!rows.length) {
            return null;
          }
          return {
            title: text(headingNode),
            matches: rows,
          };
        };

        const columns = headings.map(parseColumn).filter(Boolean);
        return columns.length ? columns : null;
      };

      const extractHeadToHead = () => {
        const headingNode =
          Array.from(document.querySelectorAll('h3, h4')).find((node) =>
            /(karşılıklı maçlar|head to head|encuentros directos|enfrentamientos)/i.test(text(node)),
          ) ||
          Array.from(document.querySelectorAll('h3, h4')).find((node) =>
            /(son \d+ karşılaşma|karşılaşma özeti|last \d+ matches|match summary|resumen de partidos|últimos \d+ encuentros)/i.test(
              text(node),
            ),
          );
        if (!headingNode) {
          return null;
        }
        const container =
          headingNode.closest('.bg-card-bg, .rounded-xl, .rounded-lg') ||
          headingNode.parentElement ||
          findSectionAfterHeading(headingNode) ||
          headingNode.closest?.('section');
        if (!container) {
          return null;
        }
        const table = container.querySelector('table');
        if (table) {
          const rows = extractTableRows(table);
          return rows.length ? rows : null;
        }
        const listRows = Array.from(
          container.querySelectorAll(
            '.space-y-2 > div, .space-y-3 > div, li, .flex.items-center.gap-3, .flex.items-center.justify-between',
          ),
        )
          .map((row) => {
            const dateText = text(
              row.querySelector(
                '.text-xs.w-16, .text-gray-500.text-xs:first-child, .text-xs:first-child',
              ),
            );
            const competition = text(
              row.querySelector('.text-gray-600.text-xs:last-child, .text-xs.text-right'),
            );
            const infoContainer =
              row.querySelector('.flex-1.flex, .flex-1.flex.items-center') ||
              row.querySelector('.flex.items-center.justify-between');
            const infoSpans = infoContainer
              ? Array.from(infoContainer.querySelectorAll('span')).map((node) => text(node)).filter(Boolean)
              : [];
            const scoreIndex = infoSpans.findIndex((value) => /\d+\s*-\s*\d+/.test(value));
            const scoreText = scoreIndex >= 0 ? infoSpans[scoreIndex] : null;
            const homeTeam = scoreIndex > 0 ? infoSpans[scoreIndex - 1] : infoSpans[0] || null;
            const awayTeam =
              scoreIndex >= 0 && scoreIndex + 1 < infoSpans.length
                ? infoSpans[scoreIndex + 1]
                : infoSpans[infoSpans.length - 1] || null;

            if (!(homeTeam || awayTeam || scoreText)) {
              return null;
            }
            return {
              date: dateText || null,
              competition: competition || null,
              homeTeam: homeTeam || null,
              awayTeam: awayTeam || null,
              score: scoreText || null,
            };
          })
          .filter(Boolean);
        return listRows.length ? listRows : null;
      };

      const extractOddsSection = () => {
        const heading = findHeading(headingConfig?.odds ?? ['Oran Trend Analizi']);
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
        const heading = findHeading(headingConfig?.upcoming ?? ['Gelecek Maçlar']);
        if (!heading) {
          return [];
        }
        const container = heading.closest('.space-y-6') || heading.parentElement?.parentElement;
        const grid = container?.querySelector('.grid') || container;
        if (!grid) {
          return [];
        }
        const columns = Array.from(grid.children).filter((child) => {
          const title = text(child.querySelector('h3'));
          return Boolean(title);
        });
        return columns.map((column) => {
          const matches = Array.from(column.querySelectorAll('.group.relative, li, article')).map(
            (card) => {
              const footer =
                card.querySelector('.flex.items-center.justify-between.pt-3') ||
                card.querySelector('.flex.items-center.justify-between') ||
                card.querySelector('.flex.items-center.gap-2') ||
                card.querySelector('.flex.items-center');
              const footerSpans = footer
                ? Array.from(footer.querySelectorAll('span')).map((span) => text(span))
                : [];
              return {
                badge: text(card.querySelector('.inline-flex, .px-2.py-1, .rounded-full')),
                opponent: text(card.querySelector('h4, h5, h6')),
                competition: text(card.querySelector('p.text-xs, p.text-sm')),
                dateText: footerSpans[0] || null,
                tag: footerSpans[1] || null,
              };
            },
          );
          return {
            team: text(column.querySelector('h3')),
            role: text(column.querySelector('p.text-xs, p.text-sm')),
            matches,
          };
        });
      };

      const upcomingMatches = extractUpcomingMatches();
      let recentForm = extractFormColumns();
      let headToHead = extractHeadToHead();

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const ensureStatsTabData = async () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find((btn) => /H2H|Form/i.test((btn.textContent || '').trim()));
        if (!target) {
          return;
        }
        target.click();
        for (let attempt = 0; attempt < 15; attempt += 1) {
          const hasSections = Array.from(document.querySelectorAll('h3, h4')).some((node) =>
            /Form|Karşılaşma|Head|Encuentro|Partido/i.test((node.textContent || '').trim()),
          );
          if (hasSections) {
            recentForm = extractFormColumns() || recentForm;
            headToHead = extractHeadToHead() || headToHead;
            return;
          }
          await delay(200);
        }
      };

      if (!recentForm || !headToHead) {
        await ensureStatsTabData();
      }

      const footerMeta = text(
        document.querySelector('.text-center.text-gray-600.text-xs.py-4'),
      );
      let lastUpdated = null;
      if (footerMeta) {
        const match =
          footerMeta.match(/G[üu]ncelleme\s*:\s*([0-9.: ]+)/i) ||
          footerMeta.match(/Update\s*:\s*([0-9.: ]+)/i) ||
          footerMeta.match(/Actualizaci[oó]n\s*:\s*([0-9.: ]+)/i);
        if (match) {
          lastUpdated = match[1]?.trim() || null;
        }
      }

      return {
        scoreboard,
        highlightPredictions,
        detailPredictions,
        oddsTrends,
        upcomingMatches,
        recentForm,
        headToHead,
        structuredData: {
          sportsEvent,
          faqPage,
          article,
          breadcrumbs,
          raw: structuredDataList,
        },
        lastUpdatedAt: lastUpdated,
      };
    }, headingConfig);

    if (!detail.scoreboard) {
      throw new Error('Scoreboard could not be extracted. Page structure might have changed or page is invalid.');
    }

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
