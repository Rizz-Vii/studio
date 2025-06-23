// src/hooks/useProtectedRoute.ts
    'use client';

    import { useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import { useAuth } from '@/context/AuthContext';
    import LoadingScreen from '@/components/ui/loading-screen';

    export default function useProtectedRoute() {
      const { user, loading,role } = useAuth();
      const router = useRouter();

      useEffect(() => {
        if (!loading && !user) {
          // Redirect to login page if not authenticated and not loading
          router.push('/login');
        }
      }, [user, loading, router,role]);
      
      if (loading) {
        return { user: null, loading: true, role: null, profile: null };
      }

      return { user, loading, role };
    }