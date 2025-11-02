# Firebase Configuration Setup

This guide explains how to set up your Firebase configuration files for ScoreVault.

## Overview

The following files contain Firebase project credentials and are **not tracked in git** for security:
- `config/firebase.ts` - Web Firebase configuration
- `google-services.json` - Android Firebase configuration
- `GoogleService-Info.plist` - iOS Firebase configuration

## Setup Instructions

### 1. Web Configuration (`config/firebase.ts`)

1. Copy the template file:
   ```bash
   cp config/firebase.ts.template config/firebase.ts
   ```

2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project (scorevault-d5b34)
4. Click on the gear icon → Project settings
5. Scroll down to "Your apps" section
6. Select the Web app or create one if it doesn't exist
7. Copy the Firebase configuration object
8. Replace the placeholder values in `config/firebase.ts` with your actual values

### 2. Android Configuration (`google-services.json`)

1. Copy the template file:
   ```bash
   cp google-services.json.template google-services.json
   ```

2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project
4. Click on the gear icon → Project settings
5. Scroll down to "Your apps" section
6. Select your Android app (com.illuvatar.ScoreVault)
7. Click "Download google-services.json"
8. Replace the template file with the downloaded file

**Also copy to android folder:**
```bash
cp google-services.json android/app/google-services.json
```

### 3. iOS Configuration (`GoogleService-Info.plist`)

1. Copy the template file:
   ```bash
   cp GoogleService-Info.plist.template GoogleService-Info.plist
   ```

2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select your project
4. Click on the gear icon → Project settings
5. Scroll down to "Your apps" section
6. Select your iOS app (com.illuvatar.ScoreVault)
7. Click "Download GoogleService-Info.plist"
8. Replace the template file with the downloaded file

## Security Notes

- **Never commit these files to git** - they are already in `.gitignore`
- The Firebase Web API key is safe to be public (it's meant for client-side use)
- Security is handled by Firebase Security Rules, not by hiding API keys
- However, keeping these files out of git is still a best practice

## What if I accidentally committed secrets?

If you've already committed these files:

1. They've been removed from tracking with: `git rm --cached <filename>`
2. The files still exist locally and will continue to work
3. Future commits will not include these files
4. GitHub may still show warnings about secrets in git history
5. To completely remove from history (advanced): Use `git filter-branch` or BFG Repo-Cleaner

## Firebase Security Rules

Make sure your Firestore security rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /backups/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures users can only access their own data, regardless of whether the API key is public.
