import { Heading, Section, Text } from '@react-email/components';
// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import { type Locale, t } from '../i18n';
import { BaseEmail } from './base';

export type TemporaryCredentialsEmailProps = {
  username: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  locale?: Locale;
};

export function TemporaryCredentialsEmailTemplate({
  username,
  email,
  temporaryPassword,
  loginUrl,
  locale = 'en',
}: TemporaryCredentialsEmailProps) {
  return (
    <BaseEmail
      locale={locale}
      preview={t(locale, 'temporaryCredentials.preview', { user: username })}
      title={t(locale, 'temporaryCredentials.heading')}
    >
      <Section className="px-8 py-10">
        <Heading className="m-0 mb-4 text-center text-2xl text-primary">
          {t(locale, 'temporaryCredentials.heading')}
        </Heading>

        <Section className="rounded-lg border border-border p-6">
          <Text className="m-0 mb-3 text-muted text-sm">{t(locale, 'common.hiUser', { user: username })}</Text>
          <Text className="m-0 mb-4 text-muted text-sm leading-relaxed">
            {t(locale, 'temporaryCredentials.explanation')}
          </Text>

          <Section className="rounded-md bg-muted/40 p-4">
            <Text className="m-0 text-muted text-xs">{t(locale, 'temporaryCredentials.emailLabel')}</Text>
            <Text className="m-0 mb-3 font-semibold text-sm">{email}</Text>
            <Text className="m-0 text-muted text-xs">{t(locale, 'temporaryCredentials.passwordLabel')}</Text>
            <Text className="m-0 font-semibold text-sm">{temporaryPassword}</Text>
          </Section>

          <Text className="m-0 mt-4 text-muted text-sm leading-relaxed">
            {t(locale, 'temporaryCredentials.firstLogin')}
          </Text>
          <Text className="m-0 mt-2 text-primary text-xs no-underline">{loginUrl}</Text>
        </Section>
      </Section>
    </BaseEmail>
  );
}

export default TemporaryCredentialsEmailTemplate;
