'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { useCreateAgencyManager } from '@/features/agency-managers/api/use-create-agency-manager';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { Select } from '@/components/select';

export function NewAgencyManager() {
  const t = useTranslations('agencyOwner');
  const tc = useTranslations('common');
  const { data: agenciesData } = useListAgencies({ limit: '100' });
  const formSchema = z.object({
    agencyId: z.string().min(1, { message: t('agencyRequired') }),
    email: z.string().email({ message: t('invalidEmail') }),
    firstName: z.string().min(1, { message: t('firstNameRequired') }),
    lastName: z.string().min(1, { message: t('lastNameRequired') }),
    phoneNumber: z.string().min(1, { message: t('phoneNumberRequired') }),
  });

  const createAgencyManager = useCreateAgencyManager();
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      agencyId: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAgencyManager.mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  const agencies = agenciesData?.data?.map((agency) => ({
    value: agency.id,
    label: agency.name,
  })) ?? [];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> {t('addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('addNew')}</DialogTitle>
          <DialogDescription>{t('addDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
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
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('email')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('emailAddress')}
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
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">{tc('cancel')}</Button>
            </DialogClose>
            <Button
              disabled={!form.formState.isValid || createAgencyManager.isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
            >
              {createAgencyManager.isPending ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
