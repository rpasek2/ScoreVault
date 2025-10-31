/**
 * Script to create a test account for Google Play review
 * Run with: node scripts/createTestAccount.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration (same as in the app)
const firebaseConfig = {
  apiKey: "AIzaSyDXF2MErsia35nQVcUsb08dFu5o0qJBzS8",
  authDomain: "scorevault-d5b34.firebaseapp.com",
  projectId: "scorevault-d5b34",
  storageBucket: "scorevault-d5b34.firebasestorage.app",
  messagingSenderId: "695514704249",
  appId: "1:695514704249:web:06c018b8f2ae4e5429a7a8",
  measurementId: "G-D5ZYHKWN06"
};

// Test account credentials
const TEST_EMAIL = 'googleplay.reviewer@scorevault.app';
const TEST_PASSWORD = 'GooglePlay2024!Review';

async function createTestAccount() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('\n📧 Creating test account...');
    console.log('Email:', TEST_EMAIL);
    console.log('Password:', TEST_PASSWORD);

    // Try to create the account
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
      console.log('\n✅ Test account created successfully!');
      console.log('User ID:', userCredential.user.uid);
      console.log('\n📝 SAVE THESE CREDENTIALS FOR GOOGLE PLAY:');
      console.log('─────────────────────────────────────────────');
      console.log(`Email: ${TEST_EMAIL}`);
      console.log(`Password: ${TEST_PASSWORD}`);
      console.log('─────────────────────────────────────────────');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('\n⚠️  Account already exists. Verifying login...');
        const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        console.log('✅ Test account verified and accessible!');
        console.log('User ID:', userCredential.user.uid);
        console.log('\n📝 EXISTING CREDENTIALS FOR GOOGLE PLAY:');
        console.log('─────────────────────────────────────────────');
        console.log(`Email: ${TEST_EMAIL}`);
        console.log(`Password: ${TEST_PASSWORD}`);
        console.log('─────────────────────────────────────────────');
      } else {
        throw error;
      }
    }

    console.log('\n📱 Next Steps:');
    console.log('1. Open the ScoreVault app');
    console.log('2. Sign in with the above credentials');
    console.log('3. Add sample data:');
    console.log('   - Create 3-4 gymnasts (different levels)');
    console.log('   - Add 2-3 meets');
    console.log('   - Record scores for gymnasts');
    console.log('   - Test team scoring');
    console.log('   - Create a social card');
    console.log('\n4. Use these credentials in Google Play Console');
    console.log('   under "App access" section');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

// Run the script
createTestAccount();
