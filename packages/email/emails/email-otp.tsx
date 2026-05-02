import { Heading, Section, Text } from '@react-email/components';
// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import { type Locale, t } from '../i18n';
import { BaseEmail } from './base';
export type EmailOtpProps = {
  username: string;
  otpCode: string;
  expiresInMinutes: number;
  locale?: Locale;
};

export function EmailOtpTemplate({ username, otpCode, expiresInMinutes, locale = 'en' }: EmailOtpProps) {
  return (
    <BaseEmail
      locale={locale}
      preview={t(locale, 'emailOtp.preview', { code: otpCode })}
      title={t(locale, 'emailOtp.heading')}
    >
      <Section className="px-8 py-10">
        <Heading className="m-0 mb-2 text-center text-2xl text-primary">{t(locale, 'emailOtp.heading')}</Heading>
        <Text className="m-0 mb-6 text-center text-muted text-sm">{t(locale, 'emailOtp.almostThere')}</Text>

        <Section className="mb-6 rounded-lg border border-border p-6 text-center">
          <Text className="m-0 mb-2 font-semibold text-muted text-xs uppercase tracking-widest">
            {t(locale, 'emailOtp.codeLabel')}
          </Text>
          <Text className="m-0 font-bold font-mono text-3xl tracking-widest">{otpCode}</Text>
          <Text className="m-0 mt-3 text-muted text-xs">{t(locale, 'emailOtp.enterCode')}</Text>
        </Section>

        <Section className="rounded-lg border border-border p-5">
          <Text className="m-0 mb-3 text-muted text-sm">{t(locale, 'common.hiUser', { user: username })}</Text>
          <Text className="m-0 text-muted text-sm leading-relaxed">{t(locale, 'emailOtp.welcome')}</Text>
          <Text className="m-0 mt-4 text-muted text-xs">
            {t(locale, 'emailOtp.codeExpires', { minutes: expiresInMinutes })}
          </Text>
        </Section>
      </Section>
    </BaseEmail>
  );
}
export default EmailOtpTemplate;
