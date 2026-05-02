'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/web/src/components/ui/dropdown-menu';
import { TicketStatus } from '@repo/shared';
import { Printer, MoreHorizontal, CreditCard, Undo2, Ban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCancelTicket } from '@/features/tickets/api/use-cancel-ticket';
import { usePayTicket } from '@/features/tickets/api/use-pay-ticket';
import { useRefundTicket } from '@/features/tickets/api/use-refund-ticket';

type TicketActionsProps = {
  ticketId: string;
  status: TicketStatus;
  ticketKey?: string;
};

export const TicketActions = ({ ticketId, status, ticketKey }: TicketActionsProps) => {
  const t = useTranslations('tickets');
  const router = useRouter();

  const cancelTicket = useCancelTicket({
    onSuccess: () => {
      toast.success(t('actions.cancelled'));
    },
  });

  const payTicket = usePayTicket({
    onSuccess: () => {
      toast.success(t('actions.paid'));
    },
  });

  const refundTicket = useRefundTicket({
    onSuccess: () => {
      toast.success(t('actions.refunded'));
    },
  });

  const handlePay = () => {
    payTicket.mutate(ticketId);
  };

  const handleCancel = () => {
    cancelTicket.mutate(ticketId);
  };

  const handleRefund = () => {
    refundTicket.mutate(ticketId);
  };

  const handleReprint = () => {
    router.push(`/tickets/${ticketId}`);
  };

  const isLoading = cancelTicket.isPending || payTicket.isPending || refundTicket.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="size-8 p-0">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleReprint}>
          <Printer className="mr-2 size-4" />
          {t('actions.reprint')}
        </DropdownMenuItem>

        {status === TicketStatus.RESERVED && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlePay} disabled={isLoading}>
              <CreditCard className="mr-2 size-4" />
              {t('actions.pay')}
            </DropdownMenuItem>
          </>
        )}

        {status === TicketStatus.ISSUED && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRefund} disabled={isLoading}>
              <Undo2 className="mr-2 size-4" />
              {t('actions.refund')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCancel} disabled={isLoading} className="text-destructive">
              <Ban className="mr-2 size-4" />
              {t('actions.cancel')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
