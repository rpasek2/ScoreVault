# ScoreVault - Project Plan

## Overview
ScoreVault is a mobile application designed for parents of gymnasts to log, track, and view their child's competition scores across multiple seasons. The app provides an intuitive interface for recording scores, placements, and viewing historical performance data.

## ✅ Current Status
**Version**: 1.0 (Beta)
**Architecture**: Local-first with optional cloud backup
**Platform**: Android (iOS support pending)

## Tech Stack

### Frontend ✅
- **Framework**: React Native (v0.81.4)
- **Navigation**: Expo Router (v6.0.8) with file-based routing
- **UI Components**: React Native core components + custom gradient components
- **State Management**: React Context API (Auth, Theme)
- **Platform Support**: iOS and Android
- **Development Environment**: Expo (v54)

### Backend ✅ (Architecture Changed)
- **Primary Storage**: SQLite (expo-sqlite v16.0.8) - Local-first, offline-capable
- **Cloud Backup**: Firebase Firestore (optional backup/restore only)
- **Authentication**: Firebase Authentication (Email/Password)
- **Device ID**: expo-application (v7.0.7) for backup identification

### Additional Libraries ✅
- **Bottom Tabs**: @react-navigation/bottom-tabs (v7.4.0)
- **Gestures**: react-native-gesture-handler (v2.28.0)
- **Icons**: @expo/vector-icons (v15.0.2)
- **Date Picker**: @react-native-community/datetimepicker (v8.4.5)
- **Charts**: react-native-chart-kit (v6.12.0)
- **Gradients**: expo-linear-gradient (v15.0.7)
- **Haptics**: expo-haptics (v15.0.7)
- **File System**: expo-file-system (v19.0.16), expo-document-picker (v14.0.7), expo-sharing (v14.0.7)
- **Social Sharing**: react-native-view-shot (v3.8.0), expo-image-picker (v15.0.14), expo-media-library (v16.0.5)

## Data Structure

### SQLite Database Schema ✅

#### gymnasts table
```sql
CREATE TABLE gymnasts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dateOfBirth INTEGER,  -- timestamp in milliseconds
  usagNumber TEXT,
  level TEXT NOT NULL,
  discipline TEXT NOT NULL,  -- 'Womens' or 'Mens'
  createdAt INTEGER NOT NULL
)
```

#### meets table
```sql
CREATE TABLE meets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date INTEGER NOT NULL,  -- timestamp in milliseconds
  season TEXT NOT NULL,    -- e.g., "2025-2026"
  location TEXT,
  createdAt INTEGER NOT NULL
)
```

#### scores table
```sql
CREATE TABLE scores (
  id TEXT PRIMARY KEY,
  meetId TEXT NOT NULL,
  gymnastId TEXT NOT NULL,
  level TEXT,
  -- Women's events
  vault REAL,
  bars REAL,
  beam REAL,
  floor REAL,
  -- Men's events
  pommelHorse REAL,
  rings REAL,
  parallelBars REAL,
  highBar REAL,
  -- All-Around
  allAround REAL NOT NULL,
  -- Placements
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
)
```

#### app_settings table
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)
-- Used for storing device ID for cloud backup
```

### Firebase Firestore (Cloud Backup Only) ✅

#### backups collection
```
backups/{deviceId}
  - deviceId: string
  - timestamp: number
  - lastBackup: serverTimestamp
  - data: {
      gymnasts: array of gymnast objects
      meets: array of meet objects
      scores: array of score objects
    }
