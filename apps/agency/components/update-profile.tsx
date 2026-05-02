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
import { Textarea } from '@repo/design-system/web/src/components/ui/textarea';
import { Pen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetMyAgency } from '@/features/me/api/use-get-my-agency';
import { useUpdateMyAgency } from '@/features/me/api/use-update-my-agency';
import { LogoUpload } from './logo-upload';

export function UpdateProfile() {
  const t = useTranslations('common');
  const { data } = useGetMyAgency();
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    description: z.string().min(2, {
      message: 'Description must be at least 2 characters long.',
    }),
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters long.',
    }),
    logo: z.string().optional(),
  });

  const form = useForm({
    defaultValues: {
      description: '',
      logo: '',
      name: '',
    },
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const updateMyAgency = useUpdateMyAgency({
    onSuccess: () => {
      form.reset();
      setOpen(false);
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        description: data.data.agency?.description ?? '',
        logo: data.data.agency?.logo ?? '',
        name: data.data.agency?.name ?? '',
      });
    }
  }, [data, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateMyAgency.mutate({ json: values });
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <Pen />
          {t('dialogs.editProfile')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('dialogs.editProfile')}</DialogTitle>
          <DialogDescription>{t('dialogs.editProfileDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('forms.name')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('forms.enterName')}
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
                  <FieldLabel>{t('forms.description')}</FieldLabel>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('forms.enterDescription')}
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
                  <FieldLabel>{t('forms.logo')}</FieldLabel>
                  <LogoUpload onChange={field.onChange} onRemove={() => field.onChange('')} value={field.value} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('cancel')}</Button>
          </DialogClose>
          <Button
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            onClick={form.handleSubmit(onSubmit)}
            type="submit"
          >
            {t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
