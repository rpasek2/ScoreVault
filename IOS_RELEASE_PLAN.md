# ScoreVault iOS Release Plan

**Version:** 1.0.5
**Target Release:** 4-6 weeks from start
**Budget:** $99 Apple Developer + $29/month EAS Build = $128 first month

---

## Phase 1: Prerequisites & Account Setup (Days 1-3)

### Apple Developer Account
- [ ] **Enroll in Apple Developer Program** - $99/year
  - URL: https://developer.apple.com/programs/enroll/
  - Expected approval time: 24-48 hours
- [ ] Set up Two-Factor Authentication
- [ ] Agree to latest Apple Developer Agreement
- [ ] Add payment method for App Store distribution

### Build Method: EAS Build (Cloud-based)
**Decision: Use EAS Build** - No Mac required, faster iteration

- [ ] Install EAS CLI globally
  ```bash
  npm install -g eas-cli
  ```
- [ ] Login to Expo account
  ```bash
  eas login
  ```
- [ ] Sign up for EAS Build plan ($29/month for unlimited builds)

---

## Phase 2: Firebase iOS Configuration (Day 3)

### Add iOS App to Firebase Project

1. [ ] Go to Firebase Console: https://console.firebase.google.com
2. [ ] Select ScoreVault project
3. [ ] Click "Add app" → iOS
4. [ ] Bundle ID: `com.illuvatar.ScoreVault`
5. [ ] App nickname: "ScoreVault iOS"
6. [ ] Download `GoogleService-Info.plist`
7. [ ] Save file to project root: `C:\Users\Roger\Desktop\ScoreVault\GoogleService-Info.plist`
8. [ ] Enable Firebase services for iOS:
   - Authentication ✓
   - Cloud Firestore ✓

---

## Phase 3: iOS Configuration (Days 3-4)

### Update app.json

Add complete iOS configuration:

```json
"ios": {
  "bundleIdentifier": "com.illuvatar.ScoreVault",
  "buildNumber": "1",
  "supportsTablet": true,
  "icon": "./assets/images/icon.png",
  "infoPlist": {
    "NSPhotoLibraryUsageDescription": "Allow ScoreVault to save score cards to your photo library.",
    "NSPhotoLibraryAddUsageDescription": "Allow ScoreVault to save score cards to your photo library.",
    "UIBackgroundModes": [],
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

### Update eas.json

Add iOS production build configuration:

```json
"production": {
  "ios": {
    "simulator": false,
    "buildConfiguration": "Release",
    "autoIncrement": true
  },
  "android": {
    "buildType": "app-bundle",
    "credentialsSource": "remote"
  }
}
```

### Verify App Icon

- [ ] Check that `./assets/images/icon.png` is 1024x1024px
- [ ] If not, resize/recreate logo at 1024x1024
- [ ] Ensure transparent background or solid color
- [ ] No alpha channel in corners (iOS requirement)

---

## Phase 4: First iOS Build (Days 4-5)

### Configure EAS Build for iOS

```bash
# Configure build
eas build:configure

# Create iOS credentials (will prompt for Apple ID)
eas credentials

