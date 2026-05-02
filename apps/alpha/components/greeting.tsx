'use client';

import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';

export const Greeting = () => {
  const { fullName } = useUser();
  const t = useTranslations('common');

  const greet = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('greetings.morning');
    }
    if (hour < 18) {
      return t('greetings.afternoon');
    }
    return t('greetings.evening');
  };

  return (
    <p className="fade-in animate-in text-2xl duration-200">
      {greet()}, <span className="font-semibold">{fullName}</span>
    </p>
  );
};
