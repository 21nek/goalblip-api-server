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

    const detail = await page.evaluate(async () => {
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
        return Array.from(document.querySelectorAll('h1, h2, h3')).find((node) =>
          text(node).toLowerCase().includes(lower),
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

      const scoreboardGrid = document.querySelector('main .grid.grid-cols-3.items-center');
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
            /(karşılıklı maçlar|head to head)/i.test(text(node)),
          ) ||
          Array.from(document.querySelectorAll('h3, h4')).find((node) =>
            /(son \d+ karşılaşma|karşılaşma özeti)/i.test(text(node)),
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
        const heading = findHeading('Gelecek MaÃ§lar');
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
            /Form|Karşılaşma|Head/i.test((node.textContent || '').trim()),
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
        const match = footerMeta.match(/G[üu]ncelleme\s*:\s*([0-9.: ]+)/i);
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
