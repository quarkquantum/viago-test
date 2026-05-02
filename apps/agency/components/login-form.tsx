'use client';

import { agencyAuthClient } from '@repo/auth/agency/client';
import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export const LoginForm = () => {
  const t = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await agencyAuthClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
        onSuccess: async () => {
          router.push('/');
          router.refresh();
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-sm py-12">
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <Image alt="logo" className="mb-4" src={Logo} />
        <h1 className="font-bold text-2xl">{t('auth.login')}</h1>
        <CardDescription>{t('auth.enterEmail')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
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
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Link
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  href="/forgot-password"
                >
                  {t('auth.forgotPassword')}
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
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.login')
              )}
            </Button>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            {t('auth.noAgency')}{' '}
            <Link className="text-primary underline-offset-4 hover:underline" href="/register">
              {t('auth.registerHere')}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
