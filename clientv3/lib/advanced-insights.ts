import type { MatchDetail } from '@/types/match';

type FormMatch = {
  result?: string | null;
  score?: string | null;
};

const MAX_RECENT_MATCHES = 5;
const WEIGHT_SEQUENCE = [1, 0.85, 0.7, 0.55, 0.4];
const MOMENTUM_WEIGHTS = [1, 0.9, 0.75, 0.6, 0.45];

type ParsedScore = { goalsFor: number; goalsAgainst: number };

function parseScore(score?: string | null): ParsedScore | null {
  if (!score) return null;
  const match = score.match(/(-?\d+)\D+(-?\d+)/);
  if (!match) return null;
  const goalsFor = Number(match[1]);
  const goalsAgainst = Number(match[2]);
  if (Number.isNaN(goalsFor) || Number.isNaN(goalsAgainst)) {
    return null;
  }
  return { goalsFor, goalsAgainst };
}

function normalizeResult(result?: string | null) {
  if (!result) return null;
  const trimmed = result.trim().toUpperCase();
  if (trimmed.startsWith('W')) return 'W';
  if (trimmed.startsWith('D')) return 'D';
  if (trimmed.startsWith('L')) return 'L';
  return null;
}

function takeRecentMatches(detail: MatchDetail, index: number): FormMatch[] {
  const block = detail.recentForm?.[index];
  if (!block || !Array.isArray(block.matches)) {
    return [];
  }
  return block.matches.slice(0, MAX_RECENT_MATCHES);
}

export type WeightedScoreResult = ReturnType<typeof computeWeightedScore>;
export type MomentumResult = ReturnType<typeof computeMomentum>;
export type ConfidenceBlendResult = ReturnType<typeof computeConfidenceBlend>;
export type PoissonResult = ReturnType<typeof computePoissonEstimates>;

export type AdvancedMetrics = {
  weightedScore: WeightedScoreResult | null;
  momentum: MomentumResult | null;
  confidenceBlend: ConfidenceBlendResult;
  poisson: PoissonResult;
  goalTrends: ReturnType<typeof computeGoalTrends> | null;
  confidenceLadder: ReturnType<typeof buildConfidenceLadder>;
  overUnderLadder: ReturnType<typeof buildOverUnderLadder>;
  handicapInsight: ReturnType<typeof deriveHandicapInsight>;
  halfComparison: ReturnType<typeof compareHalfFullTime>;
};

export type InsightSentence = {
  tone: 'positive' | 'warning' | 'info';
  translationKey: string;
  params?: Record<string, string | number>;
};

export function computeWeightedScore(detail: MatchDetail) {
  const homeMatches = takeRecentMatches(detail, 0);
  const awayMatches = takeRecentMatches(detail, 1);

  const computeScore = (matches: FormMatch[]) => {
    let totalWeight = 0;
    let weightedPoints = 0;

    matches.forEach((match, index) => {
      if (index >= WEIGHT_SEQUENCE.length) return;
      const normalizedResult = normalizeResult(match.result);
      if (!normalizedResult) return;
      const weight = WEIGHT_SEQUENCE[index];
      totalWeight += weight;
      const points = normalizedResult === 'W' ? 3 : normalizedResult === 'D' ? 1 : 0;
      weightedPoints += points * weight;
    });

    if (!totalWeight) return null;
    const normalizedScore = (weightedPoints / (3 * totalWeight)) * 100;
    return Math.max(0, Math.min(100, Number(normalizedScore.toFixed(1))));
  };

  return {
    home: computeScore(homeMatches),
    away: computeScore(awayMatches),
    sampleSize: Math.max(homeMatches.length, awayMatches.length),
  };
}

export function computeMomentum(detail: MatchDetail) {
  const homeMatches = takeRecentMatches(detail, 0);
  const awayMatches = takeRecentMatches(detail, 1);

  const compute = (matches: FormMatch[]) => {
    let totalWeight = 0;
    let weightedMomentum = 0;

    matches.forEach((match, index) => {
      if (index >= MOMENTUM_WEIGHTS.length) return;
      const parsed = parseScore(match.score);
      if (!parsed) return;
      const weight = MOMENTUM_WEIGHTS[index];
      const clampedDiff = Math.max(-3, Math.min(3, parsed.goalsFor - parsed.goalsAgainst));
      weightedMomentum += clampedDiff * weight;
      totalWeight += weight;
    });

    if (!totalWeight) return null;
    const normalized = (weightedMomentum / (3 * totalWeight)) * 100;
    return Math.max(-100, Math.min(100, Number(normalized.toFixed(1))));
  };

  return {
    home: compute(homeMatches),
    away: compute(awayMatches),
  };
}

