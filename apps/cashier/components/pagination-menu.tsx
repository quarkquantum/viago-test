'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@repo/design-system/web/src/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/web/src/components/ui/select';
import { useTranslations } from 'next-intl';
import type React from 'react';

type PaginationMenuProps = {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export const PaginationMenu: React.FC<PaginationMenuProps> = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const t = useTranslations('common.pagination');
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPages = (p: number, t: number): (number | string)[] => {
    if (t <= 5) {
      return [...new Array(t)].map((_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];

    if (p > 3) {
      pages.push('...');
    }
    if (p > 2) {
      pages.push(p - 1);
    }

    if (p !== 1 && p !== t) {
      pages.push(p);
    }

    if (p < t - 1) {
      pages.push(p + 1);
    }
    if (p < t - 2) {
      pages.push('...');
    }

    pages.push(t);

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
      {/* Left: Info text */}
      <div className="whitespace-nowrap text-muted-foreground text-sm">
        {total > 0 ? t('showing', { start, end, total }) : t('noResults')}
      </div>

      {/* Center: Pagination */}
      <Pagination>
        <PaginationContent>
          <PaginationItem className={page === 1 ? 'pointer-events-none opacity-50' : ''}>
            <PaginationPrevious
              aria-label={t('previous')}
              href="#"
              label={t('previous')}
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) {
                  onPageChange(page - 1);
                }
              }}
            />
          </PaginationItem>

          {getPages(page, totalPages).map((p, i) =>
            p === '...' ? (
              <PaginationItem key={`dots-${i}`}>
                <PaginationEllipsis label={t('morePages')} />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  className={p === page ? 'border bg-stone-50 font-bold' : 'font-light'}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(Number(p));
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem className={page === totalPages ? 'pointer-events-none opacity-50' : ''}>
            <PaginationNext
              aria-label={t('next')}
              href="#"
              label={t('next')}
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) {
                  onPageChange(page + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Right: Limit Select */}
      <div className="flex flex-row items-center justify-between gap-2">
        <span className="whitespace-nowrap pr-2 text-muted-foreground text-sm">{t('rowsPerPage')}</span>

        <Select onValueChange={(val) => onLimitChange(Number(val))} value={String(limit)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {[5, 10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
