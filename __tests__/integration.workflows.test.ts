import {
  initDatabase,
  addGymnast,
  getGymnasts,
  addMeet,
  getMeets,
  addScore,
  getScoresByGymnast,
  getScoresByMeet,
  hideGymnast,
  getHiddenGymnasts,
  unhideGymnast,
} from '@/utils/database';
import { calculateTeamScore } from '@/utils/teamScores';
import { calculateSeason } from '@/utils/seasonUtils';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

describe('Integration Tests - Complete Workflows', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    const db = require('expo-sqlite').openDatabaseSync();
    db.clearAll();
  });

  describe('Complete Score Entry Workflow', () => {
    it('should handle full workflow: add gymnast → add meet → enter scores → retrieve results', async () => {
      // Step 1: Add a gymnast
      const gymnastId = await addGymnast({
        name: 'Sarah Johnson',
        level: 'Level 5',
        discipline: 'Womens',
        usagNumber: '12345',
      });

      // Verify gymnast was added
      const gymnasts = await getGymnasts();
      expect(gymnasts).toHaveLength(1);
      expect(gymnasts[0].name).toBe('Sarah Johnson');
      expect(gymnasts[0].level).toBe('Level 5');

      // Step 2: Add a meet
      const meetDate = new Date('2025-03-15');
      const meetId = await addMeet({
        name: 'State Championship',
        date: { toMillis: () => meetDate.getTime() },
        season: calculateSeason(meetDate),
        location: 'Central Gym',
      });

      // Verify meet was added
      const meets = await getMeets();
      expect(meets).toHaveLength(1);
      expect(meets[0].name).toBe('State Championship');
      expect(meets[0].season).toBe('2024-2025');

      // Step 3: Enter scores for the gymnast
      const scoreId = await addScore({
        gymnastId,
        meetId,
        scores: {
          vault: 9.5,
          bars: 9.3,
          beam: 9.4,
          floor: 9.6,
          allAround: 37.8,
        },
        placements: {
          vault: 1,
          bars: 2,
          beam: 1,
          floor: 1,
          allAround: 1,
        },
      });

      // Step 4: Retrieve and verify scores
      const gymnastScores = await getScoresByGymnast(gymnastId);
      expect(gymnastScores).toHaveLength(1);
      expect(gymnastScores[0].scores.vault).toBe(9.5);
      expect(gymnastScores[0].scores.allAround).toBe(37.8);
      expect(gymnastScores[0].placements?.allAround).toBe(1);

      // Step 5: Verify scores can be retrieved by meet
      const meetScores = await getScoresByMeet(meetId);
      expect(meetScores).toHaveLength(1);
      expect(meetScores[0].gymnastId).toBe(gymnastId);
    });

    it('should handle multiple gymnasts at same meet', async () => {
      // Add multiple gymnasts
      const gymnast1 = await addGymnast({
        name: 'Gymnast 1',
        level: 'Level 5',
        discipline: 'Womens',
      });

      const gymnast2 = await addGymnast({
        name: 'Gymnast 2',
        level: 'Level 5',
        discipline: 'Womens',
      });

      const gymnast3 = await addGymnast({
        name: 'Gymnast 3',
        level: 'Level 5',
        discipline: 'Womens',
      });

      // Add meet
      const meetId = await addMeet({
        name: 'Team Meet',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });

      // Add scores for all gymnasts
      await addScore({
        gymnastId: gymnast1,
        meetId,
        scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
        placements: {},
      });

      await addScore({
        gymnastId: gymnast2,
        meetId,
        scores: { vault: 9.6, bars: 9.4, beam: 9.5, floor: 9.7, allAround: 38.2 },
        placements: {},
      });

      await addScore({
        gymnastId: gymnast3,
        meetId,
        scores: { vault: 9.4, bars: 9.2, beam: 9.3, floor: 9.5, allAround: 37.4 },
        placements: {},
      });

      // Retrieve all scores for the meet
      const meetScores = await getScoresByMeet(meetId);
      expect(meetScores).toHaveLength(3);

      // Verify each gymnast has exactly one score
      const g1Scores = await getScoresByGymnast(gymnast1);
      const g2Scores = await getScoresByGymnast(gymnast2);
      const g3Scores = await getScoresByGymnast(gymnast3);

      expect(g1Scores).toHaveLength(1);
      expect(g2Scores).toHaveLength(1);
      expect(g3Scores).toHaveLength(1);
    });

    it('should track gymnast progress across multiple meets', async () => {
      const gymnastId = await addGymnast({
        name: 'Progressive Gymnast',
        level: 'Level 6',
        discipline: 'Womens',
      });

      // Add 3 meets in chronological order
      const meet1 = await addMeet({
        name: 'Meet 1',
        date: { toMillis: () => new Date('2025-01-15').getTime() },
        season: '2024-2025',
      });

      const meet2 = await addMeet({
        name: 'Meet 2',
        date: { toMillis: () => new Date('2025-02-15').getTime() },
        season: '2024-2025',
      });

      const meet3 = await addMeet({
        name: 'Meet 3',
        date: { toMillis: () => new Date('2025-03-15').getTime() },
        season: '2024-2025',
      });

      // Scores improve over time
      await addScore({
        gymnastId,
        meetId: meet1,
        scores: { vault: 9.0, bars: 8.8, beam: 8.9, floor: 9.1, allAround: 35.8 },
        placements: {},
      });

      await addScore({
        gymnastId,
        meetId: meet2,
        scores: { vault: 9.3, bars: 9.1, beam: 9.2, floor: 9.4, allAround: 37.0 },
        placements: {},
      });

      await addScore({
        gymnastId,
        meetId: meet3,
        scores: { vault: 9.5, bars: 9.4, beam: 9.5, floor: 9.6, allAround: 38.0 },
        placements: {},
      });

      // Retrieve all scores for the gymnast
      const scores = await getScoresByGymnast(gymnastId);
      expect(scores).toHaveLength(3);

      // Verify progression (scores should improve)
      const allAroundScores = scores.map(s => s.scores.allAround);
      expect(allAroundScores).toContain(35.8);
      expect(allAroundScores).toContain(37.0);
      expect(allAroundScores).toContain(38.0);
    });
  });

  describe('Team Scoring Integration', () => {
    it('should calculate team scores from database data', async () => {
      // Add 4 gymnasts for a team
      const g1 = await addGymnast({ name: 'G1', level: 'Level 5', discipline: 'Womens' });
      const g2 = await addGymnast({ name: 'G2', level: 'Level 5', discipline: 'Womens' });
      const g3 = await addGymnast({ name: 'G3', level: 'Level 5', discipline: 'Womens' });
      const g4 = await addGymnast({ name: 'G4', level: 'Level 5', discipline: 'Womens' });

      const meetId = await addMeet({
        name: 'Team Competition',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });

      // Add scores
      await addScore({
        gymnastId: g1,
        meetId,
        scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
        placements: {},
      });

      await addScore({
        gymnastId: g2,
        meetId,
        scores: { vault: 9.6, bars: 9.4, beam: 9.5, floor: 9.7, allAround: 38.2 },
        placements: {},
      });

      await addScore({
        gymnastId: g3,
        meetId,
        scores: { vault: 9.4, bars: 9.2, beam: 9.3, floor: 9.5, allAround: 37.4 },
        placements: {},
      });

      await addScore({
        gymnastId: g4,
        meetId,
        scores: { vault: 9.3, bars: 9.1, beam: 9.2, floor: 9.4, allAround: 37.0 },
        placements: {},
      });

      // Get all scores and calculate team score
      const scores = await getScoresByMeet(meetId);
      const gymnasts = await getGymnasts();

      const teamResult = calculateTeamScore(scores, 'Womens', gymnasts, 3);

      // Top 3 vault: 9.6 + 9.5 + 9.4 = 28.5
      expect(teamResult.teamScores.vault).toBeCloseTo(28.5, 1);

      // Top 3 bars: 9.4 + 9.3 + 9.2 = 27.9
      expect(teamResult.teamScores.bars).toBeCloseTo(27.9, 1);

      // Top 3 beam: 9.5 + 9.4 + 9.3 = 28.2
      expect(teamResult.teamScores.beam).toBeCloseTo(28.2, 1);

      // Top 3 floor: 9.7 + 9.6 + 9.5 = 28.8
      expect(teamResult.teamScores.floor).toBeCloseTo(28.8, 1);

      // Total should be sum of all events
      expect(teamResult.totalScore).toBeCloseTo(113.4, 1);

      // Should have 12 counting scores (4 events × 3 gymnasts)
      expect(teamResult.countingScores.length).toBe(12);
    });

    it('should handle teams with fewer than 3 competitors per event', async () => {
      // Only 2 gymnasts
      const g1 = await addGymnast({ name: 'G1', level: 'Level 5', discipline: 'Womens' });
      const g2 = await addGymnast({ name: 'G2', level: 'Level 5', discipline: 'Womens' });

      const meetId = await addMeet({
        name: 'Small Team Meet',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });

      await addScore({
        gymnastId: g1,
        meetId,
        scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
        placements: {},
      });

      await addScore({
        gymnastId: g2,
        meetId,
        scores: { vault: 9.4, bars: 9.2, beam: 9.3, floor: 9.5, allAround: 37.4 },
        placements: {},
      });

      const scores = await getScoresByMeet(meetId);
      const gymnasts = await getGymnasts();

      const teamResult = calculateTeamScore(scores, 'Womens', gymnasts, 3);

      // Should only count 2 scores per event
      expect(teamResult.teamScores.vault).toBeCloseTo(18.9, 1);
      expect(teamResult.countingScores.length).toBe(8); // 4 events × 2 gymnasts
    });

    it('should handle mixed level teams by filtering', async () => {
      // Add gymnasts at different levels
      const level5_1 = await addGymnast({ name: 'L5-1', level: 'Level 5', discipline: 'Womens' });
      const level5_2 = await addGymnast({ name: 'L5-2', level: 'Level 5', discipline: 'Womens' });
      const level6_1 = await addGymnast({ name: 'L6-1', level: 'Level 6', discipline: 'Womens' });

      const meetId = await addMeet({
        name: 'Mixed Meet',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });

      await addScore({
        gymnastId: level5_1,
        meetId,
        scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
        placements: {},
      });

      await addScore({
        gymnastId: level5_2,
        meetId,
        scores: { vault: 9.4, bars: 9.2, beam: 9.3, floor: 9.5, allAround: 37.4 },
        placements: {},
      });

      await addScore({
        gymnastId: level6_1,
        meetId,
        scores: { vault: 9.8, bars: 9.6, beam: 9.7, floor: 9.9, allAround: 39.0 },
        placements: {},
      });

      // Get all scores, then filter for Level 5 only
      const allScores = await getScoresByMeet(meetId);
      const allGymnasts = await getGymnasts();

      const level5Gymnasts = allGymnasts.filter(g => g.level === 'Level 5');
      const level5Scores = allScores.filter(s =>
        level5Gymnasts.some(g => g.id === s.gymnastId)
      );

      const teamResult = calculateTeamScore(level5Scores, 'Womens', level5Gymnasts, 3);

      // Should only include Level 5 scores
      expect(level5Scores).toHaveLength(2);
      expect(teamResult.countingScores.length).toBe(8); // 4 events × 2 gymnasts
    });
  });

  describe('Hide/Unhide Gymnast Workflow', () => {
    it('should hide gymnast from roster but preserve historical scores', async () => {
      // Step 1: Add gymnast
      const gymnastId = await addGymnast({
        name: 'Hidden Gymnast',
        level: 'Level 5',
        discipline: 'Womens',
      });

      // Step 2: Add meet and score
      const meetId = await addMeet({
        name: 'Historical Meet',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });

      await addScore({
        gymnastId,
        meetId,
        scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
        placements: {},
      });

      // Verify gymnast appears in roster
      let visibleGymnasts = await getGymnasts();
      expect(visibleGymnasts).toHaveLength(1);

      // Verify score exists
      let scores = await getScoresByGymnast(gymnastId);
      expect(scores).toHaveLength(1);

      // Step 3: Hide the gymnast
      await hideGymnast(gymnastId);

      // Step 4: Verify gymnast hidden from roster
      visibleGymnasts = await getGymnasts();
      expect(visibleGymnasts).toHaveLength(0);

      const hiddenGymnasts = await getHiddenGymnasts();
      expect(hiddenGymnasts).toHaveLength(1);
      expect(hiddenGymnasts[0].name).toBe('Hidden Gymnast');

      // Step 5: Verify historical scores still exist
      scores = await getScoresByGymnast(gymnastId);
      expect(scores).toHaveLength(1);
      expect(scores[0].scores.allAround).toBe(37.8);

      // Step 6: Unhide and verify restoration
      await unhideGymnast(gymnastId);

      visibleGymnasts = await getGymnasts();
      expect(visibleGymnasts).toHaveLength(1);
      expect(visibleGymnasts[0].name).toBe('Hidden Gymnast');
    });

    it('should exclude hidden gymnasts from team scoring', async () => {
      const g1 = await addGymnast({ name: 'G1', level: 'Level 5', discipline: 'Womens' });
      const g2 = await addGymnast({ name: 'G2', level: 'Level 5', discipline: 'Womens' });
      const g3 = await addGymnast({ name: 'G3 Hidden', level: 'Level 5', discipline: 'Womens' });

      const meetId = await addMeet({
        name: 'Team Meet',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });

      await addScore({
        gymnastId: g1,
        meetId,
        scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
        placements: {},
      });

      await addScore({
        gymnastId: g2,
        meetId,
        scores: { vault: 9.4, bars: 9.2, beam: 9.3, floor: 9.5, allAround: 37.4 },
        placements: {},
      });

      await addScore({
        gymnastId: g3,
        meetId,
        scores: { vault: 9.6, bars: 9.4, beam: 9.5, floor: 9.7, allAround: 38.2 },
        placements: {},
      });

      // Hide G3
      await hideGymnast(g3);

      // Get visible gymnasts and their scores
      const visibleGymnasts = await getGymnasts(); // Should only get G1 and G2
      const allScores = await getScoresByMeet(meetId);

      // Filter scores to only include visible gymnasts
      const visibleScores = allScores.filter(score =>
        visibleGymnasts.some(g => g.id === score.gymnastId)
      );

      expect(visibleGymnasts).toHaveLength(2);
      expect(visibleScores).toHaveLength(2);

      // Team score should only use G1 and G2
      const teamResult = calculateTeamScore(visibleScores, 'Womens', visibleGymnasts, 3);
      expect(teamResult.countingScores.length).toBe(8); // 4 events × 2 gymnasts
    });
  });

  describe('Season and Meet Management', () => {
    it('should properly categorize meets by season', async () => {
      // Add meets in different seasons
      const fall2024 = await addMeet({
        name: 'Fall Meet',
        date: { toMillis: () => new Date('2024-09-15').getTime() },
        season: calculateSeason(new Date('2024-09-15')),
      });

      const winter2025 = await addMeet({
        name: 'Winter Meet',
        date: { toMillis: () => new Date('2025-01-15').getTime() },
        season: calculateSeason(new Date('2025-01-15')),
      });

      const spring2025 = await addMeet({
        name: 'Spring Meet',
        date: { toMillis: () => new Date('2025-05-15').getTime() },
        season: calculateSeason(new Date('2025-05-15')),
      });

      const fall2025 = await addMeet({
        name: 'Fall Meet 2',
        date: { toMillis: () => new Date('2025-09-15').getTime() },
        season: calculateSeason(new Date('2025-09-15')),
      });

      const meets = await getMeets();
      expect(meets).toHaveLength(4);

      // Group by season
      const season2024_2025 = meets.filter(m => m.season === '2024-2025');
      const season2025_2026 = meets.filter(m => m.season === '2025-2026');

      expect(season2024_2025).toHaveLength(3); // Fall 2024, Winter 2025, Spring 2025
      expect(season2025_2026).toHaveLength(1); // Fall 2025

      // Verify season calculation
      expect(calculateSeason(new Date('2024-09-15'))).toBe('2024-2025');
      expect(calculateSeason(new Date('2025-01-15'))).toBe('2024-2025');
      expect(calculateSeason(new Date('2025-09-15'))).toBe('2025-2026');
    });

    it('should handle complete season workflow', async () => {
      const gymnastId = await addGymnast({
        name: 'Season Tracker',
        level: 'Level 6',
        discipline: 'Womens',
      });

      // Add 3 meets across a season
      const meets = [
        await addMeet({
          name: 'Early Season',
          date: { toMillis: () => new Date('2024-09-01').getTime() },
          season: '2024-2025',
        }),
        await addMeet({
          name: 'Mid Season',
          date: { toMillis: () => new Date('2025-01-15').getTime() },
          season: '2024-2025',
        }),
        await addMeet({
          name: 'Late Season',
          date: { toMillis: () => new Date('2025-05-01').getTime() },
          season: '2024-2025',
        }),
      ];

      // Add scores for each meet
      for (const meetId of meets) {
        await addScore({
          gymnastId,
          meetId,
          scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
          placements: {},
        });
      }

      // Verify all scores for the season
      const gymnastScores = await getScoresByGymnast(gymnastId);
      expect(gymnastScores).toHaveLength(3);

      // Verify meets are in the same season
      const allMeets = await getMeets();
      const seasonMeets = allMeets.filter(m => m.season === '2024-2025');
      expect(seasonMeets).toHaveLength(3);
    });
  });
});
