/**
 * Firebase Test User Creation Script (JavaScript)
 *
 * Creates test users for role-based testing with proper subscription tiers
 * and access permissions in Firebase Authentication and Firestore.
 */

// Load environment variables
require("dotenv").config({ path: ".env.test" });

const { initializeApp, getApps } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} = require("firebase/auth");
const {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
} = require("firebase/firestore");

// Test users configuration
const TEST_USERS = {
  free: {
    email: "abbas_ali_rizvi@hotmail.com",
    password: "123456",
    role: "free",
    displayName: "Abbas Ali (Free)",
    description: "Free tier user with basic access",
  },
  admin: {
    email: "admin@rankpilot.com",
    password: "admin123",
    role: "admin",
    displayName: "Admin User",
    description: "Admin user with full access to all features",
  },
  enterprise: {
    email: "enterprise@rankpilot.com",
    password: "enterprise123",
    role: "enterprise",
    displayName: "Enterprise User",
    description: "Enterprise tier user with advanced features",
  },
  starter: {
    email: "starter@rankpilot.com",
    password: "starter123",
    role: "starter",
    displayName: "Starter User",
    description: "Starter tier user with intermediate features",
  },
};

// Feature access configuration for each tier
const TIER_FEATURES = {
  free: ["dashboard_access", "basic_keyword_analysis", "limited_searches"],
  starter: [
    "dashboard_access",
    "keyword_analysis",
    "link_analysis",
    "serp_analysis",
    "basic_performance_metrics",
    "export_pdf",
  ],
  agency: [
    "dashboard_access",
    "keyword_analysis",
    "link_analysis",
    "serp_analysis",
    "performance_metrics",
    "competitor_analysis",
    "bulk_operations",
    "export_csv",
    "export_pdf",
  ],
  enterprise: [
    "dashboard_access",
    "keyword_analysis",
    "link_analysis",
    "serp_analysis",
    "performance_metrics",
    "competitor_analysis",
    "bulk_operations",
    "white_label",
    "api_access",
    "export_csv",
    "export_pdf",
    "priority_support",
  ],
  admin: [
    "dashboard_access",
    "keyword_analysis",
    "link_analysis",
    "serp_analysis",
    "performance_metrics",
    "competitor_analysis",
    "bulk_operations",
    "white_label",
    "api_access",
    "export_csv",
    "export_pdf",
    "priority_support",
    "admin_panel",
    "user_management",
    "system_settings",
  ],
};

// Firebase configuration (using environment variables)
const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN ||
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (avoid duplicate initialization)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser(userKey) {
  const user = TEST_USERS[userKey];

  if (!user) {
    throw new Error(`User configuration not found for key: ${userKey}`);
  }

  console.log(`🔐 Creating Firebase user: ${user.displayName} (${user.email})`);

  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      user.email,
      user.password
    );
    const firebaseUser = userCredential.user;

    console.log(`✅ Firebase Auth user created: ${firebaseUser.uid}`);

    // Create user profile in Firestore
    const userProfile = {
      uid: firebaseUser.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      subscription: {
        tier: user.role,
        status: "active",
        startDate: new Date().toISOString(),
        features: TIER_FEATURES[user.role] || [],
      },
      createdAt: new Date().toISOString(),
      testUser: true,
    };

    // Save to Firestore users collection
    await setDoc(doc(db, "users", firebaseUser.uid), userProfile);
    console.log(`✅ User profile created in Firestore`);

    // Create subscription record
    const subscription = {
      userId: firebaseUser.uid,
      tier: user.role,
      status: "active",
      startDate: new Date().toISOString(),
      features: TIER_FEATURES[user.role] || [],
      testAccount: true,
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "subscriptions"), subscription);
    console.log(`✅ Subscription record created`);

    // Sign out the created user
    await signOut(auth);

    return {
      uid: firebaseUser.uid,
      email: user.email,
      role: user.role,
      success: true,
    };
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log(`⚠️ User ${user.email} already exists, updating profile...`);

      try {
        // Sign in and update existing user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          user.email,
          user.password
        );
        const firebaseUser = userCredential.user;

        // Update Firestore profile
        const userProfile = {
          uid: firebaseUser.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          subscription: {
            tier: user.role,
            status: "active",
            startDate: new Date().toISOString(),
            features: TIER_FEATURES[user.role] || [],
          },
          createdAt: new Date().toISOString(),
          testUser: true,
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userProfile, {
          merge: true,
        });
        await signOut(auth);

        console.log(`✅ Updated existing user: ${user.email}`);
        return {
          uid: firebaseUser.uid,
          email: user.email,
          role: user.role,
          success: true,
        };
      } catch (updateError) {
        console.error(
          `❌ Failed to update existing user ${user.email}:`,
          updateError
        );
        return {
          email: user.email,
          role: user.role,
          success: false,
          error: updateError,
        };
      }
    } else {
      console.error(`❌ Failed to create user ${user.email}:`, error);
      return {
        email: user.email,
        role: user.role,
        success: false,
        error: error,
      };
    }
  }
}

async function createAllTestUsers() {
  console.log(`🚀 Starting Firebase test user creation...`);
  console.log(
    `📊 Creating users for roles: ${Object.keys(TEST_USERS).join(", ")}`
  );

  const results = [];

  for (const userKey of Object.keys(TEST_USERS)) {
    try {
      const result = await createTestUser(userKey);
      results.push(result);

      // Add delay between user creation to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to process user ${userKey}:`, error);
      results.push({
        role: userKey,
        success: false,
        error: error,
      });
    }
  }

  // Summary
  console.log(`\n📈 Test User Creation Summary:`);
  console.log(`${"=".repeat(50)}`);

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successfully created/updated: ${successful.length} users`);
  successful.forEach((user) => {
    console.log(`   - ${user.email} (${user.role})`);
  });

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length} users`);
    failed.forEach((user) => {
      console.log(
        `   - ${user.email || user.role}: ${user.error?.message || "Unknown error"}`
      );
    });
  }

  console.log(`\n🎯 Ready for role-based testing!`);
  console.log(`Run: npm run test:role-based`);

  return results;
}

// CLI execution
if (require.main === module) {
  createAllTestUsers()
    .then(() => {
      console.log(`\n✅ Test user creation completed`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`\n❌ Test user creation failed:`, error);
      process.exit(1);
    });
}

module.exports = { createAllTestUsers, createTestUser, TIER_FEATURES };
