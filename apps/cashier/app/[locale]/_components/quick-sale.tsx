'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/web/src/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/web/src/components/ui/select';
import { Input } from '@repo/design-system/web/src/components/ui/input';
import { Label } from '@repo/design-system/web/src/components/ui/label';
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/design-system/web/src/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/design-system/web/src/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/design-system/web/src/components/ui/alert-dialog';
import { TicketStatus } from '@repo/shared';
import { z } from 'zod';
import { cameroonPhoneNumberSchema } from '@repo/validators';
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, User, Wallet, Bus, CreditCard, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/helpers/format-currency';
import dayjs from 'dayjs';
import { useCreateTicket } from '@/features/tickets/api/use-create-ticket';
import { useGetTripAvailableSeats } from '@/features/trips/api/use-get-trip-available-seats';
import { useGetTrip } from '@/features/trips/api/use-get-trip';
import { useListTripsRoutes } from '@/features/trips/api/use-list-trips-routes';
import { useListLocations } from '@/features/locations/api/use-list-locations';
import { useListStations } from '@/features/stations/api/use-list-stations';
import { SeatMap } from '@/components/trip/seat-map';

type Trip = {
  id: string;
  slug: string;
  name: string;
  status: string;
  agency?: { name: string };
  stations: { id: string; name: string; order: number }[];
};

type Seat = {
  id: string;
  number: number;
};

