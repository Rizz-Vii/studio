/**
 * Development User Switcher Component
 * Allows switching between test users in development mode using real Firebase auth
 */

"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export function DevUserSwitcher() {
  const { user } = useAuth();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleUserSwitch = async (userType: "free" | "starter" | "logout") => {
    try {
      if (userType === "logout") {
        await signOut(auth);
        return;
      }

      if (userType === "starter") {
        // Use Google sign-in for starter user
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          login_hint: "abba7254@gmail.com",
          prompt: "select_account",
        });
        await signInWithPopup(auth, provider);
      } else {
        // Use email/password for free user
        await signInWithEmailAndPassword(
          auth,
          "abbas_ali_rizvi@hotmail.com",
          "123456"
        );
      }
    } catch (error) {
      console.error("Failed to switch user:", error);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs space-y-2 z-50">
      <div className="font-semibold">Dev Mode - Switch User:</div>
      <div className="space-y-1">
        <button
          onClick={() => handleUserSwitch("free")}
          className={`block w-full text-left px-2 py-1 rounded ${
            user?.email === "abbas_ali_rizvi@hotmail.com"
              ? "bg-blue-600"
              : "hover:bg-gray-600"
          }`}
        >
          Free User (Abbas)
        </button>
        <button
          onClick={() => handleUserSwitch("starter")}
          className={`block w-full text-left px-2 py-1 rounded ${
            user?.email === "abba7254@gmail.com"
              ? "bg-blue-600"
              : "hover:bg-gray-600"
          }`}
        >
          Starter User (Abba) - Google
        </button>
        <button
          onClick={() => handleUserSwitch("logout")}
          className={`block w-full text-left px-2 py-1 rounded ${
            !user ? "bg-blue-600" : "hover:bg-gray-600"
          }`}
        >
          Logged Out
        </button>
      </div>
      {user && (
        <div className="text-green-400 text-xs">Current: {user.email}</div>
      )}
    </div>
  );
}
