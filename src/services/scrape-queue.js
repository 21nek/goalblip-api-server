import { scrapeMatchDetail } from '../scrapers/golsinyali/match-detail.js';
import { saveMatchDetail } from './match-storage.js';

const DEFAULT_CONCURRENCY = Number(
  process.env.MATCH_DETAIL_SCRAPE_CONCURRENCY ?? process.env.SCRAPE_CONCURRENCY ?? 2,
);

class TaskQueue {
  constructor({ concurrency = DEFAULT_CONCURRENCY, logger = console } = {}) {
    this.concurrency = Math.max(1, Number(concurrency) || 1);
    this.logger = logger;
    this.activeCount = 0;
    this.queue = [];
    this.jobCounter = 0;
  }

  enqueue(taskFn, metadata = {}) {
    const task = {
      id: metadata.id ?? `job-${Date.now()}-${++this.jobCounter}`,
      enqueuedAt: Date.now(),
      fn: taskFn,
      metadata,
    };
    this.queue.push(task);
    const queuePosition = this.activeCount + this.queue.length;
    this.logger?.debug?.(
      `[scrape-queue] enqueued ${task.metadata.label ?? task.id} (position ${queuePosition})`,
    );
    this.#process();
    return { taskId: task.id, queuePosition };
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
    this.activeCount += 1;
    const label = task.metadata.label ?? task.id;
    this.logger?.info?.(
      `[scrape-queue] starting ${label} (active: ${this.activeCount}/${this.concurrency})`,
    );
    Promise.resolve()
      .then(() => task.fn())
      .catch((error) => {
        this.logger?.error?.(`[scrape-queue] job failed ${label}:`, error);
      })
      .finally(() => {
        this.activeCount -= 1;
        this.logger?.info?.(
          `[scrape-queue] finished ${label} (active: ${this.activeCount}/${this.concurrency})`,
        );
        this.#process();
      });
  }
}

const matchDetailQueue = new TaskQueue();

export function enqueueMatchDetailScrape(params) {
  const { matchId } = params;
  const labelDate = params.dataDate ?? 'unknown';
  const metadata = {
    label: `match:${matchId}@${labelDate}`,
  };
  const { taskId, queuePosition } = matchDetailQueue.enqueue(async () => {
    const scraped = await scrapeMatchDetail(params);
    const resolvedDate = params.dataDate ?? scraped.dataDate ?? currentIsoDate();
    const viewContext = params.viewContext ?? params.view ?? scraped.viewContext ?? 'manual';
    const enrichedDetail = {
      ...scraped,
      dataDate: resolvedDate,
      viewContext,
      sourceListScrapedAt: scraped.sourceListScrapedAt ?? params.sourceListScrapedAt ?? null,
    };
    await saveMatchDetail(enrichedDetail);
  }, metadata);

  return { taskId, queuePosition };
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
