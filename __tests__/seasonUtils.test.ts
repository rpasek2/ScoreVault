import {
  calculateSeason,
  parseSeason,
  getPreviousSeason,
  getNextSeason,
  formatScore,
} from '@/utils/seasonUtils';

describe('Season Utilities', () => {
  describe('calculateSeason', () => {
    it('should return correct season for August (start of season)', () => {
      const date = new Date(2024, 7, 1); // Month is 0-indexed, 7 = August
      expect(calculateSeason(date)).toBe('2024-2025');
    });

    it('should return correct season for December', () => {
      const date = new Date(2024, 11, 15); // 11 = December
      expect(calculateSeason(date)).toBe('2024-2025');
    });

    it('should return correct season for January', () => {
      const date = new Date(2025, 0, 1); // 0 = January
      expect(calculateSeason(date)).toBe('2024-2025');
    });

    it('should return correct season for July (end of season)', () => {
      const date = new Date(2025, 6, 31); // 6 = July
      expect(calculateSeason(date)).toBe('2024-2025');
    });

    it('should handle different years', () => {
      const date2023 = new Date(2023, 8, 15); // 8 = September
      expect(calculateSeason(date2023)).toBe('2023-2024');

      const date2026 = new Date(2026, 2, 20); // 2 = March
      expect(calculateSeason(date2026)).toBe('2025-2026');
    });
  });

  describe('parseSeason', () => {
    it('should parse season string correctly', () => {
      const result = parseSeason('2024-2025');
      expect(result.startYear).toBe(2024);
      expect(result.endYear).toBe(2025);
    });

    it('should handle different years', () => {
      const result = parseSeason('2023-2024');
      expect(result.startYear).toBe(2023);
      expect(result.endYear).toBe(2024);
    });
  });

  describe('getPreviousSeason', () => {
    it('should return previous season', () => {
      expect(getPreviousSeason('2024-2025')).toBe('2023-2024');
    });

    it('should work across multiple seasons', () => {
      expect(getPreviousSeason('2023-2024')).toBe('2022-2023');
      expect(getPreviousSeason('2022-2023')).toBe('2021-2022');
    });
  });

  describe('getNextSeason', () => {
    it('should return next season', () => {
      expect(getNextSeason('2024-2025')).toBe('2025-2026');
    });

    it('should work across multiple seasons', () => {
      expect(getNextSeason('2023-2024')).toBe('2024-2025');
      expect(getNextSeason('2025-2026')).toBe('2026-2027');
    });
  });

  describe('formatScore', () => {
    it('should format score to 3 decimal places', () => {
      expect(formatScore(9.5)).toBe('9.500');
      expect(formatScore(10)).toBe('10.000');
      expect(formatScore(9.125)).toBe('9.125');
    });

    it('should round correctly', () => {
      expect(formatScore(9.1234)).toBe('9.123');
      expect(formatScore(9.9999)).toBe('10.000');
    });

    it('should handle zero and low scores', () => {
      expect(formatScore(0)).toBe('0.000');
      expect(formatScore(0.5)).toBe('0.500');
    });
  });
});
