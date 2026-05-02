export const formatCurrency = (amount: number, locale: string = 'en-US') =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-CM' : locale, {
    currency: 'XAF',
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
