// Timestamp interface compatible with both Firebase and local storage
export interface Timestamp {
  toMillis?: () => number;
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
}

// User type
export interface User {
  id: string;
  email: string;
  createdAt: Timestamp;
}

// Gymnast type
export interface Gymnast {
  id: string;
  userId: string;
  name: string;
  dateOfBirth?: Timestamp;
  usagNumber?: string;
  level: string;
  discipline: 'Womens' | 'Mens';
  isHidden?: boolean;
  createdAt: Timestamp;
}

// Score event data (supports both Womens and Mens)
export interface EventScores {
  // Womens events
  vault?: number;
  bars?: number;
  beam?: number;
  floor?: number;
  // Mens events
  pommelHorse?: number;
  rings?: number;
  parallelBars?: number;
  highBar?: number;
  // Calculated
  allAround: number; // Sum of all event scores
}

// Placement data
export interface Placements {
  // Womens events
  vault?: number;
  bars?: number;
  beam?: number;
  floor?: number;
  // Mens events
  pommelHorse?: number;
  rings?: number;
  parallelBars?: number;
  highBar?: number;
  // All around
  allAround?: number;
}

// Meet/Competition
export interface Meet {
  id: string;
  userId: string;
  name: string; // Competition name
  date: Timestamp;
  season: string; // Format: "YYYY-YYYY" (e.g., "2025-2026")
  location?: string;
  createdAt: Timestamp;
}

// Score entry (linked to a meet)
export interface Score {
  id: string;
  meetId: string; // Reference to the meet
  gymnastId: string;
  userId: string;
  level?: string; // Level at time of competition
  scores: EventScores;
  placements: Placements;
  createdAt: Timestamp;
}

// Form data types (used for creating/editing)
export interface GymnastFormData {
  name: string;
  dateOfBirth?: Date;
  usagNumber?: string;
  level: string;
  discipline: 'Womens' | 'Mens';
}

export interface MeetFormData {
  name: string;
  date: Date;
  location?: string;
}

export interface ScoreFormData {
  meetId: string;
  gymnastId: string;
  vault: string; // String for form input, will be converted to number
  bars: string;
  beam: string;
  floor: string;
  vaultPlacement?: string;
  barsPlacement?: string;
  beamPlacement?: string;
  floorPlacement?: string;
  allAroundPlacement?: string;
}

// Social Media Score Card Types
export type GradientName = 'purple' | 'ocean' | 'sunset' | 'forest' | 'royal' | 'fire' | 'skyBlue' | 'rosePink' | 'midnight' | 'crimson';

export type AspectRatio = 'square' | 'story'; // 1:1 or 9:16

export type BackgroundType = 'gradient' | 'photo';

export type DecorativeIcon = 'none' | 'stars' | 'trophy' | 'medal' | 'fire' | 'sparkles';

export interface ScoreCardConfig {
  backgroundType: BackgroundType;
  gradientName: GradientName;
  photoUri?: string;
  aspectRatio: AspectRatio;
  decorativeIcon: DecorativeIcon;
}

export interface ScoreCardData {
  gymnastName: string;
  level: string;
  discipline: 'Womens' | 'Mens';
  meetName: string;
  meetDate: Date;
  location?: string;
  scores: EventScores;
  placements: Placements;
}
