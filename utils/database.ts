import * as SQLite from 'expo-sqlite';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { Gymnast, Meet, Score, TeamPlacement } from '@/types';
import { db as firestore } from '@/config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Current database instance
let db: SQLite.SQLiteDatabase | null = null;
let currentUserId: string | null = null;

// Track if database has been initialized
let isInitialized = false;
let isInitializing = false; // Lock to prevent concurrent operations

// Get database name for a user
const getDatabaseName = (userId: string | null): string => {
  if (!userId) {
    return 'scorevault.db'; // Fallback for no user
  }
  return `scorevault_user_${userId}.db`;
};

// Get current database instance
const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    console.error('Database access attempted but db is null. isInitialized:', isInitialized, 'isInitializing:', isInitializing, 'currentUserId:', currentUserId);
    throw new Error(`Database not initialized. isInitialized: ${isInitialized}, isInitializing: ${isInitializing}, currentUserId: ${currentUserId}`);
  }
  return db;
};

// Switch to a different user's database
export const switchDatabase = async (userId: string | null) => {
  const newDbName = getDatabaseName(userId);
  const oldDbName = db ? getDatabaseName(currentUserId) : null;

  // If switching to the same database, do nothing
  if (oldDbName === newDbName && db && isInitialized) {
    console.log('Already using database:', newDbName);
    return;
  }

  // Wait for any pending initialization to finish
  while (isInitializing) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('Switching database from', oldDbName, 'to', newDbName);

  // Reset all state
  db = null;
  currentUserId = null;
  isInitialized = false;

  // Initialize from scratch with the new userId
  try {
    await initDatabase(userId);
    console.log('Database switched to:', newDbName);
  } catch (error) {
    console.error('Error switching database:', error);
    throw error;
  }
};

// Delete user's database file
export const deleteDatabase = async (userId: string): Promise<void> => {
  try {
    const dbName = getDatabaseName(userId);
    console.log('Deleting database:', dbName);

    // Close current database if it's the one being deleted
    if (db && currentUserId === userId) {
      db.closeSync();
      db = null;
      currentUserId = null;
      isInitialized = false;
    }

    // Delete the database file
    await SQLite.deleteDatabaseAsync(dbName);
    console.log('Database deleted successfully');
  } catch (error) {
    console.error('Error deleting database:', error);
    throw error;
  }
};