export function computeConfidenceBlend(detail: MatchDetail) {
  const highlight = detail.highlightPredictions?.filter(
    (prediction) =>
      !prediction.locked &&
      typeof prediction.successRate === 'number' &&
      prediction.successRate !== null,
  );

  const detailConfidence = detail.detailPredictions?.filter(
    (prediction) => typeof prediction.confidence === 'number',
  );

  const entries: Array<{ label: string; score: number }> = [];

  highlight?.forEach((prediction) => {
    const ratingRatio =
      prediction.rating && prediction.ratingMax
        ? prediction.rating / prediction.ratingMax
        : 0.8;
    const combined =
      (prediction.successRate ?? 0) * 0.6 + (ratingRatio * 100) * 0.4;
    entries.push({
      label: prediction.title || '',
      score: combined,
    });
  });

  detailConfidence?.forEach((prediction) => {
    entries.push({
      label: prediction.title || '',
      score: prediction.confidence ?? 0,
    });
  });

  if (!entries.length) {
    return null;
  }

  const aggregate =
    entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length;
  const best = entries.reduce((max, entry) => (entry.score > max.score ? entry : max), entries[0]);

  return {
    score: Math.max(0, Math.min(100, Number(aggregate.toFixed(1)))),
    topPick: best,
  };
}

type TeamStats = {
  avgGoalsFor: number;
  avgGoalsAgainst: number;
};

function computeTeamStats(matches: FormMatch[]): TeamStats | null {
  let goalsFor = 0;
  let goalsAgainst = 0;
  let count = 0;
  matches.forEach((match) => {
    const parsed = parseScore(match.score);
    if (!parsed) return;
    goalsFor += parsed.goalsFor;
    goalsAgainst += parsed.goalsAgainst;
    count += 1;
  });
  if (!count) return null;
  return {
    avgGoalsFor: goalsFor / count,
    avgGoalsAgainst: goalsAgainst / count,
  };
}

function calculatePoissonProbabilities(lambda: number) {
  const probabilities: Array<{ bucket: string; value: number }> = [];
  const maxK = 3;

  const eToMinusLambda = Math.exp(-lambda);
  let cumulative = 0;

  for (let k = 0; k <= maxK; k += 1) {
    const value = (Math.pow(lambda, k) / factorial(k)) * eToMinusLambda;
    const bucket = k < maxK ? String(k) : '3+';
    probabilities.push({ bucket, value });
    cumulative += value;
  }

  const lastIndex = probabilities.length - 1;
  probabilities[lastIndex].value = Math.max(
    0,
    1 - cumulative + probabilities[lastIndex].value,
  );

  return probabilities.map((row) => ({
    bucket: row.bucket,
    percent: Number((row.value * 100).toFixed(1)),
  }));
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i += 1) {
    result *= i;
  }
  return result;
}

export function computePoissonEstimates(detail: MatchDetail) {
  const homeMatches = takeRecentMatches(detail, 0);
  const awayMatches = takeRecentMatches(detail, 1);

  const homeStats = computeTeamStats(homeMatches);
  const awayStats = computeTeamStats(awayMatches);

  if (!homeStats || !awayStats) {
    return null;
  }

  const lambdaHome = Math.max(
    0.2,
    Number(((homeStats.avgGoalsFor + awayStats.avgGoalsAgainst) / 2).toFixed(2)),
  );
  const lambdaAway = Math.max(
    0.2,
    Number(((awayStats.avgGoalsFor + homeStats.avgGoalsAgainst) / 2).toFixed(2)),
  );

  return {
    home: {
      lambda: lambdaHome,
      probabilities: calculatePoissonProbabilities(lambdaHome),
    },
    away: {
      lambda: lambdaAway,
      probabilities: calculatePoissonProbabilities(lambdaAway),
    },
  };
}

