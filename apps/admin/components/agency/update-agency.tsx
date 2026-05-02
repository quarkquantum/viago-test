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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/web/src/components/ui/select';
import { Textarea } from '@repo/design-system/web/src/components/ui/textarea';
import { AgencyStatus, SystemRoles } from '@repo/shared';
import { Pen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from 'react-use';
import z from 'zod';
import { LogoUpload } from '@/components/logo-upload';
import { Select as SelectComponent } from '@/components/select';
import { useGetAgency } from '@/features/agencies/api/use-get-agency';
import { useUpdateAgency } from '@/features/agencies/api/use-update-agency';
import { useListCities } from '@/features/cities/api/use-list-cities';
import { useListCountries } from '@/features/countries/api/use-list-countries';
import { useListUsers } from '@/features/users/api/use-list-users';

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters long.',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters long.',
  }),
  status: z.enum(AgencyStatus),
  logo: z.string().optional(),
  countryCode: z.string().min(1, { message: 'Country is required.' }),
  cityId: z.string().min(1, { message: 'City is required.' }),
  ownerId: z.string().optional(),
});

export function UpdateAgency({ identifier }: { identifier: string }) {
  const t = useTranslations('agencies');
  const tc = useTranslations('common');
  const { data } = useGetAgency(identifier);
  const updateAgency = useUpdateAgency({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      logo: '',
      name: '',
      status: AgencyStatus.ACTIVE,
      countryCode: '',
      cityId: '',
      ownerId: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (data) {
      form.reset({
        description: data.data.description ?? '',
        logo: data.data.logo ?? '',
        name: data.data.name ?? '',
        status: (data.data.status as AgencyStatus) ?? AgencyStatus.ACTIVE,
        countryCode: data.data.country?.code ?? '',
        cityId: data.data.city?.id ?? '',
        ownerId: data.data.owner?.id ?? '',
      });
    }
  }, [data, form]);

  const [countryQuery, setCountryQuery] = useState('');
  const [debouncedCountryQuery, setDebouncedCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [debouncedCityQuery, setDebouncedCityQuery] = useState('');
  const [ownerQuery, setOwnerQuery] = useState('');
  const [debouncedOwnerQuery, setDebouncedOwnerQuery] = useState('');

  useDebounce(
    () => {
      setDebouncedCountryQuery(countryQuery);
    },
    300,
    [countryQuery]
  );

  useDebounce(
    () => {
      setDebouncedCityQuery(cityQuery);
    },
    300,
    [cityQuery]
  );

  useDebounce(
    () => {
      setDebouncedOwnerQuery(ownerQuery);
    },
    300,
    [ownerQuery]
  );

  const selectedCountry = useWatch({ control: form.control, name: 'countryCode' });

  const previousCountry = useRef<string | null>(null);

  useEffect(() => {
    if (previousCountry.current && previousCountry.current !== selectedCountry) {
      form.setValue('cityId', '');
    }
    previousCountry.current = selectedCountry || null;
  }, [selectedCountry, form]);

  const { data: countriesData, isLoading: isLoadingCountries } = useListCountries(
    debouncedCountryQuery ? { q: debouncedCountryQuery } : {}
  );

  const { data: citiesData, isLoading: isLoadingCities } = useListCities(
    selectedCountry
      ? { country: selectedCountry, ...(debouncedCityQuery ? { q: debouncedCityQuery } : {}) }
      : {}
  );

  const { data: ownersData, isLoading: isLoadingOwners } = useListUsers(
    debouncedOwnerQuery ? { role: SystemRoles.AGENCY, q: debouncedOwnerQuery } : { role: SystemRoles.AGENCY }
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAgency.mutate({
      identifier,
      json: {
        ...values,
        ownerId: values.ownerId || undefined,
      },
    });
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pen />
          {t('details.editAgency') || 'Edit Agency'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('details.editAgency') || 'Edit agency'}</DialogTitle>
          <DialogDescription>
            {t('details.editAgencyDescription') || "Make changes to this agency here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tc('table.agencyName')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('create.agencyNamePlaceholder')}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tc('table.agencyDescription')}</FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('create.agencyDescriptionPlaceholder')}
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
                  <FieldLabel>{tc('table.status')}</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('create.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AgencyStatus.ACTIVE}>{t('create.active')}</SelectItem>
                      <SelectItem value={AgencyStatus.INACTIVE}>{t('create.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="countryCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tc('table.country')}</FieldLabel>
                  <SelectComponent
                    emptyMessage={isLoadingCountries ? tc('loading') : tc('select.emptyMessage')}
                    onSearchChange={setCountryQuery}
                    onValueChange={field.onChange}
                    options={countriesData?.data?.map((country: { name: string; code: string }) => ({
                      label: country.name,
                      value: country.code,
                    })) || []}
                    placeholder={t('create.selectCountry')}
                    searchPlaceholder={t('create.searchCountry')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="cityId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tc('table.city')}</FieldLabel>
                  <SelectComponent
                    disabled={!selectedCountry}
                    emptyMessage={isLoadingCities ? tc('loading') : tc('select.emptyMessage')}
                    onSearchChange={setCityQuery}
                    onValueChange={field.onChange}
                    options={citiesData?.data?.map((city: { id: string; name: string }) => ({
                      label: city.name,
                      value: city.id,
                    })) || []}
                    placeholder={t('create.selectCity')}
                    searchPlaceholder={t('create.searchCity')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="ownerId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('details.agencyOwner')}</FieldLabel>
                  <SelectComponent
                    emptyMessage={isLoadingOwners ? tc('loading') : tc('select.emptyMessage')}
                    onSearchChange={setOwnerQuery}
                    onValueChange={field.onChange}
                    options={ownersData?.data?.map((user: { id: string; fullName: string; email: string }) => ({
                      label: user.fullName || user.email,
                      value: user.id,
                    })) || []}
                    placeholder={t('details.selectOwner')}
                    searchPlaceholder={t('details.searchOwner')}
                    value={field.value}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="logo"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{tc('table.logo')}</FieldLabel>
                  <LogoUpload onChange={field.onChange} onRemove={() => field.onChange('')} value={field.value} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{tc('cancel')}</Button>
          </DialogClose>
          <Button
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            onClick={form.handleSubmit(onSubmit)}
            type="submit"
          >
            {tc('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
