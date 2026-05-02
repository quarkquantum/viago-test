'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Hammer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useBanUser } from '@/features/users/api/use-ban-user';

const formSchema = z.object({
  banExpires: z.string().optional(),
  banReason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const BanUserDialog = ({ userId }: { userId: string }) => {
  const t = useTranslations('passengers.ban');
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      banExpires: undefined,
      banReason: '',
    },
    resolver: zodResolver(formSchema),
  });

  const banUser = useBanUser(userId, {
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: FormValues) => {
    banUser.mutate({
      banExpires: data.banExpires ? Number(data.banExpires) : undefined,
      banReason: data.banReason,
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Hammer className="mr-2 size-4" />
          {t('submit')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel>{t('reason')}</FieldLabel>
              <Input {...form.register('banReason')} placeholder="Banned for..." />
              {form.formState.errors.banReason && <FieldError errors={[form.formState.errors.banReason]} />}
            </Field>
            <Field>
              <FieldLabel>{t('expires')}</FieldLabel>
              <Input {...form.register('banExpires')} placeholder="In seconds (e.g. 3600 for 1 hour)" type="number" />
              {form.formState.errors.banExpires && <FieldError errors={[form.formState.errors.banExpires]} />}
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button disabled={banUser.isPending} type="submit" variant="destructive">
              {banUser.isPending ? t('banning') : t('submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
