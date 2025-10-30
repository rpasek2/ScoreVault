import {
  initDatabase,
  addMeet,
  getMeets,
  getMeetById,
  updateMeet,
  deleteMeet,
  addScore,
  getScoresByGymnast,
  getScoresByMeet,
  getScoreById,
  updateScore,
  deleteScore,
  addGymnast,
} from '@/utils/database';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  db: {},
}));

describe('Database - Meet and Score Operations', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    const db = require('expo-sqlite').openDatabaseSync();
    db.clearAll();
  });

  describe('Meet Operations', () => {
    describe('addMeet', () => {
      it('should add a new meet to the database', async () => {
        const meetData = {
          name: 'State Championship',
          date: { toMillis: () => new Date('2025-03-15').getTime() },
          season: '2024-2025',
          location: 'Test Gym',
        };

        const id = await addMeet(meetData);

        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');

        const meets = await getMeets();
        expect(meets).toHaveLength(1);
        expect(meets[0].name).toBe('State Championship');
        expect(meets[0].season).toBe('2024-2025');
        expect(meets[0].location).toBe('Test Gym');
      });

      it('should add meet without location', async () => {
        const meetData = {
          name: 'Home Meet',
          date: { toMillis: () => Date.now() },
          season: '2024-2025',
        };

        const id = await addMeet(meetData);
        const meet = await getMeetById(id);

        expect(meet).toBeTruthy();
        expect(meet?.name).toBe('Home Meet');
        expect(meet?.location).toBeUndefined();
      });

      it('should add multiple meets', async () => {
        await addMeet({ name: 'Meet 1', date: { toMillis: () => Date.now() }, season: '2024-2025' });
        await addMeet({ name: 'Meet 2', date: { toMillis: () => Date.now() }, season: '2024-2025' });
        await addMeet({ name: 'Meet 3', date: { toMillis: () => Date.now() }, season: '2025-2026' });

        const meets = await getMeets();
        expect(meets).toHaveLength(3);
      });
    });

    describe('getMeets', () => {
      it('should return empty array when no meets exist', async () => {
        const meets = await getMeets();
        expect(meets).toEqual([]);
      });

      it('should return meets ordered by date descending', async () => {
        await addMeet({
          name: 'Oldest',
          date: { toMillis: () => new Date('2025-01-01').getTime() },
          season: '2024-2025',
        });
        await addMeet({
          name: 'Newest',
          date: { toMillis: () => new Date('2025-03-01').getTime() },
          season: '2024-2025',
        });
        await addMeet({
          name: 'Middle',
          date: { toMillis: () => new Date('2025-02-01').getTime() },
          season: '2024-2025',
        });

        const meets = await getMeets();

        expect(meets).toHaveLength(3);
        expect(meets[0].name).toBe('Newest');
        expect(meets[1].name).toBe('Middle');
        expect(meets[2].name).toBe('Oldest');
      });
    });

    describe('getMeetById', () => {
      it('should return meet by ID', async () => {
        const id = await addMeet({
          name: 'Find Me',
          date: { toMillis: () => Date.now() },
          season: '2024-2025',
          location: 'Test Location',
        });

        const meet = await getMeetById(id);

        expect(meet).toBeTruthy();
        expect(meet?.id).toBe(id);
        expect(meet?.name).toBe('Find Me');
        expect(meet?.location).toBe('Test Location');
      });

      it('should return null for non-existent ID', async () => {
        const meet = await getMeetById('non-existent-id');
        expect(meet).toBeNull();
      });
    });

    describe('updateMeet', () => {
      it('should update meet name', async () => {
        const id = await addMeet({
          name: 'Original',
          date: { toMillis: () => Date.now() },
          season: '2024-2025',
        });

        await updateMeet(id, { name: 'Updated Name' });

        const meet = await getMeetById(id);
        expect(meet?.name).toBe('Updated Name');
      });

      it('should update meet location', async () => {
        const id = await addMeet({
          name: 'Test Meet',
          date: { toMillis: () => Date.now() },
          season: '2024-2025',
        });

        await updateMeet(id, { location: 'New Location' });

        const meet = await getMeetById(id);
        expect(meet?.location).toBe('New Location');
      });
    });

    describe('deleteMeet', () => {
      it('should delete a meet', async () => {
        const id = await addMeet({
          name: 'To Delete',
          date: { toMillis: () => Date.now() },
          season: '2024-2025',
        });

        await deleteMeet(id);

        const meet = await getMeetById(id);
        expect(meet).toBeNull();
      });
    });
  });

  describe('Score Operations', () => {
    let gymnastId: string;
    let meetId: string;

    beforeEach(async () => {
      // Create a gymnast and meet for score tests
      gymnastId = await addGymnast({
        name: 'Test Gymnast',
        level: 'Level 5',
        discipline: 'Womens',
      });

      meetId = await addMeet({
        name: 'Test Meet',
        date: { toMillis: () => Date.now() },
        season: '2024-2025',
      });
    });

    describe('addScore', () => {
      it('should add a score for womens gymnastics', async () => {
        const scoreData = {
          gymnastId,
          meetId,
          scores: {
            vault: 9.5,
            bars: 9.3,
            beam: 9.4,
            floor: 9.6,
            allAround: 37.8,
          },
          placements: {},
        };

        const id = await addScore(scoreData);

        expect(id).toBeTruthy();

        const scores = await getScoresByMeet(meetId);
        expect(scores).toHaveLength(1);
        expect(scores[0].scores.vault).toBe(9.5);
        expect(scores[0].scores.bars).toBe(9.3);
        expect(scores[0].scores.allAround).toBe(37.8);
      });

      it('should add score for mens gymnastics', async () => {
        const mensGymnastId = await addGymnast({
          name: 'Male Gymnast',
          level: 'Level 5',
          discipline: 'Mens',
        });

        const scoreData = {
          gymnastId: mensGymnastId,
          meetId,
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
        };

        const id = await addScore(scoreData);
        const score = await getScoreById(id);

        expect(score).toBeTruthy();
        expect(score?.scores.floor).toBe(9.0);
        expect(score?.scores.highBar).toBe(9.5);
        expect(score?.scores.allAround).toBe(55.5);
      });

      it('should add score with placements', async () => {
        const scoreData = {
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
        };

        const id = await addScore(scoreData);
        const score = await getScoreById(id);

        expect(score?.placements?.vault).toBe(1);
        expect(score?.placements?.bars).toBe(2);
        expect(score?.placements?.allAround).toBe(1);
      });
    });

    describe('getScoresByGymnast', () => {
      it('should return all scores for a gymnast', async () => {
        const meet1 = await addMeet({ name: 'Meet 1', date: { toMillis: () => Date.now() }, season: '2024-2025' });
        const meet2 = await addMeet({ name: 'Meet 2', date: { toMillis: () => Date.now() }, season: '2024-2025' });

        await addScore({
          gymnastId,
          meetId: meet1,
          scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
          placements: {},
        });

        await addScore({
          gymnastId,
          meetId: meet2,
          scores: { vault: 9.6, bars: 9.4, beam: 9.5, floor: 9.7, allAround: 38.2 },
          placements: {},
        });

        const scores = await getScoresByGymnast(gymnastId);
        expect(scores).toHaveLength(2);
      });

      it('should return empty array for gymnast with no scores', async () => {
        const scores = await getScoresByGymnast(gymnastId);
        expect(scores).toEqual([]);
      });
    });

    describe('getScoresByMeet', () => {
      it('should return all scores for a meet', async () => {
        const gymnast2 = await addGymnast({
          name: 'Gymnast 2',
          level: 'Level 5',
          discipline: 'Womens',
        });

        await addScore({
          gymnastId,
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

        const scores = await getScoresByMeet(meetId);
        expect(scores).toHaveLength(2);
      });
    });

    describe('updateScore', () => {
      it('should update score values', async () => {
        const id = await addScore({
          gymnastId,
          meetId,
          scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
          placements: {},
        });

        await updateScore(id, {
          scores: { vault: 9.7, bars: 9.5, beam: 9.6, floor: 9.8, allAround: 38.6 },
        });

        const score = await getScoreById(id);
        expect(score?.scores.vault).toBe(9.7);
        expect(score?.scores.allAround).toBe(38.6);
      });

      it('should update placements', async () => {
        const id = await addScore({
          gymnastId,
          meetId,
          scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
          placements: {},
        });

        await updateScore(id, {
          placements: { vault: 1, bars: 2, beam: 1, floor: 1, allAround: 1 },
        });

        const score = await getScoreById(id);
        expect(score?.placements?.vault).toBe(1);
        expect(score?.placements?.allAround).toBe(1);
      });
    });

    describe('deleteScore', () => {
      it('should delete a score', async () => {
        const id = await addScore({
          gymnastId,
          meetId,
          scores: { vault: 9.5, bars: 9.3, beam: 9.4, floor: 9.6, allAround: 37.8 },
          placements: {},
        });

        await deleteScore(id);

        const score = await getScoreById(id);
        expect(score).toBeNull();
      });
    });
  });
});
