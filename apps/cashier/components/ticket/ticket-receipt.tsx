'use client';

import dayjs from 'dayjs';
import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/helpers/format-currency';

type TicketReceiptProps = {
  agency: string;
  tripName: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: number;
  ticketKey: string;
  total: number;
  busTitle: string;
  busLicensePlate: string;
  createdAt: string;
  locale?: string;
};

const printTranslations = {
  en: {
    trip: 'Trip',
    departure: 'Departure',
    arrival: 'Arrival',
    passenger: 'Passenger',
    phone: 'Phone',
    seat: 'Seat',
    bus: 'Bus',
    plate: 'Plate',
    total: 'TOTAL',
    ticketRef: 'Ticket Ref.',
    issuedOn: 'Issued on',
    thankYou: 'Thank you for traveling with us!',
    keepTicket: 'Please keep this ticket until the end of your trip.',
  },
  fr: {
    trip: 'Voyage',
    departure: 'Départ',
    arrival: 'Arrivée',
    passenger: 'Passager',
    phone: 'Tél',
    seat: 'Siège',
    bus: 'Bus',
    plate: 'Plaque',
    total: 'TOTAL',
    ticketRef: 'Réf. Billet',
    issuedOn: 'Émis le',
    thankYou: 'Merci de voyager avec nous !',
    keepTicket: 'Veuillez conserver ce billet jusqu\'à la fin de votre voyage.',
  },
};

type Translations = Record<string, string>;

const getTranslations = (loc: string): Translations => {
  return printTranslations[loc as keyof typeof printTranslations] ?? printTranslations.en;
};

export const TicketReceipt = forwardRef<HTMLDivElement, TicketReceiptProps>(
  (
    {
      agency,
      tripName,
      fromStation,
      toStation,
      departureTime,
      arrivalTime,
      passengerName,
      passengerPhone,
      seatNumber,
      ticketKey,
      total,
      busTitle,
      busLicensePlate,
      createdAt,
      locale = 'en',
    },
    ref
  ) => {
    const translations = getTranslations(locale);
    const t = (key: string): string => translations[key] || key;

    const dashed = { borderTop: '1px dashed black', margin: '3mm 0' } as const;
    const labelStyle = { padding: '1mm 0', fontWeight: 'bold' } as const;
    const valueStyle = { padding: '1mm 0', textAlign: 'right' } as const;

    return (
      <div ref={ref} className="ticket-receipt hidden print:block">
        <style>{`
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }

            body * {
              visibility: hidden !important;
            }

            .ticket-receipt,
            .ticket-receipt * {
              visibility: visible !important;
            }

            .ticket-receipt {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 80mm !important;
              display: block !important;
              background: white !important;
              color: black !important;
              font-family: 'Courier New', Courier, monospace !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
              padding: 4mm !important;
            }
          }
        `}</style>

        {/* Header - Agency Name as Receipt Title */}
        <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {agency}
          </div>
        </div>

        <div style={dashed} />

        {/* Route */}
        <div style={{ textAlign: 'center', margin: '2mm 0' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fromStation}</div>
          <div style={{ fontSize: '10px', margin: '1mm 0' }}>▼</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{toStation}</div>
        </div>

        <div style={dashed} />

        {/* Trip & Schedule */}
        <table style={{ width: '100%', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={labelStyle}>{t('trip')}</td>
              <td style={valueStyle}>{tripName}</td>
            </tr>
            <tr>
              <td style={labelStyle}>{t('departure')}</td>
              <td style={valueStyle}>{dayjs(departureTime).format('DD/MM/YYYY HH:mm')}</td>
            </tr>
            <tr>
              <td style={labelStyle}>{t('arrival')}</td>
              <td style={valueStyle}>{dayjs(arrivalTime).format('DD/MM/YYYY HH:mm')}</td>
            </tr>
          </tbody>
        </table>

        <div style={dashed} />

        {/* Passenger info */}
        <table style={{ width: '100%', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={labelStyle}>{t('passenger')}</td>
              <td style={valueStyle}>{passengerName}</td>
            </tr>
            {passengerPhone && passengerPhone !== 'N/A' && (
              <tr>
                <td style={labelStyle}>{t('phone')}</td>
                <td style={valueStyle}>{passengerPhone}</td>
              </tr>
            )}
            <tr>
              <td style={labelStyle}>{t('seat')}</td>
              <td style={{ ...valueStyle, fontSize: '14px', fontWeight: 'bold' }}>#{seatNumber}</td>
            </tr>
          </tbody>
        </table>

        <div style={dashed} />

        {/* Bus & Driver */}
        <table style={{ width: '100%', fontSize: '11px' }}>
          <tbody>
            <tr>
              <td style={labelStyle}>{t('bus')}</td>
              <td style={valueStyle}>{busTitle}</td>
            </tr>
            <tr>
              <td style={labelStyle}>{t('plate')}</td>
              <td style={valueStyle}>{busLicensePlate}</td>
            </tr>
          </tbody>
        </table>

        <div style={dashed} />

        {/* Total & Status */}
        <div style={{ textAlign: 'center', margin: '3mm 0' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>{t('total')}</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{formatCurrency(total)}</div>
        </div>

        <div style={dashed} />

        {/* QR Code */}
        <div style={{ textAlign: 'center', margin: '3mm 0' }}>
          <QRCodeSVG level="M" size={100} value={ticketKey} style={{ margin: '0 auto', display: 'block' }} />
        </div>

        {/* Ticket reference */}
        <div style={{ textAlign: 'center', fontSize: '10px', margin: '2mm 0' }}>
          <div>{t('ticketRef')}</div>
          <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '0.5px', wordBreak: 'break-all' }}>
            {ticketKey}
          </div>
        </div>

        {/* Issued date */}
        <div style={{ textAlign: 'center', fontSize: '9px', margin: '2mm 0', color: '#666' }}>
          {t('issuedOn')} {dayjs(createdAt).format('DD/MM/YYYY HH:mm')}
        </div>

        <div style={dashed} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10px', margin: '2mm 0' }}>
          <div style={{ fontWeight: 'bold' }}>{t('thankYou')}</div>
          <div style={{ marginTop: '1mm', fontSize: '9px' }}>{t('keepTicket')}</div>
        </div>

        <div style={{ marginTop: '4mm', textAlign: 'center', fontSize: '8px', color: '#999' }}>
          ********************************
        </div>
      </div>
    );
  }
);

TicketReceipt.displayName = 'TicketReceipt';