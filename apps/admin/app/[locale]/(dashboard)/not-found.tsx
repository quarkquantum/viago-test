'use client';

import { Button } from '@repo/design-system/web/src/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@repo/design-system/web/src/components/ui/empty';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations('common.notFound');

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle className="text-6xl text-primary">404</EmptyTitle>
          <EmptyTitle>{t('title')}</EmptyTitle>
          <EmptyDescription>{t('description')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="default">
              <Link href="/">
                <Home className="mr-2 size-4" />
                {t('goHome')}
              </Link>
            </Button>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              {t('goBack')}
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
