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
import { Textarea } from '@repo/design-system/web/src/components/ui/textarea';
import { AgencyStatus } from '@repo/shared';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDebounce } from 'react-use';
import z from 'zod';
import { LogoUpload } from '@/components/logo-upload';
import { Select as SelectComponent } from '@/components/select';
import { useCreateAgency } from '@/features/agencies/api/use-create-agency';
import { useListCities } from '@/features/cities/api/use-list-cities';
import { useListCountries } from '@/features/countries/api/use-list-countries';

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters long.',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters long.',
  }),
  logo: z.string().min(1, {
    message: 'Logo is required.',
  }),
  status: z.enum(AgencyStatus).default(AgencyStatus.ACTIVE),
  countryCode: z.string().min(1, {
    message: 'Country is required.',
  }),
  cityId: z.string().min(1, {
    message: 'City is required.',
  }),
});

export function NewAgency() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      description: '',
      logo: '',
      name: '',
      status: AgencyStatus.ACTIVE,
      countryCode: '',
      cityId: '',
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const createAgency = useCreateAgency({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  const statusList = [
    { label: t('agencies.create.active'), value: 'ACTIVE' },
    { label: t('agencies.create.inactive'), value: 'INACTIVE' },
  ];

  const [countryQuery, setCountryQuery] = useState('');
  const [debouncedCountryQuery, setDebouncedCountryQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [debouncedCityQuery, setDebouncedCityQuery] = useState('');

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

  const selectedCountry = useWatch({ control: form.control, name: 'countryCode' });

  useEffect(() => {
    form.setValue('cityId', '');
  }, [selectedCountry, form]);

  const { data: countriesData, isLoading: isLoadingCountries } = useListCountries(
    debouncedCountryQuery ? { q: debouncedCountryQuery } : {}
  );

  const { data: citiesData, isLoading: isLoadingCities } = useListCities(
    selectedCountry
      ? { country: selectedCountry, ...(debouncedCityQuery ? { q: debouncedCityQuery } : {}) }
      : {}
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAgency.mutate({ ...values });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {t('agencies.create.trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('agencies.create.title')}</DialogTitle>
          <DialogDescription>{t('agencies.create.description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('common.status.label')}</FieldLabel>
                  <SelectComponent
                    onValueChange={field.onChange}
                    options={statusList}
                    placeholder={t('agencies.create.selectStatus')}
                    value={field.value}
                    withSearch={false}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="countryCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('common.table.country')}</FieldLabel>
                  <SelectComponent
                    emptyMessage={isLoadingCountries ? t('common.loading') : t('common.select.emptyMessage')}
                    onSearchChange={setCountryQuery}
                    onValueChange={field.onChange}
                    options={countriesData?.data?.map((country: { name: string; code: string }) => ({
                      label: country.name,
                      value: country.code,
                    })) || []}
                    placeholder={t('agencies.create.selectCountry')}
                    searchPlaceholder={t('agencies.create.searchCountry')}
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
                  <FieldLabel>{t('common.table.city')}</FieldLabel>
                  <SelectComponent
                    emptyMessage={isLoadingCities ? t('common.loading') : t('common.select.emptyMessage')}
                    disabled={!selectedCountry}
                    onSearchChange={setCityQuery}
                    onValueChange={field.onChange}
                    options={citiesData?.data?.map((city: { id: string; name: string }) => ({
                      label: city.name,
                      value: city.id,
                    })) || []}
                    placeholder={t('agencies.create.selectCity')}
                    searchPlaceholder={t('agencies.create.searchCity')}
                    value={field.value}
                    withSearch={!!selectedCountry}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('common.table.name')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('agencies.create.agencyNamePlaceholder')}
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
                  <FieldLabel>{t('common.table.description')}</FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('agencies.create.agencyDescriptionPlaceholder')}
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
                  <FieldLabel>{t('common.table.logo')}</FieldLabel>
                  <LogoUpload onChange={field.onChange} onRemove={() => field.onChange('')} value={field.value} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button
            disabled={!form.formState.isValid || createAgency.isPending}
            onClick={form.handleSubmit(onSubmit)}
            type="submit"
          >
            {createAgency.isPending ? t('common.loading') : t('agencies.create.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