```

## Feature Breakdown

### Phase 1: Authentication & Core Setup ✅ COMPLETE
- [x] Firebase project setup
- [x] Firebase SDK integration (Authentication only)
- [x] Authentication screen (Sign Up / Login)
- [x] User session management (AuthContext)
- [x] Protected routes
- [x] SQLite database setup and initialization
- [x] Theme system with Context API

### Phase 2: Gymnast Management ✅ COMPLETE
- [x] Bottom tab navigation (Gymnasts, Meets, Settings)
- [x] Gymnasts list screen with gradient cards
- [x] Add gymnast screen (name, DOB, USAG#, level, discipline)
- [x] Gymnast detail view with analytics
- [x] Edit gymnast functionality
- [x] Delete gymnast (with confirmation, cascade deletes scores)
- [x] Support for both Women's and Men's gymnastics

### Phase 3: Score Entry & Display ✅ COMPLETE
- [x] Floating Action Button (FAB) component
- [x] Add score screen (separate from meet creation)
- [x] Real-time all-around score calculation
- [x] Season storage from meet date
- [x] Form validation
- [x] Save scores to SQLite
- [x] Display scores in gymnast detail view
- [x] Edit score functionality
- [x] Delete score (with confirmation)
- [x] Event-specific scoring for Women's and Men's events
- [x] Placement tracking for each event

### Phase 4: Meets Management ✅ COMPLETE
- [x] Meets tab: List view of all meets
- [x] Add meet screen (name, date, location, season)
- [x] Meet detail view showing all scores from that meet
- [x] Edit meet functionality
- [x] Delete meet (with confirmation, cascade deletes scores)
- [x] Sort by date (most recent first)
- [x] Display all gymnasts' scores for each meet

### Phase 5: Settings & Features ✅ MOSTLY COMPLETE
- [x] Settings tab with organized sections (Account, Data, App, Support)
- [x] Profile settings screen
- [x] Cloud backup & restore functionality
- [x] Export data (CSV/JSON)
- [x] Import data (CSV/JSON)
- [x] Appearance settings screen
- [x] Help & FAQ screen
- [x] Privacy policy screen
- [x] Logout functionality
- [x] Error handling & loading states
- [x] Empty states with helpful messages
- [x] Haptic feedback throughout
- [ ] Privacy & Security settings screen (placeholder exists)
- [ ] Notifications settings (placeholder exists)
- [ ] Contact Support functionality (placeholder exists)
- [ ] Rate App functionality (placeholder exists)

### Phase 6: Cloud Backup ✅ COMPLETE
- [x] Device ID generation (platform-specific)
- [x] Backup all data to Firebase Firestore
- [x] Restore data from cloud backup
- [x] Backup status display
- [x] Cloud backup settings screen
- [x] Firestore security rules for backups

### Phase 7: Social Media Score Cards ✅ COMPLETE
- [x] Score card component with customizable layouts
- [x] Multiple aspect ratio support (1:1 square, 9:16 story)
- [x] Gradient background presets (6 options)
- [x] Custom photo backgrounds with overlay
- [x] Image generation using react-native-view-shot
- [x] Share functionality (Instagram, Facebook, Messages, etc.)
- [x] Save to Photos functionality
- [x] Medal emoji display for placements
- [x] Integration from gymnast profile (share button on scores)
- [x] Real-time preview with customization

## Screen Structure

### App Navigation Hierarchy
```
Root Stack
├── Auth Stack (not authenticated)
│   └── Login/Sign Up Screen
│
└── Main Tabs (authenticated)
    ├── Gymnasts Tab
    │   ├── Gymnasts List
    │   └── Gymnast Detail (with season picker)
    │
    ├── Meets Tab
    │   └── [To be defined]
    │
    └── Settings Tab
        └── Settings Screen

