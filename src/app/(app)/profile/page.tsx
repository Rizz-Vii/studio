// src/app/(app)/profile/page.tsx
"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileForm from "@/components/profile-form";

export default function ProfilePage() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-headline mb-6">Your Profile</h1>
      <ProfileForm user={user} profile={profile} />
    </div>
  );
}
