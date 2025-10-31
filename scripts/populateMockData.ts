import {
  addGymnast,
  addMeet,
  addScore,
  saveTeamPlacement
} from '../utils/database';

// Mock data for realistic gymnastics app
// Need at least 3 gymnasts per level/discipline for team scoring
// Using 4 gymnasts and 5 meets to ensure graphs show (need 2+ meets with full teams)
const mockGymnasts = [
  // Women's Level 10 (4 gymnasts)
  { name: 'Emma Johnson', level: 'Level 10', discipline: 'Womens' as const, usagNumber: 'USAG12345' },
  { name: 'Ava Davis', level: 'Level 10', discipline: 'Womens' as const, usagNumber: 'USAG12348' },
  { name: 'Mia Wilson', level: 'Level 10', discipline: 'Womens' as const, usagNumber: 'USAG12350' },
  { name: 'Ella Martinez', level: 'Level 10', discipline: 'Womens' as const, usagNumber: 'USAG12354' },

  // Women's Level 9 (4 gymnasts)
  { name: 'Sophia Martinez', level: 'Level 9', discipline: 'Womens' as const, usagNumber: 'USAG12346' },
  { name: 'Isabella Brown', level: 'Level 9', discipline: 'Womens' as const, usagNumber: 'USAG12349' },
  { name: 'Charlotte Taylor', level: 'Level 9', discipline: 'Womens' as const, usagNumber: 'USAG12351' },
  { name: 'Luna Garcia', level: 'Level 9', discipline: 'Womens' as const, usagNumber: 'USAG12355' },

  // Women's Level 8 (4 gymnasts)
  { name: 'Olivia Williams', level: 'Level 8', discipline: 'Womens' as const, usagNumber: 'USAG12347' },
  { name: 'Amelia Moore', level: 'Level 8', discipline: 'Womens' as const, usagNumber: 'USAG12352' },
  { name: 'Harper Lee', level: 'Level 8', discipline: 'Womens' as const, usagNumber: 'USAG12353' },
  { name: 'Aria Thompson', level: 'Level 8', discipline: 'Womens' as const, usagNumber: 'USAG12356' },

  // Men's Level 10 (4 gymnasts)
  { name: 'Liam Anderson', level: 'Level 10', discipline: 'Mens' as const, usagNumber: 'USAG54321' },
  { name: 'Jackson White', level: 'Level 10', discipline: 'Mens' as const, usagNumber: 'USAG54324' },
  { name: 'Aiden Harris', level: 'Level 10', discipline: 'Mens' as const, usagNumber: 'USAG54325' },
  { name: 'Carter Brown', level: 'Level 10', discipline: 'Mens' as const, usagNumber: 'USAG54330' },

  // Men's Level 9 (4 gymnasts)
  { name: 'Noah Thompson', level: 'Level 9', discipline: 'Mens' as const, usagNumber: 'USAG54322' },
  { name: 'Lucas Martin', level: 'Level 9', discipline: 'Mens' as const, usagNumber: 'USAG54326' },
  { name: 'Oliver Clark', level: 'Level 9', discipline: 'Mens' as const, usagNumber: 'USAG54327' },
  { name: 'Elijah Wilson', level: 'Level 9', discipline: 'Mens' as const, usagNumber: 'USAG54331' },

  // Men's Level 8 (4 gymnasts)
  { name: 'Ethan Garcia', level: 'Level 8', discipline: 'Mens' as const, usagNumber: 'USAG54323' },
  { name: 'Mason Rodriguez', level: 'Level 8', discipline: 'Mens' as const, usagNumber: 'USAG54328' },
  { name: 'Logan Lewis', level: 'Level 8', discipline: 'Mens' as const, usagNumber: 'USAG54329' },
  { name: 'James Davis', level: 'Level 8', discipline: 'Mens' as const, usagNumber: 'USAG54332' },
];

const mockMeets = [
  {
    name: 'State Championship',
    location: 'Phoenix Convention Center',
    season: '2024-2025',
    date: new Date('2024-11-15')
  },
  {
    name: 'Regional Qualifier',
    location: 'Tucson Sports Complex',
    season: '2024-2025',
    date: new Date('2024-10-20')
  },
  {
    name: 'Fall Classic',
    location: 'Mesa Gymnastics Center',
    season: '2024-2025',
    date: new Date('2024-10-05')
  },
  {
    name: 'Invitational Meet',
    location: 'Scottsdale Gym',
    season: '2024-2025',
    date: new Date('2024-09-28')
  },
  {
    name: 'Season Opener',
    location: 'Tempe Sports Arena',
    season: '2024-2025',
    date: new Date('2024-09-14')
  },
];

// Generate random score between min and max
const randomScore = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
};

// Generate random placement between 1 and maxPlace
const randomPlacement = (maxPlace: number): number => {
  return Math.floor(Math.random() * maxPlace) + 1;
};

