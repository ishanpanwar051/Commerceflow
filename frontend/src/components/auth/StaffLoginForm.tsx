import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/userSlice';
import { useRouter } from '@/lib/navigation';
import { getDashboardPath } from '@/lib/auth-redirect';

const EMAIL_OR_PHONE = /^(?:\+?[1-9]\d{1,14}|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/;

const staffLoginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Enter your email or mobile number')
    .regex(EMAIL_OR_PHONE, 'Enter a valid email or mobile number'),
  password: z.string().min(1, 'Password is required'),
});

type StaffLoginForm = z.infer<typeof staffLoginSchema>;

interface StaffLoginFormProps {
  role: 'ADMIN' | 'SELLER' | 'DELIVERY_BOY';
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_PORTAL: Record<string, string> = {
  ADMIN: 'admin',
  SELLER: 'seller',
  DELIVERY_BOY: 'delivery',
};

export function StaffLoginForm({ role, title, description, icon }: StaffLoginFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [identifierType, setIdentifierType] = useState<'email' | 'mobile' | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StaffLoginForm>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const identifierValue = watch('identifier');

  const onSubmit = async (data: StaffLoginForm) => {
    setRoleError(null);
    const result = await dispatch(login({
      identifier: data.identifier.trim(),
      password: data.password,
      remember,
    }));

    if (login.fulfilled.match(result)) {
      const loggedInRole = result.payload.user.role;
      if (loggedInRole !== role) {
        const portal = ROLE_PORTAL[loggedInRole];
        setRoleError(
          loggedInRole === 'CUSTOMER'
            ? 'This account is a customer account. Please sign in at the customer portal.'
            : portal
              ? `This is a ${portal} account. Please sign in via the ${portal} portal.`
              : 'This account does not have access to this portal.'
        );
        return;
      }
      router.push(getDashboardPath(loggedInRole));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="text-center space-y-1.5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
          >
            {icon}
          </motion.div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Mobile Number</Label>
              <div className="relative">
                {identifierType === 'mobile' ? (
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@company.com or mobile number"
                  autoComplete="username"
                  className="pl-10 pr-10 h-11"
                  {...register('identifier', {
                    onChange: (e) => setIdentifierType(/^\+?\d[\d\s-]*$/.test(e.target.value.trim()) ? 'mobile' : 'email'),
                  })}
                  aria-invalid={!!errors.identifier}
                  aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                />
              </div>
              {errors.identifier && <p id="identifier-error" className="text-sm text-destructive">{errors.identifier.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
              <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(!!checked)} />
              <span>Remember me on this device</span>
            </label>

            {(error || roleError) && (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {roleError || error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Wrong portal?{' '}
            <a
              href={`/login`}
              className="text-primary hover:underline font-semibold"
              onClick={(e) => { e.preventDefault(); window.location.href = `/login`; }}
            >
              Customer sign-in
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
