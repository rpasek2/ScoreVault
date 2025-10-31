import {
  initDatabase,
  saveTeamPlacement,
  getTeamPlacement,
  getTeamPlacementsByMeet,
  deleteTeamPlacement,
  addMeet,
  exportAllData,
  importAllData
} from '../utils/database';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

describe('Database - Team Placement Operations', () => {
  let testMeetId: string;

  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    const db = require('expo-sqlite').openDatabaseSync();
    db.clearAll();

    // Create a test meet
    testMeetId = await addMeet({
      name: 'Test Meet',
      date: new Date('2024-03-15'),
      location: 'Test Location'
    });
  });

  describe('saveTeamPlacement', () => {
    it('should save team placements successfully', async () => {
      const placementId = await saveTeamPlacement(
        testMeetId,
        'Level 4',
        'Womens',
        {
          vault: 1,
          bars: 2,
          beam: 3,
          floor: 1,
          allAround: 2
        }
      );

      expect(placementId).toBeDefined();
      expect(typeof placementId).toBe('string');
    });

    it('should update existing placements when called again', async () => {
      // Save initial placements
      const id1 = await saveTeamPlacement(
        testMeetId,
        'Level 4',
        'Womens',
        { vault: 1, allAround: 1 }
      );

      // Update placements
      const id2 = await saveTeamPlacement(
        testMeetId,
        'Level 4',
        'Womens',
        { vault: 2, allAround: 2 }
      );

      // Should return same ID (update, not insert)
      expect(id1).toBe(id2);

      // Verify updated values
      const placement = await getTeamPlacement(testMeetId, 'Level 4', 'Womens');
      expect(placement?.placements.vault).toBe(2);
      expect(placement?.placements.allAround).toBe(2);
    });

    it('should handle null/undefined placements', async () => {
      const placementId = await saveTeamPlacement(
        testMeetId,
        'Level 5',
        'Mens',
        {
          vault: 1,
          // Other events not specified
        }
      );

      const placement = await getTeamPlacement(testMeetId, 'Level 5', 'Mens');
      expect(placement?.placements.vault).toBe(1);
      expect(placement?.placements.bars).toBeNull();
    });
  });

  describe('getTeamPlacement', () => {
    it('should retrieve team placement by meet, level, and discipline', async () => {
      await saveTeamPlacement(
        testMeetId,
        'Level 4',
        'Womens',
        { vault: 1, bars: 2, beam: 3, floor: 1, allAround: 1 }
      );

      const placement = await getTeamPlacement(testMeetId, 'Level 4', 'Womens');

      expect(placement).toBeDefined();
      expect(placement?.meetId).toBe(testMeetId);
      expect(placement?.level).toBe('Level 4');
      expect(placement?.discipline).toBe('Womens');
      expect(placement?.placements.vault).toBe(1);
      expect(placement?.placements.allAround).toBe(1);
    });

    it('should return null when no placement exists', async () => {
      const placement = await getTeamPlacement(testMeetId, 'Level 10', 'Mens');
      expect(placement).toBeNull();
    });

    it('should handle different disciplines separately', async () => {
      await saveTeamPlacement(testMeetId, 'Level 4', 'Womens', { vault: 1 });
      await saveTeamPlacement(testMeetId, 'Level 4', 'Mens', { vault: 2 });

      const womensPlacement = await getTeamPlacement(testMeetId, 'Level 4', 'Womens');
      const mensPlacement = await getTeamPlacement(testMeetId, 'Level 4', 'Mens');

      expect(womensPlacement?.placements.vault).toBe(1);
      expect(mensPlacement?.placements.vault).toBe(2);
    });
  });

  describe('getTeamPlacementsByMeet', () => {
    it('should retrieve all placements for a meet', async () => {
      await saveTeamPlacement(testMeetId, 'Level 4', 'Womens', { vault: 1 });
      await saveTeamPlacement(testMeetId, 'Level 5', 'Womens', { vault: 2 });
      await saveTeamPlacement(testMeetId, 'Level 4', 'Mens', { vault: 3 });

      const placements = await getTeamPlacementsByMeet(testMeetId);

      expect(placements).toHaveLength(3);
      expect(placements.map(p => p.level).sort()).toEqual(['Level 4', 'Level 4', 'Level 5']);
    });

    it('should return empty array when no placements exist', async () => {
      const placements = await getTeamPlacementsByMeet('nonexistent-meet-id');
      expect(placements).toEqual([]);
    });
  });

  describe('deleteTeamPlacement', () => {
    it('should delete a team placement', async () => {
      const placementId = await saveTeamPlacement(
        testMeetId,
        'Level 4',
        'Womens',
        { vault: 1 }
      );

      await deleteTeamPlacement(placementId);

      const placement = await getTeamPlacement(testMeetId, 'Level 4', 'Womens');
      expect(placement).toBeNull();
    });
  });

  describe('Export/Import with Team Placements', () => {
    it('should include team placements in export', async () => {
      await saveTeamPlacement(testMeetId, 'Level 4', 'Womens', { vault: 1, allAround: 2 });

      const exportedData = await exportAllData();

      expect(exportedData.teamPlacements).toBeDefined();
      expect(exportedData.teamPlacements.length).toBeGreaterThan(0);
      expect(exportedData.teamPlacements[0].placements.vault).toBe(1);
    });

    it('should restore team placements on import', async () => {
      // Save initial data
      await saveTeamPlacement(testMeetId, 'Level 4', 'Womens', { vault: 1, allAround: 2 });
      const exportedData = await exportAllData();

      // Clear and import
      await importAllData(exportedData);

      // Verify placements were restored
      const placement = await getTeamPlacement(testMeetId, 'Level 4', 'Womens');
      expect(placement).toBeDefined();
      expect(placement?.placements.vault).toBe(1);
      expect(placement?.placements.allAround).toBe(2);
    });

    it('should handle imports without team placements (backward compatibility)', async () => {
      const dataWithoutPlacements = {
        gymnasts: [],
        meets: [],
        scores: []
      };

      // Should not throw error
      await expect(importAllData(dataWithoutPlacements)).resolves.not.toThrow();
    });
  });

  describe('Mens Events', () => {
    it('should save mens team placements correctly', async () => {
      await saveTeamPlacement(
        testMeetId,
        'Level 4',
        'Mens',
        {
          floor: 1,
          pommelHorse: 2,
          rings: 3,
          vault: 1,
          parallelBars: 2,
          highBar: 3,
          allAround: 1
        }
      );

      const placement = await getTeamPlacement(testMeetId, 'Level 4', 'Mens');

      expect(placement?.placements.pommelHorse).toBe(2);
      expect(placement?.placements.rings).toBe(3);
      expect(placement?.placements.parallelBars).toBe(2);
      expect(placement?.placements.highBar).toBe(3);
    });
  });
});
