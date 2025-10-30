import {
  calculateTeamScore,
  isCountingScore,
  getEventDisplayName,
  getLevelOrder,
  sortLevelDisciplineCombos,
  formatTeamScore,
  CountingScore,
} from '@/utils/teamScores';
import { Score, Gymnast } from '@/types';

describe('Team Score Utilities', () => {
  const mockGymnasts: Gymnast[] = [
    {
      id: '1',
      userId: 'test',
      name: 'Gymnast 1',
      level: 'Level 5',
      discipline: 'Womens',
      createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
    },
    {
      id: '2',
      userId: 'test',
      name: 'Gymnast 2',
      level: 'Level 5',
      discipline: 'Womens',
      createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
    },
    {
      id: '3',
      userId: 'test',
      name: 'Gymnast 3',
      level: 'Level 5',
      discipline: 'Womens',
      createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
    },
  ];

  describe('calculateTeamScore', () => {
    it('should calculate team score for womens gymnastics', () => {
      const scores: Score[] = [
        {
          id: '1',
          gymnastId: '1',
          userId: 'test',
          meetId: 'meet1',
          scores: { vault: 9.5, bars: 9.2, beam: 9.3, floor: 9.4, allAround: 37.4 },
          placements: {},
          createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
        },
        {
          id: '2',
          gymnastId: '2',
          userId: 'test',
          meetId: 'meet1',
          scores: { vault: 9.6, bars: 9.3, beam: 9.1, floor: 9.5, allAround: 37.5 },
          placements: {},
          createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
        },
        {
          id: '3',
          gymnastId: '3',
          userId: 'test',
          meetId: 'meet1',
          scores: { vault: 9.4, bars: 9.4, beam: 9.2, floor: 9.3, allAround: 37.3 },
          placements: {},
          createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
        },
      ];

      const result = calculateTeamScore(scores, 'Womens', mockGymnasts, 3);

      expect(result.teamScores.vault).toBe(9.6 + 9.5 + 9.4);
      expect(result.teamScores.bars).toBe(9.4 + 9.3 + 9.2);
      expect(result.teamScores.beam).toBe(9.3 + 9.2 + 9.1);
      expect(result.teamScores.floor).toBe(9.5 + 9.4 + 9.3);
      expect(result.totalScore).toBeCloseTo(112.2, 1);
      expect(result.countingScores.length).toBe(12); // 4 events × 3 gymnasts
    });

    it('should handle top 5 counting scores', () => {
      const scores: Score[] = Array.from({ length: 6 }, (_, i) => ({
        id: `${i}`,
        gymnastId: `${i}`,
        userId: 'test',
        meetId: 'meet1',
        scores: { vault: 9.0 + i * 0.1, bars: 0, beam: 0, floor: 0, allAround: 9.0 + i * 0.1 },
        placements: {},
        createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
      }));

      const result = calculateTeamScore(scores, 'Womens', mockGymnasts, 5);

      expect(result.countingScores.filter(cs => cs.event === 'vault').length).toBe(5);
    });

    it('should exclude zero and null scores', () => {
      const scores: Score[] = [
        {
          id: '1',
          gymnastId: '1',
          userId: 'test',
          meetId: 'meet1',
          scores: { vault: 9.5, bars: 0, beam: 0, floor: 9.4, allAround: 18.9 },
          placements: {},
          createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
        },
      ];

      const result = calculateTeamScore(scores, 'Womens', mockGymnasts, 3);

      expect(result.teamScores.vault).toBe(9.5);
      expect(result.teamScores.bars).toBe(0);
      expect(result.teamScores.beam).toBe(0);
      expect(result.teamScores.floor).toBe(9.4);
    });

    it('should handle mens gymnastics with 6 events', () => {
      const scores: Score[] = [
        {
          id: '1',
          gymnastId: '1',
          userId: 'test',
          meetId: 'meet1',
          scores: {
            floor: 9.0,
            pommelHorse: 9.1,
            rings: 9.2,
            vault: 9.3,
            parallelBars: 9.4,
            highBar: 9.5,
            allAround: 55.5,
          },
          placements: {},
          createdAt: { toMillis: () => Date.now(), toDate: () => new Date() },
        },
      ];

      const result = calculateTeamScore(scores, 'Mens', mockGymnasts, 3);

      expect(result.teamScores.floor).toBe(9.0);
      expect(result.teamScores.pommelHorse).toBe(9.1);
      expect(result.teamScores.rings).toBe(9.2);
      expect(result.teamScores.vault).toBe(9.3);
      expect(result.teamScores.parallelBars).toBe(9.4);
      expect(result.teamScores.highBar).toBe(9.5);
      expect(result.totalScore).toBeCloseTo(55.5, 1);
    });
  });

  describe('isCountingScore', () => {
    const countingScores: CountingScore[] = [
      { gymnastId: '1', event: 'vault', score: 9.5 },
      { gymnastId: '2', event: 'vault', score: 9.4 },
      { gymnastId: '1', event: 'bars', score: 9.3 },
    ];

    it('should return true for counting scores', () => {
      expect(isCountingScore('1', 'vault', countingScores)).toBe(true);
      expect(isCountingScore('2', 'vault', countingScores)).toBe(true);
      expect(isCountingScore('1', 'bars', countingScores)).toBe(true);
    });

    it('should return false for non-counting scores', () => {
      expect(isCountingScore('3', 'vault', countingScores)).toBe(false);
      expect(isCountingScore('1', 'beam', countingScores)).toBe(false);
    });
  });

  describe('getEventDisplayName', () => {
    it('should return abbreviated names by default', () => {
      expect(getEventDisplayName('vault')).toBe('V');
      expect(getEventDisplayName('bars')).toBe('UB');
      expect(getEventDisplayName('beam')).toBe('BB');
      expect(getEventDisplayName('floor')).toBe('FX');
      expect(getEventDisplayName('pommelHorse')).toBe('PH');
      expect(getEventDisplayName('rings')).toBe('R');
      expect(getEventDisplayName('parallelBars')).toBe('PB');
      expect(getEventDisplayName('highBar')).toBe('HB');
    });

    it('should return full names when requested', () => {
      expect(getEventDisplayName('vault', false)).toBe('Vault');
      expect(getEventDisplayName('bars', false)).toBe('Uneven Bars');
      expect(getEventDisplayName('beam', false)).toBe('Balance Beam');
      expect(getEventDisplayName('floor', false)).toBe('Floor Exercise');
    });

    it('should handle unknown events', () => {
      expect(getEventDisplayName('unknown')).toBe('unknown');
    });
  });

  describe('getLevelOrder', () => {
    it('should return correct order for numbered levels', () => {
      expect(getLevelOrder('Level 1')).toBe(1);
      expect(getLevelOrder('Level 5')).toBe(5);
      expect(getLevelOrder('Level 10')).toBe(10);
    });

    it('should return correct order for Xcel levels', () => {
      expect(getLevelOrder('Xcel Bronze')).toBe(11);
      expect(getLevelOrder('Xcel Silver')).toBe(12);
      expect(getLevelOrder('Xcel Gold')).toBe(13);
      expect(getLevelOrder('Xcel Platinum')).toBe(14);
      expect(getLevelOrder('Xcel Diamond')).toBe(15);
      expect(getLevelOrder('Xcel Sapphire')).toBe(16);
    });

    it('should return high order for Elite', () => {
      expect(getLevelOrder('Elite')).toBe(100);
    });

    it('should return 999 for unknown levels', () => {
      expect(getLevelOrder('Unknown Level')).toBe(999);
    });
  });

  describe('sortLevelDisciplineCombos', () => {
    it('should sort by level first, then discipline', () => {
      const combos = [
        { level: 'Level 5', discipline: 'Mens' as const },
        { level: 'Level 3', discipline: 'Womens' as const },
        { level: 'Level 5', discipline: 'Womens' as const },
        { level: 'Elite', discipline: 'Womens' as const },
        { level: 'Xcel Gold', discipline: 'Womens' as const },
      ];

      const sorted = sortLevelDisciplineCombos(combos);

      expect(sorted[0].level).toBe('Level 3');
      expect(sorted[1].level).toBe('Level 5');
      expect(sorted[1].discipline).toBe('Womens');
      expect(sorted[2].level).toBe('Level 5');
      expect(sorted[2].discipline).toBe('Mens');
      expect(sorted[3].level).toBe('Xcel Gold');
      expect(sorted[4].level).toBe('Elite');
    });
  });

  describe('formatTeamScore', () => {
    it('should format scores to 3 decimal places', () => {
      expect(formatTeamScore(113.2)).toBe('113.200');
      expect(formatTeamScore(100)).toBe('100.000');
      expect(formatTeamScore(99.9999)).toBe('100.000');
    });
  });
});
