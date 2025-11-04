# ScoreVault 📊

**Version 1.0.6** - A mobile application for parents and coaches to track and manage gymnast competition scores across multiple seasons.

## Overview

ScoreVault is a local-first mobile app designed for gymnastics parents and coaches who want to keep detailed records of individual gymnast scores and team performance. Track competition results, placements, and analytics over time. Built with React Native and Expo, the app works completely offline and offers optional cloud backup.

**Platform Support:**
- ✅ Android (Released on Google Play)
- ✅ iOS (Configured, ready for App Store submission)

**Key Highlights:**
- 🏆 90+ automated tests with comprehensive coverage
- 🌐 Full bilingual support (English/Spanish)
- 📱 Works 100% offline with optional cloud sync
- 🎨 Beautiful gradient-based UI with haptic feedback
- 🔒 Secure local-first architecture with encrypted cloud backup
- 📊 Advanced team scoring analytics
- 🎯 Single codebase for Android and iOS

## Features

### Core Functionality ✅
- **Gymnast Management**: Add, edit, and manage multiple gymnasts with details including level, discipline (Women's/Men's), USAG number, date of birth, and profile photos
- **Hidden Gymnasts**: Hide inactive gymnasts while preserving all their data, easily unhide when needed
- **Score Tracking**: Record detailed scores for all gymnastics events with automatic all-around calculation
- **Meet Management**: Organize competitions by season with location and date tracking
- **Performance Analytics**: View trends, averages, and personal records for each event
- **Team Scoring**: Track team scores by level and discipline with analytics, event breakdowns, and counting score visualization
- **Team Placements**: Record and track team placement positions for each event and all-around
- **Dual Discipline Support**: Full support for both Women's and Men's gymnastics scoring

### Data Management ✅
- **Local-First Architecture**: All data stored locally in SQLite for fast, offline access
- **Cloud Backup**: Optional Firebase backup and restore for data safety
- **Import/Export**: Export data to CSV or JSON, import from JSON
- **Multi-Device Sync**: Cloud backup enables data access across multiple devices

### Social Sharing ✅
- **Score Cards**: Generate beautiful, shareable score cards for social media
- **Rich Customization**:
  - 10 gradient themes (Purple, Ocean, Sunset, Forest, Royal, Fire, Sky Blue, Rose Pink, Midnight, Crimson)
  - Custom photo backgrounds
  - 6 decorative icon styles (None, Stars, Trophy, Medal, Fire, Sparkles)
  - Dynamic accent colors matching selected gradient
- **Multiple Formats**: Support for Instagram posts (1:1) and stories (9:16)
- **Direct Sharing**: Share to Instagram, Facebook, Messages, or save to Photos
- **Professional Design**: Placement badges, enhanced typography, celebration-focused layout

### User Experience ✅
- **User Profile**: Persistent profile with custom display name and profile photo
- **Bilingual Support**: Full English and Spanish translations
- **Gradient-Based Design**: Modern, polished UI with beautiful gradients throughout
- **Haptic Feedback**: Tactile feedback for all interactions
- **Theme Support**: Light mode (dark mode infrastructure exists)
- **Empty States**: Helpful guidance when getting started
- **Level Filtering**: View scores for current level or all levels
- **Onboarding Tutorial**: Interactive tutorial for first-time users

### Testing & Quality ✅
- **Comprehensive Test Suite**: 90+ automated tests
- **Unit Tests**: Theme utilities, team scoring, season calculations
- **Integration Tests**: Database operations (CRUD for gymnasts, meets, scores)
- **Workflow Tests**: Complete user flows from adding gymnasts to calculating team scores
- **Mock Database**: In-memory SQLite simulation for fast, isolated testing
- **Coverage Reporting**: Track code coverage with `npm run test:coverage`

## Tech Stack

### Frontend
- React Native (v0.81.4)
- Expo (v54)
- Expo Router (v6.0.8) - File-based routing
- TypeScript

### Backend
- SQLite (expo-sqlite v16.0.8) - Primary local storage
- Firebase Authentication - User accounts
- Firebase Firestore - Optional cloud backup only

### Key Libraries
- react-native-chart-kit - Performance charts
- expo-linear-gradient - Gradient UI
- expo-haptics - Tactile feedback
- react-native-view-shot - Score card image generation
- expo-sharing - Social media sharing
- expo-media-library - Save to photos

### Testing
- Jest (v30.2.0) - Test framework
- React Native Testing Library (v13.3.3) - Component testing
- Custom mock database for SQLite testing

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- iOS Simulator (macOS only) or Android Emulator
- Firebase project (for authentication and optional cloud backup)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - See `FIREBASE_SETUP.md` for complete Firebase configuration instructions
   - Create Firebase project, enable Email/Password authentication, create Firestore database
   - Download and configure `google-services.json` (Android), `GoogleService-Info.plist` (iOS), and `config/firebase.ts` (Web)

3. Start the development server:
```bash
npx expo start
```

4. Run on your platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

