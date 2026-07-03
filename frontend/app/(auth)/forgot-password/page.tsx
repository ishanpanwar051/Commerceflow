"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks";
import { Loader2, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { resetPassword, resetPasswordLoading, auth } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    resetPassword(data.email);
    setSubmitted(true);
  };

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-white font-bold mx-auto mb-4">
          CF
        </div>
        <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        <p className="text-muted-foreground text-sm mt-2">
          We&apos;ll send you a link to reset your password
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex flex-col items-center text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Check Your Email
            </h2>
            <p className="text-green-800 dark:text-green-200 mt-2 text-sm">
              We&apos;ve sent a password reset link to your email address. Please check your
              inbox and click the link to reset your password.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>
        </div>
      ) : (
        <>
          {auth.error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {auth.error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={resetPasswordLoading}
              className="w-full"
            >
              {resetPasswordLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {resetPasswordLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          {/* Back to Sign In */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </>
      )}
    </Card>
  );
}
