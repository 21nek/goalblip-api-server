/**
 * Match analysis utilities - Calculates insights from match data
 */

type FormMatch = {
  result?: string | null;
  opponent?: string | null;
  score?: string | null;
};

type FormData = {
  title?: string | null;
  matches?: FormMatch[];
};

type HeadToHeadMatch = {
  date?: string | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  score?: string | null;
};

export type FormStats = {
  winRate: number;
  drawRate: number;
  lossRate: number;
  avgGoalsFor: number;
  avgGoalsAgainst: number;
  goalDifference: number;
  formScore: number; // 0-100, higher is better
  currentStreak: 'win' | 'draw' | 'loss' | 'none';
  streakCount: number;
};

export type TeamComparison = {
  homeTeam: {
    name: string;
    stats: FormStats;
  };
  awayTeam: {
    name: string;
    stats: FormStats;
  };
  homeAdvantage: number; // -100 to 100
  prediction: 'home' | 'draw' | 'away' | 'balanced';
  confidence: number;
};

export type KeyInsight = {
  type: 'positive' | 'warning' | 'info';
  message: string;
  priority: 'high' | 'medium' | 'low';
};

/**
 * Parse score string (e.g., "2-1") to goals
 */
function parseScore(score: string | null | undefined): { for: number; against: number } | null {
  if (!score) return null;
  const parts = score.split('-');
  if (parts.length !== 2) return null;
  const forGoals = parseInt(parts[0].trim(), 10);
  const againstGoals = parseInt(parts[1].trim(), 10);
  if (isNaN(forGoals) || isNaN(againstGoals)) return null;
  return { for: forGoals, against: againstGoals };
}

/**
 * Calculate form statistics from recent matches
 */
export function calculateFormStats(matches: FormMatch[]): FormStats {
  if (!matches || matches.length === 0) {
    return {
      winRate: 0,
      drawRate: 0,
      lossRate: 0,
      avgGoalsFor: 0,
      avgGoalsAgainst: 0,
      goalDifference: 0,
      formScore: 0,
      currentStreak: 'none',
      streakCount: 0,
    };
  }

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let totalGoalsFor = 0;
  let totalGoalsAgainst = 0;
  let validScores = 0;

  matches.forEach((match) => {
    if (match.result === 'W') wins++;
    else if (match.result === 'D') draws++;
    else if (match.result === 'L') losses++;

    const score = parseScore(match.score);
    if (score) {
      totalGoalsFor += score.for;
      totalGoalsAgainst += score.against;
      validScores++;
    }
  });

  const total = matches.length;
  const winRate = (wins / total) * 100;
  const drawRate = (draws / total) * 100;
  const lossRate = (losses / total) * 100;

  const avgGoalsFor = validScores > 0 ? totalGoalsFor / validScores : 0;
  const avgGoalsAgainst = validScores > 0 ? totalGoalsAgainst / validScores : 0;
  const goalDifference = avgGoalsFor - avgGoalsAgainst;

  // Form score: weighted average (recent matches more important)
  // Win = 3, Draw = 1, Loss = 0
  let weightedScore = 0;
  matches.forEach((match, index) => {
    const weight = (matches.length - index) / matches.length; // More recent = higher weight
    if (match.result === 'W') weightedScore += 3 * weight;
    else if (match.result === 'D') weightedScore += 1 * weight;
  });
  const maxPossibleScore = matches.reduce((sum, _, index) => sum + 3 * ((matches.length - index) / matches.length), 0);
  const formScore = maxPossibleScore > 0 ? (weightedScore / maxPossibleScore) * 100 : 0;

  // Calculate current streak
  let currentStreak: 'win' | 'draw' | 'loss' | 'none' = 'none';
  let streakCount = 0;
  if (matches.length > 0) {
    const firstResult = matches[0].result;
    if (firstResult) {
      currentStreak = firstResult === 'W' ? 'win' : firstResult === 'D' ? 'draw' : 'loss';
      streakCount = 1;
      for (let i = 1; i < matches.length; i++) {
        if (matches[i].result === firstResult) {
          streakCount++;
        } else {
          break;
        }
      }
    }
  }

  return {
    winRate,
    drawRate,
    lossRate,
    avgGoalsFor,
    avgGoalsAgainst,
    goalDifference,
    formScore,
    currentStreak,
    streakCount,
  };
}

/**
 * Compare two teams based on form
 */
