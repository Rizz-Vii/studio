/**
 * Service Worker for RankPilot PWA
 * Advanced Architecture Enhancement - DevReady Phase 3
 * 
 * Features:
 * - Offline functionality with intelligent caching
 * - Background sync for data synchronization
 * - Push notifications for critical SEO alerts
 * - Cache-first strategy for static assets
 * - Network-first strategy for dynamic data
 */

const CACHE_NAME = 'rankpilot-v1.0.0';
const STATIC_CACHE = 'rankpilot-static-v1';
const DYNAMIC_CACHE = 'rankpilot-dynamic-v1';

// Static assets to cache immediately - FIXED: removed non-existent routes
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/favicon.ico',
    '/manifest.json'
    // Removed '/settings' and '/neuroseo' as they cause 404 errors in cache.addAll()
];

// API endpoints to cache with network-first strategy
const DYNAMIC_CACHE_PATHS = [
    '/api/user',
    '/api/dashboard',
    '/api/neuroseo',
    '/api/settings'
];

// Install event - cache static assets with individual error handling
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(STATIC_CACHE);

                // Cache assets individually to prevent cache.addAll() failures
                const cachePromises = STATIC_ASSETS.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response);
                            console.log(`✅ [SW] Cached: ${url}`);
                        } else {
                            console.warn(`⚠️ [SW] Failed to cache ${url}: ${response.status}`);
                        }
                    } catch (error) {
                        console.error(`❌ [SW] Cache error for ${url}:`, error);
                        // Continue with other assets instead of failing entirely
                    }
                });

                await Promise.allSettled(cachePromises); // Use allSettled instead of all
                console.log('🚀 [SW] Installation complete');

                return self.skipWaiting();
            } catch (error) {
                console.error('❌ [SW] Installation failed:', error);
                throw error;
            }
        })()
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle API requests with network-first strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Handle static assets with cache-first strategy
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirstStrategy(request));
        return;
    }

    // Handle app routes with stale-while-revalidate
    if (isAppRoute(url.pathname)) {
        event.respondWith(staleWhileRevalidateStrategy(request));
        return;
    }
});

// Network-first strategy for dynamic content
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for failed requests
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'This feature requires an internet connection'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Failed to fetch static asset:', request.url);
        return new Response('Asset not available offline', { status: 503 });
    }
}

// Stale-while-revalidate strategy for app routes
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });

    return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(pathname) {
    return pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
}

function isAppRoute(pathname) {
    const appRoutes = [
        '/',
        '/dashboard',
        '/settings',
        '/neuroseo',
        '/analytics',
        '/competitors',
        '/reports'
    ];

    return appRoutes.some(route => pathname.startsWith(route));
}

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);

    if (event.tag === 'neuroseo-analysis') {
        event.waitUntil(syncNeuroSEOAnalysis());
    }

    if (event.tag === 'user-preferences') {
        event.waitUntil(syncUserPreferences());
    }
});

async function syncNeuroSEOAnalysis() {
    try {
        // Get pending analysis requests from IndexedDB
        const pendingRequests = await getPendingAnalysisRequests();

        for (const request of pendingRequests) {
            try {
                const response = await fetch('/api/neuroseo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request.data)
                });

                if (response.ok) {
                    await removePendingRequest(request.id);

                    // Notify user of successful sync
                    await showNotification('Analysis Complete', {
                        body: 'Your SEO analysis has been completed',
                        icon: '/icons/icon-192x192.png',
                        tag: 'analysis-complete'
                    });
                }
            } catch (error) {
                console.error('[SW] Failed to sync analysis request:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

async function syncUserPreferences() {
    try {
        const pendingPreferences = await getPendingPreferences();

        for (const pref of pendingPreferences) {
            try {
                const response = await fetch('/api/user/preferences', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pref.data)
                });

                if (response.ok) {
                    await removePendingPreference(pref.id);
                }
            } catch (error) {
                console.error('[SW] Failed to sync preferences:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Preference sync failed:', error);
    }
}

// Push notifications for critical SEO alerts
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    if (!event.data) {
        return;
    }

    try {
        const data = event.data.json();

        const options = {
            body: data.body || 'You have a new notification',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: data.tag || 'default',
            data: data.url ? { url: data.url } : undefined,
            actions: data.actions || [
                {
                    action: 'view',
                    title: 'View Details',
                    icon: '/icons/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/icons/dismiss-icon.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'RankPilot', options)
        );
    } catch (error) {
        console.error('[SW] Failed to show notification:', error);
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    if (action === 'dismiss') {
        return;
    }

    let targetUrl = '/dashboard';

    if (action === 'view' && data?.url) {
        targetUrl = data.url;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }

            // Open new window if app not open
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// IndexedDB helpers for offline data management
async function getPendingAnalysisRequests() {
    // Implementation would use IndexedDB to store/retrieve pending requests
    return [];
}

async function removePendingRequest(id) {
    // Implementation would remove request from IndexedDB
}

async function getPendingPreferences() {
    // Implementation would use IndexedDB to store/retrieve pending preferences
    return [];
}

async function removePendingPreference(id) {
    // Implementation would remove preference from IndexedDB
}

async function showNotification(title, options) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        return registration.showNotification(title, options);
    }
}
