import type { SUPPORTED_LOCALES } from '@repo/shared/constants';
import { z } from 'zod';

export function setZodLocale(locale: SUPPORTED_LOCALES[number]) {
  switch (locale) {
    case 'en': {
      z.config(z.locales.en());
      break;
    }
    case 'ar': {
      z.config(z.locales.ar());
      break;
    }
    default: {
      throw new Error(`Unsupported locale: ${locale}`);
    }
  }
}
