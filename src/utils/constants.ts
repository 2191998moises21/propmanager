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

/**
 * UI/UX Constants
 */
export const UI_CONSTANTS = {
  TOAST_DURATION: 3000, // milliseconds
  MODAL_ANIMATION_DURATION: 300, // milliseconds
  DEBOUNCE_DELAY: 300, // milliseconds
  SEARCH_MIN_CHARS: 2,
  MOBILE_BREAKPOINT: 768, // pixels
} as const;

/**
 * Authentication Constants
 */
export const AUTH_CONSTANTS = {
  LOGIN_SIMULATION_DELAY: 500, // milliseconds (for demo mode)
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MIN_PHONE_DIGITS: 10,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s()-]{10,}$/,
} as const;

/**
 * File Upload Constants
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  GENERIC_ERROR: 'Ocurrió un error inesperado. Intenta nuevamente.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Guardado exitosamente',
  UPDATE_SUCCESS: 'Actualizado exitosamente',
  DELETE_SUCCESS: 'Eliminado exitosamente',
  UPLOAD_SUCCESS: 'Archivo subido exitosamente',
  EMAIL_SENT: 'Email enviado exitosamente',
} as const;
