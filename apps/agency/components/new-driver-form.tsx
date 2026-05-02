'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import { DialogClose, DialogFooter } from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateDriver } from '@/features/drivers/api/use-create-driver';

export const NewDriverForm = ({ setOpenAction }: { setOpenAction: (open: boolean) => void }) => {
  const t = useTranslations('common');

  const formSchema = z.object({
    email: z.string().min(1, t('forms.validation.emailRequired')).email(),
    firstName: z.string().min(1, t('forms.validation.firstNameRequired')).max(32),
    lastName: z.string().min(1, t('forms.validation.lastNameRequired')).max(32),
    phoneNumber: z.string().min(1, t('forms.validation.phoneNumberRequired')).max(32),
  });

  type FormValues = z.infer<typeof formSchema>;

  const createDriver = useCreateDriver({
    onSuccess: () => {
      form.reset();
      setOpenAction(false);
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    createDriver.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FieldSet className="flex flex-col gap-4">
          <Controller
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.firstName')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterFirstName')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="lastName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.lastName')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterLastName')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.email')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterEmail')} type="email" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="phoneNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('forms.phoneNumber')}</FieldLabel>
                <Input {...field} placeholder={t('forms.enterPhoneNumber')} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {t('cancel')}
          </Button>
        </DialogClose>
        <Button disabled={createDriver.isPending} type="submit">
          {createDriver.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t('dialogs.createDriver')}
        </Button>
      </DialogFooter>
    </form>
  );
};
