/**
 * Critical Database Fix: Activity Schema Standardization
 * Resolves production-breaking mismatch between stored activity types
 * and analytics/profile queries
 */

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Activity Type Mapping: Current Storage → Standard Analytics Names
const ACTIVITY_TYPE_MIGRATION_MAP = {
  // Current stored names → Expected analytics names
  "SEO Audit": "audit",
  "Keyword Search": "keyword-research",
  "SERP View": "serp-analysis",
  "Competitor Analysis": "competitor-analysis",
  "Content Analysis": "content-analysis",
  "Content Brief Generation": "content-brief",
  "Link Analysis": "link-analysis",
} as const;

interface ActivityData {
  userId: string;
  activityId: string;
  currentType: string;
  newType: string;
  timestamp: any;
}

export async function fixActivitySchemaConflicts(): Promise<void> {
  console.log(
    "🚨 CRITICAL FIX: Starting activity schema conflict resolution..."
  );

  try {
    // Get all users to scan their activities
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    const activitiesToUpdate: ActivityData[] = [];
    let totalActivitiesScanned = 0;
    let conflictingActivities = 0;

    console.log(
      `📊 Scanning ${usersSnapshot.size} users for activity conflicts...`
    );

    // Scan all user activities for conflicts
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const activitiesRef = collection(db, "users", userId, "activities");
      const activitiesSnapshot = await getDocs(activitiesRef);

      for (const activityDoc of activitiesSnapshot.docs) {
        totalActivitiesScanned++;
        const activityData = activityDoc.data();
        const currentType = activityData.type;

        // Check if this activity type needs migration
        const newType =
          ACTIVITY_TYPE_MIGRATION_MAP[
            currentType as keyof typeof ACTIVITY_TYPE_MIGRATION_MAP
          ];

        if (newType && newType !== currentType) {
          conflictingActivities++;
          activitiesToUpdate.push({
            userId,
            activityId: activityDoc.id,
            currentType,
            newType,
            timestamp: activityData.timestamp,
          });

          console.log(
            `  🔄 ${currentType} → ${newType} (User: ${userId.slice(0, 8)}...)`
          );
        }
      }
    }

    console.log(`\n📈 CONFLICT ANALYSIS COMPLETE:`);
    console.log(`  Total activities scanned: ${totalActivitiesScanned}`);
    console.log(`  Conflicting activities found: ${conflictingActivities}`);
    console.log(`  Activities needing migration: ${activitiesToUpdate.length}`);

    if (activitiesToUpdate.length === 0) {
      console.log("✅ No activity schema conflicts found!");
      return;
    }

    // Batch update conflicting activities
    console.log(
      `\n🔧 UPDATING ${activitiesToUpdate.length} conflicting activities...`
    );

    const batch = writeBatch(db);
    let updateCount = 0;

    for (const activity of activitiesToUpdate) {
      const activityRef = doc(
        db,
        "users",
        activity.userId,
        "activities",
        activity.activityId
      );

      batch.update(activityRef, {
        type: activity.newType,
        originalType: activity.currentType, // Preserve original for rollback
        schemaMigrationDate: new Date(),
        schemaMigrationVersion: "1.0.0",
      });

      updateCount++;

      // Commit batch every 500 operations (Firestore limit)
      if (updateCount % 500 === 0) {
        await batch.commit();
        console.log(
          `  ✅ Updated batch ${Math.ceil(updateCount / 500)} (${updateCount}/${activitiesToUpdate.length})`
        );
      }
    }

    // Commit remaining operations
    if (updateCount % 500 !== 0) {
      await batch.commit();
    }

    console.log(`\n🎉 CRITICAL FIX COMPLETED SUCCESSFULLY!`);
    console.log(`  ✅ Updated ${activitiesToUpdate.length} activity records`);
    console.log(`  ✅ Analytics and profiles should now work correctly`);
    console.log(`  ✅ Achievement badges should display proper counts`);

    // Verify the fix worked
    await verifySchemaFix();
  } catch (error) {
    console.error("❌ CRITICAL ERROR during activity schema fix:", error);
    throw error;
  }
}

async function verifySchemaFix(): Promise<void> {
  console.log("\n🔍 VERIFYING SCHEMA FIX...");

  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    const typeDistribution: Record<string, number> = {};

    for (const userDoc of usersSnapshot.docs) {
      const activitiesRef = collection(db, "users", userDoc.id, "activities");
      const activitiesSnapshot = await getDocs(activitiesRef);

      for (const activityDoc of activitiesSnapshot.docs) {
        const activityType = activityDoc.data().type;
        typeDistribution[activityType] =
          (typeDistribution[activityType] || 0) + 1;
      }
    }

    console.log("📊 CURRENT ACTIVITY TYPE DISTRIBUTION:");
    Object.entries(typeDistribution)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        const isStandard = Object.values(ACTIVITY_TYPE_MIGRATION_MAP).includes(
          type as any
        );
        const status = isStandard ? "✅" : "⚠️";
        console.log(`  ${status} ${type}: ${count} activities`);
      });

    console.log("\n✅ Schema verification completed!");
  } catch (error) {
    console.error("❌ Error during schema verification:", error);
  }
}

// Export for use in admin interface
export { ACTIVITY_TYPE_MIGRATION_MAP };