// Migrate data from old database to user-specific database
export const migrateToUserDatabase = async (userId: string) => {
  const oldDbName = 'scorevault.db';
  const newDbName = getDatabaseName(userId);

  try {
    // Check if old database exists and has data
    const oldDb = SQLite.openDatabaseSync(oldDbName);
    const tables = await oldDb.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('gymnasts', 'meets', 'scores', 'team_placements')"
    );

    if (tables.length === 0) {
      console.log('No data to migrate');
      oldDb.closeSync();
      return;
    }

    // Open new database (should already be initialized by switchDatabase)
    const newDb = SQLite.openDatabaseSync(newDbName);

    // Check if new database already has data
    const gymnastCount = await newDb.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM gymnasts');

    if (gymnastCount && gymnastCount.count > 0) {
      console.log('User database already has data, skipping migration');
      oldDb.closeSync();
      newDb.closeSync();
      return;
    }

    console.log('Migrating data from', oldDbName, 'to', newDbName);

    // Copy all tables
    const tablesToMigrate = ['gymnasts', 'meets', 'scores', 'team_placements', 'user_profile'];

    for (const table of tablesToMigrate) {
      try {
        const rows = await oldDb.getAllAsync(`SELECT * FROM ${table}`);
        if (rows.length > 0) {
          // Get column names
          const columns = Object.keys(rows[0] as Record<string, any>);
          const placeholders = columns.map(() => '?').join(',');
          const columnNames = columns.join(',');

          // Insert each row
          for (const row of rows) {
            const values = columns.map(col => (row as any)[col]);
            await newDb.runAsync(
              `INSERT OR REPLACE INTO ${table} (${columnNames}) VALUES (${placeholders})`,
              values
            );
          }
          console.log(`Migrated ${rows.length} rows from ${table}`);
        }
      } catch (error) {
        console.log(`Skipping table ${table}:`, error);
      }
    }

    console.log('Migration completed successfully');
    oldDb.closeSync();
    newDb.closeSync();
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Initialize database tables
export const initDatabase = async (userId: string | null = null) => {
  // Wait for any pending initialization to finish
  while (isInitializing) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // If already initialized, do nothing
  if (db && isInitialized) {
    console.log('Database already initialized, skipping');
    return;
  }

  // Set the lock
  isInitializing = true;

  try {
    const dbName = getDatabaseName(userId);
    console.log('Opening database:', dbName);

    // Use a LOCAL variable for all initialization
    // This prevents race conditions where db could be set to null mid-initialization
    const localDb = SQLite.openDatabaseSync(dbName);

    // --- CRITICAL SECTION: All initialization happens on localDb ---

    // Create gymnasts table
    await localDb.execAsync(`
      CREATE TABLE IF NOT EXISTS gymnasts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        dateOfBirth INTEGER,
        usagNumber TEXT,
        level TEXT NOT NULL,
        discipline TEXT NOT NULL,
        photoUri TEXT,
        isHidden INTEGER DEFAULT 0,
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_gymnasts_createdAt ON gymnasts(createdAt);
    `);

    // Add isHidden column if it doesn't exist (for existing databases)
    try {
      const result = await localDb.getAllAsync<{ name: string }>(`PRAGMA table_info(gymnasts)`);
      const hasIsHidden = result.some(col => col.name === 'isHidden');
      if (!hasIsHidden) {
        await localDb.execAsync(`ALTER TABLE gymnasts ADD COLUMN isHidden INTEGER DEFAULT 0`);
      }
    } catch (error) {
      console.error('Error checking isHidden column:', error);
    }

    // Add photoUri column if it doesn't exist (for existing databases)
    try {
      const result = await localDb.getAllAsync<{ name: string }>(`PRAGMA table_info(gymnasts)`);
      const hasPhotoUri = result.some(col => col.name === 'photoUri');
      if (!hasPhotoUri) {
        await localDb.execAsync(`ALTER TABLE gymnasts ADD COLUMN photoUri TEXT`);
      }
    } catch (error) {
      console.error('Error checking photoUri column:', error);
    }

    // Create meets table
    await localDb.execAsync(`
      CREATE TABLE IF NOT EXISTS meets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date INTEGER NOT NULL,
        season TEXT NOT NULL,
        location TEXT,
        createdAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_meets_date ON meets(date);
      CREATE INDEX IF NOT EXISTS idx_meets_season ON meets(season);
    `);

    // Create scores table
    await localDb.execAsync(`
      CREATE TABLE IF NOT EXISTS scores (
        id TEXT PRIMARY KEY,
        meetId TEXT NOT NULL,
        gymnastId TEXT NOT NULL,
        level TEXT,
        vault REAL,
        bars REAL,
        beam REAL,
        floor REAL,
        pommelHorse REAL,
        rings REAL,
        parallelBars REAL,
        highBar REAL,
        allAround REAL NOT NULL,
        vaultPlacement INTEGER,
        barsPlacement INTEGER,
        beamPlacement INTEGER,
        floorPlacement INTEGER,
        pommelHorsePlacement INTEGER,
        ringsPlacement INTEGER,
        parallelBarsPlacement INTEGER,
        highBarPlacement INTEGER,
        allAroundPlacement INTEGER,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (meetId) REFERENCES meets(id) ON DELETE CASCADE,
        FOREIGN KEY (gymnastId) REFERENCES gymnasts(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_scores_meetId ON scores(meetId);
      CREATE INDEX IF NOT EXISTS idx_scores_gymnastId ON scores(gymnastId);
    `);

    // Create team_placements table
    await localDb.execAsync(`
      CREATE TABLE IF NOT EXISTS team_placements (
        id TEXT PRIMARY KEY,
        meetId TEXT NOT NULL,
        level TEXT NOT NULL,
        discipline TEXT NOT NULL,
        vaultPlacement INTEGER,
        barsPlacement INTEGER,
        beamPlacement INTEGER,
        floorPlacement INTEGER,
        pommelHorsePlacement INTEGER,
        ringsPlacement INTEGER,
        parallelBarsPlacement INTEGER,
        highBarPlacement INTEGER,
        allAroundPlacement INTEGER,
        createdAt INTEGER NOT NULL,
        FOREIGN KEY (meetId) REFERENCES meets(id) ON DELETE CASCADE,
        UNIQUE(meetId, level, discipline)
      );
      CREATE INDEX IF NOT EXISTS idx_team_placements_meetId ON team_placements(meetId);
      CREATE INDEX IF NOT EXISTS idx_team_placements_level ON team_placements(level);
    `);

    // --- END CRITICAL SECTION ---

    // ONLY set the global variables at the very end when everything is 100% ready
    db = localDb;
    currentUserId = userId;
    isInitialized = true;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    // Release the lock no matter what
    isInitializing = false;
  }
};

// Helper function to generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to convert timestamp to milliseconds
const timestampToMs = (timestamp: any): number => {
  if (!timestamp) return Date.now();
  if (typeof timestamp === 'number') return timestamp;
  if (timestamp.toMillis) return timestamp.toMillis();
  if (timestamp instanceof Date) return timestamp.getTime();
  return Date.now();
};

// ========== GYMNAST OPERATIONS ==========

export const addGymnast = async (data: Omit<Gymnast, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const id = generateId();
  const createdAt = Date.now();
  const dateOfBirth = data.dateOfBirth ? timestampToMs(data.dateOfBirth) : null;

  await getDb().runAsync(
    `INSERT INTO gymnasts (id, name, dateOfBirth, usagNumber, level, discipline, photoUri, isHidden, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, dateOfBirth, data.usagNumber || null, data.level, data.discipline, data.photoUri || null, 0, createdAt]
  );

  return id;
};

export const getGymnasts = async (includeHidden: boolean = false): Promise<Gymnast[]> => {
  let result;

  try {
    const query = includeHidden
      ? 'SELECT * FROM gymnasts ORDER BY createdAt DESC'
      : 'SELECT * FROM gymnasts WHERE isHidden = 0 ORDER BY createdAt DESC';

    result = await getDb().getAllAsync<any>(query);
  } catch (error) {
    // Column might not exist yet - fall back to getting all gymnasts
    console.log('isHidden column not found, fetching all gymnasts');
    result = await getDb().getAllAsync<any>('SELECT * FROM gymnasts ORDER BY createdAt DESC');
  }

  return result.map(row => ({
    id: row.id,
    userId: 'local', // No longer using userId since data is local
    name: row.name,
    dateOfBirth: row.dateOfBirth ? { toMillis: () => row.dateOfBirth } : undefined,
    usagNumber: row.usagNumber || undefined,
    level: row.level,
    discipline: row.discipline as 'Womens' | 'Mens',
    photoUri: row.photoUri || undefined,
    isHidden: row.isHidden === 1,
    createdAt: { toMillis: () => row.createdAt, toDate: () => new Date(row.createdAt) }
  })) as Gymnast[];
};

export const getGymnastById = async (id: string): Promise<Gymnast | null> => {
  const result = await getDb().getFirstAsync<any>('SELECT * FROM gymnasts WHERE id = ?', [id]);

  if (!result) return null;

  return {
    id: result.id,
    userId: 'local',
    name: result.name,
    dateOfBirth: result.dateOfBirth ? { toMillis: () => result.dateOfBirth } : undefined,
    usagNumber: result.usagNumber || undefined,
    level: result.level,
    discipline: result.discipline as 'Womens' | 'Mens',
    photoUri: result.photoUri || undefined,
    isHidden: result.isHidden === 1,
    createdAt: { toMillis: () => result.createdAt, toDate: () => new Date(result.createdAt) }
  } as Gymnast;
};

export const hideGymnast = async (id: string): Promise<void> => {
  try {
    await getDb().runAsync('UPDATE gymnasts SET isHidden = 1 WHERE id = ?', [id]);
  } catch (error) {
    // Column might not exist - try to add it first
    try {
      await getDb().execAsync(`ALTER TABLE gymnasts ADD COLUMN isHidden INTEGER DEFAULT 0`);
      await getDb().runAsync('UPDATE gymnasts SET isHidden = 1 WHERE id = ?', [id]);
    } catch (e) {
      throw new Error('Failed to hide gymnast. Please restart the app and try again.');
    }
  }
};

export const unhideGymnast = async (id: string): Promise<void> => {
  try {
    await getDb().runAsync('UPDATE gymnasts SET isHidden = 0 WHERE id = ?', [id]);
  } catch (error) {
    throw new Error('Failed to unhide gymnast. Please restart the app and try again.');
  }
};

export const getHiddenGymnasts = async (): Promise<Gymnast[]> => {
  try {
    const result = await getDb().getAllAsync<any>('SELECT * FROM gymnasts WHERE isHidden = 1 ORDER BY createdAt DESC');

    return result.map(row => ({
      id: row.id,
      userId: 'local',
      name: row.name,
      dateOfBirth: row.dateOfBirth ? { toMillis: () => row.dateOfBirth } : undefined,
      usagNumber: row.usagNumber || undefined,
      level: row.level,
      discipline: row.discipline as 'Womens' | 'Mens',
      photoUri: row.photoUri || undefined,
      isHidden: row.isHidden === 1,
      createdAt: { toMillis: () => row.createdAt, toDate: () => new Date(row.createdAt) }
    })) as Gymnast[];
  } catch (error) {
    // Column might not exist yet - return empty array
    console.log('isHidden column not found, returning empty array');
    return [];
  }
};

export const updateGymnast = async (id: string, data: Partial<Omit<Gymnast, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.dateOfBirth !== undefined) {
    updates.push('dateOfBirth = ?');
    values.push(data.dateOfBirth ? timestampToMs(data.dateOfBirth) : null);
  }
  if (data.usagNumber !== undefined) {
    updates.push('usagNumber = ?');
    values.push(data.usagNumber || null);
  }
  if (data.level !== undefined) {
    updates.push('level = ?');
    values.push(data.level);
  }
  if (data.discipline !== undefined) {
    updates.push('discipline = ?');
    values.push(data.discipline);
  }
  if (data.photoUri !== undefined) {
    updates.push('photoUri = ?');
    values.push(data.photoUri || null);
  }

  if (updates.length === 0) return;

  values.push(id);
  await getDb().runAsync(
    `UPDATE gymnasts SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteGymnast = async (id: string): Promise<void> => {
  // Delete gymnast (scores will be cascade deleted)
  await getDb().runAsync('DELETE FROM gymnasts WHERE id = ?', [id]);
};

// ========== MEET OPERATIONS ==========

export const addMeet = async (data: Omit<Meet, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const id = generateId();
  const createdAt = Date.now();
  const date = timestampToMs(data.date);

  await getDb().runAsync(
    `INSERT INTO meets (id, name, date, season, location, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.name, date, data.season, data.location || null, createdAt]
  );

  return id;
};

export const getMeets = async (): Promise<Meet[]> => {
  const result = await getDb().getAllAsync<any>('SELECT * FROM meets ORDER BY date DESC');

  return result.map(row => ({
    id: row.id,
    userId: 'local',
    name: row.name,
    date: { toMillis: () => row.date, toDate: () => new Date(row.date) },
    season: row.season,
    location: row.location || undefined,
    createdAt: { toMillis: () => row.createdAt, toDate: () => new Date(row.createdAt) }
  })) as Meet[];
};

export const getMeetById = async (id: string): Promise<Meet | null> => {
  const result = await getDb().getFirstAsync<any>('SELECT * FROM meets WHERE id = ?', [id]);

  if (!result) return null;

  return {
    id: result.id,
    userId: 'local',
    name: result.name,
    date: { toMillis: () => result.date, toDate: () => new Date(result.date) },
    season: result.season,
    location: result.location || undefined,
    createdAt: { toMillis: () => result.createdAt, toDate: () => new Date(result.createdAt) }
  } as Meet;
};

export const updateMeet = async (id: string, data: Partial<Omit<Meet, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.date !== undefined) {
    updates.push('date = ?');
    values.push(timestampToMs(data.date));
  }
  if (data.season !== undefined) {
    updates.push('season = ?');
    values.push(data.season);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    values.push(data.location || null);
  }

  if (updates.length === 0) return;

  values.push(id);
  await getDb().runAsync(
    `UPDATE meets SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteMeet = async (id: string): Promise<void> => {
  // Delete meet (scores will be cascade deleted)
  await getDb().runAsync('DELETE FROM meets WHERE id = ?', [id]);
};

// ========== SCORE OPERATIONS ==========

export const addScore = async (data: Omit<Score, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
  const id = generateId();
  const createdAt = Date.now();

  await getDb().runAsync(
    `INSERT INTO scores (
      id, meetId, gymnastId, level, vault, bars, beam, floor,
      pommelHorse, rings, parallelBars, highBar, allAround,
      vaultPlacement, barsPlacement, beamPlacement, floorPlacement,
      pommelHorsePlacement, ringsPlacement, parallelBarsPlacement, highBarPlacement,
      allAroundPlacement, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.meetId, data.gymnastId, data.level || null,
      data.scores.vault || null, data.scores.bars || null, data.scores.beam || null, data.scores.floor || null,
      data.scores.pommelHorse || null, data.scores.rings || null, data.scores.parallelBars || null, data.scores.highBar || null,
      data.scores.allAround,
      data.placements.vault || null, data.placements.bars || null, data.placements.beam || null, data.placements.floor || null,
      data.placements.pommelHorse || null, data.placements.rings || null, data.placements.parallelBars || null, data.placements.highBar || null,
      data.placements.allAround || null,
      createdAt
    ]
  );

  return id;
};

export const getScores = async (): Promise<Score[]> => {
  const result = await getDb().getAllAsync<any>('SELECT * FROM scores ORDER BY createdAt DESC');

  return result.map(rowToScore);
};

export const getScoresByGymnast = async (gymnastId: string): Promise<Score[]> => {
  const result = await getDb().getAllAsync<any>('SELECT * FROM scores WHERE gymnastId = ? ORDER BY createdAt DESC', [gymnastId]);

  return result.map(rowToScore);
};

export const getScoresByMeet = async (meetId: string): Promise<Score[]> => {
  const result = await getDb().getAllAsync<any>('SELECT * FROM scores WHERE meetId = ? ORDER BY createdAt DESC', [meetId]);

  return result.map(rowToScore);
};

export const getScoreById = async (id: string): Promise<Score | null> => {
  const result = await getDb().getFirstAsync<any>('SELECT * FROM scores WHERE id = ?', [id]);

  if (!result) return null;
  return rowToScore(result);
};

export const updateScore = async (id: string, data: Partial<Omit<Score, 'id' | 'userId' | 'createdAt'>>): Promise<void> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (data.meetId !== undefined) {
    updates.push('meetId = ?');
    values.push(data.meetId);
  }
  if (data.gymnastId !== undefined) {
    updates.push('gymnastId = ?');
    values.push(data.gymnastId);
  }
  if (data.level !== undefined) {
    updates.push('level = ?');
    values.push(data.level || null);
  }

  // Update scores
  if (data.scores) {
    if (data.scores.vault !== undefined) {
      updates.push('vault = ?');
      values.push(data.scores.vault || null);
    }
    if (data.scores.bars !== undefined) {
      updates.push('bars = ?');
      values.push(data.scores.bars || null);
    }
    if (data.scores.beam !== undefined) {
      updates.push('beam = ?');
      values.push(data.scores.beam || null);
    }
    if (data.scores.floor !== undefined) {
      updates.push('floor = ?');
      values.push(data.scores.floor || null);
    }
    if (data.scores.pommelHorse !== undefined) {
      updates.push('pommelHorse = ?');
      values.push(data.scores.pommelHorse || null);
    }
    if (data.scores.rings !== undefined) {
      updates.push('rings = ?');
      values.push(data.scores.rings || null);
    }
    if (data.scores.parallelBars !== undefined) {
      updates.push('parallelBars = ?');
      values.push(data.scores.parallelBars || null);
    }
    if (data.scores.highBar !== undefined) {
      updates.push('highBar = ?');
      values.push(data.scores.highBar || null);
    }
    if (data.scores.allAround !== undefined) {
      updates.push('allAround = ?');
      values.push(data.scores.allAround);
    }
  }

  // Update placements
  if (data.placements) {
    if (data.placements.vault !== undefined) {
      updates.push('vaultPlacement = ?');
      values.push(data.placements.vault || null);
    }
    if (data.placements.bars !== undefined) {
      updates.push('barsPlacement = ?');
      values.push(data.placements.bars || null);
    }
    if (data.placements.beam !== undefined) {
      updates.push('beamPlacement = ?');
      values.push(data.placements.beam || null);
    }
    if (data.placements.floor !== undefined) {
      updates.push('floorPlacement = ?');
      values.push(data.placements.floor || null);
    }
    if (data.placements.pommelHorse !== undefined) {
      updates.push('pommelHorsePlacement = ?');
      values.push(data.placements.pommelHorse || null);
    }
    if (data.placements.rings !== undefined) {
      updates.push('ringsPlacement = ?');
      values.push(data.placements.rings || null);
    }
    if (data.placements.parallelBars !== undefined) {
      updates.push('parallelBarsPlacement = ?');
      values.push(data.placements.parallelBars || null);
    }
    if (data.placements.highBar !== undefined) {
      updates.push('highBarPlacement = ?');
      values.push(data.placements.highBar || null);
    }
    if (data.placements.allAround !== undefined) {
      updates.push('allAroundPlacement = ?');
      values.push(data.placements.allAround || null);
    }
  }

  if (updates.length === 0) return;

  values.push(id);
  await getDb().runAsync(
    `UPDATE scores SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
};

export const deleteScore = async (id: string): Promise<void> => {
  await getDb().runAsync('DELETE FROM scores WHERE id = ?', [id]);
};

// Helper function to convert database row to Score object
const rowToScore = (row: any): Score => ({
  id: row.id,
  meetId: row.meetId,
  gymnastId: row.gymnastId,
  userId: 'local',
  level: row.level || undefined,
  scores: {
    vault: row.vault || undefined,
    bars: row.bars || undefined,
    beam: row.beam || undefined,
    floor: row.floor || undefined,
    pommelHorse: row.pommelHorse || undefined,
    rings: row.rings || undefined,
    parallelBars: row.parallelBars || undefined,
    highBar: row.highBar || undefined,
    allAround: row.allAround
  },
  placements: {
    vault: row.vaultPlacement || undefined,
    bars: row.barsPlacement || undefined,
    beam: row.beamPlacement || undefined,
    floor: row.floorPlacement || undefined,
    pommelHorse: row.pommelHorsePlacement || undefined,
    rings: row.ringsPlacement || undefined,
    parallelBars: row.parallelBarsPlacement || undefined,
    highBar: row.highBarPlacement || undefined,
    allAround: row.allAroundPlacement || undefined
  },
  createdAt: { toMillis: () => row.createdAt, toDate: () => new Date(row.createdAt) }
});

// ========== STATISTICS & QUERIES ==========

export const getScoreCountByGymnast = async (gymnastId: string): Promise<number> => {
  const result = await getDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(DISTINCT meetId) as count FROM scores WHERE gymnastId = ?',
    [gymnastId]
  );
  return result?.count || 0;
};

export const getScoreCountByMeet = async (meetId: string): Promise<number> => {
  const result = await getDb().getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM scores WHERE meetId = ?',
    [meetId]
  );
  return result?.count || 0;
};

// ========== TEAM PLACEMENTS ==========

// Helper function to convert database row to TeamPlacement
const rowToTeamPlacement = (row: any): TeamPlacement => ({
  id: row.id,
  userId: '', // Team placements are shared across users in local storage
  meetId: row.meetId,
  level: row.level,
  discipline: row.discipline,
  placements: {
    vault: row.vaultPlacement,
    bars: row.barsPlacement,
    beam: row.beamPlacement,
    floor: row.floorPlacement,
    pommelHorse: row.pommelHorsePlacement,
    rings: row.ringsPlacement,
    parallelBars: row.parallelBarsPlacement,
    highBar: row.highBarPlacement,
    allAround: row.allAroundPlacement
  },
  createdAt: { toMillis: () => row.createdAt, toDate: () => new Date(row.createdAt) }
});

export const saveTeamPlacement = async (
  meetId: string,
  level: string,
  discipline: 'Womens' | 'Mens',
  placements: Partial<{
    vault?: number;
    bars?: number;
    beam?: number;
    floor?: number;
    pommelHorse?: number;
    rings?: number;
    parallelBars?: number;
    highBar?: number;
    allAround?: number;
  }>
): Promise<string> => {
  const createdAt = Date.now();

  // Check if entry exists
  const existing = await getDb().getFirstAsync<any>(
    'SELECT id FROM team_placements WHERE meetId = ? AND level = ? AND discipline = ?',
    [meetId, level, discipline]
  );

  if (existing) {
    // Update existing
    await getDb().runAsync(
      `UPDATE team_placements SET
        vaultPlacement = ?,
        barsPlacement = ?,
        beamPlacement = ?,
        floorPlacement = ?,
        pommelHorsePlacement = ?,
        ringsPlacement = ?,
        parallelBarsPlacement = ?,
        highBarPlacement = ?,
        allAroundPlacement = ?
      WHERE id = ?`,
      [
        placements.vault || null,
        placements.bars || null,
        placements.beam || null,
        placements.floor || null,
        placements.pommelHorse || null,
        placements.rings || null,
        placements.parallelBars || null,
        placements.highBar || null,
        placements.allAround || null,
        existing.id
      ]
    );
    return existing.id;
  } else {
    // Insert new
    const id = generateId();
    await getDb().runAsync(
      `INSERT INTO team_placements (
        id, meetId, level, discipline,
        vaultPlacement, barsPlacement, beamPlacement, floorPlacement,
        pommelHorsePlacement, ringsPlacement, parallelBarsPlacement, highBarPlacement,
        allAroundPlacement, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, meetId, level, discipline,
        placements.vault || null,
        placements.bars || null,
        placements.beam || null,
        placements.floor || null,
        placements.pommelHorse || null,
        placements.rings || null,
        placements.parallelBars || null,
        placements.highBar || null,
        placements.allAround || null,
        createdAt
      ]
    );
    return id;
  }
};

export const getTeamPlacement = async (
  meetId: string,
  level: string,
  discipline: 'Womens' | 'Mens'
): Promise<TeamPlacement | null> => {
  const result = await getDb().getFirstAsync<any>(
    'SELECT * FROM team_placements WHERE meetId = ? AND level = ? AND discipline = ?',
    [meetId, level, discipline]
  );

  return result ? rowToTeamPlacement(result) : null;
};

export const getTeamPlacementsByMeet = async (meetId: string): Promise<TeamPlacement[]> => {
  const result = await getDb().getAllAsync<any>(
    'SELECT * FROM team_placements WHERE meetId = ?',
    [meetId]
  );

  return result.map(rowToTeamPlacement);
};

export const deleteTeamPlacement = async (id: string): Promise<void> => {
  await getDb().runAsync('DELETE FROM team_placements WHERE id = ?', [id]);
};

// ========== DATA EXPORT/IMPORT ==========

export const getAllTeamPlacements = async (): Promise<TeamPlacement[]> => {
  const result = await getDb().getAllAsync<any>('SELECT * FROM team_placements ORDER BY createdAt DESC');
  return result.map(rowToTeamPlacement);
};

export const exportAllData = async (): Promise<{ gymnasts: Gymnast[]; meets: Meet[]; scores: Score[]; teamPlacements: TeamPlacement[] }> => {
  const gymnasts = await getGymnasts();
  const meets = await getMeets();
  const scores = await getScores();
  const teamPlacements = await getAllTeamPlacements();

  return { gymnasts, meets, scores, teamPlacements };
};

export const importAllData = async (data: { gymnasts: any[]; meets: any[]; scores: any[]; teamPlacements?: any[] }): Promise<void> => {
  try {
    // Clear existing data
    await getDb().execAsync('DELETE FROM team_placements; DELETE FROM scores; DELETE FROM meets; DELETE FROM gymnasts;');

    // Import gymnasts
    for (const gymnast of data.gymnasts) {
      await getDb().runAsync(
        `INSERT INTO gymnasts (id, name, dateOfBirth, usagNumber, level, discipline, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          gymnast.id,
          gymnast.name,
          gymnast.dateOfBirth ? timestampToMs(gymnast.dateOfBirth) : null,
          gymnast.usagNumber || null,
          gymnast.level,
          gymnast.discipline,
          timestampToMs(gymnast.createdAt)
        ]
      );
    }

    // Import meets
    for (const meet of data.meets) {
      await getDb().runAsync(
        `INSERT INTO meets (id, name, date, season, location, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          meet.id,
          meet.name,
          timestampToMs(meet.date),
          meet.season,
          meet.location || null,
          timestampToMs(meet.createdAt)
        ]
      );
    }

    // Import scores
    for (const score of data.scores) {
      await getDb().runAsync(
        `INSERT INTO scores (
          id, meetId, gymnastId, level, vault, bars, beam, floor,
          pommelHorse, rings, parallelBars, highBar, allAround,
          vaultPlacement, barsPlacement, beamPlacement, floorPlacement,
          pommelHorsePlacement, ringsPlacement, parallelBarsPlacement, highBarPlacement,
          allAroundPlacement, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          score.id,
          score.meetId,
          score.gymnastId,
          score.level || null,
          score.scores.vault || null,
          score.scores.bars || null,
          score.scores.beam || null,
          score.scores.floor || null,
          score.scores.pommelHorse || null,
          score.scores.rings || null,
          score.scores.parallelBars || null,
          score.scores.highBar || null,
          score.scores.allAround,
          score.placements.vault || null,
          score.placements.bars || null,
          score.placements.beam || null,
          score.placements.floor || null,
          score.placements.pommelHorse || null,
          score.placements.rings || null,
          score.placements.parallelBars || null,
          score.placements.highBar || null,
          score.placements.allAround || null,
          timestampToMs(score.createdAt)
        ]
      );
    }

    // Import team placements
    if (data.teamPlacements && data.teamPlacements.length > 0) {
      for (const placement of data.teamPlacements) {
        await getDb().runAsync(
          `INSERT INTO team_placements (
            id, meetId, level, discipline,
            vaultPlacement, barsPlacement, beamPlacement, floorPlacement,
            pommelHorsePlacement, ringsPlacement, parallelBarsPlacement, highBarPlacement,
            allAroundPlacement, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            placement.id,
            placement.meetId,
            placement.level,
            placement.discipline,
            placement.placements.vault || null,
            placement.placements.bars || null,
            placement.placements.beam || null,
            placement.placements.floor || null,
            placement.placements.pommelHorse || null,
            placement.placements.rings || null,
            placement.placements.parallelBars || null,
            placement.placements.highBar || null,
            placement.placements.allAround || null,
            timestampToMs(placement.createdAt)
          ]
        );
      }
    }

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// ========== FIREBASE CLOUD BACKUP ==========

// Backup all local data to Firebase
export const backupToFirebase = async (userId: string): Promise<{ success: boolean; timestamp: number; error?: string }> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for backup');
    }

    const allData = await exportAllData();
    const timestamp = Date.now();

    // Serialize data for Firestore (convert timestamp objects to numbers, undefined to null)
    const serializedData = {
      gymnasts: allData.gymnasts.map(g => ({
        id: g.id,
        userId: g.userId,
        name: g.name,
        dateOfBirth: g.dateOfBirth ? timestampToMs(g.dateOfBirth) : null,
        usagNumber: g.usagNumber || null,
        level: g.level,
        discipline: g.discipline,
        createdAt: timestampToMs(g.createdAt)
      })),
      meets: allData.meets.map(m => ({
        id: m.id,
        userId: m.userId,
        name: m.name,
        date: timestampToMs(m.date),
        season: m.season,
        location: m.location || null,
        createdAt: timestampToMs(m.createdAt)
      })),
      scores: allData.scores.map(s => ({
        id: s.id,
        meetId: s.meetId,
        gymnastId: s.gymnastId,
        userId: s.userId,
        level: s.level || null,
        scores: {
          vault: s.scores.vault || null,
          bars: s.scores.bars || null,
          beam: s.scores.beam || null,
          floor: s.scores.floor || null,
          pommelHorse: s.scores.pommelHorse || null,
          rings: s.scores.rings || null,
          parallelBars: s.scores.parallelBars || null,
          highBar: s.scores.highBar || null,
          allAround: s.scores.allAround
        },
        placements: {
          vault: s.placements.vault || null,
          bars: s.placements.bars || null,
          beam: s.placements.beam || null,
          floor: s.placements.floor || null,
          pommelHorse: s.placements.pommelHorse || null,
          rings: s.placements.rings || null,
          parallelBars: s.placements.parallelBars || null,
          highBar: s.placements.highBar || null,
          allAround: s.placements.allAround || null
        },
        createdAt: timestampToMs(s.createdAt)
      })),
      teamPlacements: allData.teamPlacements.map(tp => ({
        id: tp.id,
        userId: tp.userId,
        meetId: tp.meetId,
        level: tp.level,
        discipline: tp.discipline,
        placements: {
          vault: tp.placements.vault || null,
          bars: tp.placements.bars || null,
          beam: tp.placements.beam || null,
          floor: tp.placements.floor || null,
          pommelHorse: tp.placements.pommelHorse || null,
          rings: tp.placements.rings || null,
          parallelBars: tp.placements.parallelBars || null,
          highBar: tp.placements.highBar || null,
          allAround: tp.placements.allAround || null
        },
        createdAt: timestampToMs(tp.createdAt)
      }))
    };

    // Store backup in Firestore using userId as the document ID
    const backupRef = doc(firestore, 'backups', userId);
    await setDoc(backupRef, {
      data: serializedData,
      timestamp,
      lastBackup: serverTimestamp(),
      userId
    });

    console.log('Backup successful:', { userId, timestamp });
    return { success: true, timestamp };
  } catch (error: any) {
    console.error('Backup failed:', error);
    return { success: false, timestamp: Date.now(), error: error.message || 'Backup failed' };
  }
};

// Restore data from Firebase backup
export const restoreFromFirebase = async (userId: string): Promise<{ success: boolean; timestamp?: number; error?: string }> => {
  try {
    if (!userId) {
      throw new Error('User ID is required for restore');
    }

    // Fetch backup from Firestore using userId
    const backupRef = doc(firestore, 'backups', userId);
    const backupSnap = await getDoc(backupRef);

    if (!backupSnap.exists()) {
      return { success: false, error: 'No backup found for this account' };
    }

    const backupData = backupSnap.data();

    if (!backupData.data) {
      return { success: false, error: 'Backup data is corrupted' };
    }

    // CRITICAL: Initialize database for this user before importing data
    console.log('Initializing database for restore:', userId);
    await initDatabase(userId);

    // Import the backup data
    await importAllData(backupData.data);

    console.log('Restore successful:', { userId, timestamp: backupData.timestamp });
    return { success: true, timestamp: backupData.timestamp };
  } catch (error: any) {
    console.error('Restore failed:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
};

// Get last backup info
export const getLastBackupInfo = async (userId: string): Promise<{ timestamp?: number; exists: boolean }> => {
  try {
    if (!userId) {
      return { exists: false };
    }

    const backupRef = doc(firestore, 'backups', userId);
    const backupSnap = await getDoc(backupRef);

    if (!backupSnap.exists()) {
      return { exists: false };
    }

    const backupData = backupSnap.data();
    return { timestamp: backupData.timestamp, exists: true };
  } catch (error) {
    console.error('Error checking backup:', error);
    return { exists: false };
  }
};
