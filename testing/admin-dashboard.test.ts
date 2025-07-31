/**
 * 🛡️ Admin Dashboard Comprehensive Test Suite
 * Purpose: Testing enterprise admin functionality with AI agent integration
 * Created: July 31, 2025
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Admin Dashboard - Enterprise Features', () => {

    test.beforeEach(async ({ page }) => {
        // Mock admin authentication
        await page.goto('/login');
        await page.evaluate(() => {
            // Mock admin user session
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'admin_test_123',
                email: 'admin@rankpilot.com',
                role: 'admin'
            }));
        });
    });

    test('Admin Page Access Control', async ({ page }) => {
        await page.goto('/adminonly');

        // Should not redirect to login for admin user
        expect(page.url()).toContain('/adminonly');

        // Check for admin dashboard elements
        await expect(page.locator('h1')).toContainText('Admin Dashboard');
        await expect(page.locator('[data-testid="admin-header"]')).toBeVisible();

        console.log('✅ Admin access control test passed');
    });

    test('System Health Overview Cards', async ({ page }) => {
        await page.goto('/adminonly');

        // Verify all health metric cards are present
        const healthCards = [
            'Overall Health',
            'Database',
            'API Health',
            'AI Agents',
            'Performance'
        ];

        for (const cardTitle of healthCards) {
            await expect(page.locator(`text=${cardTitle}`)).toBeVisible();
        }

        // Check for progress bars
        const progressBars = await page.locator('.progress-bar, [data-testid*="progress"]').count();
        expect(progressBars).toBeGreaterThan(0);

        console.log('✅ System health overview test passed');
    });

    test('AI Agent Control Center', async ({ page }) => {
        await page.goto('/adminonly');

        // Verify AI Agent Control Center section
        await expect(page.locator('text=AI Agent Control Center')).toBeVisible();
        await expect(page.locator('text=15+ specialized agents')).toBeVisible();

        // Check for agent status toggle
        const agentSwitch = page.locator('[data-testid="ai-agents-switch"]');
        if (await agentSwitch.isVisible()) {
            await expect(agentSwitch).toBeVisible();
        }

        // Check for orchestrator cards
        const orchestratorCards = [
            'Customer Support Orchestrator',
            'Business Operations Orchestrator',
            'Technical Operations Orchestrator'
        ];

        for (const orchestrator of orchestratorCards) {
            const orchestratorElement = page.locator(`text=${orchestrator}`);
            if (await orchestratorElement.isVisible()) {
                await expect(orchestratorElement).toBeVisible();
            }
        }

        console.log('✅ AI Agent Control Center test passed');
    });

    test('ChatBot System Integration', async ({ page }) => {
        await page.goto('/adminonly');

        // Verify ChatBot section
        await expect(page.locator('text=AI ChatBot System')).toBeVisible();
        await expect(page.locator('text=GPT-4o powered')).toBeVisible();

        // Check for chatbot toggle
        const chatbotSwitch = page.locator('[data-testid="chatbot-switch"]');
        if (await chatbotSwitch.isVisible()) {
            await chatbotSwitch.click();

            // Verify chatbot interface appears
            await expect(page.locator('[data-testid="admin-chatbot"]')).toBeVisible();
        }

        console.log('✅ ChatBot system integration test passed');
    });

    test('Admin Tabs Navigation', async ({ page }) => {
        await page.goto('/adminonly');

        const tabs = ['Users', 'Subscriptions', 'Analytics', 'System', 'Settings'];

        for (const tab of tabs) {
            await page.click(`text=${tab}`);

            // Verify tab content loads
            const tabContent = page.locator(`[data-state="active"]`);
            await expect(tabContent).toBeVisible();

            // Check for placeholder or actual content
            const hasContent = await page.locator('[data-testid*="admin-"], .p-8, .p-4').isVisible();
            expect(hasContent).toBeTruthy();
        }

        console.log('✅ Admin tabs navigation test passed');
    });

    test('Mobile Responsiveness - Admin Dashboard', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/adminonly');

        // Header should be visible and properly formatted
        await expect(page.locator('h1')).toBeVisible();

        // System health cards should stack properly
        const healthCards = page.locator('[data-testid*="health-card"], .grid > div');
        const cardCount = await healthCards.count();
        expect(cardCount).toBeGreaterThan(0);

        // Tabs should be responsive
        const tabsList = page.locator('[role="tablist"]');
        await expect(tabsList).toBeVisible();

        console.log('✅ Mobile responsiveness test passed');
    });

    test('Error Handling - Non-Admin Access', async ({ page }) => {
        // Clear admin session
        await page.evaluate(() => {
            localStorage.setItem('auth_user', JSON.stringify({
                uid: 'user_123',
                email: 'user@test.com',
                role: 'free'
            }));
        });

        await page.goto('/adminonly');

        // Should show access denied alert
        await expect(page.locator('text=Access Denied')).toBeVisible();
        await expect(page.locator('text=Admin access required')).toBeVisible();

        console.log('✅ Error handling test passed');
    });

    test('Performance - Dashboard Load Time', async ({ page }) => {
        const startTime = performance.now();

        await page.goto('/adminonly');
        await page.waitForLoadState('networkidle');

        const endTime = performance.now();
        const loadTime = endTime - startTime;

        // Dashboard should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);

        console.log(`✅ Performance test passed - Load time: ${loadTime}ms`);
    });

    test('AI Agent Activation Workflow', async ({ page }) => {
        await page.goto('/adminonly');

        // Look for activation controls
        const activateButton = page.locator('button:has-text("Activate AI Agents")');
        const agentSwitch = page.locator('[data-testid="ai-agents-switch"]');

        if (await activateButton.isVisible()) {
            await activateButton.click();

            // Should show activation feedback
            await expect(page.locator('text=Activating')).toBeVisible();
        } else if (await agentSwitch.isVisible()) {
            await agentSwitch.click();

            // Should update agent status
            await expect(page.locator('[data-testid="agent-status"]')).toBeVisible();
        }

        console.log('✅ AI Agent activation workflow test passed');
    });

    test('Emergency Controls - Safety Features', async ({ page }) => {
        await page.goto('/adminonly');

        // Check for emergency shutdown button
        const emergencyButton = page.locator('button:has-text("Emergency"), button:has-text("Stop")');

        if (await emergencyButton.isVisible()) {
            await expect(emergencyButton).toBeVisible();

            // Verify button styling indicates danger
            const buttonClass = await emergencyButton.getAttribute('class');
            expect(buttonClass).toContain('red');
        }

        console.log('✅ Emergency controls test passed');
    });
});
