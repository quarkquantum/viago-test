'use client';

import { signIn } from '@repo/auth/alpha/client';
import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useRouter } from '@/i18n/routing';

export const LoginForm = () => {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onError: (ctx) => {
            toast.error(ctx.error.message);
            setLoading(false);
          },
          onSuccess: () => {
            setLoading(false);
            router.push('/');
          },
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm py-12">
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <Image alt="logo" className="mb-4" src={Logo} />
        <h1 className="font-bold text-2xl">{t('login')}</h1>
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
                  {t('forgotPassword')}
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
                t('loginButton')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
