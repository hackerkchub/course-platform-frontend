import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely with clsx and twMerge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format numerical amounts as Indian Currency (e.g. ₹14,999)
 */
export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format video or lesson duration in seconds to "HH:MM:SS" or "MM mins"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`.trim();
  }
  if (mins > 0) {
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`.trim();
  }
  return `${secs}s`;
}

/**
 * Format timestamp into standard Indian Standard Time (Asia/Kolkata) string
 */
export function formatDateKolkata(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/**
 * Safe error message extractor from unknown API errors
 */
export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const err = error as AxiosErrorLike;
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.message) {
      return err.message;
    }
  }
  return fallbackMessage;
}

/**
 * Convert string to URL-friendly slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
