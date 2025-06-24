// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface UserActivity {
  id: string;
  type: string;
  tool: string;
  timestamp: any; // Firestore Timestamp
  details?: any;
  resultsSummary?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  profile: any;
  activities: UserActivity[];
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null, profile: null, activities: [] });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile and role
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setRole(userData?.role || null);
          setProfile(userData || null );
        } else {
          setRole(null);
          setProfile(null);
        }

        // Fetch user activities
        const activitiesRef = collection(db, "users", user.uid, "activities");
        const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        const fetchedActivities = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as UserActivity));
        setActivities(fetchedActivities);

      } else {
        setRole(null);
        setProfile(null);
        setActivities([]); // Clear activities on logout
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, profile, activities }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
