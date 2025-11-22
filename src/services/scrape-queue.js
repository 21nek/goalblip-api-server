import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';
import { saveMatchDetail } from './match-storage.js';
import { DEFAULT_TIMEZONE } from '../config/timezones.js';
import { toUtcFromLocal } from '../utils/datetime.js';
import { normalizeLocale } from '../config/locales.js';

const DEFAULT_CONCURRENCY = Number(
  process.env.MATCH_DETAIL_SCRAPE_CONCURRENCY ?? process.env.SCRAPE_CONCURRENCY ?? 1,
);
const DEFAULT_DELAY_MS = Number(process.env.SCRAPE_JOB_DELAY_MS ?? 4000);

class TaskQueue {
  constructor({ concurrency = DEFAULT_CONCURRENCY, delayMs = DEFAULT_DELAY_MS, logger = console } = {}) {
    this.concurrency = Math.max(1, Number(concurrency) || 1);
    this.delayMs = Math.max(0, Number(delayMs) || 0);
    this.logger = logger;
    this.activeCount = 0;
    this.queue = [];
    this.jobCounter = 0;
    this.pendingKeys = new Map();
  }

  enqueue(taskFn, metadata = {}) {
    const dedupeKey = metadata.dedupeKey;
    if (dedupeKey && this.pendingKeys.has(dedupeKey)) {
      const existing = this.pendingKeys.get(dedupeKey);
      const queuePosition =
        existing.status === 'active' ? 1 : this.#calculateQueuePosition(existing.taskId);
      this.logger?.debug?.(
        `[scrape-queue] dedupe hit for ${metadata.label ?? dedupeKey} (status: ${existing.status})`,
      );
      return {
        taskId: existing.taskId,
        queuePosition,
        alreadyQueued: true,
        status: existing.status,
      };
    }

    const task = {
      id: metadata.id ?? `job-${Date.now()}-${++this.jobCounter}`,
      enqueuedAt: Date.now(),
      fn: taskFn,
      metadata,
    };
    this.queue.push(task);
    const queuePosition = this.activeCount + this.queue.length;
    if (dedupeKey) {
      this.pendingKeys.set(dedupeKey, {
        taskId: task.id,
        status: 'queued',
        enqueuedAt: task.enqueuedAt,
      });
    }
    this.logger?.debug?.(
      `[scrape-queue] enqueued ${task.metadata.label ?? task.id} (position ${queuePosition})`,
    );
    this.#process();
    return { taskId: task.id, queuePosition, alreadyQueued: false, status: 'queued' };
  }

  snapshot() {
    return {
      concurrency: this.concurrency,
      active: this.activeCount,
      queued: this.queue.length,
      nextJobs: this.queue.slice(0, 5).map((task) => ({
        id: task.id,
        enqueuedAt: task.enqueuedAt,
        label: task.metadata.label ?? null,
        locale: task.metadata.locale ?? null,
        view: task.metadata.view ?? null,
        date: task.metadata.date ?? null,
        status: task.metadata.dedupeKey
          ? this.pendingKeys.get(task.metadata.dedupeKey)?.status ?? 'queued'
          : 'queued',
        matchId: task.metadata.matchId ?? null,
      })),
    };
  }

  #process() {
    if (this.activeCount >= this.concurrency) {
      return;
    }
    const task = this.queue.shift();
    if (!task) {
      return;
    }
    const dedupeKey = task.metadata?.dedupeKey;
    if (dedupeKey && this.pendingKeys.has(dedupeKey)) {
      this.pendingKeys.get(dedupeKey).status = 'active';
    }
    this.activeCount += 1;
    const label = task.metadata.label ?? task.id;
    const metaInfo = buildMetadataSummary(task.metadata);
    this.logger?.info?.(
      `[scrape-queue] starting ${label}${metaInfo} (active: ${this.activeCount}/${this.concurrency})`,
    );
    Promise.resolve()
      .then(() => task.fn())
      .catch((error) => {
        this.logger?.error?.(`[scrape-queue] job failed ${label}:`, error);
      })
      .finally(() => {
        this.activeCount -= 1;
        if (dedupeKey) {
          this.pendingKeys.delete(dedupeKey);
        }
        this.logger?.info?.(
          `[scrape-queue] finished ${label}${metaInfo} (active: ${this.activeCount}/${this.concurrency})`,
        );
        if (this.delayMs > 0) {
          setTimeout(() => this.#process(), this.delayMs);
        } else {
          this.#process();
        }
      });
  }

  #calculateQueuePosition(taskId) {
    const index = this.queue.findIndex((task) => task.id === taskId);
    if (index === -1) {
      return Math.max(1, this.activeCount || 1);
    }
    return this.activeCount + index + 1;
  }
}

const matchDetailQueue = new TaskQueue();

export function enqueueMatchDetailScrape(params) {
  const normalizedLocale = normalizeLocale(params.locale || 'tr');
  const { matchId } = params;
  const labelDate = params.dataDate ?? 'unknown';
  const viewLabel = params.viewContext ?? params.view ?? 'manual';
  const dedupeKey = ['match', matchId, labelDate, normalizedLocale, viewLabel]
    .map((part) => String(part ?? '').trim().toLowerCase())
    .join('::');
  const metadata = {
    label: `match:${matchId}@${labelDate} [${normalizedLocale}/${viewLabel}]`,
    locale: normalizedLocale,
    view: viewLabel,
    date: labelDate,
    dedupeKey,
    matchId: String(matchId),
  };
  const { taskId, queuePosition, alreadyQueued, status } = matchDetailQueue.enqueue(async () => {
    const scraped = await scrapeMatchDetail({ ...params, locale: normalizedLocale });
    const resolvedDate = params.dataDate ?? scraped.dataDate ?? currentIsoDate();
    const viewContext = params.viewContext ?? params.view ?? scraped.viewContext ?? 'manual';
    const enrichedDetail = {
      ...scraped,
      dataDate: resolvedDate,
      viewContext,
      sourceListScrapedAt: scraped.sourceListScrapedAt ?? params.sourceListScrapedAt ?? null,
    };

    if (enrichedDetail.scoreboard && resolvedDate) {
      const kickoffText = enrichedDetail.scoreboard.kickoff || '';
      const match = typeof kickoffText === 'string' ? kickoffText.match(/(\d{1,2}:\d{2})/) : null;
      const kickoffTime = match ? match[1] : null;
      const kickoffIsoUtc =
        kickoffTime && resolvedDate
          ? toUtcFromLocal(resolvedDate, kickoffTime, DEFAULT_TIMEZONE)
          : null;
      enrichedDetail.scoreboard = {
        ...enrichedDetail.scoreboard,
        kickoffTimezone: enrichedDetail.scoreboard.kickoffTimezone || `(${DEFAULT_TIMEZONE})`,
        kickoffIsoUtc: kickoffIsoUtc ?? enrichedDetail.scoreboard.kickoffIsoUtc ?? null,
      };
    }

    await saveMatchDetail(enrichedDetail);
  }, metadata);

  return { taskId, queuePosition, alreadyQueued, status };
}

export function getMatchDetailQueueSnapshot() {
  return matchDetailQueue.snapshot();
}

function currentIsoDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function buildMetadataSummary(metadata = {}) {
  const parts = [];
  if (metadata.locale) {
    parts.push(`locale=${metadata.locale}`);
  }
  if (metadata.view) {
    parts.push(`view=${metadata.view}`);
  }
  if (metadata.date) {
    parts.push(`date=${metadata.date}`);
  }
  return parts.length ? ` (${parts.join(', ')})` : '';
}
