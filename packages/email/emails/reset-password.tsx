import { Button, Heading, Section, Text } from '@react-email/components';
// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import { type Locale, t } from '../i18n';
import { BaseEmail } from './base';

export type ResetPasswordEmailProps = {
  username: string;
  resetLink: string;
  locale?: Locale;
};

export function ResetPasswordEmailTemplate({ username, resetLink, locale = 'en' }: ResetPasswordEmailProps) {
  return (
    <BaseEmail
      locale={locale}
      preview={t(locale, 'resetPassword.preview', { user: username })}
      title={t(locale, 'resetPassword.heading')}
    >
      <Section className="px-8 py-10">
        <Heading className="m-0 mb-4 text-center text-2xl text-primary">{t(locale, 'resetPassword.heading')}</Heading>

        <Section className="rounded-lg border border-border p-6">
          <Text className="m-0 mb-3 text-muted text-sm">{t(locale, 'common.hiUser', { user: username })}</Text>
          <Text className="m-0 mb-6 text-muted text-sm leading-relaxed">{t(locale, 'resetPassword.explanation')}</Text>

          <Section className="text-center">
            <Button
              className="rounded bg-primary px-6 py-3 font-semibold text-primary-foreground text-sm no-underline"
              href={resetLink}
            >
              {t(locale, 'resetPassword.buttonLabel')}
            </Button>
          </Section>

          <Text className="m-0 mt-6 text-muted text-xs leading-relaxed">
            {t(locale, 'resetPassword.linkExplanation')}
          </Text>
          <Text className="m-0 mt-2 break-all text-primary text-xs no-underline">{resetLink}</Text>
        </Section>
      </Section>
    </BaseEmail>
  );
}

export default ResetPasswordEmailTemplate;
