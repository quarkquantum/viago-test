'use client';

import { cashierAuthClient } from '@repo/auth/cashier/client';
import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export const ResetPasswordForm = () => {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('tokenMissing'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    await cashierAuthClient.resetPassword(
      {
        newPassword: password,
        token,
      },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
        onSuccess: () => {
          toast.success(t('passwordResetSuccess'));
          router.push('/login');
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-sm py-12">
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <Image alt="logo" className="mb-4" src={Logo} />
        <h1 className="font-bold text-2xl">{t('resetPassword')}</h1>
        <CardDescription>{t('resetPasswordDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password">{t('newPassword')}</Label>
              <Input
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                type="password"
                value={password}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                required
                type="password"
                value={confirmPassword}
              />
            </div>
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('resetting')}
                </>
              ) : (
                t('resetPassword')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