export function compareTeams(
  homeForm: FormData | null,
  awayForm: FormData | null,
  homeTeamName: string | null | undefined,
  awayTeamName: string | null | undefined
): TeamComparison | null {
  if (!homeForm?.matches || !awayForm?.matches) return null;

  const homeStats = calculateFormStats(homeForm.matches);
  const awayStats = calculateFormStats(awayForm.matches);

  // Home advantage calculation
  // Positive = home advantage, Negative = away advantage
  const formDiff = homeStats.formScore - awayStats.formScore;
  const goalDiff = homeStats.goalDifference - awayStats.goalDifference;
  const homeAdvantage = (formDiff * 0.6 + goalDiff * 10 * 0.4); // Weighted

  // Prediction based on stats
  let prediction: 'home' | 'draw' | 'away' | 'balanced' = 'balanced';
  let confidence = 0;

  if (homeAdvantage > 15) {
    prediction = 'home';
    confidence = Math.min(90, 50 + homeAdvantage / 2);
  } else if (homeAdvantage < -15) {
    prediction = 'away';
    confidence = Math.min(90, 50 + Math.abs(homeAdvantage) / 2);
  } else {
    prediction = 'balanced';
    confidence = 50;
  }

  return {
    homeTeam: {
      name: homeTeamName || 'Ev Sahibi',
      stats: homeStats,
    },
    awayTeam: {
      name: awayTeamName || 'Deplasman',
      stats: awayStats,
    },
    homeAdvantage,
    prediction,
    confidence,
  };
}

/**
 * Extract key insights from match data
 */
