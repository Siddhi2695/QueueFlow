/**
 * Formats a sequential integer number into a token string.
 * Example: 1 -> "T001", 24 -> "T024", 100 -> "T100", 1234 -> "T1234"
 */
export const formatTokenNumber = (num: number, prefix = 'T', minDigits = 3): string => {
  const padded = String(num).padStart(minDigits, '0');
  return `${prefix}${padded}`;
};

