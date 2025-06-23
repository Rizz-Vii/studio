// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import auth and db
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// A simple inline SVG for the Google logo
const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.79 2.72v2.26h2.9c1.7-1.56 2.67-3.88 2.67-6.62z" fill="#4285F4"></path>
        <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-2.06.92-1.65.12-3.4-.7-4.04-2.58H1.96v2.33A8.99 8.99 0 0 0 9 18z" fill="#34A853"></path>
        <path d="M4.96 10.71A5.41 5.41 0 0 1 4.64 9c0-.58.1-1.15.32-1.7V5.01L1.96 5C1.34 6.18 1 7.55 1 9s.34 2.82 1.96 4z" fill="#FBBC05"></path>
        <path d="M9 3.9c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 9 0a8.99 8.99 0 0 0-7.04 4l3.02 2.33c.63-1.88 2.39-2.7 4.02-2.73z" fill="#EA4335"></path>
      </g>
    </svg>
  );

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const { user, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (role === 'admin') {
        router.push('/adminonly');
      } else if (role === 'user') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection is handled by the useEffect hook
    } catch (error: any) {
      console.error("Error logging in:", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          createdAt: serverTimestamp(),
        });
      }
      // Redirection is handled by the useEffect hook
    } catch (error: any) {
      console.error("Error with Google Sign-In:", error.message);
    }
  };

  if (loading || user) {
    return null;
  }

  return (
    <div className="flex min-h-60px items-center justify-center">
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

        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
        </div>
        
        <button
            onClick={handleGoogleSignIn}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <GoogleIcon />
            Sign in with Google
        </button>


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
