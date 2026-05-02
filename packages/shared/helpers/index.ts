/**
 * Calculates the refundable amount for a ticket based on the time remaining before departure.
 *
 * Rules:
 * - > 24h: 100% refund
 * - 24h to 18h: 75% refund
 * - 18h to 12h: 50% refund
 * - 12h to 6h: 25% refund
 * - < 6h: 0% refund
 */
export const calculateRefund = (params: {
  departureTime: Date | string;
  amount: number;
}): {
  refundable: boolean;
  refundableAmount: number;
  percentage: number;
} => {
  const { departureTime, amount } = params;
  const departureDate = typeof departureTime === 'string' ? new Date(departureTime) : departureTime;
  const now = new Date();

  const diffInMilliseconds = departureDate.getTime() - now.getTime();
  const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

  let percentage = 0;

  if (diffInHours > 24) {
    percentage = 100;
  } else if (diffInHours > 18) {
    percentage = 75;
  } else if (diffInHours > 12) {
    percentage = 50;
  } else if (diffInHours > 6) {
    percentage = 25;
  } else {
    percentage = 0;
  }

  const refundableAmount = (amount * percentage) / 100;

  return {
    refundable: percentage > 0,
    refundableAmount,
    percentage,
  };
};
