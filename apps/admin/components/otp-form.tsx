'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminAuthClient } from '@repo/auth/admin/client';
import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/web/src/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/design-system/web/src/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@repo/design-system/web/src/components/ui/input-otp';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

export const OTPForm = ({ ...props }: React.ComponentProps<typeof Card>) => {
  const t = useTranslations('auth');

  const formSchema = z.object({
    otp: z.string().length(6, t('otp.validation')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      otp: '',
    },
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { data: result, error } = await adminAuthClient.twoFactor.verifyOtp({
        code: data.otp,
      });

      if (error) {
        toast.error(error.message || t('otp.verifyError'));
        return;
      }

      if (result) {
        toast.success(t('loginSuccess'));
        router.push('/');
      }
    } catch (error) {
      console.error(error);
      toast.error(t('otp.verifyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResending(true);
    try {
      const { data: result } = await adminAuthClient.twoFactor.sendOtp();
      if (result) {
        toast.success(t('otp.sendSuccess'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('otp.sendError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <Card {...props} className="py-12">
      <CardHeader className="flex flex-col items-center justify-center gap-6">
        <Image alt="logo" src={Logo} />
        <div className="flex flex-col items-center justify-center gap-2">
          <CardTitle>{t('otp.title')}</CardTitle>
          <CardDescription>{t('otp.description')}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="otp"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="otp">{t('otp.label')}</FieldLabel>
                  <InputOTP
                    autoFocus
                    id="otp"
                    maxLength={6}
                    onChange={field.onChange}
                    onComplete={(value) => onSubmit({ otp: value })}
                    value={field.value}
                  >
                    <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>{t('otp.placeholder')}</FieldDescription>
                  )}
                </Field>
              )}
            />
            <FieldGroup>
              <Button disabled={loading} type="submit">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t('otp.verifying')}
                  </>
                ) : (
                  t('otp.verify')
                )}
              </Button>
              <FieldDescription className="text-center">
                {t('otp.didNotReceive')}{' '}
                <button
                  className="text-primary hover:underline disabled:opacity-50"
                  disabled={resending}
                  onClick={handleResend}
                  type="button"
                >
                  {resending ? t('sending') : t('otp.resend')}
                </button>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};
