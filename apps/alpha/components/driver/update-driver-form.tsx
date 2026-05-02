import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { toast } from 'sonner';
import { z } from 'zod';
import { Select } from '@/components/select';
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import type { Driver, DriverAgency } from '@/features/drivers/api/use-get-driver';
import { useUpdateDriver } from '@/features/drivers/api/use-update-driver';

export const UpdateDriverForm = ({
  id,
  driver,
  agency,
  setOpen,
}: {
  id: string;
  driver: Driver;
  agency: DriverAgency;
  setOpen: (open: boolean) => void;
}) => {
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

  const updateDriver = useUpdateDriver();

  const form = useForm<FormValues>({
    defaultValues: {
      agencyId: agency?.id ?? '',
      email: driver?.user.email ?? '',
      firstName: driver?.user.profile?.firstName ?? '',
      lastName: driver?.user.profile?.lastName ?? '',
      phoneNumber: driver?.user.profile?.phoneNumber ?? '',
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

  useEffect(() => {
    if (driver && agency) {
      reset({
        agencyId: agency.id,
        email: driver.user.email,
        firstName: driver.user.profile?.firstName ?? '',
        lastName: driver.user.profile?.lastName ?? '',
        phoneNumber: driver.user.profile?.phoneNumber ?? '',
      });
    }
  }, [driver, agency, reset]);

  const agencies = [
    ...(agency && !agencyList?.data.some((a) => a.id === agency.id) ? [agency] : []),
    ...(agencyList?.data ?? []),
  ].map((a) => ({
    label: a.name,
    value: a.id,
  }));

  const onSubmit = (data: FormValues) => {
    updateDriver.mutate(
      {
        identifier: id,
        json: data,
      },
      {
        onError: () => {
          toast.error(t('drivers.updateError'));
        },
        onSuccess: () => {
          toast.success(t('drivers.updateSuccess'));
          setOpen(false);
        },
      }
    );
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
        <Button
          disabled={!(isDirty && isValid) || updateDriver.isPending}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {updateDriver.isPending ? t('drivers.updating') : t('drivers.updateDriverButton')}
        </Button>
      </DialogFooter>
    </form>
  );
};
