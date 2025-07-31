/**
 * Advanced Accessibility System for RankPilot
 * Priority 3 Feature Implementation - DevReady Phase 3
 * 
 * Features:
 * - Enhanced ARIA live regions for dynamic content
 * - Advanced keyboard shortcuts and focus management
 * - Screen reader optimization
 * - Cognitive accessibility features
 * - Voice interface integration
 */

import { useEffect, useState } from 'react';

// Web Speech API type definitions
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Accessibility announcements interface
export interface AccessibilityAnnouncement {
    id: string;
    message: string;
    priority: 'polite' | 'assertive';
    type: 'status' | 'alert' | 'log';
    timestamp: number;
}

// Focus management interface
export interface FocusTarget {
    element: HTMLElement;
    priority: number;
    context?: string;
}

// Voice command interface
export interface VoiceCommand {
    phrases: string[];
    action: () => void;
    description: string;
    context?: string;
}

// Keyboard shortcut interface
export interface KeyboardShortcut {
    key: string;
    modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
    action: () => void;
    description: string;
    global?: boolean;
    context?: string;
}

export class AccessibilityManager {
    private static instance: AccessibilityManager;
    private announcements: AccessibilityAnnouncement[] = [];
    private focusHistory: HTMLElement[] = [];
    private shortcuts: Map<string, KeyboardShortcut> = new Map();
    private voiceCommands: VoiceCommand[] = [];
    private recognition: any = null;
    private isListening = false;
    private listeners: Set<(announcement: AccessibilityAnnouncement) => void> = new Set();

    private constructor() {
        this.initializeKeyboardNavigation();
        this.initializeVoiceRecognition();
        this.setupDefaultShortcuts();
    }

