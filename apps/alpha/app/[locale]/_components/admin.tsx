'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { SystemRoles } from '@repo/shared';
import dayjs from 'dayjs';
import { Calendar, Mail, Phone, ShieldCheck, User, User2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { DeleteAdminDialog } from '@/components/admin/delete-admin-dialog';
import { UpdateAdmin } from '@/components/admin/update-admin';
import { useGetAdmin } from '@/features/admins/api/use-get-admin';
import { Link } from '@/i18n/routing';

export const Admin = () => {
  const t = useTranslations();
  const locale = useLocale();
  const params = useParams();
  const id = params.identifier as string;

  const scrollY = useRef(0);

  const { data: admin, isLoading, refetch } = useGetAdmin(id);

  useEffect(() => {
    if (!isLoading) {
      window.scrollTo(0, scrollY.current);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!admin || 'message' in admin) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>{t('admins.profile.adminNotFound')}</EmptyTitle>
            <EmptyDescription>{t('admins.profile.adminNotFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/admins">{t('admins.profile.backToAdmins')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // After the loading and error checks, admin is guaranteed to be a User
  const userData = admin;

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-2xl">{t('admins.profile.title')}</h1>
          <div className="flex gap-2">
            <UpdateAdmin id={id} />
            <DeleteAdminDialog adminId={id} />
          </div>
        </div>
        <p className="text-primary">{t('admins.profile.description')}</p>
      </div>

      {/* Admin Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                {t('admins.profile.personalInfo')}
              </CardTitle>
              <CardDescription>{t('admins.profile.personalInfoDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.fullName')}</p>
                <p className="truncate font-medium">{userData.fullName || userData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Mail className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.emailAddress')}</p>
                <p className="truncate font-medium">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Phone className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.phoneNumber')}</p>
                <p className="font-medium">{userData.profile?.phoneNumber || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-5" />
                {t('admins.profile.accountStatus')}
              </CardTitle>
              <CardDescription>{t('admins.profile.accountStatusDescription')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <ShieldCheck className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('admins.filter.role')}</p>
                <p className="font-medium capitalize">
                  {userData.role === SystemRoles.ADMIN
                    ? t('admins.roles.admin')
                    : userData.role === SystemRoles.SUPER_ADMIN
                      ? t('admins.roles.superAdmin')
                      : userData.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('drivers.profile.memberSince')}</p>
                <p className="font-medium">{dayjs(userData.createdAt).locale(locale).format('MMM D, YYYY')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User2 className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('common.status.label')}</p>
                <p className="font-medium">
                  {userData.emailVerified ? t('common.status.verified') : t('common.status.notVerified')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