# Build for iOS (first build takes 15-30 minutes)
eas build --platform ios --profile production
```

**Expected outcomes:**
- EAS will handle code signing automatically
- Build will be uploaded to App Store Connect automatically
- You'll receive email when build completes
- Build will be available in TestFlight within minutes

---

## Phase 5: App Store Connect Setup (Days 5-6)

### Create App Record

1. [ ] Go to App Store Connect: https://appstoreconnect.apple.com
2. [ ] Click "My Apps" → "+" → "New App"
3. [ ] Platform: iOS
4. [ ] Name: **ScoreVault**
5. [ ] Primary Language: English (U.S.)
6. [ ] Bundle ID: Select `com.illuvatar.ScoreVault`
7. [ ] SKU: `scorevault-ios-001`
8. [ ] User Access: Full Access

### App Information

- [ ] **Category**
  - Primary: **Sports**
  - Secondary: **Productivity**

- [ ] **Age Rating**
  - Complete questionnaire
  - Expected rating: **4+** (No objectionable content)

### Pricing and Availability

- [ ] **Price:** $6.99 USD (Tier 7)
  - One-time purchase, no subscriptions
  - Emphasize "No subscription required!" in marketing

- [ ] **Availability:** All territories

- [ ] **Pre-order:** No (release immediately after approval)

---

## Phase 6: App Store Listing Content (Days 6-8)

### Text Content

**App Name (30 char max):**
```
ScoreVault
```

**Subtitle (30 char max):**
```
Gymnastics Score Tracking
```

**Promotional Text (170 char max) - Can edit anytime:**
```
Track scores, manage teams, analyze performance. One-time purchase - no subscription required! Perfect for coaches and competitive gymnasts.
```

**Description (4000 char max):**
```
ScoreVault is the ultimate gymnastics scoring and team management app for coaches and competitive gymnasts. Track scores, analyze performance trends, manage teams, and share achievements - all in one beautifully designed app.

🏆 KEY FEATURES

SCORE TRACKING
• Record scores for all events (Vault, Bars, Beam, Floor for Women's; Floor, Pommel Horse, Rings, Vault, Parallel Bars, High Bar for Men's)
• Automatic all-around calculation
• Track placement rankings
• Personal record detection
• Full meet history

TEAM MANAGEMENT
• Organize gymnasts by level and discipline
• Team score calculations (configurable 3-up or 5-up)
• Real-time leaderboards
• Track multiple teams

ANALYTICS & INSIGHTS
• Performance trends over time
• Event strength analysis
• Compare scores across meets
• Season summaries
• Identify improvement areas

SOCIAL SHARING
• Create beautiful score cards
• Share achievements on social media
• Professional-looking graphics
• Customizable designs

DATA MANAGEMENT
• Cloud backup with Firebase
• Restore across devices
• Local data storage for offline access
• Export/import functionality
• Privacy-focused - your data stays yours

MULTI-LANGUAGE SUPPORT
• English
• Spanish (Español)

PERFECT FOR:
✓ Gymnastics coaches managing teams
✓ Parents tracking their gymnast's progress
✓ Competitive gymnasts monitoring performance
✓ Club administrators
✓ Anyone involved in gymnastics scoring

💰 ONE-TIME PURCHASE
Pay once, use forever. No subscriptions, no recurring fees, no hidden costs. Just $6.99 for lifetime access to all features.

📱 DESIGNED FOR iOS
• Native iOS experience
• Optimized for iPhone and iPad
• Dark mode support
• Haptic feedback
• Smooth animations

🔒 PRIVACY FIRST
• All gymnastics data stored locally on your device
• Cloud backup optional and encrypted
• No data sharing with third parties
• Full account deletion available
• Transparent privacy policy

Whether you're a coach managing a team of 20 gymnasts or a parent tracking your child's competitive journey, ScoreVault makes score tracking effortless and insightful.

Download ScoreVault today and transform how you track gymnastics performance!

---

Support: twotreessoftware@gmail.com
Privacy Policy: https://rpasek2.github.io/ScoreVault/PRIVACY_POLICY.html
```

**Keywords (100 char max, comma-separated):**
```
gymnastics,scoring,coaching,meets,sports,team,tracker,score,athlete,competition,vault,bars,beam
```

**Support URL:**
```
https://rpasek2.github.io/ScoreVault/
```

**Marketing URL:** (Optional - Skip for now)

**Privacy Policy URL:**
```
https://rpasek2.github.io/ScoreVault/PRIVACY_POLICY.html
```

---

## Phase 7: Screenshots (Days 8-10)

### Required Screenshot Sizes

**Decision: Create 2 sets of screenshots**
1. **6.7" iPhone** (1290 x 2796) - iPhone 15 Pro Max - REQUIRED
2. **5.5" iPhone** (1242 x 2208) - For older devices - REQUIRED

**Optional but recommended:**
3. **12.9" iPad Pro** (2048 x 2732) - Since we support iPad

### Screenshot Content (3-5 screenshots per device)

**Screenshot 1: Gymnast List**
- Show organized gymnast roster
- Multiple levels visible
- Clean, professional look

**Screenshot 2: Score Entry**
- Adding scores for a meet
- All event scores visible
- Show intuitive UI

**Screenshot 3: Team Scoring**
- Team score calculation screen
- Show counting scores highlighted
- Leaderboard view

**Screenshot 4: Analytics**
- Performance trends chart
- Progress over time
- Insights view

**Screenshot 5: Social Card**
- Beautiful score card design
- Share functionality
- Professional presentation

### How to Create Screenshots

**Option 1: Use iOS Simulator** (Requires Mac or EAS)
```bash
# Run on simulator
npx expo run:ios

