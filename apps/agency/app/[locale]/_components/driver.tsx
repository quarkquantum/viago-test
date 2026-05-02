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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/web/src/components/ui/table';
import dayjs from 'dayjs';
import { Calendar, File, Mail, Phone, Ticket, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DeleteDriverDialog } from '@/components/delete-driver-dialog';
import { Status } from '@/components/status';
import { useGetDriver } from '@/features/drivers/api/use-get-driver';

export const Driver = () => {
  const t = useTranslations('drivers');
  const tCommon = useTranslations('common');
  const params = useParams();
  const driver = params.driver as string;
  const { data: driverData, isLoading } = useGetDriver(driver);

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
        <Skeleton className="h-96" />
      </div>
    );
  }
  console.log(driverData);

  if (!driverData || 'message' in driverData) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User />
            </EmptyMedia>
            <EmptyTitle>{t('list.empty.title')}</EmptyTitle>
            <EmptyDescription>{t('list.empty.description')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/drivers">{t('details.empty.backToDrivers')}</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // After the loading and error checks, passenger is guaranteed to be a Passenger
  console.log(driverData);
  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 py-2">
        <div className="flex justify-between">
          <h1 className="font-bold text-2xl">{t('details.title')}</h1>
          <DeleteDriverDialog driverId={driverData.user.id} />
        </div>
        <p className="text-primary">{t('details.description')}</p>
      </div>

      {/* Passenger Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                {t('details.personalInfo')}
              </CardTitle>
              <CardDescription>{t('details.personalInfoDesc')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <User className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.fullName')}</p>
                <p className="truncate font-medium">{driverData.user.fullName || driverData.user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Mail className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.email')}</p>
                <p className="truncate font-medium">{driverData.user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Phone className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.phone')}</p>
                <p className="font-medium">{driverData.user.profile?.phoneNumber || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <File className="size-5 text-primary" />
                {t('details.accountDetails')}
              </CardTitle>
              <CardDescription>{t('details.accountDetailsDesc')}</CardDescription>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Ticket className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.totalTrips')}</p>
                <p className="font-medium">{driverData.trips?.length || 0}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.memberSince')}</p>
                <p className="font-medium">{dayjs(driverData.createdAt).format('MMM D, YYYY')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
              <Calendar className="mt-0.5 size-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-muted-foreground text-xs">{t('details.status')}</p>
                <p className="font-medium">
                  {driverData.user.emailVerified ? t('details.verified') : t('details.notVerified')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket History */}
      <div className="space-y-4">
        <Card className="w-full rounded-2xl shadow">
          <CardContent className="fade-in flex h-full animate-in flex-col gap-4 p-6 duration-200">
            <div className="flex flex-col gap-2">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="size-5 text-primary" />
                {t('details.tripsHistory')}
              </CardTitle>
              <CardDescription>{t('details.tripsHistoryDesc')}</CardDescription>
            </div>
            {driverData.trips?.length > 0 ? (
              <div className="fade-in max-h-64 animate-in overflow-hidden overflow-y-auto rounded-md border duration-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tCommon('table.trip')}</TableHead>
                      <TableHead>{tCommon('table.description')}</TableHead>
                      <TableHead>{tCommon('table.status')}</TableHead>
                      <TableHead>{tCommon('table.seat')}</TableHead>
                      <TableHead>{tCommon('table.price')}</TableHead>
                      <TableHead>{tCommon('table.created')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverData.trips?.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>{trip.name}</TableCell>
                        <TableCell>{<Status s={trip.status} />}</TableCell>
                        <TableCell>{trip.bus.title}</TableCell>
                        <TableCell>{dayjs(trip.departureTime).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                        <TableCell>{dayjs(trip.arrivalTime).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                        <TableCell>{dayjs(trip.createdAt).format('ddd, D MMM YYYY h:mm A')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Ticket />
                  </EmptyMedia>
                  <EmptyTitle>{t('details.empty.noTrips')}</EmptyTitle>
                  <EmptyDescription>{t('details.empty.noTripsDesc')}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent />
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
