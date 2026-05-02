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
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { TicketStatus } from '@repo/shared';
import dayjs from 'dayjs';
import { Search, Ticket, User, Phone, MapPin, Bus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useGetTicket } from '@/features/tickets/api/use-get-ticket';
import { formatCurrency } from '@/helpers/format-currency';

export const QuickSearchDialog = () => {
  const t = useTranslations('quickSearch');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchedId, setSearchedId] = useState('');

  const { data: ticketData, isLoading, isError, error } = useGetTicket(searchedId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchedId(query.trim());
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setQuery('');
      setSearchedId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start rounded-lg py-6 text-base">
          <Search className="mr-2 size-5" />
          {t('title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticketId">{t('fields.ticketId')}</Label>
            <div className="flex gap-2">
              <Input
                id="ticketId"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('placeholders.ticketId')}
              />
              <Button type="submit" disabled={!query.trim() || isLoading}>
                <Search className="size-4" />
              </Button>
            </div>
          </div>
        </form>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && searchedId && !isLoading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-destructive">{t('notFound')}</p>
          </div>
        )}

        {ticketData?.data && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="size-5 text-primary" />
                  <span className="font-semibold">{t('ticketInfo')}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticketData.data.status === TicketStatus.ISSUED
                      ? 'bg-green-100 text-green-700'
                      : ticketData.data.status === TicketStatus.RESERVED
                        ? 'bg-blue-100 text-blue-700'
                        : ticketData.data.status === TicketStatus.CANCELLED
                          ? 'bg-red-100 text-red-700'
                          : ticketData.data.status === TicketStatus.REFUNDED
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ticketData.data.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Bus className="size-4 text-muted-foreground" />
                  <span>{ticketData.data.booking.trip.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>
                    {ticketData.data.booking.fromStation.name} → {ticketData.data.booking.toStation.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket className="size-4 text-muted-foreground" />
                  <span>
                    {t('seat')}: {ticketData.data.seat?.number || '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('total')}: {formatCurrency(ticketData.data.booking.total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="size-5 text-primary" />
                <span className="font-semibold">{t('passengerInfo')}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-muted-foreground" />
                  <span>{ticketData.data.passenger.profile?.firstName} {ticketData.data.passenger.profile?.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-4 text-muted-foreground">@</span>
                  <span>{ticketData.data.passenger.email}</span>
                </div>
                {ticketData.data.passenger.profile?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{ticketData.data.passenger.profile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              {t('bookedOn')}: {dayjs(ticketData.data.createdAt).format('DD MMM YYYY HH:mm')}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