# Take screenshots with Cmd+S
```

**Option 2: TestFlight on Real Device**
- Install via TestFlight
- Navigate to each screen
- Take screenshots (Power + Volume Up)
- AirDrop to computer
- Resize if needed

**Option 3: Design Tool**
- Use Figma/Sketch to create mockups
- Overlay app screenshots into device frames
- Add annotations/highlights

---

## Phase 8: App Preview Video (Days 10-11)

### Video Specifications

**Decision: Create a 30-second app preview video**

**Requirements:**
- Duration: 15-30 seconds
- Sizes: Same as screenshots (6.7" and 5.5")
- Format: .mov or .m4v
- Max file size: 500 MB

### Video Content Script (30 seconds)

1. **0-5s:** App icon animation → Open app → Gymnast list
2. **6-10s:** Add new gymnast → Show profile
3. **11-15s:** Enter meet scores → See all-around calculation
4. **16-20s:** View team scores → Leaderboard
5. **21-25s:** Performance analytics → Trend chart
6. **26-30s:** Create social card → App icon + name

**Tools:**
- Screen recording with QuickTime (Mac)
- Edit with iMovie or Final Cut Pro
- Add subtle background music (royalty-free)
- Add text overlays for key features

**Decision: Optional - can launch without video, add later**

---

## Phase 9: App Privacy Details (Day 11)

### Data Collection Declaration

**Data Collected:**

1. **Contact Information**
   - Email Addresses
   - Purpose: Account Management
   - Linked to user: Yes
   - Used for tracking: No
   - Collected: Yes

2. **User IDs**
   - User ID
   - Purpose: Account Management
   - Linked to user: Yes
   - Used for tracking: No
   - Collected: Yes

3. **Photos**
   - Photos or Videos
   - Purpose: App Functionality (save score cards)
   - Linked to user: No
   - Used for tracking: No
   - Collected: No (user-provided only)

4. **Identifiers**
   - Device ID
   - Purpose: Analytics
   - Linked to user: No
   - Used for tracking: No
   - Collected: Yes (Firebase Installation ID)

5. **Diagnostics**
   - Crash Data
   - Purpose: App Functionality
   - Linked to user: No
   - Used for tracking: No
   - Collected: Yes

**Data NOT Collected:**
- ✗ Location
- ✗ Contacts
- ✗ Browsing history
- ✗ Search history
- ✗ Purchase history
- ✗ Financial info
- ✗ Health data
- ✗ Sensitive info

**Third-Party Analytics:** Firebase Analytics (automatic)

---

## Phase 10: TestFlight Beta Testing (Days 12-18)

### Internal Testing

1. [ ] Upload build from EAS to TestFlight (automatic)
2. [ ] Add internal testers (up to 100):
   - Add your email
   - Add test account: googleplay.reviewer@scorevault.app
   - Invite 5-10 friends/family with iPhones
3. [ ] Send test invitations
4. [ ] Testers install via TestFlight app
5. [ ] Collect feedback for 5-7 days

### Test Checklist

**Core Features:**
- [ ] Sign up / Sign in
- [ ] Add gymnast
- [ ] Edit gymnast profile with photo
- [ ] Add meet
- [ ] Enter scores for meet
- [ ] View team scores
- [ ] View analytics
- [ ] Create social card
- [ ] Save to photo library
- [ ] Cloud backup
- [ ] Cloud restore
- [ ] Delete account
- [ ] Switch language (English/Spanish)
- [ ] Dark mode

**iOS-Specific:**
- [ ] Haptic feedback works
- [ ] Swipe-back navigation works
- [ ] Permissions prompt correctly
- [ ] Photo library access works
- [ ] No crashes on various iOS versions
- [ ] Works on iPad (larger screen)
- [ ] Rotation handling (if applicable)

### Bug Fixes

- [ ] Address any bugs found in testing
- [ ] Create new build if needed
- [ ] Re-test critical fixes

---

## Phase 11: App Review Preparation (Day 19)

### Demo Account

Create demo account with sample data for Apple reviewers:

**Account:** googleplay.reviewer@scorevault.app
**Password:** GooglePlay2024!Review

**Sample Data to Include:**
- 5-10 gymnasts across different levels
- 3-5 meets with scores
- Mix of Women's and Men's gymnastics
- At least one team score calculation
- Some analytics data (multiple meets for trends)

### Notes for Reviewer

```
DEMO ACCOUNT
Email: googleplay.reviewer@scorevault.app
Password: GooglePlay2024!Review

