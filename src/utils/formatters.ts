import { Currency } from '@/types';

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: Currency = Currency.USD): string {
  const locale = 'es-419'; // Latin American Spanish

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @param format - 'short' | 'long' | 'medium'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'long' | 'medium' = 'short'
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
  }[format];

  return new Intl.DateTimeFormat('es-419', options).format(date);
}

/**
 * Formats a phone number
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length
  if (cleaned.length === 10) {
    // Format: (XXX) XXX-XXXX
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone; // Return original if doesn't match expected format
}

/**
 * Truncates text to a maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a number with thousand separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-419').format(num);
}

/**
 * Gets relative time string (e.g., "hace 2 días")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
  return `Hace ${Math.floor(diffInDays / 365)} años`;
}