export const QuickSale = () => {
  const t = useTranslations('quickSale');
  const tc = useTranslations('tickets.print');
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [fromStationId, setFromStationId] = useState('');
  const [toStationId, setToStationId] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [passenger, setPassenger] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    identityDocumentType: '',
    identityDocumentNumber: '',
  });
  const [isPaid, setIsPaid] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tripsPage, setTripsPage] = useState(1);

  const [searchFromStation, setSearchFromStation] = useState('');
  const [searchToStation, setSearchToStation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [fromStationOpen, setFromStationOpen] = useState(false);
  const [toStationOpen, setToStationOpen] = useState('');

  const { data: locationsData } = useListLocations({ limit: '50' });
  const locations = locationsData?.data || [];

  const { data: fromStationsData } = useListStations({
    search: searchFromStation,
    limit: '20',
  });
  const fromStations = fromStationsData?.data || [];

  const { data: toStationsData } = useListStations({
    search: searchToStation,
    limit: '20',
  });
  const toStations = toStationsData?.data || [];

  const searchQuery: Record<string, string> = {
    limit: '12',
    page: tripsPage.toString(),
  };
  if (searchFromStation) searchQuery.fromStation = searchFromStation;
  if (searchToStation) searchQuery.toStation = searchToStation;
  if (searchDate) {
    searchQuery.departureTime = new Date(searchDate + 'T00:00:00Z').toISOString();
    searchQuery.arrivalTime = new Date(searchDate + 'T23:59:59Z').toISOString();
  }

  const { data: tripsData, isLoading: isLoadingTrips } = useListTripsRoutes(searchQuery);
  const trips = tripsData?.data || [];
  const tripsPagination = tripsData?.pagination;

  const { data: availableSeatsData, isLoading: isLoadingSeats } = useGetTripAvailableSeats(
    selectedTrip?.id || '',
    {
      fromStationId: fromStationId || undefined,
      toStationId: toStationId || undefined,
    }
  );
  const availableSeats = (availableSeatsData?.data as Seat[]) || [];

  const { data: tripDetails } = useGetTrip(selectedTrip?.id || '');
  const tripBus = tripDetails?.bus;
  const tripStations = tripDetails?.stations || [];

  const createTicket = useCreateTicket({
    onSuccess: () => {
      window.location.href = '/tickets';
    },
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const isValidCameroonPhone = (phone: string): boolean => {
    if (!phone) return true;
    return cameroonPhoneNumberSchema.safeParse(phone).success;
  };

  const calculateTotal = (): number => {
    if (!selectedTrip || !fromStationId || !toStationId) return 0;
    
    const fromStation = selectedTrip.stations.find(s => s.id === fromStationId);
    const toStation = selectedTrip.stations.find(s => s.id === toStationId);
    
    if (!fromStation || !toStation) return 0;
    
    const stationsInRange = selectedTrip.stations.filter(s => 
      s.order >= fromStation.order && s.order <= toStation.order
    );
    
    return stationsInRange.reduce((sum, station) => sum + (station as any).startingPrice, 0);
  };

  const handleSubmit = () => {
    if (!selectedTrip || !fromStationId || !toStationId) return;

    createTicket.mutate({
      tripId: selectedTrip.id,
      fromStationId,
      toStationId,
      seatId: selectedSeat?.id,
      passengerEmail: passenger.email || undefined,
      passengerFirstName: passenger.firstName,
      passengerLastName: passenger.lastName,
      passengerPhone: passenger.phone || undefined,
      passengerIdentityDocumentType: passenger.identityDocumentType || undefined,
      passengerIdentityDocumentNumber: passenger.identityDocumentNumber || undefined,
      isPaid,
      locationId: selectedLocation || undefined,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedTrip;
      case 2:
        return !!fromStationId && !!toStationId;
      case 3:
        return !!passenger.firstName && !!passenger.lastName && isValidCameroonPhone(passenger.phone) && !!passenger.identityDocumentType && !!passenger.identityDocumentNumber;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNewSale = () => {
    setStep(1);
    setSelectedTrip(null);
    setFromStationId('');
    setToStationId('');
    setSelectedSeat(null);
    setPassenger({ firstName: '', lastName: '', email: '', phone: '', identityDocumentType: '', identityDocumentNumber: '' });
    setTripsPage(1);
  };

  if (step === 5) {
    return (
      <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center gap-6 py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="size-12 animate-spin text-primary" />
          <div>
            <h1 className="font-bold text-2xl">{t('processing')}</h1>
            <p className="text-primary">{t('success.description')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col gap-6">
      <div className="flex flex-col gap-2 py-2">
        <h1 className="font-bold text-2xl">{t('title')}</h1>
        <p className="text-primary">{t('description')}</p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : step > s
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="size-4" /> : s}
            </div>
            {s < 4 && (
              <div className={`h-0.5 w-8 ${step > s ? 'bg-green-600' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>
            {step === 1 && t('steps.trip.title')}
            {step === 2 && t('steps.seat.title')}
            {step === 3 && t('steps.passenger.title')}
            {step === 4 && t('steps.payment.title')}
          </CardTitle>
          <CardDescription>
            {step === 1 && t('steps.trip.description')}
            {step === 2 && t('steps.seat.description')}
            {step === 3 && t('steps.passenger.description')}
            {step === 4 && t('steps.payment.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Search className="size-4" />
                  {t('searchByRoute')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('fields.from')}</Label>
                    <Input
                      placeholder={t('selectFrom')}
                      value={searchFromStation}
                      onChange={(e) => setSearchFromStation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.to')}</Label>
                    <Input
                      placeholder={t('selectTo')}
                      value={searchToStation}
                      onChange={(e) => setSearchToStation(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('fields.date')}</Label>
                    <Input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchFromStation('');
                      setSearchToStation('');
                      setSearchDate('');
                      setTripsPage(1);
                    }}
                  >
                    <X className="mr-2 size-4" />
                    {t('clearSearch')}
                  </Button>
                  <Button size="sm" onClick={() => setTripsPage(1)}>
                    <Search className="mr-2 size-4" />
                    {t('search')}
                  </Button>
                </div>
              </div>

              {locations.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('fields.location')}</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={(v) => {
                      setSelectedLocation(v);
                      setSelectedTrip(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLocation')} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} - {loc.city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isLoadingTrips ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : trips.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {searchFromStation || searchToStation || searchDate ? t('noTripsFound') : t('noTrips')}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {trips.map((trip) => (
                      <Button
                        key={trip.id}
                        variant={selectedTrip?.id === trip.id ? 'default' : 'outline'}
                        className="flex h-auto flex-col items-start justify-start gap-1 p-4"
                        onClick={() => {
                          setSelectedTrip(trip);
                          setFromStationId('');
                          setToStationId('');
                          setSelectedSeat(null);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Bus className="size-4" />
                          <span className="font-semibold">{trip.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {trip.agency?.name} - {trip.stations[0]?.name} to {trip.stations[trip.stations.length - 1]?.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                  {tripsPagination && tripsPagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTripsPage(p => Math.max(1, p - 1))}
                        disabled={tripsPage === 1}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {tripsPage} / {tripsPagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTripsPage(p => p + 1)}
                        disabled={tripsPage >= tripsPagination.pages}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 2 && selectedTrip && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fields.from')}</Label>
                  <Select value={fromStationId} onValueChange={(v) => { setFromStationId(v); setSelectedSeat(null); }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectFrom')} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTrip.stations
                        .filter((s) => s.id !== toStationId)
                        .map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.to')}</Label>
                  <Select
                    value={toStationId}
                    onValueChange={(v) => { setToStationId(v); setSelectedSeat(null); }}
                    disabled={!fromStationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTo')} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTrip.stations
                        .filter((s) => s.id !== fromStationId && s.order > selectedTrip.stations.find((st) => st.id === fromStationId)?.order!)
                        .map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fromStationId && toStationId && (
                tripBus?.seats ? (
                  <SeatMap
                    tripId={selectedTrip.id}
                    stations={tripStations}
                    allSeats={tripBus.seats}
                    totalSeats={tripBus.seats.length}
                    externalFromStationId={fromStationId}
                    externalToStationId={toStationId}
                    onSegmentChange={(from, to) => {
                      setFromStationId(from);
                      setToStationId(to);
                      setSelectedSeat(null);
                    }}
                    onSeatSelect={(seat) => setSelectedSeat(seat)}
                    selectedSeatId={selectedSeat?.id}
                  />
                ) : (
                  <div className="space-y-2">
                    <Label>{t('fields.seat')}</Label>
                    {isLoadingSeats ? (
                      <Skeleton className="h-20 w-full" />
                    ) : availableSeats.length === 0 ? (
                      <p className="text-sm text-destructive">{t('noSeats')}</p>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        {availableSeats.map((seat) => (
                          <Button
                            key={seat.id}
                            variant={selectedSeat?.id === seat.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedSeat(seat)}
                          >
                            {seat.number}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fields.firstName')} *</Label>
                  <Input
                    value={passenger.firstName}
                    onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                    placeholder={t('placeholders.firstName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.lastName')} *</Label>
                  <Input
                    value={passenger.lastName}
                    onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                    placeholder={t('placeholders.lastName')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('fields.email')}</Label>
                <Input
                  type="email"
                  value={passenger.email}
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  placeholder={t('placeholders.email')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('fields.phone')}</Label>
                <Input
                  value={passenger.phone}
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  placeholder={t('placeholders.phone')}
                />
                {passenger.phone && !isValidCameroonPhone(passenger.phone) && (
                  <p className="text-xs text-destructive">{t('phoneFormatHint')}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('fields.identityDocumentType')} *</Label>
                  <Select
                    value={passenger.identityDocumentType}
                    onValueChange={(v) => setPassenger({ ...passenger, identityDocumentType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectIdentityDocumentType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNI">{t('documentTypes.CNI')}</SelectItem>
                      <SelectItem value="CNI_RECEIPT">{t('documentTypes.CNI_RECEIPT')}</SelectItem>
                      <SelectItem value="PASSPORT">{t('documentTypes.PASSPORT')}</SelectItem>
                      <SelectItem value="RESIDENCE_PERMIT">{t('documentTypes.RESIDENCE_PERMIT')}</SelectItem>
                      <SelectItem value="STUDENT_CARD">{t('documentTypes.STUDENT_CARD')}</SelectItem>
                      <SelectItem value="SCHOOL_CARD">{t('documentTypes.SCHOOL_CARD')}</SelectItem>
                      <SelectItem value="LOSS_CERTIFICATE">{t('documentTypes.LOSS_CERTIFICATE')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('fields.identityDocumentNumber')} *</Label>
                  <Input
                    value={passenger.identityDocumentNumber}
                    onChange={(e) => setPassenger({ ...passenger, identityDocumentNumber: e.target.value })}
                    placeholder={t('placeholders.identityDocumentNumber')}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-3">{t('summary.title')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summary.trip')}:</span>
                    <span>{selectedTrip?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summary.route')}:</span>
                    <span>
                      {selectedTrip?.stations.find((s) => s.id === fromStationId)?.name} to{' '}
                      {selectedTrip?.stations.find((s) => s.id === toStationId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summary.seat')}:</span>
                    <span>{selectedSeat ? `#${selectedSeat.number}` : t('summary.auto')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('summary.passenger')}:</span>
                    <span>{passenger.firstName} {passenger.lastName}</span>
                  </div>
                  {passenger.identityDocumentType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('fields.identityDocumentType')}:</span>
                      <span>{t(`documentTypes.${passenger.identityDocumentType}`)}</span>
                    </div>
                  )}
                  {passenger.identityDocumentNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('fields.identityDocumentNumber')}:</span>
                      <span>{passenger.identityDocumentNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('fields.paymentType')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={isPaid ? 'default' : 'outline'}
                    className="flex gap-2"
                    onClick={() => setIsPaid(true)}
                  >
                    <CreditCard className="size-4" />
                    {t('payment.paid')}
                  </Button>
                  <Button
                    variant={!isPaid ? 'default' : 'outline'}
                    className="flex gap-2"
                    onClick={() => setIsPaid(false)}
                  >
                    <Wallet className="size-4" />
                    {t('payment.reserved')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
              <ArrowLeft className="mr-2 size-4" />
              {t('back')}
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                {t('next')}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setShowConfirmDialog(true);
                }} 
                disabled={createTicket.isPending}
              >
                {createTicket.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    {isPaid ? t('confirmPayment') : t('confirmReservation')}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPaid ? t('payment.confirmCash') : t('payment.confirmMobileMoney')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPaid
                ? t('payment.cashMessage', { amount: formatCurrency(calculateTotal()) })
                : t('payment.mobileMoneyMessage', { amount: formatCurrency(calculateTotal()) })
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>
              {t('common.no')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleSubmit();
              }}
              disabled={createTicket.isPending}
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('common.yes')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};