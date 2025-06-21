// src/context/AuthContext.tsx
    'use client';

    import React, { createContext, useContext, useEffect, useState } from 'react';
    import { User } from 'firebase/auth';
    import { auth, db } from '@/lib/firebase'; // Import auth
    import { doc, getDoc, updateDoc } from 'firebase/firestore';

    interface AuthContextType {
      user: User | null;
      loading: boolean;
      role: string | null; // Add role to the context
      profile: any; // Add profile data to the context (use a more specific type later)
    }

    const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null, profile: null });

    export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
      const [user, setUser] = useState<User | null>(null);
      const [loading, setLoading] = useState(true);
      const [role, setRole] = useState<string | null>(null); // State for role
      const [profile, setProfile] = useState<any>(null); // State for profile data
    
      useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          setUser(user);
          setLoading(true);if (user) {
            // Fetch user document from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
    
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setRole(userData?.role || null); // Set the role from the document
              setProfile(userData?.profile || null ); // Set other profile data
            } else {
              setRole(null); // User document not found
              setProfile(null);
            }
          } else {
            setRole(null); // User logged out
            setProfile(null);
          }
    
          setLoading(false); // Set loading to false after fetching profile
        });
    
        // Clean up the subscription on unmount
        return () => unsubscribe();
      }, []);

      return (
        <AuthContext.Provider value={{ user, loading, role, profile }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => {
      return useContext(AuthContext);
    };