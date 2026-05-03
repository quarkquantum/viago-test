'use client';

import { adminAuthClient } from '@repo/auth/admin/client';
import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

export const LoginForm = () => {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('[login] NEXT_PUBLIC_API_URL:', apiUrl);
    console.log('[login] Attempting login with email:', email);

    // --- RAW FETCH: bypass the auth client entirely to see real headers ---
    const rawSignIn = await fetch(`${apiUrl}/api/admin/auth/sign-in/email`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('[login] raw sign-in status:', rawSignIn.status);
    const allRawHeaders: Record<string, string> = {};
    rawSignIn.headers.forEach((v, k) => { allRawHeaders[k] = v; });
    console.log('[login] raw sign-in response headers:', JSON.stringify(allRawHeaders));
    console.log('[login] raw set-cookie header:', rawSignIn.headers.get('set-cookie'));
    const rawBody = await rawSignIn.json().catch(() => null);
    console.log('[login] raw sign-in body:', JSON.stringify(rawBody));
    console.log('[login] document.cookie after raw fetch:', document.cookie || '(empty)');

    // --- SESSION CHECK: verify cookie was stored ---
    const rawSession = await fetch(`${apiUrl}/api/admin/auth/get-session`, {
      credentials: 'include',
      cache: 'no-store',
    });
    console.log('[login] raw get-session status:', rawSession.status);
    const rawSessionBody = await rawSession.text();
    console.log('[login] raw get-session body:', rawSessionBody);
    // --- END RAW FETCH ---

    await adminAuthClient.signIn.email(
      { email, password },
      {
        onError: (ctx) => {
          console.log('[login] client error:', ctx.error);
          toast.error(ctx.error.message);
          setLoading(false);
        },
        onSuccess: async (ctx) => {
          console.log('[login] client onSuccess, twoFactorRedirect:', ctx.data.twoFactorRedirect);
          if (ctx.data.twoFactorRedirect) {
            const { data, error } = await adminAuthClient.twoFactor.sendOtp();
            setLoading(false);
            if (error) { toast.error(error.message); return; }
            if (data?.status) { toast.success(t('otpSent')); router.push('/otp-verification'); }
            return;
          }
          setLoading(false);
          window.location.href = '/fr/';
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-sm py-12">
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <Image alt="logo" className="mb-4" src={Logo} />
        <h1 className="font-bold text-2xl">{t('loginTitle')}</h1>
        <CardDescription>{t('loginDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t('password')}</Label>
                <Link
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  href="/forgot-password"
                >
                  {t('forgotPasswordPrompt')}
                </Link>
              </div>
              <Input
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                type="password"
                value={password}
              />
            </div>
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('loggingIn')}
                </>
              ) : (
                t('login')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
