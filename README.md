# ScoreVault 📊

A mobile application for parents to track and manage their gymnast's competition scores across multiple seasons.

## Overview

ScoreVault is a local-first mobile app designed for gymnastics parents who want to keep detailed records of their child's competition scores, placements, and performance over time. Built with React Native and Expo, the app works completely offline and offers optional cloud backup.

## Features

### Core Functionality ✅
- **Gymnast Management**: Add, edit, and manage multiple gymnasts with details including level, discipline (Women's/Men's), USAG number, and date of birth
- **Score Tracking**: Record detailed scores for all gymnastics events with automatic all-around calculation
- **Meet Management**: Organize competitions by season with location and date tracking
- **Performance Analytics**: View trends, averages, and personal records for each event
- **Dual Discipline Support**: Full support for both Women's and Men's gymnastics scoring

### Data Management ✅
- **Local-First Architecture**: All data stored locally in SQLite for fast, offline access
- **Cloud Backup**: Optional Firebase backup and restore for data safety
- **Import/Export**: Export data to CSV or JSON, import from JSON
- **Multi-Device Sync**: Cloud backup enables data access across multiple devices

### Social Sharing ✅
- **Score Cards**: Generate beautiful, shareable score cards for social media
- **Customization**: Choose from gradient backgrounds or use custom photos
- **Multiple Formats**: Support for Instagram posts (1:1) and stories (9:16)
- **Direct Sharing**: Share to Instagram, Facebook, Messages, or save to Photos

### User Experience ✅
- **Gradient-Based Design**: Modern, polished UI with beautiful gradients throughout
- **Haptic Feedback**: Tactile feedback for all interactions
- **Theme Support**: Light mode (dark mode infrastructure exists)
- **Empty States**: Helpful guidance when getting started
- **Level Filtering**: View scores for current level or all levels

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
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create a Firestore database
   - Copy your Firebase config to `config/firebase.ts`

3. Start the development server:
```bash
npx expo start
```

4. Run on your platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

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
│   ├── (tabs)/                # Main tab navigation
│   ├── gymnast/[id].tsx       # Gymnast profile
│   ├── meet/[id].tsx          # Meet details
│   ├── score-card-creator.tsx # Social media card creator
│   └── ...                    # Other screens
├── components/                 # Reusable components
│   ├── ScoreCard.tsx          # Social media score card
│   └── FloatingActionButton.tsx
├── config/                     # Configuration
│   └── firebase.ts            # Firebase config
├── contexts/                   # React contexts
│   ├── AuthContext.tsx        # Authentication
│   └── ThemeContext.tsx       # Theme management
├── types/                      # TypeScript definitions
├── utils/                      # Utilities and database
│   ├── database.ts            # SQLite operations
│   └── seasonUtils.ts         # Season calculations
└── constants/                  # App constants
    ├── theme.ts               # Design tokens
    └── gradients.ts           # Gradient presets
```

## Database Schema

### SQLite (Local Storage)

**gymnasts**
- id, name, dateOfBirth, usagNumber, level, discipline, createdAt

**meets**
- id, name, date, season, location, createdAt

**scores**
- id, meetId, gymnastId, level
- Event scores: vault, bars, beam, floor (Women's) / floor, pommelHorse, rings, vault, parallelBars, highBar (Men's)
- allAround (calculated)
- Placements for each event
- createdAt

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

## Season Calculation

Gymnastics seasons run August through July:
- **Aug-Dec**: Season is "YYYY-(YYYY+1)"
- **Jan-July**: Season is "(YYYY-1)-YYYY"
- Example: September 2025 → "2025-2026", March 2026 → "2025-2026"

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub Issues.

## License

Private project - All rights reserved

## Support

For questions or issues:
- Check `IMPORT_EXPORT_GUIDE.md` for data format help
- Review `PROJECT_PLAN.md` for detailed feature documentation
- Contact: [Your contact info]

---

**ScoreVault** - Track your gymnastics journey 🎯
