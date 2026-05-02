'use client';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';

export const Greeting = () => {
  const t = useTranslations('common.greetings');
  const user = useUser();
  const greet = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('morning');
    }
    if (hour < 18) {
      return t('afternoon');
    }
    return t('evening');
  };
  return (
    <p className="fade-in animate-in text-2xl duration-200">
      {greet()}, <span className="font-semibold">{user?.fullName}</span>
    </p>
  );
};
