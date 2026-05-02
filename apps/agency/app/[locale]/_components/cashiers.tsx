'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/design-system/web/src/components/ui/alert-dialog';
import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/web/src/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@repo/design-system/web/src/components/ui/field';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';
import { Loader2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDebounce } from 'react-use';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewCashier } from '@/components/new-cashier';
import { PaginationMenu } from '@/components/pagination-menu';
import { SearchInput } from '@/components/search';
import { SkeletonTable } from '@/components/skeleton-table';
import { useDeleteCashier } from '@/features/cashiers/api/use-delete-cashier';
import { useUpdateCashier } from '@/features/cashiers/api/use-update-cashier';
import { type Cashier, useListCashiers } from '@/features/cashiers/api/use-list-cashiers';

const HEADERS_KEYS = ['table.name', 'table.phone', 'table.email', 'table.action'];

export const Cashiers = () => {
  const t = useTranslations('cashiers');
  const tCommon = useTranslations('common');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [query, setQuery] = useState(q || '');

  useDebounce(
    () => {
      if (query !== q) {
        setPage(1);
        setQ(query || null);
      }
    },
    300,
    [query]
  );

  useEffect(() => {
    setQuery(q || '');
  }, [q]);

  const { data, isLoading, refetch } = useListCashiers({
    limit: limit.toString(),
    page: page.toString(),
  });

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-end justify-between">
          <h1 className="font-bold text-2xl">{t('list.title')}</h1>
          <NewCashier />
        </div>
        <p className="text-primary">{t('list.description')}</p>
      </div>

      <SearchInput
        onChange={(e) => setQuery(e.currentTarget.value)}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        placeholder={t('list.searchPlaceholder')}
        value={query}
      />

      {isLoading ? (
        <SkeletonTable header={HEADERS_KEYS.map((key) => tCommon(key))} rows={5} />
      ) : data?.data && data.data.length > 0 ? (
        <div className="w-full space-y-4">
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {HEADERS_KEYS.map((key) => (
                    <TableHead key={key}>{tCommon(key)}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="fade-in animate-in duration-200">
                {data.data.map((cashier: Cashier) => (
                  <TableRow key={cashier.id}>
                    <TableCell>{cashier.user.fullName}</TableCell>
                    <TableCell>{cashier.user.profile?.phoneNumber}</TableCell>
                    <TableCell>{cashier.user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EditCashierButton cashier={cashier} />
                        <DeleteCashierButton id={cashier.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationMenu
            limit={data.pagination.limit}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            onPageChange={(newPage) => setPage(newPage)}
            page={data.pagination.page}
            total={data.pagination.total}
            totalPages={data.pagination.pages}
          />
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};

const EditCashierButton = ({ cashier }: { cashier: Cashier }) => {
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    firstName: z.string().min(1).max(32),
    lastName: z.string().min(1).max(32),
    phoneNumber: z.string().min(1).max(32),
  });
  type FormValues = z.infer<typeof formSchema>;

  const update = useUpdateCashier(cashier.id, {
    onSuccess: () => setOpen(false),
  });

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: cashier.user.profile?.firstName || '',
      lastName: cashier.user.profile?.lastName || '',
      phoneNumber: cashier.user.profile?.phoneNumber || '',
    },
    resolver: zodResolver(formSchema),
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {tCommon('edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{tCommon('dialogs.editCashier')}</DialogTitle>
          <DialogDescription>{cashier.user.email}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => update.mutate(data))}>
          <FieldGroup>
            <FieldSet className="flex flex-col gap-4">
              <Controller
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{tCommon('forms.firstName')}</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{tCommon('forms.lastName')}</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{tCommon('forms.phoneNumber')}</FieldLabel>
                    <Input {...field} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldSet>
          </FieldGroup>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button disabled={update.isPending} type="submit">
              {update.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteCashierButton = ({ id }: { id: string }) => {
  const tCommon = useTranslations('common');
  const t = useTranslations('cashiers');
  const deleteCashier = useDeleteCashier();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          {tCommon('delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tCommon('dialogs.areYouSure')}</AlertDialogTitle>
          <AlertDialogDescription>{t('list.deleteConfirm')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteCashier.isPending}
            onClick={() => deleteCashier.mutate(id)}
          >
            {deleteCashier.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {tCommon('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
