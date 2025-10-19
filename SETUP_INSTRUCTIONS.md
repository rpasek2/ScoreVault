# ScoreVault Setup Instructions

## ✅ Completed Steps

1. ✅ Firebase packages installed
2. ✅ TypeScript types created for all data models
3. ✅ Season calculation utilities created
4. ✅ Firebase configuration file created
5. ✅ Authentication context with sign up/sign in/sign out
6. ✅ Protected routes with automatic navigation
7. ✅ Authentication screen (login/signup with toggle)
8. ✅ Tab navigation configured (Gymnasts, Meets, Settings)
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

## 📋 Next Steps (Not Yet Built)

The following features still need to be implemented:

1. ⏳ FAB (Floating Action Button) component
2. ⏳ Gymnasts list screen with data fetching
3. ⏳ Add Gymnast modal
4. ⏳ Gymnast Detail screen with season picker
5. ⏳ Add/Edit Score modal with real-time calculations
6. ⏳ Meets tab (unified timeline view)
7. ⏳ Edit/Delete gymnast functionality
8. ⏳ Edit/Delete score functionality
9. ⏳ Loading states and error handling
10. ⏳ Pull-to-refresh on lists

## 📁 Project Structure

```
ScoreVault/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          ✅ Auth stack layout
│   │   └── sign-in.tsx           ✅ Login/Sign up screen
│   ├── (tabs)/
│   │   ├── _layout.tsx           ✅ Tab navigation
│   │   ├── index.tsx             ⏳ Gymnasts list (needs work)
│   │   ├── meets.tsx             ⏳ Meets timeline (needs work)
│   │   └── settings.tsx          ✅ Settings screen
│   └── _layout.tsx               ✅ Root layout with auth
├── config/
│   └── firebase.ts               ⚠️  Needs configuration
├── contexts/
│   └── AuthContext.tsx           ✅ Authentication context
├── types/
│   └── index.ts                  ✅ TypeScript types
├── utils/
│   └── seasonUtils.ts            ✅ Season calculation utilities
└── PROJECT_PLAN.md               ✅ Detailed project plan
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
