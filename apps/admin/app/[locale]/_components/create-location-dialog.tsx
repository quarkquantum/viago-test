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
import { useListAgencies } from '@/features/agencies/api/use-list-agencies';
import { useListCities } from '@/features/cities/api/use-list-cities';

type CreateLocationDialogProps = {
  onSuccess?: () => void;
};

export const CreateLocationDialog = ({ onSuccess }: CreateLocationDialogProps) => {
  const t = useTranslations('locations');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    agencyId: '',
    cityId: '',
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const { data: agenciesData } = useListAgencies({ limit: '100' });
  const { data: citiesData } = useListCities({ limit: '500' });

  const createLocation = useCreateLocation({
    onSuccess: () => {
      setOpen(false);
      setFormData({ agencyId: '', cityId: '', name: '', address: '', phone: '', email: '' });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLocation.mutate(formData);
  };

  const isValid = formData.agencyId && formData.cityId && formData.name;

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
            <Label>{t('fields.agency')} *</Label>
            <Select value={formData.agencyId} onValueChange={(v) => setFormData({ ...formData, agencyId: v })}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectAgency')} />
              </SelectTrigger>
              <SelectContent>
                {agenciesData?.data.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('fields.name')} *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('placeholders.name')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('fields.city')} *</Label>
            <Select value={formData.cityId} onValueChange={(v) => setFormData({ ...formData, cityId: v })}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectCity')} />
              </SelectTrigger>
              <SelectContent>
                {citiesData?.data.map((city) => (
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
