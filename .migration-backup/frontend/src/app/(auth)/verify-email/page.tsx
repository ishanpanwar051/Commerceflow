'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => !token ? 'error' : 'loading');
  const [message, setMessage] = useState(() => !token ? 'No verification token provided.' : '');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The link may be expired or invalid.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {status === 'loading' && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
              {status === 'error' && <XCircle className="h-16 w-16 text-destructive" />}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">You can now access all features of your account.</p>
                <Button className="w-full" onClick={() => router.push('/login')}>
                  Go to Login
                </Button>
              </div>
            )}
            {status === 'error' && token && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please try requesting a new verification email.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    try {
                      await authService.resendVerification();
                      toast.success('Verification email sent');
                    } catch {
                      toast.error('Failed to resend verification email');
                    }
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" /> Resend Verification
                </Button>
              </div>
            )}
            {status === 'error' && !token && (
              <p className="text-sm text-muted-foreground">
                Please check your email for the verification link.
              </p>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="link" onClick={() => router.push('/')}>Back to Home</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
