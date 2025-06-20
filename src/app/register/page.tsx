// src/app/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import auth and db
import { doc, setDoc } from 'firebase/firestore'; // Import firestore functions
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const { user, loading } = useAuth(); // Use the useAuth hook
  
    // Add this useEffect hook to check authentication state and redirect
    useEffect(() => {
      if (!loading && user) {
        // Redirect to dashboard if user is already logged in and not loading
        router.push('/');
      }
    }, [user, loading, router]);
  
    // Add this condition to not render the form while loading or if user is logged in
    if (loading || user) {
      return null; // Or you could return a loading spinner
    }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: 'user', // Default role is 'user'
        createdAt: new Date(),
        // Add other initial user data here
      });

      // Redirect to dashboard or desired page after successful registration
      router.push('/');
    } catch (error: any) {
      console.error("Error registering:", error.message);
      // Display an error message to the user
    }
  };

  return (
    <div className="flex min-h-60px items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
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
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
