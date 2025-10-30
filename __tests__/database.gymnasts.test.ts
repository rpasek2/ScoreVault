import {
  initDatabase,
  addGymnast,
  getGymnasts,
  getGymnastById,
  updateGymnast,
  deleteGymnast,
  hideGymnast,
  unhideGymnast,
  getHiddenGymnasts,
} from '@/utils/database';
import { Gymnast } from '@/types';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

describe('Database - Gymnast Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    const db = require('expo-sqlite').openDatabaseSync();
    db.clearAll();
  });

  describe('addGymnast', () => {
    it('should add a new gymnast to the database', async () => {
      const gymnastData = {
        name: 'Test Gymnast',
        level: 'Level 5',
        discipline: 'Womens' as const,
        dateOfBirth: { toMillis: () => Date.now() },
      };

      const id = await addGymnast(gymnastData);

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');

      const gymnasts = await getGymnasts();
      expect(gymnasts).toHaveLength(1);
      expect(gymnasts[0].name).toBe('Test Gymnast');
      expect(gymnasts[0].level).toBe('Level 5');
      expect(gymnasts[0].discipline).toBe('Womens');
    });

    it('should add gymnast without optional fields', async () => {
      const gymnastData = {
        name: 'Simple Gymnast',
        level: 'Level 3',
        discipline: 'Mens' as const,
      };

      const id = await addGymnast(gymnastData);
      const gymnast = await getGymnastById(id);

      expect(gymnast).toBeTruthy();
      expect(gymnast?.name).toBe('Simple Gymnast');
      expect(gymnast?.usagNumber).toBeUndefined();
      expect(gymnast?.dateOfBirth).toBeUndefined();
    });

    it('should add multiple gymnasts', async () => {
      await addGymnast({ name: 'Gymnast 1', level: 'Level 4', discipline: 'Womens' as const });
      await addGymnast({ name: 'Gymnast 2', level: 'Level 5', discipline: 'Womens' as const });
      await addGymnast({ name: 'Gymnast 3', level: 'Level 6', discipline: 'Mens' as const });

      const gymnasts = await getGymnasts();
      expect(gymnasts).toHaveLength(3);
    });
  });

  describe('getGymnasts', () => {
    it('should return empty array when no gymnasts exist', async () => {
      const gymnasts = await getGymnasts();
      expect(gymnasts).toEqual([]);
    });

    it('should return all gymnasts ordered by creation date', async () => {
      // Add with delays to ensure different timestamps
      await addGymnast({ name: 'First', level: 'Level 1', discipline: 'Womens' as const });
      await new Promise(resolve => setTimeout(resolve, 10));
      await addGymnast({ name: 'Second', level: 'Level 2', discipline: 'Womens' as const });
      await new Promise(resolve => setTimeout(resolve, 10));
      await addGymnast({ name: 'Third', level: 'Level 3', discipline: 'Womens' as const });

      const gymnasts = await getGymnasts();

      expect(gymnasts).toHaveLength(3);
      // Most recent first
      expect(gymnasts[0].name).toBe('Third');
      expect(gymnasts[1].name).toBe('Second');
      expect(gymnasts[2].name).toBe('First');
    });

    it('should exclude hidden gymnasts by default', async () => {
      const id1 = await addGymnast({ name: 'Visible', level: 'Level 4', discipline: 'Womens' as const });
      const id2 = await addGymnast({ name: 'Hidden', level: 'Level 5', discipline: 'Womens' as const });

      await hideGymnast(id2);

      const gymnasts = await getGymnasts();
      expect(gymnasts).toHaveLength(1);
      expect(gymnasts[0].name).toBe('Visible');
    });

    it('should include hidden gymnasts when requested', async () => {
      const id1 = await addGymnast({ name: 'Visible', level: 'Level 4', discipline: 'Womens' as const });
      const id2 = await addGymnast({ name: 'Hidden', level: 'Level 5', discipline: 'Womens' as const });

      await hideGymnast(id2);

      const allGymnasts = await getGymnasts(true);
      expect(allGymnasts).toHaveLength(2);
    });
  });

  describe('getGymnastById', () => {
    it('should return gymnast by ID', async () => {
      const id = await addGymnast({
        name: 'Find Me',
        level: 'Level 7',
        discipline: 'Womens' as const,
        usagNumber: '12345',
      });

      const gymnast = await getGymnastById(id);

      expect(gymnast).toBeTruthy();
      expect(gymnast?.id).toBe(id);
      expect(gymnast?.name).toBe('Find Me');
      expect(gymnast?.usagNumber).toBe('12345');
    });

    it('should return null for non-existent ID', async () => {
      const gymnast = await getGymnastById('non-existent-id');
      expect(gymnast).toBeNull();
    });
  });

  describe('updateGymnast', () => {
    it('should update gymnast name', async () => {
      const id = await addGymnast({
        name: 'Original Name',
        level: 'Level 5',
        discipline: 'Womens' as const,
      });

      await updateGymnast(id, { name: 'Updated Name' });

      const gymnast = await getGymnastById(id);
      expect(gymnast?.name).toBe('Updated Name');
      expect(gymnast?.level).toBe('Level 5'); // Unchanged
    });

    it('should update gymnast level', async () => {
      const id = await addGymnast({
        name: 'Test',
        level: 'Level 5',
        discipline: 'Womens' as const,
      });

      await updateGymnast(id, { level: 'Level 6' });

      const gymnast = await getGymnastById(id);
      expect(gymnast?.level).toBe('Level 6');
    });

    it('should update multiple fields', async () => {
      const id = await addGymnast({
        name: 'Test',
        level: 'Level 5',
        discipline: 'Womens' as const,
      });

      await updateGymnast(id, {
        name: 'New Name',
        level: 'Level 7',
        usagNumber: '99999',
      });

      const gymnast = await getGymnastById(id);
      expect(gymnast?.name).toBe('New Name');
      expect(gymnast?.level).toBe('Level 7');
      expect(gymnast?.usagNumber).toBe('99999');
    });
  });

  describe('deleteGymnast', () => {
    it('should delete a gymnast', async () => {
      const id = await addGymnast({
        name: 'To Delete',
        level: 'Level 5',
        discipline: 'Womens' as const,
      });

      await deleteGymnast(id);

      const gymnast = await getGymnastById(id);
      expect(gymnast).toBeNull();

      const all = await getGymnasts();
      expect(all).toHaveLength(0);
    });

    it('should only delete specified gymnast', async () => {
      const id1 = await addGymnast({ name: 'Keep', level: 'Level 5', discipline: 'Womens' as const });
      const id2 = await addGymnast({ name: 'Delete', level: 'Level 5', discipline: 'Womens' as const });

      await deleteGymnast(id2);

      const gymnasts = await getGymnasts();
      expect(gymnasts).toHaveLength(1);
      expect(gymnasts[0].name).toBe('Keep');
    });
  });

  describe('hideGymnast / unhideGymnast', () => {
    it('should hide a gymnast', async () => {
      const id = await addGymnast({
        name: 'Hide Me',
        level: 'Level 5',
        discipline: 'Womens' as const,
      });

      await hideGymnast(id);

      const visible = await getGymnasts();
      expect(visible).toHaveLength(0);

      const all = await getGymnasts(true);
      expect(all).toHaveLength(1);
      expect(all[0].isHidden).toBe(true);
    });

    it('should unhide a gymnast', async () => {
      const id = await addGymnast({
        name: 'Test',
        level: 'Level 5',
        discipline: 'Womens' as const,
      });

      await hideGymnast(id);
      await unhideGymnast(id);

      const gymnasts = await getGymnasts();
      expect(gymnasts).toHaveLength(1);
      expect(gymnasts[0].isHidden).toBe(false);
    });

    it('should get hidden gymnasts only', async () => {
      const id1 = await addGymnast({ name: 'Visible', level: 'Level 4', discipline: 'Womens' as const });
      const id2 = await addGymnast({ name: 'Hidden 1', level: 'Level 5', discipline: 'Womens' as const });
      const id3 = await addGymnast({ name: 'Hidden 2', level: 'Level 6', discipline: 'Mens' as const });

      await hideGymnast(id2);
      await hideGymnast(id3);

      const hidden = await getHiddenGymnasts();
      expect(hidden).toHaveLength(2);
      expect(hidden.every(g => g.isHidden)).toBe(true);
    });
  });
});
