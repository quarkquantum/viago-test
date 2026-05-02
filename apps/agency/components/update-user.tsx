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
import { Edit } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useGetMe } from '@/features/me/api/use-get-me';
import { useUpdateMe } from '@/features/me/api/use-update-me';

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

export const UpdateUser = ({ label }: { label?: string }) => {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const { data: user, isLoading } = useGetMe();
  const updateMe = useUpdateMe({
    onSuccess: () => {
      setOpen(false);
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
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        firstName: user.profile?.firstName ?? '',
        lastName: user.profile?.lastName ?? '',
        phoneNumber: user.profile?.phoneNumber ?? '',
      });
    }
  }, [user, form]);

  const onSubmit = (data: FormValues) => {
    updateMe.mutate(data);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 size-4" />
          {label ?? t('dialogs.editProfile')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{label ?? t('dialogs.editProfile')}</DialogTitle>
          <DialogDescription>{t('dialogs.editProfileDescription')}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">{t('loading')}</div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{t('forms.firstName')}</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder={t('forms.enterFirstName')}
                    />
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
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder={t('forms.enterLastName')}
                    />
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
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder={t('forms.enterEmail')}
                      type="email"
                    />
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
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                      placeholder={t('forms.enterPhoneNumber')}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
              </DialogClose>
              <Button disabled={form.formState.isSubmitting || !form.formState.isDirty} type="submit">
                {updateMe.isPending ? t('saving') : t('saveChanges')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
