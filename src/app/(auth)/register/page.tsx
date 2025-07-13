// src/app/(auth)/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Import auth and db
import { doc, setDoc } from "firebase/firestore"; // Import firestore functions
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const router = useRouter();

  const { user, loading } = useAuth(); // Use the useAuth hook

  // Add this useEffect hook to check authentication state and redirect
  useEffect(() => {
    if (!loading && user) {
      // Redirect to dashboard if user is already logged in and not loading
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Add this condition to not render the form while loading or if user is logged in
  if (loading || user) {
    return null; // Or you could return a loading spinner
  }

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "user", // Default role is 'user'
        createdAt: new Date(),
        // Add other initial user data here
      });

      // Redirect to dashboard or desired page after successful registration
      router.push("/");
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, form: "Registration failed. Please try again." }));
    }
  };

  return (
    <div className="flex min-h-60px items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
              }}
              className={`w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : ''}`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
              }}
              className={`w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary ${errors.password ? 'border-red-500' : ''}`}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          {errors.form && (
            <p className="text-red-600 text-xs mt-2 text-center">{errors.form}</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-primary rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
