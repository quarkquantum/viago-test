'use client';

import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { createAgencyRequestSchema } from '@repo/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Select } from '@/components/select';
import { useCreateAgencyRequest } from '@/features/agency-requests/api/use-create-agency-request';

const LEGAL_FORM_OTHER = 'OTHER';
const REQUIRED_FIELD = <span className="text-destructive">*</span>;

type FormData = z.infer<typeof createAgencyRequestSchema>;

export const RegisterForm = () => {
  const t = useTranslations('common');
  const [submitted, setSubmitted] = useState(false);
  const [legalForm, setLegalForm] = useState('');

  const { mutate, isPending } = useCreateAgencyRequest({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAgencyRequestSchema),
  });

  const handleFormSubmit = (data: FormData) => {
    if (data.legalForm === LEGAL_FORM_OTHER && data.customLegalForm) {
      data.legalForm = data.customLegalForm as FormData['legalForm'];
    }
    delete data.customLegalForm;
    mutate(data);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-sm py-12">
        <CardHeader className="flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="mb-4 size-12 text-primary" />
          <h1 className="font-bold text-2xl">{t('auth.registerSuccess')}</h1>
          <CardDescription className="text-center">{t('auth.registerSuccessDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/login">{t('auth.backToLogin')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg py-8">
      <CardHeader className="flex flex-col items-center justify-center gap-2">
        <Image alt="logo" className="mb-4" src={Logo} />
        <h1 className="font-bold text-2xl">{t('auth.registerTitle')}</h1>
        <CardDescription>{t('auth.registerDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agencyName">
                {t('auth.registerAgencyName')} {REQUIRED_FIELD}
              </Label>
              <Input id="agencyName" placeholder={t('auth.registerAgencyNamePlaceholder')} {...register('agencyName')} />
              {errors.agencyName && <p className="text-destructive text-sm">{errors.agencyName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>
                {t('auth.registerLegalForm')} {REQUIRED_FIELD}
              </Label>
              <Controller
                control={control}
                name="legalForm"
                render={({ field }) => (
                  <Select
                    onValueChangeAction={(value) => {
                      field.onChange(value);
                      setLegalForm(value);
                    }}
                    options={[
                      { label: t('auth.legalFormOptions.sarl'), value: 'SARL' },
                      { label: t('auth.legalFormOptions.sa'), value: 'SA' },
                      { label: t('auth.legalFormOptions.gie'), value: 'GIE' },
                      { label: t('auth.legalFormOptions.ei'), value: 'ENTREPRISE_INDIVIDUELLE' },
                      { label: t('auth.legalFormOptions.other'), value: LEGAL_FORM_OTHER },
                    ]}
                    placeholder={t('auth.registerLegalFormPlaceholder')}
                    value={field.value}
                    withSearch={false}
                  />
                )}
              />
              {errors.legalForm && <p className="text-destructive text-sm">{errors.legalForm.message}</p>}
            </div>
            {legalForm === LEGAL_FORM_OTHER && (
              <div className="grid gap-2">
                <Label htmlFor="customLegalForm">{t('auth.registerCustomLegalForm')}</Label>
                <Input
                  id="customLegalForm"
                  placeholder={t('auth.registerCustomLegalFormPlaceholder')}
                  {...register('customLegalForm')}
                />
                {errors.customLegalForm && <p className="text-destructive text-sm">{errors.customLegalForm.message}</p>}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="description">{t('auth.registerDescription_field')}</Label>
              <Input id="description" placeholder={t('auth.registerDescriptionPlaceholder')} {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">
                  {t('auth.registerFirstName')} {REQUIRED_FIELD}
                </Label>
                <Input id="firstName" placeholder={t('auth.registerFirstNamePlaceholder')} {...register('firstName')} />
                {errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">
                  {t('auth.registerLastName')} {REQUIRED_FIELD}
                </Label>
                <Input id="lastName" placeholder={t('auth.registerLastNamePlaceholder')} {...register('lastName')} />
                {errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">
                {t('auth.email')} {REQUIRED_FIELD}
              </Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register('email')} />
              {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">
                {t('auth.registerPhoneNumber')} {REQUIRED_FIELD}
              </Label>
              <Input id="phoneNumber" placeholder="00237691234567" {...register('phoneNumber')} />
              {errors.phoneNumber && <p className="text-destructive text-sm">{errors.phoneNumber.message}</p>}
              <p className="text-xs text-muted-foreground">Format: 002376 + 8 digits</p>
            </div>
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('auth.registerSubmitting')}
                </>
              ) : (
                t('auth.registerSubmit')
              )}
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link className="text-primary underline-offset-4 hover:underline" href="/login">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};