### Running Tests

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm run test:coverage
```

### Building for Production

Build APK for Android:
```bash
npx eas build --profile preview --platform android
```

## Project Structure

```
ScoreVault/
├── app/                        # Expo Router screens
│   ├── (auth)/                # Authentication screens
│   ├── (tabs)/                # Main tab navigation (Gymnasts, Meets, Teams, Settings)
│   ├── gymnast/[id].tsx       # Gymnast profile
│   ├── meet/[id].tsx          # Meet details
│   ├── level-meets/[id].tsx   # Team scores by level
│   ├── team-score/[id].tsx    # Team score detail view
│   ├── score-card-creator.tsx # Social media card creator
│   └── ...                    # Other screens
├── components/                 # Reusable components
│   ├── ScoreCard.tsx          # Social media score card
│   └── FloatingActionButton.tsx
├── __tests__/                  # Test files
│   ├── __mocks__/             # Mock implementations
│   │   └── database.mock.ts   # In-memory SQLite mock
│   ├── theme.test.ts          # Theme utilities tests
│   ├── teamScores.test.ts     # Team scoring tests
│   ├── seasonUtils.test.ts    # Season calculation tests
│   ├── database.gymnasts.test.ts     # Gymnast CRUD tests
│   ├── database.meets-scores.test.ts # Meet & score tests
│   └── integration.workflows.test.ts # End-to-end workflow tests
├── config/                     # Configuration
│   └── firebase.ts            # Firebase config
├── contexts/                   # React contexts
│   ├── AuthContext.tsx        # Authentication
│   └── ThemeContext.tsx       # Theme management
├── types/                      # TypeScript definitions
├── utils/                      # Utilities and database
│   ├── database.ts            # SQLite operations
│   ├── seasonUtils.ts         # Season calculations
│   └── teamScores.ts          # Team scoring calculations
├── constants/                  # App constants
│   ├── theme.ts               # Design tokens
│   └── gradients.ts           # Gradient & icon presets
├── jest.config.js              # Jest configuration
└── jest.setup.js               # Test environment setup
```

## Database Schema

### SQLite (Local Storage)

**gymnasts**
- id, name, dateOfBirth, usagNumber, level, discipline, photoUri, isHidden, createdAt

**meets**
- id, name, date, season, location, createdAt

**scores**
- id, meetId, gymnastId, level
- Event scores: vault, bars, beam, floor (Women's) / floor, pommelHorse, rings, vault, parallelBars, highBar (Men's)
- allAround (calculated)
- Placements for each event
- createdAt

**team_placements**
- id, meetId, level, discipline
- Team placements: vault, bars, beam, floor (Women's) / floor, pommelHorse, rings, vault, parallelBars, highBar (Men's)
- allAroundPlacement
- createdAt

**user_profile**
- id (always 1), displayName, photoUri, updatedAt

**app_settings**
- key, value (used for device ID and backup info)

### Firestore (Cloud Backup Only)

**backups/{userId}**
- Complete JSON backup of all local data
- Timestamp and device ID
- Restore capability

## Data Management

### Export Formats
- **JSON**: Complete backup, can be re-imported
- **CSV**: Spreadsheet format for external analysis (read-only)

### Import Requirements
- Only JSON format supported
- Must include `gymnasts`, `meets`, and `scores` arrays
- See `IMPORT_EXPORT_GUIDE.md` for detailed format specifications

## Architecture Decisions

### Why Local-First?
- **Offline Access**: Works without internet connection
- **Speed**: Instant data access, no network latency
- **Cost**: No per-read/write Firebase costs
- **Privacy**: Data stays on device by default

### Why Optional Cloud Backup?
- **Safety**: Protect against data loss
- **Multi-Device**: Access data on multiple devices
- **Flexibility**: Users choose when to backup
- **Cost Control**: Only backup when needed

## Team Scoring

The Teams tab automatically calculates team scores by:
- **Grouping**: Scores are organized by level and discipline
- **Top Scores**: Uses top 3 scores per event (default), or top 5 for Women's Levels 1-5
- **Full Team Analytics**: Charts and averages only include meets where all events had minimum competitors
- **Expandable Meets**: Tap any meet to see detailed breakdowns, counting scores highlighted
- **Frozen Tables**: Gymnast names stay visible while scrolling through event scores

Team scoring helps coaches:
- Track team performance trends over time
- Identify strong/weak events for the team
- Compare meet-to-meet progress
- View which athletes' scores are counting

## Season Calculation

Gymnastics seasons run August through July:
- **Aug-Dec**: Season is "YYYY-(YYYY+1)"
- **Jan-July**: Season is "(YYYY-1)-YYYY"
- Example: September 2025 → "2025-2026", March 2026 → "2025-2026"

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub Issues.

## License

Private project - All rights reserved

## Documentation

- **`README.md`** (this file) - Overview and getting started guide
- **`PROJECT_PLAN.md`** - Detailed feature documentation and development roadmap
- **`FIREBASE_SETUP.md`** - Firebase configuration instructions
- **`IOS_RELEASE_PLAN.md`** - iOS App Store submission plan
- **`IMPORT_EXPORT_GUIDE.md`** - Data import/export format specifications

## Recent Updates

### Version 1.0.6 (November 2025)
- **Profile Persistence**: User profile (display name, photo) now saves permanently
- **Backup Restore Improvements**: Enhanced error handling with automatic retry logic
- **Security**: Removed Firebase credentials from repository, added setup templates
- **Translations**: Complete bilingual support (English/Spanish)
- **iOS Ready**: Full iOS configuration and App Store preparation complete

## Roadmap

### Upcoming Features
- Dark mode support
- Password change functionality
- Account deletion
- Push notifications for meet reminders
- Advanced analytics and reporting
- Multi-child family accounts

## Support

For questions or issues:
- Check `FIREBASE_SETUP.md` for Firebase configuration help
- Check `IMPORT_EXPORT_GUIDE.md` for data format help
- Review `PROJECT_PLAN.md` for detailed feature documentation
- Report issues on GitHub

---

**ScoreVault** - Track your gymnastics journey 🎯

Made with ❤️ for gymnastics families
