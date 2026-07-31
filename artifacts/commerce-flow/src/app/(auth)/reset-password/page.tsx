
import { useState, Suspense } from 'react';
import { Link } from 'wouter';
import { useRouter, useSearchParams } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: { password: string }) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password reset successfully');
      router.push('/login');
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-destructive">Invalid or missing reset token.</p>
          <Link href="/forgot-password" className="text-primary hover:underline mt-2 block">
            Request a new reset link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-primary hover:underline">Back to login</Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </motion.div>
  );
}
