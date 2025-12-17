/**
 * Format a number as South African Rand (ZAR)
 */
export const formatCurrency = (amount: number): string => {
  return `R ${amount.toFixed(2)}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};
