// src/hooks/useProtectedRoute.ts
    'use client';

    import { useEffect } from 'react';
    import { useRouter } from 'next/navigation';
    import { useAuth } from '@/context/AuthContext';

    export default function useProtectedRoute() {
      const { user, loading,role } = useAuth();
      const router = useRouter();

      useEffect(() => {
        if (!loading && !user) {
          // Redirect to login page if not authenticated and not loading
          router.push('/login');
        }
      }, [user, loading, router,role]);

      return { user, loading, role };
    }