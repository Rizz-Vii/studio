// Script to check existing Firebase Auth users
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Initialize Firebase Admin
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || 'rankpilot-h3jpc';

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Firebase Admin credentials in .env.test file');
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
}

const auth = getAuth();

async function listExistingUsers() {
  console.log('🔍 Checking existing Firebase Auth users...');
  
  try {
    const listUsersResult = await auth.listUsers(1000);
    
    console.log(`Found ${listUsersResult.users.length} existing users:`);
    
    listUsersResult.users.forEach((userRecord) => {
      console.log(`   📧 ${userRecord.email} (UID: ${userRecord.uid})`);
      console.log(`      Created: ${userRecord.metadata.creationTime}`);
      console.log(`      Verified: ${userRecord.emailVerified}`);
      console.log(`      Disabled: ${userRecord.disabled}`);
      console.log('      ---');
    });

    if (listUsersResult.users.length === 0) {
      console.log('   ⚠️  No users found. You may need to create test users manually in Firebase Console.');
      console.log('   🔗 Go to: https://console.firebase.google.com/project/rankpilot-h3jpc/authentication/users');
    }
    
  } catch (error: any) {
    console.error('❌ Error listing users:', error.message);
    
    if (error.code === 'auth/insufficient-permission') {
      console.log('💡 Suggestion: Check Firebase Admin permissions or create users manually in Firebase Console');
    }
  }
}

async function main() {
  try {
    await listExistingUsers();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
