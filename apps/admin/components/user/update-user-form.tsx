'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUpdateUser } from '@/features/users/api/use-update-user';

export const UpdateUserForm = ({ id, user, setOpen }: { id: string; user: any; setOpen: (open: boolean) => void }) => {
  const t = useTranslations('common');

  const formSchema = useMemo(
    () =>
      z.object({
        email: z.string().email({
          message: t('invalidEmail'),
        }),
        firstName: z.string().min(1, {
          message: t('firstNameRequired'),
        }),
        lastName: z.string().min(1, {
          message: t('lastNameRequired'),
        }),
        phoneNumber: z.string().min(1, {
          message: t('phoneNumberRequired'),
        }),
      }),
    [t]
  );

  type FormValues = z.infer<typeof formSchema>;

  const updateUser = useUpdateUser(id, {
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      email: user?.email ?? '',
      firstName: user?.profile?.firstName ?? '',
      lastName: user?.profile?.lastName ?? '',
      phoneNumber: user?.profile?.phoneNumber ?? '',
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid, isDirty },
  } = form;

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.profile?.firstName ?? '',
        lastName: user.profile?.lastName ?? '',
        phoneNumber: user.profile?.phoneNumber ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: FormValues) => {
    updateUser.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('table.firstName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('table.firstName')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('table.lastName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('table.lastName')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('table.emailAddress')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('table.emailAddress')}
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('table.phoneNumber')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('table.phoneNumber')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="outline">{t('cancel')}</Button>
        </DialogClose>
        <Button disabled={!(isDirty && isValid) || updateUser.isPending} onClick={handleSubmit(onSubmit)} type="submit">
          {updateUser.isPending ? t('updating') : t('updateUser')}
        </Button>
      </DialogFooter>
    </form>
  );
};
