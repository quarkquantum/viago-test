import type { Button } from '@repo/ui/components/ui/button';
import { buttonVariants } from '@repo/ui/components/ui/button';

import { cn } from '@repo/ui/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import type * as React from 'react';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      data-slot="pagination"
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-row items-center gap-1', className)} data-slot="pagination-content" {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          size,
          variant: isActive ? 'outline' : 'ghost',
        }),
        className
      )}
      data-active={isActive}
      data-slot="pagination-link"
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  label = 'Previous',
  'aria-label': ariaLabel = 'Go to previous page',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label={ariaLabel}
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      size="default"
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{label}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  label = 'Next',
  'aria-label': ariaLabel = 'Go to next page',
  ...props
}: React.ComponentProps<typeof PaginationLink> & { label?: string }) {
  return (
    <PaginationLink
      aria-label={ariaLabel}
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      size="default"
      {...props}
    >
      <span className="hidden sm:block">{label}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  label = 'More pages',
  ...props
}: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      className={cn('flex size-9 items-center justify-center', className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
