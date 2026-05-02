'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import * as z from 'zod';
import { Select } from '@/components/select';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { useCreateDriver } from '@/features/drivers/api/use-create-driver';

export const NewDriverForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const t = useTranslations();
  const formSchema = z.object({
    agencyId: z.string().min(1, {
      message: t('drivers.agencyRequired'),
    }),
    email: z.string().email({
      message: t('drivers.invalidEmail'),
    }),
    firstName: z.string().min(1, {
      message: t('drivers.firstNameRequired'),
    }),
    lastName: z.string().min(1, {
      message: t('drivers.lastNameRequired'),
    }),
    phoneNumber: z.string().min(1, {
      message: t('drivers.phoneNumberRequired'),
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const createDriver = useCreateDriver();

  const form = useForm<FormValues>({
    defaultValues: {
      agencyId: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    resolver: zodResolver(formSchema),
  });
  const [agencyQuery, setAgencyQuery] = useState('');
  const [debouncedAgencyQuery, setDebouncedAgencyQuery] = useState('');
  // Debounce agency search query
  useDebounce(
    () => {
      setDebouncedAgencyQuery(agencyQuery);
    },
    300,
    [agencyQuery]
  );
  const { data: agencyList, isLoading: isLoadingAgency } = useListAgencies(
    debouncedAgencyQuery ? { q: debouncedAgencyQuery } : {}
  );
  const agencies =
    agencyList?.data.map((agency) => ({
      label: agency.name,
      value: agency.id,
    })) ?? [];
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: FormValues) => {
    createDriver.mutate(data, {
      onError: () => {
        toast.error(t('drivers.createError'));
      },
      onSuccess: () => {
        toast.success(t('drivers.createSuccess'));
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={control}
          name="agencyId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('drivers.agency')}</FieldLabel>
              <Select
                emptyMessage={isLoadingAgency ? t('drivers.loading') : t('drivers.noAgencyFound')}
                onSearchChange={setAgencyQuery}
                onValueChange={field.onChange}
                options={agencies}
                placeholder={t('drivers.selectAgency')}
                searchPlaceholder={t('drivers.searchAgency')}
                value={field.value}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('drivers.firstName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('drivers.firstName')}
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
              <FieldLabel>{t('drivers.lastName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('drivers.lastName')}
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
              <FieldLabel>{t('drivers.email')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('drivers.emailAddress')}
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
              <FieldLabel>{t('drivers.phoneNumber')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('drivers.phoneNumber')}
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
        <Button disabled={!isValid || createDriver.isPending} onClick={handleSubmit(onSubmit)} type="submit">
          {createDriver.isPending ? t('drivers.creating') : t('drivers.createDriver')}
        </Button>
      </DialogFooter>
    </form>
  );
};