export async function populateMockData() {
  console.log('Starting mock data population...');

  try {
    // Add gymnasts
    console.log('Adding gymnasts...');
    const gymnastIds: { [key: string]: string } = {};
    for (const gymnast of mockGymnasts) {
      const id = await addGymnast(gymnast);
      gymnastIds[gymnast.name] = id;
      console.log(`Added gymnast: ${gymnast.name}`);
    }

    // Add meets
    console.log('Adding meets...');
    const meetIds: string[] = [];
    for (const meet of mockMeets) {
      const id = await addMeet(meet);
      meetIds.push(id);
      console.log(`Added meet: ${meet.name}`);
    }

    // Add scores for each gymnast at each meet
    console.log('Adding scores...');
    for (const gymnast of mockGymnasts) {
      const gymnastId = gymnastIds[gymnast.name];

      for (const meetId of meetIds) {
        if (gymnast.discipline === 'Womens') {
          // Women's events: vault, bars, beam, floor
          const vault = randomScore(8.5, 9.8);
          const bars = randomScore(8.2, 9.7);
          const beam = randomScore(8.0, 9.6);
          const floor = randomScore(8.5, 9.9);
          const allAround = vault + bars + beam + floor;

          await addScore({
            gymnastId,
            meetId,
            level: gymnast.level,
            scores: {
              vault,
              bars,
              beam,
              floor,
              allAround,
            },
            placements: {
              vault: randomPlacement(8),
              bars: randomPlacement(8),
              beam: randomPlacement(8),
              floor: randomPlacement(8),
              allAround: randomPlacement(8),
            },
          });
        } else {
          // Men's events: floor, pommel horse, rings, vault, parallel bars, high bar
          const floor = randomScore(8.5, 9.8);
          const pommelHorse = randomScore(8.0, 9.5);
          const rings = randomScore(8.2, 9.7);
          const vault = randomScore(8.5, 9.6);
          const parallelBars = randomScore(8.3, 9.8);
          const highBar = randomScore(8.4, 9.7);
          const allAround = floor + pommelHorse + rings + vault + parallelBars + highBar;

          await addScore({
            gymnastId,
            meetId,
            level: gymnast.level,
            scores: {
              floor,
              pommelHorse,
              rings,
              vault,
              parallelBars,
              highBar,
              allAround,
            },
            placements: {
              floor: randomPlacement(6),
              pommelHorse: randomPlacement(6),
              rings: randomPlacement(6),
              vault: randomPlacement(6),
              parallelBars: randomPlacement(6),
              highBar: randomPlacement(6),
              allAround: randomPlacement(6),
            },
          });
        }

        console.log(`Added score for ${gymnast.name} at meet ${meetId.substring(0, 8)}...`);
      }
    }

    // Add team placements for each meet
    console.log('Adding team placements...');
    for (const meetId of meetIds) {
      // Women's teams
      await saveTeamPlacement(meetId, 'Level 10', 'Womens', {
        vault: 2,
        bars: 1,
        beam: 3,
        floor: 1,
        allAround: 2,
      });

      await saveTeamPlacement(meetId, 'Level 9', 'Womens', {
        vault: 1,
        bars: 2,
        beam: 1,
        floor: 2,
        allAround: 1,
      });

      await saveTeamPlacement(meetId, 'Level 8', 'Womens', {
        vault: 3,
        bars: 3,
        beam: 2,
        floor: 3,
        allAround: 3,
      });

      // Men's teams
      await saveTeamPlacement(meetId, 'Level 10', 'Mens', {
        floor: 3,
        pommelHorse: 2,
        rings: 1,
        vault: 2,
        parallelBars: 2,
        highBar: 1,
        allAround: 2,
      });

      await saveTeamPlacement(meetId, 'Level 9', 'Mens', {
        floor: 2,
        pommelHorse: 1,
        rings: 2,
        vault: 1,
        parallelBars: 1,
        highBar: 2,
        allAround: 1,
      });

      await saveTeamPlacement(meetId, 'Level 8', 'Mens', {
        floor: 4,
        pommelHorse: 3,
        rings: 3,
        vault: 3,
        parallelBars: 3,
        highBar: 3,
        allAround: 3,
      });

      console.log(`Added team placements for meet ${meetId.substring(0, 8)}...`);
    }

    console.log('✅ Mock data population completed successfully!');
    console.log(`Added ${mockGymnasts.length} gymnasts`);
    console.log(`Added ${mockMeets.length} meets`);
    console.log(`Added ${mockGymnasts.length * mockMeets.length} scores`);
    console.log(`Added ${mockMeets.length * 6} team placements`);

    return {
      success: true,
      counts: {
        gymnasts: mockGymnasts.length,
        meets: mockMeets.length,
        scores: mockGymnasts.length * mockMeets.length,
        teamPlacements: mockMeets.length * 6,
      },
    };
  } catch (error) {
    console.error('❌ Error populating mock data:', error);
    throw error;
  }
}
