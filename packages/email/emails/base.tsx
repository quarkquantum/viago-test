import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
// biome-ignore lint/style/useImportType: <explanation>
import React from 'react';
import type { Locale } from '../i18n';
import { direction, t } from '../i18n';

export type BaseEmailProps = {
  children: React.ReactNode;
  preview?: string;
  title?: string;
  locale?: Locale;
};

export function BaseEmail({ children, preview, title = 'VIAGO', locale = 'en' }: BaseEmailProps) {
  const dir = direction(locale);
  return (
    <Html dir={dir} lang={locale}>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                accent: '#4caf50',
                background: '#ffffff',
                border: '#e5e5e5',
                muted: '#737373',
                'muted-alt': '#212121',
                primary: '#168039',
                text: '#0a0a0a',
              },
              fontFamily: {
                sans: ['Inter', 'Arial', 'sans-serif'],
              },
            },
          },
        }}
      >
        <Head>
          <title>{title}</title>
          <Font
            fallbackFontFamily="Arial"
            fontFamily="Inter"
            fontStyle="normal"
            fontWeight={400}
            webFont={{
              format: 'woff2',
              url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            }}
          />
        </Head>
        {preview && <Preview>{preview}</Preview>}

        <Body className="m-0 bg-background font-sans text-text" style={{ direction: dir }}>
          <Container className="mx-auto max-w-2xl">
            {/* Header */}
            <Section className="rounded-t-xl border-2 border-border border-b-0 px-8 pt-8 pb-6 text-center">
              <Row>
                <Column className="text-center">
                  <Img
                    alt="Viago Logo"
                    className="mx-auto mb-3 rounded-full border-2 border-border"
                    height="56"
                    src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=56&h=56&fit=crop&crop=center&auto=format&fm=png&q=80"
                    width="56"
                  />
                  <Text className="mb-1 font-bold text-2xl text-primary tracking-wide">Viago</Text>
                  <Text className="font-medium text-muted text-xs">{t(locale, 'common.brandTagline')}</Text>
                </Column>
              </Row>
            </Section>

            {/* Content */}
            <Section className="overflow-hidden rounded-b-xl border-2 border-border border-t-0 bg-background text-text">
              {children}

              {/* Footer */}
              <Section className="px-10 pt-8 pb-4">
                <Hr className="my-2 mb-4 border-border" />
                <Text className="m-0 mb-1 text-center text-muted text-xs leading-relaxed">
                  {t(locale, 'common.copyright', {
                    year: new Date().getFullYear(),
                  })}
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
