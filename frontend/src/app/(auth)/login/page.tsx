
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useRouter } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/userSlice';
import { getDashboardPath } from '@/lib/auth-redirect';
import { toast } from 'sonner';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const EMAIL_OR_PHONE = /^([^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?91[- ]?)?[6-9][0-9]{9})$/;

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter your email or mobile number')
    .regex(EMAIL_OR_PHONE, 'Enter a valid email or 10-digit mobile number'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [identifierType, setIdentifierType] = useState<'email' | 'mobile' | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const identifierValue = watch('identifier');

  useEffect(() => {
    const value = (identifierValue || '').trim();
    if (!value) {
      setIdentifierType(null);
    } else if (value.includes('@')) {
      setIdentifierType('email');
    } else if (/\d/.test(value)) {
      setIdentifierType('mobile');
    } else {
      setIdentifierType(null);
    }
  }, [identifierValue]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const onSubmit = async (data: LoginForm) => {
    const result = await dispatch(login({
      identifier: data.identifier.trim(),
      password: data.password,
      remember,
    }));
    if (login.fulfilled.match(result)) {
      toast.success('Signed in successfully!');
      router.push(getDashboardPath(result.payload.user.role));
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-1.5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Lock className="h-7 w-7 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Welcome back! Sign in to continue shopping.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {identifierType === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </span>
                <Input
                  id="identifier"
                  type="text"
                  inputMode={identifierType === 'mobile' ? 'numeric' : 'email'}
                  autoComplete="username"
                  placeholder="Enter email or 10-digit mobile number"
                  className="pl-10 h-11"
                  {...register('identifier')}
                  aria-invalid={!!errors.identifier}
                  aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                />
              </div>
              {errors.identifier && (
                <p id="identifier-error" className="text-sm text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(!!checked)} />
                <span>Remember me</span>
              </label>
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Secure sign in
              </span>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Signing in...' : 'Continue'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton mode="login" />
        </CardContent>
        <CardFooter className="flex-col gap-1 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            New to CommerceFlow?{' '}
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Create your account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
