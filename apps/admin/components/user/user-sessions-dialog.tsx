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
import { Skeleton } from '@repo/design-system/web/src/components/ui/skeleton';
import dayjs from 'dayjs';
import { Monitor, ShieldX, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { type UserSession, useGetUserSessions } from '@/features/users/api/use-get-user-sessions';
import { useRevokeUserSession } from '@/features/users/api/use-revoke-user-session';

export const UserSessionsDialog = ({ userId }: { userId: string }) => {
  const t = useTranslations('passengers.sessions');
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useGetUserSessions(open ? userId : '');
  const revokeSession = useRevokeUserSession(userId);

  const sessions = data?.sessions ?? [];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Monitor className="mr-2 size-4" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          {isLoading ? (
            <>
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </>
          ) : sessions.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">{t('empty')}</p>
          ) : (
            sessions.map((session: UserSession) => {
              const isMobile = session.userAgent?.toLowerCase().includes('mobile');
              return (
                <div
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                  key={session.id}
                >
                  <div className="flex items-center gap-3">
                    {isMobile ? (
                      <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <Monitor className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{session.userAgent ?? t('unknownDevice')}</p>
                      <p className="text-muted-foreground text-xs">
                        {t('created')} {dayjs(session.createdAt).format('MMM D, YYYY HH:mm')}
                        {session.expiresAt
                          ? ` · ${t('expires')} ${dayjs(session.expiresAt).format('MMM D, YYYY')}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="ml-2 shrink-0 text-destructive hover:text-destructive"
                    disabled={revokeSession.isPending}
                    onClick={() => revokeSession.mutate(session.token)}
                    size="sm"
                    variant="ghost"
                  >
                    <ShieldX className="size-4" />
                    <span className="sr-only">{t('revoke')}</span>
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
