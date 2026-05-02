'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Logo from '@repo/design-system/web/src/assets/logo-icon.svg';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/web/src/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/web/src/components/ui/command';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/web/src/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@repo/design-system/web/src/components/ui/radio-group';
import { cn } from '@repo/design-system/web/src/lib/utils';
import { createAgencyRequestSchema } from '@repo/validators';
import {
  Bus,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  UserCircle,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useCreateAgencyRequest } from '@/features/agency-requests/api/use-create-agency-request';
import { useListCities } from '@/features/cities/api/use-list-cities';
import { useListCountries } from '@/features/countries/api/use-list-countries';
import { FileUpload } from '@/components/file-upload';

type FormData = z.infer<typeof createAgencyRequestSchema>;

const LEGAL_FORM_OTHER = 'OTHER';
const REQUIRED_FIELD = <span className="text-destructive">*</span>;

const steps = [
  { id: 1, icon: Building2, label: 'company', sublabel: 'legal' },
  { id: 2, icon: UserCircle, label: 'manager', sublabel: 'contact' },
  { id: 3, icon: Bus, label: 'operations', sublabel: 'activity' },
  { id: 4, icon: Lock, label: 'account', sublabel: 'admin' },
];

function getErrorMessage(
  message: string | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  if (!message) return '';
  if (message.startsWith('validation.')) {
    return t(message);
  }
  return message;
}

