'use client';

import { useTranslations } from 'next-intl';
import { useAgency } from '@/hooks/useAgency';

export const Greeting = () => {
  const t = useTranslations('common');
  const { user } = useAgency();
  const greet = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('greeting.morning');
    }
    if (hour < 18) {
      return t('greeting.afternoon');
    }
    return t('greeting.evening');
  };
  return (
    <p className="fade-in animate-in text-2xl duration-200">
      {greet()}, <span className="font-semibold">{user?.name}</span>
    </p>
  );
};