export function extractKeyInsights(
  recentForm: FormData[] | null | undefined,
  headToHead: HeadToHeadMatch[] | null | undefined,
  detailPredictions: Array<{ confidence?: number | null; title?: string | null }> | null | undefined,
  homeTeamName: string | null | undefined,
  awayTeamName: string | null | undefined
): KeyInsight[] {
  const insights: KeyInsight[] = [];

  if (!recentForm || recentForm.length < 2) return insights;

  const homeForm = recentForm[0];
  const awayForm = recentForm[1];

  if (homeForm?.matches && awayForm?.matches) {
    const homeStats = calculateFormStats(homeForm.matches);
    const awayStats = calculateFormStats(awayForm.matches);

    // Home team insights
    if (homeStats.winRate >= 80) {
      insights.push({
        type: 'positive',
        message: `${homeTeamName || 'Ev sahibi takım'} son 5 maçta %${homeStats.winRate.toFixed(0)} galibiyet oranıyla çok iyi formda.`,
        priority: 'high',
      });
    } else if (homeStats.lossRate >= 60) {
      insights.push({
        type: 'warning',
        message: `${homeTeamName || 'Ev sahibi takım'} son 5 maçta %${homeStats.lossRate.toFixed(0)} mağlubiyet oranıyla zorlanıyor.`,
        priority: 'high',
      });
    }

    if (homeStats.avgGoalsFor >= 2) {
      insights.push({
        type: 'positive',
        message: `${homeTeamName || 'Ev sahibi takım'} son maçlarda maç başına ortalama ${homeStats.avgGoalsFor.toFixed(1)} gol atıyor.`,
        priority: 'medium',
      });
    }

    if (homeStats.avgGoalsAgainst <= 0.5) {
      insights.push({
        type: 'positive',
        message: `${homeTeamName || 'Ev sahibi takım'} son maçlarda çok az gol yiyor (maç başına ${homeStats.avgGoalsAgainst.toFixed(1)}).`,
        priority: 'medium',
      });
    }

    // Away team insights
    if (awayStats.winRate >= 80) {
      insights.push({
        type: 'warning',
        message: `${awayTeamName || 'Deplasman takımı'} son 5 maçta %${awayStats.winRate.toFixed(0)} galibiyet oranıyla çok iyi formda.`,
        priority: 'high',
      });
    } else if (awayStats.lossRate >= 60) {
      insights.push({
        type: 'positive',
        message: `${awayTeamName || 'Deplasman takımı'} son 5 maçta %${awayStats.lossRate.toFixed(0)} mağlubiyet oranıyla zorlanıyor.`,
        priority: 'medium',
      });
    }

    // Streak insights
    if (homeStats.currentStreak === 'win' && homeStats.streakCount >= 3) {
      insights.push({
        type: 'positive',
        message: `${homeTeamName || 'Ev sahibi takım'} ${homeStats.streakCount} maçtır kazanıyor.`,
        priority: 'high',
      });
    }

    if (awayStats.currentStreak === 'loss' && awayStats.streakCount >= 3) {
      insights.push({
        type: 'positive',
        message: `${awayTeamName || 'Deplasman takımı'} ${awayStats.streakCount} maçtır kaybediyor.`,
        priority: 'medium',
      });
    }

    // Goal difference insights
    if (homeStats.goalDifference > 1 && awayStats.goalDifference < -0.5) {
      insights.push({
        type: 'positive',
        message: `Gol farkı açısından ${homeTeamName || 'ev sahibi takım'} belirgin avantajlı.`,
        priority: 'medium',
      });
    }
  }

  // Head to head insights
  if (headToHead && headToHead.length > 0) {
    const homeWins = headToHead.filter((match) => {
      const score = parseScore(match.score);
      if (!score) return false;
      return match.homeTeam === homeTeamName && score.for > score.against;
    }).length;

    if (homeWins >= headToHead.length * 0.6) {
      insights.push({
        type: 'info',
        message: `Geçmiş karşılaşmalarda ${homeTeamName || 'ev sahibi takım'} üstünlük kurmuş.`,
        priority: 'medium',
      });
    }
  }

  // Prediction confidence insights - Only show if really high confidence
  if (detailPredictions && detailPredictions.length > 0) {
    const confidences = detailPredictions.map((p) => p.confidence || 0).filter((c) => c > 0);
    if (confidences.length === 0) return insights;
    
    const maxConfidence = Math.max(...confidences);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    
    // Only show if both max and average are very high (not just one outlier)
    if (maxConfidence >= 90 && avgConfidence >= 75) {
      insights.push({
        type: 'info',
        message: `AI tahminleri çok yüksek güven seviyesinde (ortalama %${avgConfidence.toFixed(0)}).`,
        priority: 'high',
      });
    } else if (maxConfidence >= 95) {
      // Only show if one prediction is extremely confident
      const highConfPred = detailPredictions.find((p) => (p.confidence || 0) >= 95);
      if (highConfPred) {
        // Get the top outcome to make it clearer
        const topOutcome = highConfPred.outcomes?.reduce((best, current) => {
          const currentPct = current.valuePercent || 0;
          const bestPct = best.valuePercent || 0;
          return currentPct > bestPct ? current : best;
        }, highConfPred.outcomes?.[0]);
        
        insights.push({
          type: 'info',
          message: `"${highConfPred.title}" tahmininin güven seviyesi çok yüksek (%${maxConfidence.toFixed(0)}). En olası sonuç: ${topOutcome?.label || '—'} (%${topOutcome?.valuePercent?.toFixed(0) || 0}).`,
          priority: 'medium',
        });
      }
    }
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Get quick summary from match data
 */
export function getQuickSummary(
  detailPredictions: Array<{ title?: string | null; confidence?: number | null; outcomes?: Array<{ label?: string | null; valuePercent?: number | null }> }> | null | undefined,
  comparison: TeamComparison | null
): {
  mainPrediction: string;
  confidence: number;
  recommendedPick: string;
  summary: string;
  outcomes?: Array<{ label?: string | null; valuePercent?: number | null }>;
} | null {
  if (!detailPredictions || detailPredictions.length === 0) {
    if (!comparison) return null;
    return {
      mainPrediction: comparison.prediction === 'home' ? 'Ev Sahibi' : comparison.prediction === 'away' ? 'Deplasman' : 'Dengeli',
      confidence: comparison.confidence,
      recommendedPick: comparison.prediction === 'home' ? '1' : comparison.prediction === 'away' ? '2' : 'X',
      summary: comparison.prediction === 'home' 
        ? 'Ev sahibi takım form avantajına sahip'
        : comparison.prediction === 'away'
        ? 'Deplasman takımı form avantajına sahip'
        : 'İki takım da dengeli formda',
    };
  }

  // Find prediction with highest confidence
  const bestPrediction = detailPredictions.reduce((best, current) => {
    const currentConf = current.confidence || 0;
    const bestConf = best.confidence || 0;
    return currentConf > bestConf ? current : best;
  }, detailPredictions[0]);

  if (!bestPrediction) return null;

  // Find outcome with highest percentage
  const bestOutcome = bestPrediction.outcomes?.reduce((best, current) => {
    const currentPct = current.valuePercent || 0;
    const bestPct = best.valuePercent || 0;
    return currentPct > bestPct ? current : best;
  }, bestPrediction.outcomes?.[0]);

  const confidence = bestPrediction.confidence || 0;
  const recommendedPick = bestOutcome?.label || '—';
  const mainPrediction = bestPrediction.title || 'Tahmin';

  let summary = '';
  if (confidence >= 75) {
    summary = 'Yüksek güven seviyesinde tahmin';
  } else if (confidence >= 60) {
    summary = 'Orta-yüksek güven seviyesinde tahmin';
  } else if (confidence >= 50) {
    summary = 'Dengeli tahmin';
  } else {
    summary = 'Düşük güven seviyesinde tahmin';
  }

  if (comparison) {
    if (comparison.homeAdvantage > 10) {
      summary += ' • Ev sahibi avantajı var';
    } else if (comparison.homeAdvantage < -10) {
      summary += ' • Deplasman takımı avantajlı';
    }
  }

  return {
    mainPrediction,
    confidence,
    recommendedPick,
    summary,
    outcomes: bestPrediction.outcomes,
  };
}

