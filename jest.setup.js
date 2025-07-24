import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
    // Mock console.warn for cleaner test output
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (args[0]?.includes?.('ReactDOM.render is no longer supported')) {
            return;
        }
        originalWarn(...args);
    };
});

// Clean up after each test to prevent memory leaks
afterEach(() => {
    // React Testing Library cleanup
    cleanup();

    // Jest mock cleanup
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.restoreAllMocks();

    // Clear any remaining timeouts/intervals
    if (typeof window !== 'undefined') {
        // Clear any pending timers
        jest.runOnlyPendingTimers();
    }
});

// Global test environment setup
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));
