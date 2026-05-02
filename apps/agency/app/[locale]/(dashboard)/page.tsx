import { getTranslations } from 'next-intl/server';
import { Dashboard } from '@/app/[locale]/_components/dashboard';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'common.navigation' });

  return {
    title: t('dashboard'),
    description: t('dashboard'),
  };
}

const page = () => <Dashboard />;

export default page;
