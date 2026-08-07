
import { useState } from 'react';
import { Link } from 'wouter';
import { useRouter } from '@/lib/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, UserPlus, Mail, Smartphone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register as registerUser } from '@/store/slices/userSlice';
import { getDashboardPath } from '@/lib/auth-redirect';
import { toast } from 'sonner';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const passwordPolicy = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?91[- ]?)?[6-9][0-9]{9}$/, 'Enter a valid 10-digit mobile number'),
  password: passwordPolicy,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!acceptedTerms) {
      setTermsError(true);
      toast.error('Please accept the Terms & Conditions to continue.');
      return;
    }
    setTermsError(false);

    const [firstName, ...rest] = data.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    const result = await dispatch(registerUser({
      email: data.email,
      password: data.password,
      firstName,
      lastName,
      phone: data.phone.replace(/[\s-]/g, ''),
    }));

    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created! Please check your email to verify your account.');
      router.push(getDashboardPath(result.payload.user.role));
    } else {
      toast.error(result.payload as string);
    }
  };

  const PasswordInput = ({ field, placeholder, show, toggle, error }: {
    field: 'password' | 'confirmPassword';
    placeholder: string;
    show: boolean;
    toggle: () => void;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{field === 'password' ? 'Password' : 'Confirm Password'}</Label>
      <div className="relative">
        <Input
          id={field}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={field === 'password' ? 'new-password' : 'new-password'}
          className="pl-10 pr-10 h-11"
          {...register(field)}
          aria-invalid={!!error}
          aria-describedby={error ? `${field}-error` : undefined}
        />
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md"
          aria-label={show ? `Hide ${field === 'password' ? 'password' : 'confirm password'}` : `Show ${field === 'password' ? 'password' : 'confirm password'}`}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p id={`${field}-error`} className="text-sm text-destructive">{error}</p>}
    </div>
  );

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
            <UserPlus className="h-7 w-7 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join CommerceFlow and start shopping today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  className="pl-10 h-11"
                  {...register('fullName')}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
              </div>
              {errors.fullName && <p id="fullName-error" className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-10 h-11"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  className="pl-10 h-11"
                  {...register('phone')}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
              </div>
              {errors.phone && <p id="phone-error" className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <PasswordInput
              field="password"
              placeholder="Create a strong password"
              show={showPassword}
              toggle={() => setShowPassword((s) => !s)}
              error={errors.password?.message}
            />

            <PasswordInput
              field="confirmPassword"
              placeholder="Re-enter your password"
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword((s) => !s)}
              error={errors.confirmPassword?.message}
            />

            <div className="space-y-1.5">
              <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(!!checked);
                    if (checked) setTermsError(false);
                  }}
                  className="mt-0.5"
                />
                <span>
                  I agree to CommerceFlow's{' '}
                  <Link href="/terms" className="text-primary hover:underline font-medium">Terms &amp; Conditions</Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                </span>
              </label>
              {termsError && <p className="text-sm text-destructive">Please accept the Terms &amp; Conditions.</p>}
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          <GoogleSignInButton mode="register" />
        </CardContent>
        <CardFooter className="flex-col gap-1 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
