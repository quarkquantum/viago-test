import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { Select } from '@/components/select';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { useCreateDriver } from '@/features/drivers/api/use-create-driver';

const formSchema = z.object({
  agencyId: z.string().min(1, {
    message: 'Agency is required.',
  }),
  email: z.string().email({
    message: 'Invalid email address.',
  }),
  firstName: z.string().min(1, {
    message: 'First name is required.',
  }),
  lastName: z.string().min(1, {
    message: 'Last name is required.',
  }),
  phoneNumber: z.string().min(1, {
    message: 'Phone number is required.',
  }),
});

export type FormValues = z.infer<typeof formSchema>;

import { useTranslations } from 'next-intl';

export const NewDriverForm = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const t = useTranslations();
  const createDriver = useCreateDriver({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

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
    agencyList?.data?.map((agency: { name: string; id: string }) => ({
      label: agency.name,
      value: agency.id,
    })) ?? [];
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = form;

  const onSubmit = (data: FormValues) => {
    createDriver.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          control={control}
          name="agencyId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{t('common.table.agency')}</FieldLabel>
              <Select
                emptyMessage={isLoadingAgency ? t('common.loading') : t('agencies.list.empty.title')}
                onSearchChange={setAgencyQuery}
                onValueChange={field.onChange}
                options={agencies}
                placeholder={t('drivers.create.selectAgency')}
                searchPlaceholder={t('drivers.create.searchAgency')}
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
              <FieldLabel>{t('common.table.firstName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('common.table.firstName')}
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
              <FieldLabel>{t('common.table.lastName')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('common.table.lastName')}
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
              <FieldLabel>{t('common.table.email')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('common.table.emailAddress')}
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
              <FieldLabel>{t('common.table.phone')}</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                placeholder={t('common.table.phoneNumber')}
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
          {createDriver.isPending ? t('common.loading') : t('drivers.create.submit')}
        </Button>
      </DialogFooter>
    </form>
  );
};