export function buildAdvancedMetrics(detail: MatchDetail): AdvancedMetrics | null {
  if (!detail) return null;
  return {
    weightedScore: computeWeightedScore(detail),
    momentum: computeMomentum(detail),
    confidenceBlend: computeConfidenceBlend(detail),
    poisson: computePoissonEstimates(detail),
    goalTrends: computeGoalTrends(detail),
    confidenceLadder: buildConfidenceLadder(detail),
    overUnderLadder: buildOverUnderLadder(detail),
    handicapInsight: deriveHandicapInsight(detail),
    halfComparison: compareHalfFullTime(detail),
  };
}

export function generateInsightSentences(
  detail: MatchDetail,
  metrics?: AdvancedMetrics | null,
): InsightSentence[] {
  if (!detail) return [];
  const data = metrics ?? buildAdvancedMetrics(detail);
  if (!data) return [];

  const sentences: InsightSentence[] = [];
  const homeName = detail.scoreboard?.homeTeam?.name || 'Home';
  const awayName = detail.scoreboard?.awayTeam?.name || 'Away';

  const weighted = data.weightedScore;
  if (weighted?.home !== null && weighted?.away !== null) {
    const diff = weighted.home - weighted.away;
    if (Math.abs(diff) >= 20) {
      sentences.push({
        tone: diff > 0 ? 'positive' : 'warning',
        translationKey:
          diff > 0
            ? 'matchDetail.insightSentences.weighted.homeAdvantage'
            : 'matchDetail.insightSentences.weighted.awayAdvantage',
        params: {
          homeTeam: homeName,
          awayTeam: awayName,
          value: Math.abs(Number(diff.toFixed(1))),
        },
      });
    }
  }

  const momentum = data.momentum;
  if (momentum?.home !== null && momentum?.home > 30) {
    sentences.push({
      tone: 'positive',
      translationKey: 'matchDetail.insightSentences.momentum.homeBullish',
      params: { team: homeName, value: Number(momentum.home.toFixed(1)) },
    });
  } else if (momentum?.home !== null && momentum.home < -30) {
    sentences.push({
      tone: 'warning',
      translationKey: 'matchDetail.insightSentences.momentum.homeBearish',
      params: { team: homeName, value: Number(momentum.home.toFixed(1)) },
    });
  }

  if (momentum?.away !== null && momentum.away > 30) {
    sentences.push({
      tone: 'positive',
      translationKey: 'matchDetail.insightSentences.momentum.awayBullish',
      params: { team: awayName, value: Number(momentum.away.toFixed(1)) },
    });
  } else if (momentum?.away !== null && momentum.away < -30) {
    sentences.push({
      tone: 'warning',
      translationKey: 'matchDetail.insightSentences.momentum.awayBearish',
      params: { team: awayName, value: Number(momentum.away.toFixed(1)) },
    });
  }

  const confidence = data.confidenceBlend;
  if (confidence?.score) {
    if (confidence.score >= 75) {
      sentences.push({
        tone: 'positive',
        translationKey: 'matchDetail.insightSentences.confidence.high',
        params: { score: confidence.score },
      });
    } else if (confidence.score <= 40) {
      sentences.push({
        tone: 'warning',
        translationKey: 'matchDetail.insightSentences.confidence.low',
        params: { score: confidence.score },
      });
    }

    if (confidence.topPick?.label) {
      sentences.push({
        tone: 'info',
        translationKey: 'matchDetail.insightSentences.confidence.topPick',
        params: {
          pick: confidence.topPick.label,
          score: Number((confidence.topPick.score ?? 0).toFixed(1)),
        },
      });
    }
  }

  const poisson = data.poisson;
  if (poisson) {
    const expectedTotal = Number(
      (poisson.home.lambda + poisson.away.lambda).toFixed(2),
    );
    if (expectedTotal >= 3) {
      sentences.push({
        tone: 'positive',
        translationKey: 'matchDetail.insightSentences.poisson.highScoring',
        params: { goals: expectedTotal },
      });
    } else if (expectedTotal <= 2) {
      sentences.push({
        tone: 'info',
        translationKey: 'matchDetail.insightSentences.poisson.lowScoring',
        params: { goals: expectedTotal },
      });
    }

    const homeCleanSheetProb = poisson.away.probabilities.find((p) => p.bucket === '0')?.percent ?? 0;
    if (homeCleanSheetProb >= 60) {
      sentences.push({
        tone: 'positive',
        translationKey: 'matchDetail.insightSentences.poisson.homeCleanSheet',
        params: { team: homeName, percent: homeCleanSheetProb },
      });
    }
    const awayCleanSheetProb = poisson.home.probabilities.find((p) => p.bucket === '0')?.percent ?? 0;
    if (awayCleanSheetProb >= 60) {
      sentences.push({
        tone: 'positive',
        translationKey: 'matchDetail.insightSentences.poisson.awayCleanSheet',
        params: { team: awayName, percent: awayCleanSheetProb },
      });
    }
  }

  const weightedSample = weighted?.sampleSize ?? 0;
  if (weightedSample && weightedSample < 3) {
    sentences.push({
      tone: 'info',
      translationKey: 'matchDetail.insightSentences.sampleSmall',
      params: { matches: weightedSample },
    });
  }

  return sentences.slice(0, 6);
}

