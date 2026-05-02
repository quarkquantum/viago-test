'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Button, buttonVariants } from './button';
import type { VariantProps } from 'class-variance-authority';

interface HoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  holdDuration?: number;
  onHoldComplete?: () => void;
}

export function HoldButton({
  className,
  variant,
  size,
  children,
  holdDuration = 3000,
  onHoldComplete,
  ...props
}: HoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = () => {
    if (isHolding) {
      return;
    }

    setIsHolding(true);
    setProgress(100);

    timeoutRef.current = setTimeout(() => {
      onHoldComplete?.();
      reset();
    }, holdDuration);
  };

  const reset = () => {
    setIsHolding(false);
    setProgress(0);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    <Button
      className={cn('relative touch-none select-none overflow-hidden', className)}
      onMouseDown={startHold}
      onMouseLeave={reset}
      onMouseUp={reset}
      onTouchCancel={reset}
      onTouchEnd={reset}
      onTouchStart={startHold}
      size={size}
      variant={variant}
      {...props}
    >
      <div
        className="absolute inset-y-0 left-0 bg-black/10 transition-[width] ease-linear"
        style={{
          transitionDuration: isHolding ? `${holdDuration}ms` : '150ms',
          width: `${progress}%`,
        }}
      />

      <span className="relative z-10 flex w-full items-center justify-center">
        {children ?? (isHolding ? 'Release to cancel' : 'Hold to confirm')}
      </span>
    </Button>
  );
}
