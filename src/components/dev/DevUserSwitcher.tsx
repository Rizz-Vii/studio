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
    <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur-sm border border-border text-foreground p-4 rounded-lg shadow-lg text-sm space-y-3 z-[9999] max-w-xs">
      <div className="font-semibold text-primary flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
        Dev Mode
      </div>
      <div className="space-y-2">
        <button
          onClick={() => handleUserSwitch("free")}
          className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
            user?.email === "abbas_ali_rizvi@hotmail.com"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <div className="font-medium">Free User</div>
          <div className="text-xs text-muted-foreground">Abbas (Email/Password)</div>
        </button>
        <button
          onClick={() => handleUserSwitch("starter")}
          className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
            user?.email === "abba7254@gmail.com"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          }`}
        >
          <div className="font-medium">Starter User</div>
          <div className="text-xs text-muted-foreground">Abba (Google Auth)</div>
        </button>
        <button
          onClick={() => handleUserSwitch("logout")}
          className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
            !user ? "bg-destructive text-destructive-foreground" : "hover:bg-muted"
          }`}
        >
          <div className="font-medium">Logout</div>
          <div className="text-xs text-muted-foreground">Sign out current user</div>
        </button>
      </div>
      {user && (
        <div className="text-xs text-muted-foreground border-t border-border pt-2">
          <span className="text-green-600 font-medium">●</span> {user.email}
        </div>
      )}
    </div>
  );
}
