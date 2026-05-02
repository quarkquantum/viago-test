'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/web/src/components/ui/select';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useCreateLocation } from '@/features/locations/api/use-create-location';
import { useListCities } from '@/features/cities/api/use-list-cities';
import { useListCountries } from '@/features/countries/api/use-list-countries';

type CreateLocationDialogProps = {
  onSuccess?: () => void;
};

export const CreateLocationDialog = ({ onSuccess }: CreateLocationDialogProps) => {
  const t = useTranslations('locations');
  const [open, setOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [formData, setFormData] = useState({
    cityId: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const { data: countriesData, isLoading: countriesLoading } = useListCountries();
  const { data: citiesData, isLoading: citiesLoading } = useListCities(
    { country: countryCode, limit: '500' },
    { enabled: !!countryCode }
  );

  const createLocation = useCreateLocation({
    onSuccess: () => {
      setOpen(false);
      setCountryCode('');
      setFormData({ cityId: '', name: '', address: '', phone: '', email: '' });
      onSuccess?.();
    },
  });

  const handleCountryChange = (value: string) => {
    setCountryCode(value);
    setFormData((prev) => ({ ...prev, cityId: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLocation.mutate(formData);
  };

  const isValid = formData.cityId && formData.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          {t('create')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('createTitle')}</DialogTitle>
          <DialogDescription>{t('createDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('fields.name')} *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('placeholders.name')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('fields.country')} *</Label>
            <Select
              value={countryCode}
              onValueChange={handleCountryChange}
              disabled={countriesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={countriesLoading ? t('loading') : t('selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {countriesData?.data?.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('fields.city')} *</Label>
            <Select
              value={formData.cityId}
              onValueChange={(v) => setFormData({ ...formData, cityId: v })}
              disabled={!countryCode || citiesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !countryCode
                      ? t('selectCountryFirst')
                      : citiesLoading
                        ? t('loading')
                        : t('selectCity')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {citiesData?.data?.map((city: { id: string; name: string }) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('fields.address')}</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('placeholders.address')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('fields.phone')}</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('placeholders.phone')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('fields.email')}</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('placeholders.email')}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!isValid || createLocation.isPending}>
              {createLocation.isPending ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
