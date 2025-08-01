#!/usr/bin/env node

/**
 * RankPilot Dashboard Query Verification
 * Tests all dashboard data queries with real Firebase connection
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses ADC automatically)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'rankpilot-h3jpc'
  });
}

const db = admin.firestore();

async function testDashboardQueries() {
  console.log('🚀 RankPilot Dashboard Query Verification\n');
  
  const testResults = {
    neuroSeoAnalyses: 0,
    keywordResearch: 0,
    projects: 0,
    userAnalyses: 0,
    recentAnalyses: 0
  };

  try {
    // Test 1: NeuroSEO analyses with status filter (using actual test user)
    console.log('1️⃣ Testing NeuroSEO analyses (status + userId + completedAt DESC)...');
    const neuroQuery1 = db.collection('neuroSeoAnalyses')
      .where('status', '==', 'completed')
      .where('userId', '==', 'vGZSfZA7yPOOCgUGtAS2ywvwP8l1') // Abbas Ali (admin user)
      .orderBy('completedAt', 'desc')
      .limit(10);
    
    const neuroSnapshot1 = await neuroQuery1.get();
    testResults.neuroSeoAnalyses = neuroSnapshot1.size;
    console.log(`   ✅ Found ${neuroSnapshot1.size} completed analyses`);

    // Test 2: User's analyses ordered by completion (using actual test user)
    console.log('\n2️⃣ Testing user analyses (userId + completedAt DESC)...');
    const neuroQuery2 = db.collection('neuroSeoAnalyses')
      .where('userId', '==', 'UFGrzIf2N3UTPd5Xz7vT8tMZpHJ3') // Admin user with 50 analyses
      .orderBy('completedAt', 'desc')
      .limit(5);
    
    const neuroSnapshot2 = await neuroQuery2.get();
    testResults.userAnalyses = neuroSnapshot2.size;
    console.log(`   ✅ Found ${neuroSnapshot2.size} user analyses`);

    // Test 3: Keyword research data (using actual test user)
    console.log('\n3️⃣ Testing keyword research queries...');
    const keywordQuery = db.collection('keywordResearch')
      .where('userId', '==', 'UFGrzIf2N3UTPd5Xz7vT8tMZpHJ3') // Admin user with 108 records
      .orderBy('createdAt', 'desc')
      .limit(5);
    
    const keywordSnapshot = await keywordQuery.get();
    testResults.keywordResearch = keywordSnapshot.size;
    console.log(`   ✅ Found ${keywordSnapshot.size} keyword research records`);

    // Test 4: Projects data (using actual test user)
    console.log('\n4️⃣ Testing projects queries...');
    const projectsQuery = db.collection('projects')
      .where('userId', '==', 'UFGrzIf2N3UTPd5Xz7vT8tMZpHJ3') // Admin user
      .limit(5);
    
    const projectsSnapshot = await projectsQuery.get();
    testResults.projects = projectsSnapshot.size;
    console.log(`   ✅ Found ${projectsSnapshot.size} projects`);

    // Test 5: Recent activity (userId + createdAt DESC) - using actual test user
    console.log('\n5️⃣ Testing recent activity (userId + createdAt DESC)...');
    const recentQuery = db.collection('neuroSeoAnalyses')
      .where('userId', '==', 'UFGrzIf2N3UTPd5Xz7vT8tMZpHJ3') // Admin user with 50 analyses
      .orderBy('createdAt', 'desc')
      .limit(3);
    
    const recentSnapshot = await recentQuery.get();
    testResults.recentAnalyses = recentSnapshot.size;
    console.log(`   ✅ Found ${recentSnapshot.size} recent analyses`);

    // Summary
    console.log('\n📊 Dashboard Query Summary:');
    console.log('=' .repeat(40));
    console.log(`NeuroSEO Completed Analyses: ${testResults.neuroSeoAnalyses}`);
    console.log(`User's All Analyses: ${testResults.userAnalyses}`);
    console.log(`Keyword Research Records: ${testResults.keywordResearch}`);
    console.log(`User Projects: ${testResults.projects}`);
    console.log(`Recent Activity: ${testResults.recentAnalyses}`);
    
    const totalRecords = Object.values(testResults).reduce((sum, count) => sum + count, 0);
    console.log(`\n🎉 Total Data Available: ${totalRecords} records`);
    
    if (totalRecords > 0) {
      console.log('\n✅ SUCCESS: Dashboard queries working with real data!');
      console.log('🚀 Users will now see actual data instead of fallback content');
    } else {
      console.log('\n⚠️  No data found - dashboard will show fallback content');
    }

  } catch (error) {
    console.error('\n❌ Query Error:', error.message);
    if (error.code === 9) {
      console.log('\n💡 This indicates missing indexes - they should already be deployed');
      console.log('   Run: firebase deploy --only firestore:indexes --project rankpilot-h3jpc');
    }
    process.exit(1);
  }
}

// Run verification
testDashboardQueries()
  .then(() => {
    console.log('\n🏆 Dashboard verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
