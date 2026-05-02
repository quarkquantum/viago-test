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
import { SystemRoles } from '@repo/shared';
import { UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { useCreateAdmin } from '@/features/admins/api/use-create-admin';

export function NewAdmin() {
  const t = useTranslations();
  const formSchema = z.object({
    email: z.string().email({
      message: t('admins.invalidEmail'),
    }),
    fullName: z.string().min(1, {
      message: t('admins.fullNameRequired'),
    }),
    phoneNumber: z.string().min(1, {
      message: t('admins.phoneNumberRequired'),
    }),
    role: z.literal(SystemRoles.ADMIN),
  });

  const createAdmin = useCreateAdmin();
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      email: '',
      fullName: '',
      phoneNumber: '',
      role: SystemRoles.ADMIN,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAdmin.mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> {t('admins.addNewAdmin')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t('admins.addNewAdmin')}</DialogTitle>
          <DialogDescription>{t('admins.addDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="fullName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('admins.fullName')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('admins.fullName')}
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
                  <FieldLabel>{t('admins.email')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('admins.emailAddress')}
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
                  <FieldLabel>{t('admins.phoneNumber')}</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder={t('admins.phoneNumber')}
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
              disabled={!form.formState.isValid || createAdmin.isPending}
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
            >
              {createAdmin.isPending ? t('admins.creating') : t('admins.createAdmin')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
