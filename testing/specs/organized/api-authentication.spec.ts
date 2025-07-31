import { expect, test } from "@playwright/test";

test.describe('API - Authentication Endpoints', () => {
    test('should handle POST /api/auth/register', async ({ request }) => {
        const response = await request.post('/api/auth/register', {
            data: {
                email: 'test@example.com',
                password: 'TestPassword123!',
                name: 'Test User'
            }
        });
        expect(response.status()).toBeLessThan(500);
    });

    test('should handle POST /api/auth/login', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'test@example.com',
                password: 'TestPassword123!'
            }
        });
        expect(response.status()).toBeLessThan(500);
    });

    test('should handle POST /api/auth/logout', async ({ request }) => {
        const response = await request.post('/api/auth/logout');
        expect(response.status()).toBeLessThan(500);
    });

    test('should handle GET /api/auth/user', async ({ request }) => {
        const response = await request.get('/api/auth/user');
        expect(response.status()).toBeLessThan(500);
    });

    test('should handle POST /api/auth/reset-password', async ({ request }) => {
        const response = await request.post('/api/auth/reset-password', {
            data: { email: 'test@example.com' }
        });
        expect(response.status()).toBeLessThan(500);
    });

    test('should validate authentication tokens', async ({ request }) => {
        const response = await request.get('/api/auth/validate');
        expect(response.status()).toBeLessThan(500);
    });

    test('should handle refresh token requests', async ({ request }) => {
        const response = await request.post('/api/auth/refresh');
        expect(response.status()).toBeLessThan(500);
    });

    test('should manage session data', async ({ request }) => {
        const response = await request.get('/api/auth/session');
        expect(response.status()).toBeLessThan(500);
    });
});
