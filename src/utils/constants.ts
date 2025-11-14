/**
 * Application-wide constants
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'PropManager';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'propmanager_auth_token',
  USER_DATA: 'propmanager_user_data',
  THEME: 'propmanager_theme',
  LANGUAGE: 'propmanager_language',
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  PROPERTIES: '/properties',
  TENANTS: '/tenants',
  CONTRACTS: '/contracts',
  PAYMENTS: '/payments',
  TICKETS: '/tickets',
  INCOME: '/income',
  PROFILE: '/profile',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  ISO: 'YYYY-MM-DD',
  LONG: 'DD [de] MMMM [de] YYYY',
} as const;

/**
 * Currency formats
 */
export const CURRENCY_FORMATS = {
  USD: { symbol: '$', locale: 'en-US' },
  MXN: { symbol: '$', locale: 'es-MX' },
  COP: { symbol: '$', locale: 'es-CO' },
  ARS: { symbol: '$', locale: 'es-AR' },
} as const;