This account is pre-populated with sample gymnastics data.

ABOUT THE APP
ScoreVault is a gymnastics scoring and team management app. It helps coaches and athletes track competition scores, calculate team placements, and analyze performance trends.

KEY FEATURES TO TEST:
1. View gymnast roster on home screen
2. Tap a meet to see all scores
3. Tap "Teams" tab to see team score calculations
4. Tap a score card to see analytics
5. Use + button to add new scores

GYMNASTICS SCORING INFO:
- Women's events: Vault, Bars, Beam, Floor
- Men's events: Floor, Pommel Horse, Rings, Vault, Parallel Bars, High Bar
- Scores typically range from 0.000 to 10.000
- All-Around = sum of all event scores

The app is designed for the gymnastics community and follows standard USA Gymnastics scoring formats.
```

### Export Compliance

**Does your app use encryption?**
- **Answer: No**
- App only uses HTTPS for network communication (standard transport security)
- No custom encryption implementation
- Qualifies for exemption

---

## Phase 12: Final Submission (Day 20)

### Pre-Submission Checklist

- [ ] Latest build uploaded to App Store Connect
- [ ] All screenshots uploaded (6.7" and 5.5")
- [ ] App Preview video uploaded (if created)
- [ ] App description complete
- [ ] Keywords finalized
- [ ] Privacy details declared
- [ ] Age rating complete
- [ ] Pricing set ($6.99)
- [ ] Support URL working
- [ ] Privacy Policy URL working
- [ ] Demo account credentials working
- [ ] TestFlight testing complete
- [ ] No known critical bugs

### Submit for Review

1. [ ] Go to App Store Connect
2. [ ] Select ScoreVault
3. [ ] Click version (1.0.5)
4. [ ] Select the build
5. [ ] Review all information
6. [ ] Click "Submit for Review"
7. [ ] Respond to any additional questions
8. [ ] Wait for review (typically 24-48 hours)

### Review Status Monitoring

- **In Review:** Apple is actively reviewing
- **Pending Developer Release:** Approved! Ready to release
- **Rejected:** Address issues and resubmit
- **Ready for Sale:** Live on App Store!

---

## Phase 13: Launch & Post-Release (Days 21-30)

### Release to App Store

Once approved:
1. [ ] Release app immediately or schedule release
2. [ ] Verify app is live on App Store
3. [ ] Test download and installation
4. [ ] Share App Store link on social media

### App Store Link

```
https://apps.apple.com/app/scorevault/[APP_ID]
```

### Post-Launch Tasks

1. [ ] Update website with iOS App Store badge
2. [ ] Update PRIVACY_POLICY.md with iOS information
3. [ ] Monitor crash reports in App Store Connect
4. [ ] Respond to user reviews
5. [ ] Track downloads and revenue
6. [ ] Plan next version features

### Marketing

**App Store Optimization (ASO):**
- Monitor keyword rankings
- A/B test screenshots (can change anytime)
- Update promotional text seasonally
- Encourage satisfied users to leave reviews

**Social Media:**
- Share launch announcement
- Post screenshots/video
- Engage with gymnastics community
- Offer launch discount (if desired)

---

## Timeline Summary

| Phase | Duration | Days |
|-------|----------|------|
| Account Setup | 1-3 days | 1-3 |
| Firebase & Configuration | 1-2 days | 3-4 |
| First Build | 1-2 days | 4-5 |
| App Store Connect Setup | 1-2 days | 5-6 |
| Content Creation | 2-3 days | 6-8 |
| Screenshots | 2-3 days | 8-10 |
| App Preview Video | 1-2 days | 10-11 |
| Privacy Details | 1 day | 11 |
| TestFlight Testing | 6-7 days | 12-18 |
| Review Preparation | 1 day | 19 |
| Submission | 1 day | 20 |
| Apple Review | 1-7 days | 20-27 |
| Launch | 1 day | 27-30 |

**Total Time: 4-6 weeks**

---

## Cost Breakdown

| Item | Cost | Frequency |
|------|------|-----------|
| Apple Developer Program | $99 | Yearly |
| EAS Build | $29 | Monthly |
| **Total First Month** | **$128** | - |
| **Ongoing (Monthly)** | **$29** | After year 1 |
| **Ongoing (Yearly)** | **$99** | Apple renewal |

---

## Risks & Mitigation

### Risk 1: App Rejection
**Mitigation:**
- Follow Apple Human Interface Guidelines
- Test thoroughly before submission
- Provide clear demo account
- Respond quickly to reviewer questions

### Risk 2: Build Issues
**Mitigation:**
- Use EAS Build (handles complexity)
- Test on real devices via TestFlight
- Keep dependencies up-to-date

### Risk 3: Privacy Compliance
**Mitigation:**
- Accurately declare data collection
- Link to privacy policy
- Offer account deletion
- Get user consent for photos

### Risk 4: Performance Issues on iOS
**Mitigation:**
- Test on multiple iOS versions
- Test on older devices (iPhone X, etc.)
- Profile app performance
- Optimize animations/images

---

## Success Criteria

**Launch Success:**
- [ ] App approved on first submission
- [ ] 4.5+ star average rating
- [ ] < 1% crash rate
- [ ] 50+ downloads in first week
- [ ] Positive user reviews mentioning ease of use

**3-Month Success:**
- [ ] 500+ downloads
- [ ] 4.5+ star rating maintained
- [ ] Featured users sharing on social media
- [ ] Gymnastics coaches recommending app
- [ ] Revenue covering costs ($128+ in sales)

---

## Next Steps

**Immediate (This Week):**
1. [ ] Enroll in Apple Developer Program
2. [ ] Sign up for EAS Build
3. [ ] Add iOS app to Firebase

**Week 2:**
4. [ ] Update app.json with iOS config
5. [ ] Run first EAS build
6. [ ] Set up App Store Connect

**Week 3:**
7. [ ] Create screenshots
8. [ ] Internal testing via TestFlight
9. [ ] Write store listing

**Week 4:**
10. [ ] Submit for review
11. [ ] Launch!

---

## Resources

**Documentation:**
- Apple Developer: https://developer.apple.com
- App Store Connect: https://appstoreconnect.apple.com
- EAS Build: https://docs.expo.dev/build/introduction/
- TestFlight: https://developer.apple.com/testflight/

**Support:**
- Apple Developer Forums: https://developer.apple.com/forums/
- Expo Discord: https://chat.expo.dev
- React Native Community: https://reactnative.dev/help

**Tools:**
- Xcode (for screenshots)
- TestFlight (for testing)
- App Store Connect (for management)
- Firebase Console (for configuration)

---

**Last Updated:** October 31, 2025
**Document Version:** 1.0
**Contact:** twotreessoftware@gmail.com
