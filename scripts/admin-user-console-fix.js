// Admin User Management Console Script
// Run this in the browser console on your RankPilot app to diagnose and fix admin users

// Usage:
// 1. Login to your RankPilot app as any user
// 2. Open browser console (F12)
// 3. Copy and paste this ENTIRE script (all lines)
// 4. Wait for "RankPilot Admin User Management Loaded!" message
// 5. Run: await adminUserUtils.diagnoseAdminUsers()
// 6. Run: await adminUserUtils.fixAdminUser("admin@rankpilot.com")

const adminUserUtils = {
    async getCurrentUser() {
        // Get current Firebase user
        const auth = window.firebase?.auth?.();
        return auth?.currentUser;
    },

    async diagnoseAdminUsers() {
        console.log("🔍 Diagnosing admin user configurations...\n");

        try {
            const firestore = window.firebase?.firestore?.();
            if (!firestore) {
                console.error("❌ Firebase not available. Make sure you're on a RankPilot page.");
                return;
            }

            // Find all users with admin role
            const usersRef = firestore.collection("users");
            const adminSnapshot = await usersRef.where("role", "==", "admin").get();

            console.log(`Found ${adminSnapshot.size} admin users:\n`);

            const adminUsers = [];

            adminSnapshot.forEach((doc) => {
                const userData = doc.data();
                userData.uid = doc.id;
                adminUsers.push(userData);

                console.log(`👤 Admin User: ${userData.email}`);
                console.log(`   - UID: ${userData.uid}`);
                console.log(`   - Role: ${userData.role}`);
                console.log(`   - Subscription Tier: ${userData.subscriptionTier || "not set"}`);
                console.log(`   - Subscription Status: ${userData.subscriptionStatus || "not set"}`);
                console.log(`   - Display Name: ${userData.displayName || "not set"}`);
                console.log("");
            });

            // Also check for users with admin tier (incorrect configuration)
            const adminTierSnapshot = await usersRef.where("subscriptionTier", "==", "admin").get();

            if (adminTierSnapshot.size > 0) {
                console.log(`⚠️  Found ${adminTierSnapshot.size} users with tier="admin" (should be role="admin" + tier="enterprise"):\n`);

                adminTierSnapshot.forEach((doc) => {
                    const userData = doc.data();
                    console.log(`👤 User with admin tier: ${userData.email}`);
                    console.log(`   - UID: ${doc.id}`);
                    console.log(`   - Role: ${userData.role || "not set"}`);
                    console.log(`   - Tier: ${userData.subscriptionTier}`);
                    console.log("");
                });
            }

            return { adminUsers };

        } catch (error) {
            console.error("❌ Error diagnosing admin users:", error);
            throw error;
        }
    },

    async fixAdminUser(userEmail) {
        console.log(`🔧 Fixing admin configuration for: ${userEmail}\n`);

        try {
            const firestore = window.firebase?.firestore?.();
            if (!firestore) {
                console.error("❌ Firebase not available. Make sure you're on a RankPilot page.");
                return;
            }

            // Find user by email
            const usersRef = firestore.collection("users");
            const userSnapshot = await usersRef.where("email", "==", userEmail).get();

            if (userSnapshot.empty) {
                console.log(`❌ User not found: ${userEmail}`);
                return false;
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            console.log("Current configuration:");
            console.log(`   - Role: ${userData.role || "not set"}`);
            console.log(`   - Subscription Tier: ${userData.subscriptionTier || "not set"}`);
            console.log(`   - Subscription Status: ${userData.subscriptionStatus || "not set"}`);

            // Fix admin user configuration
            const updatedData = {
                role: "admin",
                subscriptionTier: "enterprise", // Admin users get enterprise-level features
                subscriptionStatus: "active",
                updatedAt: new Date(),
            };

            await userDoc.ref.update(updatedData);

            console.log("\n✅ Updated configuration:");
            console.log(`   - Role: admin`);
            console.log(`   - Subscription Tier: enterprise`);
            console.log(`   - Subscription Status: active`);
            console.log("\n🎉 Admin user configuration fixed!");

            return true;

        } catch (error) {
            console.error("❌ Error fixing admin user:", error);
            throw error;
        }
    },

    async quickFixKnownAdmins() {
        const knownAdminEmails = [
            "admin@rankpilot.com",
            "admin.enterprise@test.com",
            "admin@test.com",
        ];

        console.log("🔧 Quick fix for known admin emails...\n");

        for (const email of knownAdminEmails) {
            try {
                await this.fixAdminUser(email);
                console.log(`✅ Fixed: ${email}\n`);
            } catch (error) {
                console.log(`❌ Failed to fix ${email}: ${error}\n`);
            }
        }

        console.log("🎉 Quick fix complete!");
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.adminUserUtils = adminUserUtils;

    console.log(`
🚀 RankPilot Admin User Management Loaded!

Available commands:
- await adminUserUtils.diagnoseAdminUsers()
- await adminUserUtils.fixAdminUser("admin@rankpilot.com") 
- await adminUserUtils.quickFixKnownAdmins()

Example usage:
1. await adminUserUtils.diagnoseAdminUsers()
2. await adminUserUtils.fixAdminUser("admin@rankpilot.com")
  `);
}

export default adminUserUtils;
