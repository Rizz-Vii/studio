"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import type { User } from "firebase/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/(?=.*[a-z])/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/(?=.*[A-Z])/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/(?=.*\d)/, {
        message: "Password must contain at least one number.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface SecuritySettingsFormProps {
  user: User;
}

export default function SecuritySettingsForm({
  user,
}: SecuritySettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handlePasswordUpdate(values: PasswordFormValues) {
    setIsLoading(true);
    try {
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        user.email!,
        values.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, values.newPassword);

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      // Reset form
      form.reset();
    } catch (error: any) {
      let errorMessage = "Failed to update password. Please try again.";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "New password is too weak.";
      }

      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const lastSignIn = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "Never";

  return (
    <div className="space-y-6">
      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePasswordUpdate)}
            className="space-y-6"
          >
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You'll need to re-authenticate with your current password to
                  make changes.
                </AlertDescription>
              </Alert>

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters with uppercase, lowercase,
                      and numbers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {/* Account Security Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            View your account security information and recent activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Account Created</label>
              <p className="text-sm text-muted-foreground">
                {user.metadata.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Last Sign In</label>
              <p className="text-sm text-muted-foreground">{lastSignIn}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email Verified</label>
              <p className="text-sm text-muted-foreground">
                {user.emailVerified ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <p className="text-xs text-muted-foreground font-mono">
                {user.uid}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