export function computeGoalTrends(detail: MatchDetail) {
  const homeMatches = takeRecentMatches(detail, 0);
  const awayMatches = takeRecentMatches(detail, 1);

  const aggregate = (matches: FormMatch[]) => {
    let goalsFor = 0;
    let goalsAgainst = 0;
    let count = 0;
    matches.forEach((match) => {
      const parsed = parseScore(match.score);
      if (!parsed) return;
      goalsFor += parsed.goalsFor;
      goalsAgainst += parsed.goalsAgainst;
      count += 1;
    });
    if (!count) return null;
    return {
      count,
      goalsFor,
      goalsAgainst,
      delta: goalsFor - goalsAgainst,
    };
  };

  return {
    home: aggregate(homeMatches),
    away: aggregate(awayMatches),
  };
}

export function buildConfidenceLadder(detail: MatchDetail) {
  const predictions = detail.detailPredictions ?? [];
  const entries = predictions
    .filter((item) => typeof item.confidence === 'number' && item.confidence !== null)
    .map((item) => ({
      title: item.title || '',
      confidence: Number((item.confidence ?? 0).toFixed(1)),
    }))
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

  return entries.slice(0, 6);
}

export function buildOverUnderLadder(detail: MatchDetail) {
  const targetTitles = [
    'over',
    'under',
    'üst',
    'alt',
  ];
  const nodes = detail.detailPredictions ?? [];
  const ladders: Array<{ label: string; percent: number; isOver: boolean }> = [];

  nodes.forEach((prediction) => {
    const title = (prediction.title || '').toLowerCase();
    if (!targetTitles.some((token) => title.includes(token))) return;
    const outcome = prediction.outcomes?.[0];
    if (!outcome?.label || typeof outcome.valuePercent !== 'number') return;
    ladders.push({
      label: outcome.label,
      percent: Number(outcome.valuePercent.toFixed(1)),
      isOver: /üst|over/i.test(outcome.label),
    });
  });

  return ladders.sort((a, b) => b.percent - a.percent).slice(0, 5);
}

export function deriveHandicapInsight(detail: MatchDetail) {
  const card = detail.oddsTrends?.find((item) => {
    const title = item.title?.toLowerCase() || '';
    return title.includes('asya') || title.includes('handicap') || title.includes('handikap');
  });
  if (!card?.cards) return null;
  const matchRow = card.cards
    .flatMap((subcard) => subcard.rows || [])
    .find((row) => /maç öncesi/i.test(row.label || '') || /closing/i.test(row.label || ''));
  if (!matchRow?.values?.length) return null;
  const value = matchRow.values[0];
  return {
    label: card.title || 'Asian Handicap',
    value,
  };
}

export function compareHalfFullTime(detail: MatchDetail) {
  const predictions = detail.detailPredictions ?? [];
  const firstHalf = predictions.find((p) =>
    (p.title || '').toLowerCase().includes('ilk') ||
    (p.title || '').toLowerCase().includes('first half'),
  );
  const matchResult = predictions.find((p) =>
    (p.title || '').toLowerCase().includes('maç sonuç') ||
    (p.title || '').toLowerCase().includes('match result'),
  );
  if (!firstHalf?.outcomes || !matchResult?.outcomes) {
    return null;
  }
  const parseOutcome = (outcomes: { label?: string | null; valuePercent?: number | null }[]) => {
    return outcomes
      .filter((item) => item.label && typeof item.valuePercent === 'number')
      .map((item) => ({
        label: item.label || '',
        percent: Number((item.valuePercent ?? 0).toFixed(1)),
      }))
      .sort((a, b) => b.percent - a.percent);
  };

  return {
    firstHalf: parseOutcome(firstHalf.outcomes),
    fullTime: parseOutcome(matchResult.outcomes),
  };
}
