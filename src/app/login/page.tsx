// src/app/login/page.tsx
'use client';


import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Import auth from your firebase.ts file
import { useRouter } from 'next/navigation'; // Use next/navigation for client-side routing
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function LoginPage() {

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const { user, loading, role, profile } = useAuth(); // Use the useAuth hook

  // Add this useEffect hook to check authentication state and redirect
  useEffect(() => {
    if (!loading && user ) {
      // Redirect to dashboard if user is already logged in and not loading
      if( role === 'admin') {
      router.push('/adminonly');
      }else if (role === 'user') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  // Add this condition to not render the form while loading or if user is logged in
  if (loading || user) {
    return null; // Or you could return a loading spinner
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard or desired page after successful login
        if( role !== null) {
        router.push('/');
        }
        
     
    } catch (error: any) {
      console.error("Error logging in:", error.message);
      // Display an error message to the user (e.g., using a toast notification)
    }
  };

  return (
    <div className="flex min-h-60px  items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-primary rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
