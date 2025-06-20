// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import useProtectedRoute from '@/hooks/useProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  email: string;
  role: string;
  createdAt: Date;
  displayName?: string;
  bio?: string;
  targetWebsite?: string; // Add targetWebsite
  primaryKeywords?: string; // Add primaryKeywords (can be a comma-separated string or an array)
  // Add other fields you might store
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useProtectedRoute();
  const { user: currentUser } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) {
        setLoadingProfile(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfile;
          setUserProfile(data);
          setFormData(data);
        } else {
          setError("User profile not found.");
        }
      } catch (err: any) {
        console.error("Error fetching user profile:", err.message);
        setError("Error loading profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (!authLoading && currentUser) {
      fetchUserProfile();
    }

  }, [authLoading, currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!currentUser) {
      setError("No authenticated user to save profile.");
      setIsSaving(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, formData);

      setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...formData };
      });

      toast({
        title: "Profile saved!",
        description: "Your profile information has been updated.",
      });

    } catch (err: any) {
      console.error("Error saving user profile:", err.message);
      setError("Error saving profile.");
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loadingProfile) {
    return <div>Loading profile...</div>;
  }

  if (error && !userProfile) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>

      {userProfile && (
        <div className="mb-6 space-y-2">
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          <p><strong>Member Since:</strong> {userProfile.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
          {/* Display other read-only profile data here */}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={handleSaveProfile} className="space-y-4">
        <div>
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            value={formData.displayName || ''}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio || ''}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </div>
        {/* Add fields for target website and keywords */}
        <div>
          <Label htmlFor="targetWebsite">Target Website URL</Label>
          <Input
            id="targetWebsite"
            name="targetWebsite"
            type="url" // Use type="url" for website URLs
            value={formData.targetWebsite || ''}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="primaryKeywords">Primary Focus Keywords (comma-separated)</Label>
          <Textarea
            id="primaryKeywords"
            name="primaryKeywords"
            value={formData.primaryKeywords || ''}
            onChange={handleInputChange}
            disabled={isSaving}
          />
        </div>
        {/* Add other editable fields here */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
}