export function MultiStepRegisterForm() {
  const t = useTranslations('auth');
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [legalForm, setLegalForm] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(createAgencyRequestSchema),
    mode: 'onChange',
    defaultValues: {
      agencyName: '',
      description: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      legalForm: '',
      customLegalForm: '',
      countryCode: 'CM',
      cityId: '',
      citiesServed: [],
      address: '',
      officialPhone: '',
      officialEmail: '',
      position: '',
      customPosition: '',
      directPhone: '',
      directEmail: '',
      numberOfAgencies: undefined,
      numberOfBuses: undefined,
      busType: 'NUMBERED',
      logo: '',
      rccmDocument: '',
      taxCardDocument: '',
      accountEmail: '',
      password: '',
    },
  });

  const { mutate, isPending } = useCreateAgencyRequest({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      toast.error(t('registerError'));
    },
  });

  const { data: countriesData } = useListCountries();
  const countries = countriesData?.data || [];

  const selectedCountry = form.watch('countryCode');
  const { data: citiesData } = useListCities({ countryCode: selectedCountry || 'CM' });
  const cities = citiesData?.data || [];

  const { trigger, watch } = form;
  const watchedValues = watch();

  const position = watchedValues.position;

  const canProceed = async (step: number): Promise<boolean> => {
    const isOtherLegalForm = form.watch('legalForm') === LEGAL_FORM_OTHER;
    const isOtherPosition = form.watch('position') === 'AUTRE';
    try {
      switch (step) {
        case 1:
          return trigger(['agencyName', 'legalForm', 'cityId', ...(isOtherLegalForm ? ['customLegalForm'] : [])]);
        case 2:
          return trigger(['firstName', 'lastName', 'position', 'phoneNumber', 'email', ...(isOtherPosition ? ['customPosition'] : [])]);
        case 3:
          return trigger(['numberOfAgencies', 'citiesServed', 'numberOfBuses', 'busType']);
        case 4:
          console.log('[canProceed] Step 4 - Triggering account fields');
          return trigger(['accountEmail', 'password', 'logo', 'rccmDocument', 'taxCardDocument']);
        default:
          return true;
      }
    } catch (e) {
      console.log('[canProceed] Error:', e);
      return false;
    }
  };

  const handleNext = async () => {
    console.log('[handleNext] Current step:', currentStep);
    const isValid = await canProceed(currentStep);
    console.log('[handleNext] isValid:', isValid);
    if (isValid && currentStep < 4) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && currentStep < 4) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = (data: FormData) => {
    console.log('[handleSubmit] Received data:', data);
    const submitData = {
      ...data,
      citiesServed: data.citiesServed?.join(',') || undefined,
    };
    if (data.legalForm === LEGAL_FORM_OTHER && data.customLegalForm) {
      submitData.legalForm = data.customLegalForm;
    }
    if (data.position === 'AUTRE' && data.customPosition) {
      submitData.position = data.customPosition;
    }
    delete submitData.customLegalForm;
    delete submitData.customPosition;
    console.log('[handleSubmit] Final data:', submitData);
    console.log('[handleSubmit] Calling mutate...');
    mutate(submitData);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl py-12">
        <CardHeader className="flex flex-col items-center justify-center gap-2">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
            <Check className="size-8 text-green-600" />
          </div>
          <h1 className="text-center font-bold text-2xl">{t('registerSuccess')}</h1>
          <CardDescription className="text-center">{t('registerSuccessDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/login">{t('backToLogin')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader className="flex flex-col items-center gap-3 pb-6">
        <Image alt="logo" className="mb-2" src={Logo} />
        <h1 className="flex items-center gap-2 font-bold text-2xl">
          <Truck className="text-primary" />
          {t('registerTitle')}
        </h1>
        <CardDescription className="text-center flex items-center gap-1">
          <ShieldCheck className="size-4 text-green-600" />
          {t('registerSubtitle')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full border-2 transition-all',
                      currentStep > step.id
                        ? 'border-green-600 bg-green-600 text-white'
                        : currentStep === step.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                    )}
                  >
                    {currentStep > step.id ? <Check className="size-5" /> : <step.icon className="size-5" />}
                  </div>
                  <span
                    className={cn(
                      'mt-1 text-xs font-medium',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {t(`steps.${step.label}`)}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{t(`steps.${step.sublabel}`)}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-all',
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onKeyDown={handleKeyDown} onSubmit={(e) => { e.preventDefault(); handleSubmit(form.getValues()); }} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="text-primary" />
                {t('steps.companyInfo')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="mb-2 block" htmlFor="agencyName">
                    {t('registerAgencyName')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="agencyName"
                    placeholder={t('registerAgencyNamePlaceholder')}
                    {...form.register('agencyName')}
                  />
                  {form.formState.errors.agencyName && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.agencyName.message, t)}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="legalForm">
                    {t('registerLegalForm')} {REQUIRED_FIELD}
                  </Label>
                  <select
                    id="legalForm"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register('legalForm', {
                      onChange: (e) => setLegalForm(e.target.value),
                    })}
                  >
                    <option value="">{t('selectOption')}</option>
                    <option value="SARL">{t('legalFormOptions.sarl')}</option>
                    <option value="SA">{t('legalFormOptions.sa')}</option>
                    <option value="GIE">{t('legalFormOptions.gie')}</option>
                    <option value="ENTREPRISE_INDIVIDUELLE">{t('legalFormOptions.ei')}</option>
                    <option value={LEGAL_FORM_OTHER}>{t('legalFormOptions.other')}</option>
                  </select>
                </div>

                {legalForm === LEGAL_FORM_OTHER && (
                  <div>
                    <Label className="mb-2 block" htmlFor="customLegalForm">
                      {t('registerCustomLegalForm')}
                    </Label>
                    <Input
                      id="customLegalForm"
                      placeholder={t('registerCustomLegalFormPlaceholder')}
                      {...form.register('customLegalForm')}
                    />
                  </div>
                )}

                <div>
                  <Label className="mb-2 block" htmlFor="countryCode">
                    <MapPin className="mr-1 inline size-3 text-green-600" />
                    {t('registerCountry')}
                  </Label>
                  <select
                    id="countryCode"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register('countryCode')}
                  >
                    <option value="">{t('selectOption')}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="cityId">
                    <MapPin className="mr-1 inline size-3 text-green-600" />
                    {t('registerCity')} {REQUIRED_FIELD}
                  </Label>
                  <select
                    id="cityId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register('cityId')}
                  >
                    <option value="">{t('selectOption')}</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.cityId && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.cityId.message, t)}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label className="mb-2 block" htmlFor="address">
                    {t('registerAddress')}
                  </Label>
                  <Input id="address" placeholder={t('registerAddressPlaceholder')} {...form.register('address')} />
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="officialPhone">
                    <Phone className="mr-1 inline size-3 text-green-600" />
                    {t('registerOfficialPhone')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="officialPhone"
                    type="tel"
                    placeholder="00237691234567"
                    {...form.register('officialPhone')}
                  />
                  {form.formState.errors.officialPhone && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.officialPhone.message, t)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Format: 002376 + 8 digits</p>
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="officialEmail">
                    {t('registerOfficialEmail')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="officialEmail"
                    type="email"
                    placeholder="contact@company.cm"
                    {...form.register('officialEmail')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <UserCircle className="text-primary" />
                {t('steps.managerInfo')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block" htmlFor="firstName">
                    <User className="mr-1 inline size-3 text-green-600" />
                    {t('registerFirstName')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="firstName"
                    placeholder={t('registerFirstNamePlaceholder')}
                    {...form.register('firstName')}
                  />
                  {form.formState.errors.firstName && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.firstName.message, t)}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="lastName">
                    <User className="mr-1 inline size-3 text-green-600" />
                    {t('registerLastName')} {REQUIRED_FIELD}
                  </Label>
                  <Input id="lastName" placeholder={t('registerLastNamePlaceholder')} {...form.register('lastName')} />
                  {form.formState.errors.lastName && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.lastName.message, t)}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="position">
                    {t('registerPosition')} {REQUIRED_FIELD}
                  </Label>
                  <select
                    id="position"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register('position')}
                  >
                    <option value="">{t('selectOption')}</option>
                    <option value="DIRECTEUR_GENERAL">{t('position.dg')}</option>
                    <option value="PROMOTEUR">{t('position.promoter')}</option>
                    <option value="RESPONSABLE_EXPLOITATION">{t('position.exploitation')}</option>
                    <option value="AUTRE">{t('position.other')}</option>
                  </select>
                  {position === 'AUTRE' && (
                    <div className="mt-2">
                      <Label className="mb-2 block" htmlFor="customPosition">
                        {t('registerCustomPosition')} {REQUIRED_FIELD}
                      </Label>
                      <Input
                        id="customPosition"
                        placeholder={t('registerCustomPositionPlaceholder')}
                        {...form.register('customPosition')}
                      />
                      {form.formState.errors.customPosition && (
                        <p className="mt-1 text-sm text-destructive">
                          {getErrorMessage(form.formState.errors.customPosition.message, t)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="phoneNumber">
                    <Phone className="mr-1 inline size-3 text-green-600" />
                    {t('registerPhoneNumber')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="00237691234567"
                    {...form.register('phoneNumber')}
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.phoneNumber.message, t)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Format: 002376 + 8 digits</p>
                </div>

                <div className="sm:col-span-2">
                  <Label className="mb-2 block" htmlFor="email">
                    {t('email')} {REQUIRED_FIELD}
                  </Label>
                  <Input id="email" type="email" placeholder="m@example.com" {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.email.message, t)}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="directPhone">
                    {t('registerDirectPhone')}
                  </Label>
                  <Input id="directPhone" type="tel" placeholder="00237691234567" {...form.register('directPhone')} />
                  {form.formState.errors.directPhone && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.directPhone.message, t)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">Format: 002376 + 8 digits</p>
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="directEmail">
                    {t('registerDirectEmail')}
                  </Label>
                  <Input
                    id="directEmail"
                    type="email"
                    placeholder="manager@company.cm"
                    {...form.register('directEmail')}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Bus className="text-primary" />
                {t('steps.operationsInfo')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block" htmlFor="numberOfAgencies">
                    {t('registerNumberOfAgencies')}
                  </Label>
                  <Input
                    id="numberOfAgencies"
                    type="number"
                    min="1"
                    placeholder="ex: 3"
                    {...form.register('numberOfAgencies', { valueAsNumber: true })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="mb-2 block">{t('registerCitiesServed')}</Label>
                  <Popover open={citiesOpen} onOpenChange={setCitiesOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between font-normal',
                          form.watch('citiesServed')?.length > 0 ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {form.watch('citiesServed')?.length > 0
                          ? `${form.watch('citiesServed').length} ${t('selected')}`
                          : t('selectCities')}
                        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t('searchCities')} />
                        <CommandList>
                          <CommandEmpty>{t('noCityFound')}</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {cities.map((city) => {
                              const isSelected = form.watch('citiesServed')?.includes(city.id);
                              return (
                                <CommandItem
                                  key={city.id}
                                  value={city.name}
                                  onSelect={() => {
                                    const current = form.watch('citiesServed') || [];
                                    const numberOfAgencies = form.watch('numberOfAgencies');
                                    if (isSelected) {
                                      form.setValue(
                                        'citiesServed',
                                        current.filter((id) => id !== city.id)
                                      );
                                    } else {
                                      if (numberOfAgencies && current.length >= numberOfAgencies) {
                                        return;
                                      }
                                      form.setValue('citiesServed', [...current, city.id]);
                                    }
                                  }}
                                >
                                  <Check className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                  {city.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {form.watch('citiesServed')?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {form.watch('citiesServed').map((cityId) => {
                        const city = cities.find((c) => c.id === cityId);
                        return city ? (
                          <span
                            key={cityId}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs"
                          >
                            {city.name}
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                const current = form.watch('citiesServed') || [];
                                form.setValue(
                                  'citiesServed',
                                  current.filter((id) => id !== cityId)
                                );
                              }}
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{t('registerCitiesServedPlaceholder')}</p>
                  {form.formState.errors.citiesServed && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.citiesServed.message, t)}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block" htmlFor="numberOfBuses">
                    {t('registerNumberOfBuses')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="numberOfBuses"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="25"
                    {...form.register('numberOfBuses', { valueAsNumber: true })}
                  />
                  {form.formState.errors.numberOfBuses && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.numberOfBuses.message, t)}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label className="mb-2 block">{t('registerBusType')}</Label>
                  <RadioGroup
                    className="mt-2 flex gap-4"
                    defaultValue={watchedValues.busType}
                    onValueChange={(v) => form.setValue('busType', v as 'NUMBERED' | 'NON_NUMBERED' | 'MIXTE')}
                  >
                    <div className="flex items-center space-x-2 rounded-full border px-4 py-2">
                      <RadioGroupItem id="numbered" value="NUMBERED" />
                      <Label className="cursor-pointer" htmlFor="numbered">
                        {t('busType.numbered')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-full border px-4 py-2">
                      <RadioGroupItem id="non-numbered" value="NON_NUMBERED" />
                      <Label className="cursor-pointer" htmlFor="non-numbered">
                        {t('busType.nonNumbered')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-full border px-4 py-2">
                      <RadioGroupItem id="mixte" value="MIXTE" />
                      <Label className="cursor-pointer" htmlFor="mixte">
                        {t('busType.mixte')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Lock className="text-primary" />
                {t('steps.accountInfo')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block" htmlFor="accountEmail">
                    {t('email')} {REQUIRED_FIELD}
                  </Label>
                  <Input
                    id="accountEmail"
                    type="email"
                    placeholder="exemple@email.com"
                    {...form.register('accountEmail')}
                  />
                  {form.formState.errors.accountEmail && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.accountEmail.message, t)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="mb-2 block" htmlFor="password">
                    {t('password')} {REQUIRED_FIELD}
                  </Label>
                  <Input id="password" type="password" placeholder="••••••••" {...form.register('password')} />
                  {form.formState.errors.password && (
                    <p className="mt-1 text-sm text-destructive">
                      {getErrorMessage(form.formState.errors.password.message, t)}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-blue-900">
                  <FileText className="size-4" />
                  {t('documents.title')}
                </h3>
                <p className="mt-1 text-sm text-blue-700">{t('documents.description')}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <FileUpload
                    label={t('documents.logo') + ' '}
                    onChange={(v) => form.setValue('logo', v)}
                    onRemove={() => form.setValue('logo', '')}
                    type="logo"
                    value={watchedValues.logo}
                  />
                  <FileUpload
                    label={t('documents.rccm') + ' '}
                    onChange={(v) => form.setValue('rccmDocument', v)}
                    onRemove={() => form.setValue('rccmDocument', '')}
                    type="document"
                    value={watchedValues.rccmDocument}
                  />
                  <FileUpload
                    label={t('documents.taxCard') + ' '}
                    onChange={(v) => form.setValue('taxCardDocument', v)}
                    onRemove={() => form.setValue('taxCardDocument', '')}
                    type="pdf"
                    value={watchedValues.taxCardDocument}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
              <ChevronLeft className="mr-1 size-4" />
              {t('previous')}
            </Button>

            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext}>
                {t('next')}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                onClick={() => console.log('[SubmitButton] Clicked!')}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    {t('registerSubmit')}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <ShieldCheck className="mr-1 inline size-3" />
          {t('privacyNote')}
        </p>
      </CardContent>
    </Card>
  );
}
