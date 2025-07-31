#!/usr/bin/env node

// 🧪 RankPilot Agent System Integration Test
// Testing complete integration with TypeScript error resolution

import { activateRankPilotAgents, rankPilotAgentSystem } from './src/lib/agents/AgentImplementation.js';

async function testAgentSystem() {
    console.log('🚀 RankPilot Agent System Integration Test');
    console.log('='.repeat(50));

    try {
        // Test 1: System Metrics
        console.log('📊 Testing System Metrics...');
        const metrics = rankPilotAgentSystem.getSystemMetrics();
        console.log('✅ System Metrics:', JSON.stringify(metrics, null, 2));

        // Test 2: Technical Operations Metrics
        console.log('\n🔧 Testing Technical Operations Metrics...');
        const techMetrics = rankPilotAgentSystem.getTechnicalOperationsMetrics();
        console.log('✅ Technical Operations Metrics:', JSON.stringify(techMetrics, null, 2));

        // Test 3: Execute Technical Operations
        console.log('\n🛡️ Testing Technical Operations Execution...');
        const success = await rankPilotAgentSystem.executeTechnicalOperations();
        console.log('✅ Technical Operations Execution Result:', success);

        // Test 4: Full Agent Activation
        console.log('\n🚀 Testing Full Agent System Activation...');
        const activationSuccess = await activateRankPilotAgents();
        console.log('✅ Full Agent System Activation Result:', activationSuccess);

        console.log('\n' + '='.repeat(50));
        console.log('🎉 Agent System Integration Test Complete!');

        if (success && activationSuccess) {
            console.log('✅ All tests passed! Agent system is operational.');
        } else {
            console.log('⚠️ Some tests failed. Check agent implementations.');
        }

    } catch (error) {
        console.error('🚨 Agent System Test Failed:', error);
        process.exit(1);
    }
}

// Run the test
testAgentSystem();
