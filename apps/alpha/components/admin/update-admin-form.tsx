'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { SystemRoles } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import type { AdminType } from '@/features/admins/api/use-get-admin';
import { useUpdateAdmin } from '@/features/admins/api/use-update-admin';

type UpdateAdminFormProps = {
  id: string;
  admin: AdminType;
  setOpen: (open: boolean) => void;
};

export function UpdateAdminForm({ id, admin, setOpen }: UpdateAdminFormProps) {
  const updateAdmin = useUpdateAdmin(id);
  const t = useTranslations();

  const formSchema = z.object({
    email: z.email({
      message: t('admins.invalidEmail'),
    }),
    fullName: z.string().min(1, {
      message: t('admins.fullNameRequired'),
    }),
    phoneNumber: z.string().optional(),
    role: z.enum([SystemRoles.ADMIN, SystemRoles.SUPER_ADMIN]),
  });

  const form = useForm({
    defaultValues: {
      email: admin.email || '',
      fullName: admin.fullName || '',
      phoneNumber: admin.profile?.phoneNumber || '',
      role: (admin.role === SystemRoles.SUPER_ADMIN ? SystemRoles.SUPER_ADMIN : SystemRoles.ADMIN) as
        | typeof SystemRoles.ADMIN
        | typeof SystemRoles.SUPER_ADMIN,
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAdmin.mutate(
      { ...values },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="fullName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('admins.fullName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('admins.fullName')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('admins.email')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('admins.emailAddress')}
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('admins.phoneNumber')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('admins.phoneNumber')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="outline">{t('common.cancel')}</Button>
        </DialogClose>
        <Button disabled={!form.formState.isValid || updateAdmin.isPending} type="submit">
          {updateAdmin.isPending ? t('admins.updating') : t('admins.updateAdminButton')}
        </Button>
      </DialogFooter>
    </form>
  );
}
