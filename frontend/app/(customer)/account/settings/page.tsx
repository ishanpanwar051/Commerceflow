"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useChangePassword, useUserProfile } from "@/lib/hooks/useUser";
import { useAuth } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Bell } from "lucide-react";
import { useState } from "react";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Password required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { data: profile } = useUserProfile();
  const { mutate: changePassword, isPending } = useChangePassword();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    newsletter: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormData) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          reset();
          alert("Password changed successfully");
        },
      }
    );
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Change Password */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold text-foreground mb-6">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              className={errors.currentPassword ? "border-destructive" : ""}
            />
            {errors.currentPassword && (
              <p className="text-destructive text-sm">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              className={errors.newPassword ? "border-destructive" : ""}
            />
            {errors.newPassword && (
              <p className="text-destructive text-sm">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Password
          </Button>
        </form>
      </Card>

      {/* Notifications */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h2>
        <div className="space-y-4 max-w-md">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email: checked as boolean })
              }
            />
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive order updates and promotions
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={notifications.sms}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, sms: checked as boolean })
              }
            />
            <div>
              <p className="font-medium text-foreground">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive delivery updates via text
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={notifications.newsletter}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, newsletter: checked as boolean })
              }
            />
            <div>
              <p className="font-medium text-foreground">Newsletter</p>
              <p className="text-sm text-muted-foreground">
                Stay updated with new products and deals
              </p>
            </div>
          </label>

          <Button className="mt-4">Save Preferences</Button>
        </div>
      </Card>

      {/* Account Security */}
      <Card className="p-8 border-destructive/20 bg-destructive/5">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          Account Security
        </h2>

        <div className="space-y-4 max-w-md">
          <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-destructive/30">
            <p className="text-sm text-muted-foreground mb-4">
              Logging out will end your session on all devices
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-destructive hover:text-destructive"
            >
              Logout from All Devices
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-destructive/30 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data
            </p>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="p-8 bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account Information</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Email:</strong> {profile?.email}
          </p>
          <p>
            <strong>Member Since:</strong>{" "}
            {profile ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {profile ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </Card>
    </div>
  );
}
