import { Score, Gymnast } from '@/types';

export interface CountingScore {
  gymnastId: string;
  event: string;
  score: number;
}

export interface TeamScoreResult {
  teamScores: Record<string, number>;
  totalScore: number;
  countingScores: CountingScore[];
}

// Men's events in competitive order
export const MENS_EVENTS = ['floor', 'pommelHorse', 'rings', 'vault', 'parallelBars', 'highBar'] as const;
export const WOMENS_EVENTS = ['vault', 'bars', 'beam', 'floor'] as const;

export type MensEvent = typeof MENS_EVENTS[number];
export type WomensEvent = typeof WOMENS_EVENTS[number];

/**
 * Calculate team score from a set of scores for a specific discipline
 * Takes top N scores per event (default 3, or 5 for lower levels at state meets)
 */
export const calculateTeamScore = (
  scores: Score[],
  discipline: 'Womens' | 'Mens',
  gymnasts: Gymnast[],
  topCount: number = 3
): TeamScoreResult => {
  const events = discipline === 'Womens' ? WOMENS_EVENTS : MENS_EVENTS;

  const teamScores: Record<string, number> = {};
  const countingScores: CountingScore[] = [];

  events.forEach(event => {
    // Get all non-null scores for this event
    const eventScores = scores
      .map(s => ({
        gymnastId: s.gymnastId,
        score: s.scores[event]
      }))
      .filter((s): s is { gymnastId: string; score: number } =>
        s.score !== null && s.score !== undefined && s.score > 0
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, topCount); // Top N (or fewer if less than N)

    // Sum for team score and round to avoid floating point errors
    const eventTotal = eventScores.reduce((sum, s) => sum + s.score, 0);
    teamScores[event] = Math.round(eventTotal * 1000) / 1000;

    // Mark as counting
    eventScores.forEach(s => {
      countingScores.push({
        gymnastId: s.gymnastId,
        event,
        score: s.score
      });
    });
  });

  // Calculate total and round to avoid floating point precision errors
  const totalScore = Math.round(
    Object.values(teamScores).reduce((sum, s) => sum + s, 0) * 1000
  ) / 1000;

  return { teamScores, totalScore, countingScores };
};

/**
 * Check if a specific score is counting toward the team score
 */
export const isCountingScore = (
  gymnastId: string,
  event: string,
  countingScores: CountingScore[]
): boolean => {
  return countingScores.some(
    cs => cs.gymnastId === gymnastId && cs.event === event
  );
};

/**
 * Get display name for an event (abbreviated or full)
 */
export const getEventDisplayName = (
  event: string,
  abbreviated: boolean = true
): string => {
  const names: Record<string, { full: string; short: string }> = {
    vault: { full: 'Vault', short: 'V' },
    bars: { full: 'Uneven Bars', short: 'UB' },
    beam: { full: 'Balance Beam', short: 'BB' },
    floor: { full: 'Floor Exercise', short: 'FX' },
    pommelHorse: { full: 'Pommel Horse', short: 'PH' },
    rings: { full: 'Rings', short: 'R' },
    parallelBars: { full: 'Parallel Bars', short: 'PB' },
    highBar: { full: 'High Bar', short: 'HB' },
    allAround: { full: 'All-Around', short: 'AA' }
  };

  const name = names[event];
  return name ? (abbreviated ? name.short : name.full) : event;
};

/**
 * Sort level-discipline combinations for display
 */
export const sortLevelDisciplineCombos = <T extends { level: string; discipline: 'Womens' | 'Mens' }>(
  combos: T[]
): T[] => {
  return combos.sort((a, b) => {
    // First sort by level
    const levelOrder = getLevelOrder(a.level) - getLevelOrder(b.level);
    if (levelOrder !== 0) return levelOrder;

    // Then by discipline (Women's first)
    return a.discipline === 'Womens' ? -1 : 1;
  });
};

/**
 * Get numeric order for a level string
 */
export const getLevelOrder = (level: string): number => {
  if (level.startsWith('Level ')) {
    return parseInt(level.replace('Level ', ''));
  }

  const xcelOrder: Record<string, number> = {
    'Xcel Bronze': 11,
    'Xcel Silver': 12,
    'Xcel Gold': 13,
    'Xcel Platinum': 14,
    'Xcel Diamond': 15,
    'Xcel Sapphire': 16
  };

  if (level in xcelOrder) return xcelOrder[level];
  if (level === 'Elite') return 100;

  return 999; // Unknown levels last
};

/**
 * Format team score for display
 */
export const formatTeamScore = (score: number): string => {
  return score.toFixed(3);
};
