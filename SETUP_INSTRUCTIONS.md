# ScoreVault Setup Instructions

## ✅ Completed Steps

1. ✅ Firebase packages installed
2. ✅ TypeScript types created for all data models
3. ✅ Season calculation utilities created
4. ✅ Firebase configuration file created
5. ✅ Authentication context with sign up/sign in/sign out
6. ✅ Protected routes with automatic navigation
7. ✅ Authentication screen (login/signup with toggle)
8. ✅ Tab navigation configured (Gymnasts, Meets, Teams, Settings)
9. ✅ Settings screen with sign out functionality

## 🔧 Required: Firebase Configuration

Before the app can run, you need to set up your Firebase project:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "ScoreVault" (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

### Step 2: Add Web App to Firebase
1. In your Firebase project, click the web icon (`</>`)
2. Register app with nickname "ScoreVault Web"
3. Copy the `firebaseConfig` object

### Step 3: Update Firebase Config
1. Open `config/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Step 4: Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### Step 5: Create Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll add rules next)
4. Select your region (choose closest to your users)
5. Click "Enable"

### Step 6: Set Up Security Rules
1. In Firestore Database, go to "Rules" tab
2. Replace the rules with:

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
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow write: if request.auth != null &&
                      resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
    }

    // Users can only read/write scores for their gymnasts
    match /scores/{scoreId} {
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;
      allow write: if request.auth != null &&
                      resource.data.userId == request.auth.uid;
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;
    }
  }
}ok i s
```

3. Click "Publish"

## 🚀 Running the App

Once Firebase is configured:

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## 🧪 Running Tests

The app includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- database.gymnasts.test.ts
```

**Test Coverage:**
- Unit tests for utilities (theme, team scoring, seasons)
- Database integration tests (CRUD operations)
- End-to-end workflow tests
- Mock database for isolated testing

## ✅ Completed Features

All core features have been implemented:

1. ✅ FAB (Floating Action Button) component
2. ✅ Gymnasts list screen with data fetching
3. ✅ Add Gymnast functionality
4. ✅ Gymnast Detail screen with performance analytics
5. ✅ Add/Edit Score with real-time calculations
6. ✅ Meets tab (unified timeline view)
7. ✅ Edit/Delete gymnast functionality (with hide/unhide)
8. ✅ Edit/Delete score functionality
9. ✅ Loading states and error handling
10. ✅ Pull-to-refresh on lists
11. ✅ Team scoring with analytics and charts
12. ✅ Social media score cards with rich customization
13. ✅ Cloud backup and restore
14. ✅ Import/Export (JSON and CSV)
15. ✅ Comprehensive test suite (90+ tests)

## 📁 Project Structure

```
ScoreVault/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          ✅ Auth stack layout
│   │   └── sign-in.tsx          ✅ Login/Sign up screen
│   ├── (tabs)/
│   │   ├── _layout.tsx          ✅ Tab navigation
│   │   ├── index.tsx            ✅ Gymnasts list
│   │   ├── meets.tsx            ✅ Meets timeline
│   │   ├── teams.tsx            ✅ Team scoring
│   │   └── settings.tsx         ✅ Settings screen
│   ├── gymnast/[id].tsx         ✅ Gymnast profile & analytics
│   ├── meet/[id].tsx            ✅ Meet details
│   ├── level-meets/[id].tsx     ✅ Team scores by level
│   ├── team-score/[id].tsx      ✅ Team score detail
│   ├── score-card-creator.tsx   ✅ Social media card creator
│   ├── add-gymnast.tsx          ✅ Add gymnast screen
│   ├── add-score.tsx            ✅ Add score screen
│   ├── cloud-backup.tsx         ✅ Cloud backup management
│   └── _layout.tsx              ✅ Root layout with auth
├── __tests__/
│   ├── __mocks__/
│   │   └── database.mock.ts     ✅ SQLite mock
│   ├── theme.test.ts            ✅ Theme tests
│   ├── teamScores.test.ts       ✅ Team scoring tests
│   ├── seasonUtils.test.ts      ✅ Season tests
│   ├── database.gymnasts.test.ts ✅ Database tests
│   ├── database.meets-scores.test.ts ✅ Database tests
│   └── integration.workflows.test.ts ✅ Integration tests
├── components/
│   ├── ScoreCard.tsx            ✅ Social media score card
│   └── FloatingActionButton.tsx ✅ FAB component
├── config/
│   └── firebase.ts              ⚠️  Needs configuration
├── contexts/
│   ├── AuthContext.tsx          ✅ Authentication context
│   └── ThemeContext.tsx         ✅ Theme management
├── types/
│   └── index.ts                 ✅ TypeScript types
├── utils/
│   ├── database.ts              ✅ SQLite operations
│   ├── seasonUtils.ts           ✅ Season calculation
│   └── teamScores.ts            ✅ Team scoring logic
├── constants/
│   ├── theme.ts                 ✅ Design tokens
│   └── gradients.ts             ✅ Gradient & icon presets
├── jest.config.js               ✅ Jest configuration
├── jest.setup.js                ✅ Test setup
└── PROJECT_PLAN.md              ✅ Detailed project plan
```

## 🐛 Troubleshooting

### "Firebase config not found" error
- Make sure you've updated `config/firebase.ts` with your actual Firebase credentials

### "Auth domain not whitelisted" error
- In Firebase Console, go to Authentication > Settings > Authorized domains
- Add `localhost` and your app's domain

### App crashes on startup
- Make sure all Firebase dependencies are installed: `npm install`
- Clear cache: `npm start -- --clear`

## 📝 Notes

- The Node version warnings can be safely ignored - they don't affect development
- Firebase persistence is handled automatically via AsyncStorage
- All routes are protected - users must be authenticated to access the app