Modals (accessible from Gymnasts tab)
├── Add Gymnast Modal
├── Add Score Modal
└── Edit Score Modal
```

## Screen Details

### 1. Authentication Screen
**Purpose**: User login and registration

**UI Elements**:
- App logo/title: "ScoreVault"
- Email input field
- Password input field
- "Login" button
- "Sign Up" button/link
- Error message display
- Loading indicator

### 2. Gymnasts Tab (List View)
**Purpose**: Display all gymnasts for the logged-in user

**UI Elements**:
- Screen title: "My Gymnasts"
- List of gymnast cards (name, tap to view details)
- Empty state: "Add your first gymnast by tapping the '+' button!"
- Floating Action Button (FAB) - bottom right

**Navigation**:
- Tap gymnast → Gymnast Detail View
- Tap FAB → Add Gymnast Modal

### 2a. Add Gymnast Modal
**Purpose**: Simple form to add a new gymnast

**UI Elements**:
- Modal title: "Add Gymnast"
- Gymnast Name: Text input (required)
- Optional fields (for future expansion):
  - Date of Birth: Date picker
  - Level: Dropdown (e.g., Level 3, Level 4, Xcel Silver, etc.)
- Actions:
  - "Save" button (creates gymnast in Firestore)
  - "Cancel" button (closes modal)

**Validation**:
- Name is required (min 2 characters)

### 3. Gymnast Detail View
**Purpose**: Display all competition scores for a specific gymnast

**UI Elements**:
- Screen title: Gymnast's name
- Edit/Delete buttons (top right): Edit gymnast name or delete gymnast
- Season picker:
  - Current season display (e.g., "2025-2026")
  - Left arrow (previous season)
  - Right arrow (next season)
- Scrollable list of competitions:
  - Competition name
  - Date
  - Vault, Bars, Beam, Floor scores
  - All-Around score (bold/highlighted)
  - Placements (optional, collapsible)
  - Swipe actions: Edit / Delete
- Empty state: "No scores recorded for this season"
- Floating Action Button (FAB) - bottom right (to add new score for this gymnast)

**Navigation**:
- Tap FAB → Add Score Modal (gymnast pre-selected)
- Tap score card → Edit Score Modal
- Swipe score card → Delete confirmation

### 4. Add/Edit Score Modal
**Purpose**: Form to input or edit competition scores

**UI Elements**:
- Screen title: "Add Score" or "Edit Score"
- Form fields:
  - **Gymnast**: Dropdown/picker (pre-populated with user's gymnasts)
    - If opened from Gymnast Detail View, pre-select that gymnast
  - **Competition Name**: Text input
  - **Date**: Date picker
  - **Season**: Auto-calculated from date (editable text input)
    - Logic: Aug-Dec → "YYYY-(YYYY+1)", Jan-July → "(YYYY-1)-YYYY"
    - Example: Sept 2025 → "2025-2026", March 2026 → "2025-2026"

- **Scores Section**:
  - Vault: Numeric input (0.000 format, up to 3 decimals)
  - Bars: Numeric input
  - Beam: Numeric input
  - Floor: Numeric input
  - **All-Around**: Display-only, real-time calculated (Vault + Bars + Beam + Floor)
    - Updates as user types

- **Placements Section** (optional):
  - Vault Placement: Numeric input (integer)
  - Bars Placement: Numeric input
  - Beam Placement: Numeric input
  - Floor Placement: Numeric input
  - All-Around Placement: Numeric input

- **Actions**:
  - "Save Score" button (saves to Firestore)
  - "Cancel" button (closes modal)
  - If editing: "Delete Score" button (bottom, red text)

**Validation**:
- Gymnast selection required
- Competition name required (min 2 characters)
- Date required, cannot be in the future
- Scores required (0.000 - 10.000 range)
- Placements optional (positive integers only)

### 5. Meets Tab
**Purpose**: Unified timeline view of all competition scores across all gymnasts

**UI Elements**:
- Screen title: "All Meets"
- Season filter dropdown (top): "All Seasons", "2025-2026", "2024-2025", etc.
- Scrollable list of all scores (sorted by date, most recent first):
  - Gymnast name (bold)
  - Competition name
  - Date
  - All-Around score (highlighted)
  - Individual event scores (Vault, Bars, Beam, Floor)
- Empty state: "No competitions recorded yet"

**Navigation**:
- Tap score card → Edit Score Modal
- No FAB on this tab (users add scores from Gymnast Detail View)

**Features**:
- Pull to refresh
- Infinite scroll (load more as user scrolls)
- Quick view of all recent activity

### 6. Settings Tab
**Purpose**: App settings and account management

**UI Elements**:
- User email display
- Logout button
- Account deletion option (future)
- App version info

## Implementation Plan

### Step 1: Firebase Setup
1. Create Firebase project
2. Add iOS and Android apps in Firebase console
3. Install Firebase SDK: `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`
4. Configure Firebase credentials (google-services.json, GoogleService-Info.plist)
5. Set up Firestore security rules

### Step 2: Authentication
1. Create auth context for user state management
2. Build login/signup screen UI
3. Implement Firebase email/password authentication
4. Add form validation and error handling
5. Set up protected route logic

### Step 3: Navigation Setup
1. Configure tab navigation with 3 tabs: Gymnasts, Meets, Settings
2. Create placeholder screens for each tab
3. Add FAB component (reusable across tabs)
4. Set up modal routes for Add Score screen

### Step 4: Gymnast Management
1. Create TypeScript interfaces for data models
2. Build Gymnasts list screen
3. Implement "Add Gymnast" functionality
4. Create Firestore queries for gymnasts (filtered by userId)
5. Build Gymnast Detail screen with season picker
6. Implement season navigation logic

### Step 5: Score Entry
1. Build Add Score form UI
2. Implement real-time all-around calculation
3. Add date picker and gymnast picker
4. Implement season auto-calculation from date
5. Create Firestore write operations for scores
6. Add form validation

### Step 6: Score Display
1. Query scores from Firestore (by gymnastId and season)
2. Display scores in Gymnast Detail view
3. Format scores and placements
4. Sort by date (most recent first)
5. Add empty states

### Step 7: Polish & Testing
1. Add loading states (spinners)
2. Implement error boundaries
3. Add pull-to-refresh on lists
4. Test on iOS and Android devices
5. Optimize Firestore queries
6. Add offline support (Firestore cache)

## Security Considerations

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can only read/write gymnasts they own
    match /gymnasts/{gymnastId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
    }

    // Users can only read/write scores for their gymnasts
    match /scores/{scoreId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Remaining Work for v1.0

### High Priority
- [ ] Implement Privacy & Security settings screen
  - Password change functionality
  - Account deletion
  - Data privacy controls
- [ ] Implement Notifications settings
  - Push notification preferences
  - Meet reminders
- [ ] Contact Support functionality
  - Email integration or feedback form
- [ ] Rate App functionality
  - Link to app store ratings

### Medium Priority
- [ ] iOS testing and platform-specific fixes
- [ ] Performance optimization
  - Large dataset handling
  - Image/chart rendering optimization
- [ ] Accessibility improvements
  - Screen reader support
  - Larger text options
  - Color contrast improvements

### Nice to Have
- [ ] Onboarding tutorial for first-time users
- [ ] Sample data for demo/testing
- [ ] In-app help tooltips
- [ ] Batch operations (delete multiple scores/meets)

## Future Enhancements (v2.0+)
- [ ] Score analytics and charts (progress over time) - *Partially implemented*
- [ ] Multi-child support (switch between multiple gymnasts)
- [ ] Export scores to PDF
- [ ] Photo uploads for each meet
- [ ] Share scores with coaches/family (CSV export)
- [ ] Meet reminders/notifications
- [ ] Dark mode support (theme infrastructure exists)
- [ ] Team/group features (compare with teammates)
- [ ] Coach collaboration features
- [ ] Video analysis integration
- [ ] Advanced social card features:
  - [ ] Multiple card layouts/templates
  - [ ] Season highlight cards
  - [ ] Personal record celebration cards
  - [ ] Batch card generation

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Testing Strategy
- Manual testing on iOS and Android devices
- Test user authentication flows
- Test data persistence and retrieval
- Test offline scenarios
- Validate form inputs

### Deployment
- Build production apps using EAS Build (Expo Application Services)
- Submit to Apple App Store
- Submit to Google Play Store

## Timeline

### Completed (Original Estimate: 8 weeks)
- ✅ **Phase 1**: Firebase setup, authentication, navigation structure
- ✅ **Phase 2**: SQLite database migration, gymnast management
- ✅ **Phase 3**: Score entry form, meet management
- ✅ **Phase 4**: Score display, meets tab
- ✅ **Phase 5**: Settings screens, data export/import
- ✅ **Phase 6**: Cloud backup system
- ✅ **Phase 7**: Social media score cards with sharing functionality

### Remaining for v1.0 (Estimate: 1-2 weeks)
- **High Priority Items**: Privacy settings, notifications, support features (~5 days)
- **Polish & Testing**: iOS testing, performance optimization, accessibility (~5 days)
- **Nice to Have**: Onboarding, help tooltips (~3 days)

### Total Development Time
- **Core Features**: Completed
- **Polish & Launch Prep**: 1-2 weeks remaining

## Notes
- **Season format**: "YYYY-YYYY" (e.g., "2025-2026")
- **Season calculation logic**:
  - Gymnastics season runs August through July
  - Aug-Dec → "YYYY-(YYYY+1)"
  - Jan-July → "(YYYY-1)-YYYY"
  - Example: September 2025 → "2025-2026", March 2026 → "2025-2026"
- **Scores**: Supports both Women's (Vault, Bars, Beam, Floor) and Men's (Floor, Pommel Horse, Rings, Vault, Parallel Bars, High Bar) gymnastics
- **All-Around**: Automatic calculation based on discipline
- **Placements**: Optional for each event and all-around
- **FAB placement**: Available on main tabs for quick actions
- **Architecture**: Local-first with SQLite for offline capability, Firebase for optional cloud backup only

---

## ✅ Project Completion Summary

### What's Working
**Core Application** ✅
- Local-first SQLite database for all data storage
- Full offline functionality
- Firebase Authentication for user accounts
- Optional cloud backup & restore to Firebase Firestore

**Gymnast Management** ✅
- Add, edit, delete gymnasts
- Support for both Women's and Men's gymnastics
- USAG number tracking
- Date of birth and level tracking
- Individual gymnast detail pages with analytics

**Meet Management** ✅
- Add, edit, delete meets
- Meet detail pages showing all scores
- Season-based organization
- Location tracking

**Score Tracking** ✅
- Full event scoring for Women's and Men's gymnastics
- Automatic all-around calculation
- Placement tracking for each event
- Score entry and editing
- Cascade deletion (deleting gymnast/meet removes related scores)

**Data Management** ✅
- Export to CSV/JSON
- Import from CSV/JSON
- Cloud backup to Firebase
- Cloud restore from Firebase
- Device-specific backup identification

**UI/UX** ✅
- Beautiful gradient-based design
- Bottom tab navigation (Gymnasts, Meets, Settings)
- Floating Action Buttons for quick actions
- Haptic feedback throughout
- Loading states and error handling
- Empty states with helpful messages
- Theme system (light mode implemented)

**Settings & Features** ✅
- Profile settings
- Appearance customization
- Cloud backup management
- Help & FAQ
- Privacy policy
- Data export/import

**Social Sharing** ✅
- Generate beautiful score cards for social media
- Multiple aspect ratios (Instagram post 1:1, Instagram story 9:16)
- 6 preset gradient backgrounds
- Custom photo backgrounds with dark overlay
- Share to Instagram, Facebook, Messages, etc.
- Save directly to Photos
- Real-time preview with customization
- Medal emoji display for placements

### What's Remaining
- Privacy & Security settings implementation
- Notifications settings implementation
- Contact Support functionality
- Rate App functionality
- iOS platform testing
- Performance optimization for large datasets
- Accessibility improvements
- Optional: Onboarding tutorial

### Key Achievements
1. **Architecture Migration**: Successfully migrated from Firebase-only to local SQLite with optional cloud backup - significantly reducing costs
2. **Dual Discipline Support**: Full support for both Women's and Men's gymnastics scoring
3. **Data Portability**: Robust import/export and cloud backup/restore functionality
4. **Offline-First**: Complete app functionality without internet connection
5. **Modern UI**: Polished gradient-based design with haptic feedback
6. **Social Sharing**: Professional score cards with customizable backgrounds and instant sharing to social media

**Status**: ~96% complete for v1.0 release, ready for beta testing
