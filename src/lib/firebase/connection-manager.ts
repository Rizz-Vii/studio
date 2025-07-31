/**
 * Firebase Connection Manager - Single Instance Management
 * Fixes Firestore internal assertion failures and connection issues
 */

import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, Firestore, getFirestore, terminate } from 'firebase/firestore';

// Firebase configuration - matches the one in firebase/index.ts
const firebaseConfig = {
    apiKey:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        "AIzaSyB_HzRrVdysW3o-UXUdCkPqW9rH4fWWjyY",
    authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        "rankpilot-h3jpc.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rankpilot-h3jpc",
    storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        "rankpilot-h3jpc.firebasestorage.app",
    messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "283736429782",
    appId:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
        "1:283736429782:web:a3e387a3a79a592121e577",
};

class FirestoreConnectionManager {
    private static instance: FirestoreConnectionManager;
    private db: Firestore | null = null;
    private app: FirebaseApp | null = null;
    private initialized = false;

    private constructor() { }

    static getInstance(): FirestoreConnectionManager {
        if (!FirestoreConnectionManager.instance) {
            FirestoreConnectionManager.instance = new FirestoreConnectionManager();
        }
        return FirestoreConnectionManager.instance;
    }

    getDatabase(): Firestore {
        if (!this.initialized) {
            this.initializeDatabase();
        }
        return this.db!;
    }

    private initializeDatabase() {
        try {
            // Ensure single app instance - prevents "Firebase App named '[DEFAULT]' already exists" errors
            if (getApps().length === 0) {
                this.app = initializeApp(firebaseConfig);
                console.log('🔥 Firebase app initialized');
            } else {
                this.app = getApp();
                console.log('🔥 Using existing Firebase app');
            }

            // Initialize Firestore with error handling
            this.db = getFirestore(this.app);

            // Connect to emulator in development
            if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
                try {
                    connectFirestoreEmulator(this.db, 'localhost', 8080);
                    console.log('🔧 Connected to Firestore emulator');
                } catch (error) {
                    // Emulator connection already exists - ignore error
                    console.log('🔧 Firestore emulator already connected');
                }
            }

            this.initialized = true;
            console.log('✅ Firestore connection established successfully');
        } catch (error) {
            console.error('❌ Firestore initialization failed:', error);
            throw error;
        }
    }

    async resetConnection(): Promise<void> {
        try {
            if (this.db) {
                await terminate(this.db);
                console.log('🧹 Firestore connection terminated');
            }

            this.db = null;
            this.initialized = false;
            this.initializeDatabase();

            console.log('🔄 Firestore connection reset successfully');
        } catch (error) {
            console.error('❌ Failed to reset Firestore connection:', error);
            throw error;
        }
    }

    isConnected(): boolean {
        return this.initialized && this.db !== null;
    }
}

// Export singleton instance
export const connectionManager = FirestoreConnectionManager.getInstance();
export const db = connectionManager.getDatabase();
export const resetFirestoreConnection = () => connectionManager.resetConnection();

// Health check function
export const validateConnection = async (): Promise<boolean> => {
    try {
        if (!connectionManager.isConnected()) {
            console.warn('⚠️ Firestore not connected, attempting to reconnect...');
            await connectionManager.resetConnection();
        }
        return true;
    } catch (error) {
        console.error('❌ Firestore connection validation failed:', error);
        return false;
    }
};
