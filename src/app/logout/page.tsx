'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import LoadingScreen from '@/components/ui/loading-screen';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await auth.signOut();
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        // Ensure redirection happens even if signOut fails for some reason
        router.push('/login');
      }
    };

    performLogout();
  }, [router]);

  return <LoadingScreen />;
}
