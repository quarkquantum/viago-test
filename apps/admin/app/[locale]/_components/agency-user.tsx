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
import dayjs from 'dayjs';
import { Building2, Calendar, CheckCircle2, Mail, Phone, TextSelection, User2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Status } from '@/components/status';
import { DeleteUserDialog } from '@/components/user/delete-user-dialog';
import { UpdateUser } from '@/components/user/update-user';
import { useGetUser } from '@/features/users/api/use-get-user';
import { useSendResetPasswordEmail } from '@/features/users/api/use-send-reset-password-email';

export const AgencyUser = () => {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const params = useParams();
  const userId = params.user as string;

  const { data: userData, isLoading } = useGetUser(userId);
  const sendResetEmail = useSendResetPasswordEmail(userId);

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

  if (!userData?.data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User2 />
            </EmptyMedia>
            <EmptyTitle>{t('list.notFound')}</EmptyTitle>
            <EmptyDescription>{t('list.notFoundDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/users">{t('list.backToUsers')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const user = userData.data;
  const agency = user.agencies?.[0];

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-bold text-2xl">{t('details.title')}</h1>
            <p className="mt-1 text-primary">{t('details.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              disabled={sendResetEmail.isPending}
              onClick={() => sendResetEmail.mutate()}
              size="sm"
              variant="outline"
            >
              <Mail className="mr-2 size-4" />
              {sendResetEmail.isPending ? tc('updating') : t('resetPassword.trigger')}
            </Button>
            <UpdateUser id={user.id} />
            <DeleteUserDialog userId={user.id} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User2 className="size-5 text-primary" />
                {tc('table.personalInfo')}
              </CardTitle>
              <CardDescription>{tc('table.personalInfoDescription')}</CardDescription>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                <User2 className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">{tc('table.fullName')}</p>
                  <p className="truncate font-medium">{user.fullName || user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                <Mail className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">{tc('table.emailAddress')}</p>
                  <p className="truncate font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">{tc('table.status')}</p>
                  <p className="font-medium">{user.emailVerified ? tc('table.verified') : tc('table.notVerified')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                <Phone className="mt-0.5 size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-muted-foreground text-xs">{tc('table.phoneNumber')}</p>
                  <p className="font-medium">{user.profile?.phoneNumber || '-'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency details */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                {tc('table.accountDetails')}
              </CardTitle>
              <CardDescription>{tc('table.accountDetailsDescription')}</CardDescription>
            </div>
            {agency ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Building2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyName')}</p>
                    <p className="truncate font-medium">{agency.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <TextSelection className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyDescription')}</p>
                    <p className="truncate font-medium">{agency.description || t('details.noDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <CheckCircle2 className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.agencyStatus')}</p>
                    <Status s={agency.status} />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <Calendar className="mt-0.5 size-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-muted-foreground text-xs">{tc('table.memberSince')}</p>
                    <p className="font-medium">{dayjs(agency.createdAt).format('MMM D, YYYY')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
                <Building2 className="mb-2 size-8 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm">{t('details.noAgency')}</p>
                <Button asChild className="mt-4" size="sm" variant="outline">
                  <Link href="/agencies">{t('details.goAgencies')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
