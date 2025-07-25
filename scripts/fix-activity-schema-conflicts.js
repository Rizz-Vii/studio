/**
 * Database Migration Script - CommonJS Compatible
 * Fixes critical activity schema conflicts
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    // Try to use service account key or default credentials
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'rankpilot-h3jpc'
        });
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error.message);
        console.log('💡 Ensure GOOGLE_APPLICATION_CREDENTIALS is set or run: gcloud auth application-default login');
        process.exit(1);
    }
}

const db = admin.firestore();

// Activity Type Mapping: Current Storage → Standard Analytics Names
const ACTIVITY_TYPE_MIGRATION_MAP = {
    "SEO Audit": "audit",
    "Keyword Search": "keyword-research",
    "SERP View": "serp-analysis",
    "Competitor Analysis": "competitor-analysis",
    "Content Analysis": "content-analysis",
    "Content Brief Generation": "content-brief",
    "Link Analysis": "link-analysis",
};

async function fixActivitySchemaConflicts() {
    console.log("🚨 CRITICAL FIX: Starting activity schema conflict resolution...");

    try {
        // Get all users to scan their activities
        const usersSnapshot = await db.collection('users').get();

        const activitiesToUpdate = [];
        let totalActivitiesScanned = 0;
        let conflictingActivities = 0;

        console.log(`📊 Scanning ${usersSnapshot.size} users for activity conflicts...`);

        // Scan all user activities for conflicts
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const activitiesSnapshot = await db.collection('users').doc(userId).collection('activities').get();

            for (const activityDoc of activitiesSnapshot.docs) {
                totalActivitiesScanned++;
                const activityData = activityDoc.data();
                const currentType = activityData.type;

                // Check if this activity type needs migration
                const newType = ACTIVITY_TYPE_MIGRATION_MAP[currentType];

                if (newType && newType !== currentType) {
                    conflictingActivities++;
                    activitiesToUpdate.push({
                        userId,
                        activityId: activityDoc.id,
                        currentType,
                        newType,
                        timestamp: activityData.timestamp,
                    });

                    console.log(`  🔄 ${currentType} → ${newType} (User: ${userId.slice(0, 8)}...)`);
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
        console.log(`\n🔧 UPDATING ${activitiesToUpdate.length} conflicting activities...`);

        const batch = db.batch();
        let updateCount = 0;

        for (const activity of activitiesToUpdate) {
            const activityRef = db.collection('users').doc(activity.userId).collection('activities').doc(activity.activityId);

            batch.update(activityRef, {
                type: activity.newType,
                originalType: activity.currentType, // Preserve original for rollback
                schemaMigrationDate: admin.firestore.FieldValue.serverTimestamp(),
                schemaMigrationVersion: "1.0.0",
            });

            updateCount++;

            // Commit batch every 500 operations (Firestore limit)
            if (updateCount % 500 === 0) {
                await batch.commit();
                console.log(`  ✅ Updated batch ${Math.ceil(updateCount / 500)} (${updateCount}/${activitiesToUpdate.length})`);
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

async function verifySchemaFix() {
    console.log("\n🔍 VERIFYING SCHEMA FIX...");

    try {
        const usersSnapshot = await db.collection('users').get();
        const typeDistribution = {};

        for (const userDoc of usersSnapshot.docs) {
            const activitiesSnapshot = await db.collection('users').doc(userDoc.id).collection('activities').get();

            for (const activityDoc of activitiesSnapshot.docs) {
                const activityType = activityDoc.data().type;
                typeDistribution[activityType] = (typeDistribution[activityType] || 0) + 1;
            }
        }

        console.log("📊 CURRENT ACTIVITY TYPE DISTRIBUTION:");
        Object.entries(typeDistribution)
            .sort(([, a], [, b]) => b - a)
            .forEach(([type, count]) => {
                const isStandard = Object.values(ACTIVITY_TYPE_MIGRATION_MAP).includes(type);
                const status = isStandard ? "✅" : "⚠️";
                console.log(`  ${status} ${type}: ${count} activities`);
            });

        console.log("\n✅ Schema verification completed!");

    } catch (error) {
        console.error("❌ Error during schema verification:", error);
    }
}

// Execute if run directly
if (require.main === module) {
    fixActivitySchemaConflicts()
        .then(() => {
            console.log('\n🚀 Migration completed successfully!');
            process.exit(0);
        })
        .catch(err => {
            console.error('\n💥 Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { fixActivitySchemaConflicts, ACTIVITY_TYPE_MIGRATION_MAP };
