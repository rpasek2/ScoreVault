import { getScoreColor, getAAScoreColor, getPlacementColor, getOrdinal, getInitials } from '@/constants/theme';

describe('Theme Helper Functions', () => {
  describe('getOrdinal', () => {
    it('should return correct ordinal for 1st place', () => {
      expect(getOrdinal(1)).toBe('1st');
    });

    it('should return correct ordinal for 2nd place', () => {
      expect(getOrdinal(2)).toBe('2nd');
    });

    it('should return correct ordinal for 3rd place', () => {
      expect(getOrdinal(3)).toBe('3rd');
    });

    it('should return correct ordinal for 4th place and beyond', () => {
      expect(getOrdinal(4)).toBe('4th');
      expect(getOrdinal(10)).toBe('10th');
      expect(getOrdinal(21)).toBe('21st');
      expect(getOrdinal(22)).toBe('22nd');
      expect(getOrdinal(23)).toBe('23rd');
      expect(getOrdinal(100)).toBe('100th');
      expect(getOrdinal(111)).toBe('111th');
    });
  });

  describe('getInitials', () => {
    it('should return initials for first and last name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return initials for single name', () => {
      expect(getInitials('Madonna')).toBe('M');
    });

    it('should return initials for three names', () => {
      expect(getInitials('Mary Jane Watson')).toBe('MJ');
    });

    it('should handle lowercase names', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle names with multiple spaces', () => {
      expect(getInitials('John  Doe')).toBe('JD');
    });
  });

  describe('getPlacementColor', () => {
    it('should return gold for 1st place', () => {
      const color = getPlacementColor(1);
      expect(color).toContain('#FFD700');
    });

    it('should return silver for 2nd place', () => {
      const color = getPlacementColor(2);
      expect(color).toContain('#AAB7B8');
    });

    it('should return bronze for 3rd place', () => {
      const color = getPlacementColor(3);
      expect(color).toContain('#CD7F32');
    });

    it('should return grey for 4th place and beyond', () => {
      const color4th = getPlacementColor(4);
      const color10th = getPlacementColor(10);
      expect(color4th).toBeTruthy();
      expect(color10th).toBeTruthy();
    });
  });

  describe('getScoreColor', () => {
    it('should return a color for any score', () => {
      expect(getScoreColor(10.0)).toBeTruthy();
      expect(getScoreColor(9.5)).toBeTruthy();
      expect(getScoreColor(0)).toBeTruthy();
    });
  });

  describe('getAAScoreColor', () => {
    it('should return a color for any AA score', () => {
      expect(getAAScoreColor(40.0)).toBeTruthy();
      expect(getAAScoreColor(38.5)).toBeTruthy();
      expect(getAAScoreColor(0)).toBeTruthy();
    });
  });
});
