import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/index";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  updateDoc,
} from "firebase/firestore";

// Define expected quotas for each tier
const TIER_QUOTAS = {
  free: { monthlyAnalyses: 3, keywordTracking: 10, competitorTracking: 3 },
  starter: { monthlyAnalyses: 20, keywordTracking: 50, competitorTracking: 10 },
  agency: {
    monthlyAnalyses: 100,
    keywordTracking: 200,
    competitorTracking: 25,
  },
  enterprise: {
    monthlyAnalyses: 500,
    keywordTracking: 1000,
    competitorTracking: 100,
  },
  admin: { monthlyAnalyses: -1, keywordTracking: -1, competitorTracking: -1 }, // unlimited
};

// Role-to-tier mapping for cleanup
const ROLE_TO_TIER_MAP = {
  free: "free",
  starter: "starter",
  agency: "agency",
  enterprise: "enterprise",
  admin: "admin",
  user: "free", // default user role maps to free tier
};

// Test user patterns to identify
const TEST_USER_PATTERNS = [
  "@test.com",
  "@rankpilot.com",
  "test.com",
  "abc.com",
  ".user1@",
  "admin.",
  "starter.",
  "agency.",
  "enterprise.",
  "free.",
];

export async function POST() {
  try {
    console.log("🚨 Starting comprehensive user data cleanup...");

    const usersSnapshot = await getDocs(collection(db, "users"));
    const cleanupResults = {
      totalUsers: usersSnapshot.docs.length,
      quotasFixed: 0,
      tiersFixed: 0,
      rolesFixed: 0,
      testUsersIdentified: 0,
      productionUsers: 0,
      errors: [],
    };

    const batch = writeBatch(db);
    let batchCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userRef = doc(db, "users", userId);

      // Identify if this is a test user
      const isTestUser = TEST_USER_PATTERNS.some((pattern) =>
        (userData.email || "").includes(pattern)
      );

      if (isTestUser) {
        cleanupResults.testUsersIdentified++;
      } else {
        cleanupResults.productionUsers++;
      }

      const updates = {};
      let needsUpdate = false;

      // 1. Fix empty/null subscription tiers
      let subscriptionTier = userData.subscriptionTier;
      if (!subscriptionTier || subscriptionTier.trim() === "") {
        // If user has a role, map it to tier
        if (userData.role && ROLE_TO_TIER_MAP[userData.role]) {
          subscriptionTier = ROLE_TO_TIER_MAP[userData.role];
        } else {
          subscriptionTier = "free"; // default
        }
        updates.subscriptionTier = subscriptionTier;
        cleanupResults.tiersFixed++;
        needsUpdate = true;
      }

      // 2. Initialize missing quotas based on tier
      if (!userData.quotas) {
        const expectedQuotas =
          TIER_QUOTAS[subscriptionTier] || TIER_QUOTAS.free;
        updates.quotas = {
          ...expectedQuotas,
          used: {
            monthlyAnalyses: 0,
            keywordTracking: 0,
            competitorTracking: 0,
          },
          resetDate: new Date(),
          lastUpdated: new Date(),
        };
        cleanupResults.quotasFixed++;
        needsUpdate = true;
      } else {
        // Update existing quotas to match tier if they don't match
        const expectedQuotas =
          TIER_QUOTAS[subscriptionTier] || TIER_QUOTAS.free;
        const currentQuotas = userData.quotas;

        let quotasNeedUpdate = false;
        const updatedQuotas = { ...currentQuotas };

        Object.keys(expectedQuotas).forEach((quotaKey) => {
          if (currentQuotas[quotaKey] !== expectedQuotas[quotaKey]) {
            updatedQuotas[quotaKey] = expectedQuotas[quotaKey];
            quotasNeedUpdate = true;
          }
        });

        if (quotasNeedUpdate) {
          updatedQuotas.lastUpdated = new Date();
          updates.quotas = updatedQuotas;
          cleanupResults.quotasFixed++;
          needsUpdate = true;
        }
      }

      // 3. Fix role field inconsistencies
      if (userData.role && userData.role !== subscriptionTier) {
        // For test users, align role with tier
        if (isTestUser) {
          updates.role = subscriptionTier;
          cleanupResults.rolesFixed++;
          needsUpdate = true;
        } else {
          // For production users, remove inconsistent role field
          updates.role = subscriptionTier;
          cleanupResults.rolesFixed++;
          needsUpdate = true;
        }
      } else if (!userData.role) {
        // Add missing role field
        updates.role = subscriptionTier;
        cleanupResults.rolesFixed++;
        needsUpdate = true;
      }

      // 4. Remove conflicting plan/planType fields if they exist
      if (userData.plan && userData.plan !== subscriptionTier) {
        updates.plan = subscriptionTier;
        needsUpdate = true;
      }

      if (userData.planType && userData.planType !== subscriptionTier) {
        updates.planType = subscriptionTier;
        needsUpdate = true;
      }

      // 5. Add metadata for tracking
      if (needsUpdate) {
        updates.dataCleanupDate = new Date();
        updates.cleanupVersion = "2025-07-25-tier-consistency";
        updates.isTestUser = isTestUser;

        batch.update(userRef, updates);
        batchCount++;

        // Commit batch every 500 operations to avoid limits
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }

    // Commit any remaining operations
    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      results: cleanupResults,
      message: "User data cleanup completed successfully",
      recommendations: {
        testUserCleanup: `${cleanupResults.testUsersIdentified} test users identified - consider moving to separate environment`,
        monitoringSetup:
          "Set up quota monitoring to prevent future inconsistencies",
        tierValidation:
          "Implement tier validation on user registration/updates",
      },
    });
  } catch (error) {
    console.error("Error during user cleanup:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        recommendation: "Review Firebase security rules and retry cleanup",
      },
      { status: 500 }
    );
  }
}
