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
import { useRouter } from 'next/navigation';

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
  const router = useRouter(); // Initialize useRouter

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const [isEditing, setIsEditing] = useState(false); // State to control edit mode

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
      setIsEditing(false); // Exit edit mode

      // **Add this line to refresh the page**
      router.refresh();

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
  const handleEditClick = () => {
    setIsEditing(true); // Enter edit mode
  };

  const handleCancelClick = () => {
    setFormData(userProfile || {}); // Reset form data to current profile data
    setIsEditing(false); // Exit edit mode
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

       {/* Read-only view */}
       {!isEditing && userProfile && (
        <div className="space-y-4"> {/* Use space-y-4 for consistent spacing */}
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          <p><strong>Member Since:</strong> {userProfile.createdAt ? new Date(userProfile.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
          {userProfile.displayName && <p><strong>Display Name:</strong> {userProfile.displayName}</p>}
          {userProfile.bio && <p><strong>Bio:</strong> {userProfile.bio}</p>}
          {userProfile.targetWebsite && <p><strong>Target Website URL:</strong> {userProfile.targetWebsite}</p>}
          {userProfile.primaryKeywords && <p><strong>Primary Keywords:</strong> {userProfile.primaryKeywords}</p>}
          {/* Display other read-only profile data */}

          <Button onClick={handleEditClick}>Edit Profile</Button>
        </div>
      )}

       {/* Editable form view */}
       {isEditing && (
        <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
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
          <div>
            <Label htmlFor="targetWebsite">Target Website URL</Label>
            <Input
              id="targetWebsite"
              name="targetWebsite"
              type="url"
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
        </form>
      )}
      {/* Add other editable fields here */}
      {isEditing && (
          <div className="flex space-x-4"> {/* Flex container for buttons */}
            <Button type="submit" form="profile-form" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button variant="outline" onClick={handleCancelClick} disabled={isSaving}>
              Cancel
            </Button>
          </div>  )}

      {/* Message if profile data is loading or not available initially */}
      {!isEditing && !userProfile && !loadingProfile && !error && (
          <div>No profile data available.</div>
      )}
    </div>
  );
}
