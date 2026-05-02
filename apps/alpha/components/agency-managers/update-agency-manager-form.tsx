'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { AgencyManagerStatus } from '@repo/shared/constants';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import type { AgencyManager } from '@/features/agency-managers/api/use-list-agency-managers';
import { useUpdateAgencyManager } from '@/features/agency-managers/api/use-update-agency-manager';
import { Select } from '@/components/select';

type UpdateAgencyManagerFormProps = {
  id: string;
  agencyManager: AgencyManager;
  agencies: { value: string; label: string }[];
  setOpen: (open: boolean) => void;
};

export function UpdateAgencyManagerForm({ id, agencyManager, agencies, setOpen }: UpdateAgencyManagerFormProps) {
  const updateAgencyManager = useUpdateAgencyManager(id);
  const t = useTranslations('agencyOwner');
  const tc = useTranslations('common');

  const formSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    status: z.enum([AgencyManagerStatus.ACTIVE, AgencyManagerStatus.INACTIVE]).optional(),
    agencyId: z.string().optional(),
  });

  const form = useForm({
    defaultValues: {
      firstName: agencyManager.user.profile?.firstName || '',
      lastName: agencyManager.user.profile?.lastName || '',
      phoneNumber: agencyManager.user.profile?.phoneNumber || '',
      status: agencyManager.status as 'ACTIVE' | 'INACTIVE',
      agencyId: agencyManager.agencyId || '',
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAgencyManager.mutate(
      { ...values },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  const statusOptions = [
    { value: AgencyManagerStatus.ACTIVE, label: t('statusActive') },
    { value: AgencyManagerStatus.INACTIVE, label: t('statusInactive') },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('firstName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('firstName')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="lastName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('lastName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('lastName')}
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
              <FieldLabel>{t('phoneNumber')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('phoneNumber')}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="agencyId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('agency')}</FieldLabel>
              <Select
                {...field}
                onValueChange={field.onChange}
                options={agencies}
                placeholder={t('selectAgency')}
                value={field.value}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('status')}</FieldLabel>
              <Select
                {...field}
                onValueChange={field.onChange}
                options={statusOptions}
                placeholder={t('selectStatus')}
                value={field.value}
                withSearch={false}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button variant="outline">{tc('cancel')}</Button>
        </DialogClose>
        <Button disabled={updateAgencyManager.isPending} type="submit">
          {updateAgencyManager.isPending ? t('updating') : t('update')}
        </Button>
      </DialogFooter>
    </form>
  );
}