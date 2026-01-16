/**
 * Outrank affiliate configuration
 * Uses environment variables for easy customization
 */

export const OUTRANK_URL =
  process.env.NEXT_PUBLIC_OUTRANK_URL || 'https://outrank.so';

export const OUTRANK_COUPON =
  process.env.NEXT_PUBLIC_OUTRANK_COUPON || '';
