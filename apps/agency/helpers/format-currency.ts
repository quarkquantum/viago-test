export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    currency: 'XAF',
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