    static getInstance(): AccessibilityManager {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager();
        }
        return AccessibilityManager.instance;
    }

    // Announcement management
    announce(message: string, priority: 'polite' | 'assertive' = 'polite', type: 'status' | 'alert' | 'log' = 'status') {
        const announcement: AccessibilityAnnouncement = {
            id: crypto.randomUUID(),
            message,
            priority,
            type,
            timestamp: Date.now(),
        };

        this.announcements.push(announcement);
        this.notifyListeners(announcement);

        // Clean up old announcements
        if (this.announcements.length > 50) {
            this.announcements = this.announcements.slice(-25);
        }

        return announcement.id;
    }

    announceNavigation(from: string, to: string) {
        this.announce(`Navigated from ${from} to ${to}`, 'polite', 'status');
    }

    announceAction(action: string, result?: string) {
        const message = result ? `${action}: ${result}` : action;
        this.announce(message, 'polite', 'status');
    }

    announceError(error: string) {
        this.announce(`Error: ${error}`, 'assertive', 'alert');
    }

    announceSuccess(message: string) {
        this.announce(`Success: ${message}`, 'polite', 'status');
    }

    // Focus management
    focusElement(element: HTMLElement, options: { scroll?: boolean; priority?: number; } = {}) {
        if (!element) return;

        // Add to focus history
        this.focusHistory.push(element);
        if (this.focusHistory.length > 20) {
            this.focusHistory = this.focusHistory.slice(-10);
        }

        // Focus the element
        element.focus();

        // Scroll into view if requested
        if (options.scroll !== false) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Announce focus change for screen readers
        const label = this.getElementLabel(element);
        if (label) {
            this.announce(`Focused: ${label}`, 'polite', 'status');
        }
    }

    focusPrevious() {
        if (this.focusHistory.length > 1) {
            this.focusHistory.pop(); // Remove current
            const previous = this.focusHistory.pop(); // Get previous
            if (previous) {
                this.focusElement(previous, { scroll: true });
            }
        }
    }

    trapFocus(container: HTMLElement) {
        const focusableElements = this.getFocusableElements(container);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);
        firstElement.focus();

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }

    private getFocusableElements(container: HTMLElement): HTMLElement[] {
        const selectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]',
        ];

        return Array.from(container.querySelectorAll(selectors.join(', '))) as HTMLElement[];
    }

    private getElementLabel(element: HTMLElement): string {
        // Try aria-label first
        if (element.getAttribute('aria-label')) {
            return element.getAttribute('aria-label')!;
        }

        // Try aria-labelledby
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
            const labelElement = document.getElementById(labelledBy);
            if (labelElement) {
                return labelElement.textContent || '';
            }
        }

        // Try associated label
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return label.textContent || '';
            }
        }

        // Try text content
        return element.textContent?.trim() || element.tagName.toLowerCase();
    }

    // Keyboard navigation
    private initializeKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const shortcutKey = this.createShortcutKey(e);
            const shortcut = this.shortcuts.get(shortcutKey);

            if (shortcut && shortcut.global) {
                e.preventDefault();
                shortcut.action();
                this.announceAction(`Executed shortcut: ${shortcut.description}`);
            }
        });
    }

    registerShortcut(shortcut: KeyboardShortcut) {
        const key = this.createShortcutKey({
            key: shortcut.key,
            ctrlKey: shortcut.modifiers.includes('ctrl'),
            altKey: shortcut.modifiers.includes('alt'),
            shiftKey: shortcut.modifiers.includes('shift'),
            metaKey: shortcut.modifiers.includes('meta'),
        } as KeyboardEvent);

        this.shortcuts.set(key, shortcut);
    }

    private createShortcutKey(e: KeyboardEvent | { key: string; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; metaKey: boolean; }): string {
        const modifiers = [];
        if (e.ctrlKey) modifiers.push('ctrl');
        if (e.altKey) modifiers.push('alt');
        if (e.shiftKey) modifiers.push('shift');
        if (e.metaKey) modifiers.push('meta');

        return `${modifiers.join('+')}-${e.key.toLowerCase()}`;
    }

    private setupDefaultShortcuts() {
        // Global navigation shortcuts
        this.registerShortcut({
            key: 't',
            modifiers: ['alt'],
            action: () => {
                // Toggle theme - implementation depends on theme system
                document.dispatchEvent(new CustomEvent('toggle-theme'));
            },
            description: 'Toggle theme',
            global: true,
        });

        this.registerShortcut({
            key: '/',
            modifiers: ['alt'],
            action: () => {
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                    this.focusElement(searchInput);
                }
            },
            description: 'Focus search',
            global: true,
        });

        this.registerShortcut({
            key: 'd',
            modifiers: ['alt'],
            action: () => {
                window.location.href = '/dashboard';
            },
            description: 'Go to dashboard',
            global: true,
        });

        this.registerShortcut({
            key: 'Escape',
            modifiers: [],
            action: () => {
                // Close modals, dropdowns, etc.
                document.dispatchEvent(new CustomEvent('close-modals'));
            },
            description: 'Close modals',
            global: true,
        });
    }

    // Voice recognition
    private initializeVoiceRecognition() {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            this.processVoiceCommand(transcript);
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            this.announceError(`Voice recognition error: ${event.error}`);
        };

        this.setupDefaultVoiceCommands();
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.isListening = true;
            this.announce('Voice commands enabled', 'polite', 'status');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.announce('Voice commands disabled', 'polite', 'status');
        }
    }

    registerVoiceCommand(command: VoiceCommand) {
        this.voiceCommands.push(command);
    }

    private processVoiceCommand(transcript: string) {
        for (const command of this.voiceCommands) {
            for (const phrase of command.phrases) {
                if (transcript.includes(phrase.toLowerCase())) {
                    command.action();
                    this.announceAction(`Voice command executed: ${command.description}`);
                    return;
                }
            }
        }

        this.announce(`Command not recognized: ${transcript}`, 'polite', 'status');
    }

    private setupDefaultVoiceCommands() {
        this.registerVoiceCommand({
            phrases: ['go to dashboard', 'open dashboard', 'show dashboard'],
            action: () => { window.location.href = '/dashboard'; },
            description: 'Navigate to dashboard',
        });

        this.registerVoiceCommand({
            phrases: ['search', 'find', 'look for'],
            action: () => {
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                    this.focusElement(searchInput);
                }
            },
            description: 'Focus search input',
        });

        this.registerVoiceCommand({
            phrases: ['help', 'show help', 'what can I do'],
            action: () => {
                this.announceHelp();
            },
            description: 'Show available commands',
        });
    }

    private announceHelp() {
        const shortcuts = Array.from(this.shortcuts.values())
            .filter(s => s.global)
            .map(s => `${s.key} ${s.modifiers.join(' ')}: ${s.description}`)
            .join(', ');

        const voiceCommands = this.voiceCommands
            .map(c => `"${c.phrases[0]}": ${c.description}`)
            .join(', ');

        this.announce(`Available keyboard shortcuts: ${shortcuts}. Available voice commands: ${voiceCommands}`, 'polite', 'log');
    }

    // Listeners
    subscribe(listener: (announcement: AccessibilityAnnouncement) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(announcement: AccessibilityAnnouncement) {
        this.listeners.forEach(listener => listener(announcement));
    }

    // Utility methods
    getAnnouncements(): AccessibilityAnnouncement[] {
        return [...this.announcements];
    }

    clearAnnouncements() {
        this.announcements = [];
    }

    isVoiceSupported(): boolean {
        return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
    }

    isListeningToVoice(): boolean {
        return this.isListening;
    }
}

// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();

// React hooks for accessibility features
export function useAccessibility() {
    const [announcements, setAnnouncements] = useState<AccessibilityAnnouncement[]>([]);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

    useEffect(() => {
        const unsubscribe = accessibilityManager.subscribe((announcement) => {
            setAnnouncements(prev => [...prev.slice(-9), announcement]);
        });

        return unsubscribe;
    }, []);

    return {
        announce: accessibilityManager.announce.bind(accessibilityManager),
        announceNavigation: accessibilityManager.announceNavigation.bind(accessibilityManager),
        announceAction: accessibilityManager.announceAction.bind(accessibilityManager),
        announceError: accessibilityManager.announceError.bind(accessibilityManager),
        announceSuccess: accessibilityManager.announceSuccess.bind(accessibilityManager),
        focusElement: accessibilityManager.focusElement.bind(accessibilityManager),
        focusPrevious: accessibilityManager.focusPrevious.bind(accessibilityManager),
        trapFocus: accessibilityManager.trapFocus.bind(accessibilityManager),
        registerShortcut: accessibilityManager.registerShortcut.bind(accessibilityManager),
        registerVoiceCommand: accessibilityManager.registerVoiceCommand.bind(accessibilityManager),
        startListening: accessibilityManager.startListening.bind(accessibilityManager),
        stopListening: accessibilityManager.stopListening.bind(accessibilityManager),
        isVoiceSupported: accessibilityManager.isVoiceSupported(),
        isVoiceEnabled,
        setIsVoiceEnabled,
        announcements,
    };
}

// Hook for focus management
export function useFocusManagement() {
    const focusElement = (element: HTMLElement | null, options?: { scroll?: boolean; }) => {
        if (element) {
            accessibilityManager.focusElement(element, options);
        }
    };

    const trapFocus = (container: HTMLElement | null) => {
        if (container) {
            return accessibilityManager.trapFocus(container);
        }
    };

    return {
        focusElement,
        focusPrevious: accessibilityManager.focusPrevious.bind(accessibilityManager),
        trapFocus,
    };
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        shortcuts.forEach(shortcut => {
            accessibilityManager.registerShortcut(shortcut);
        });
    }, [shortcuts]);
}

// Hook for voice commands
export function useVoiceCommands(commands: VoiceCommand[]) {
    useEffect(() => {
        commands.forEach(command => {
            accessibilityManager.registerVoiceCommand(command);
        });
    }, [commands]);
}
