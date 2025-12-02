import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

interface FileValidationOptions {
  maxSizeBytes?: number; // Max file size for data URIs
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  maxFilesCount?: number;
}

// Default configuration
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB for data URIs
const DEFAULT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const DEFAULT_ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

/**
 * Extract MIME type from data URI
 */
function getMimeTypeFromDataUri(dataUri: string): string | null {
  const match = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  return match ? match[1] : null;
}

/**
 * Calculate size of base64 data URI in bytes
 */
function getDataUriSize(dataUri: string): number {
  const base64Data = dataUri.split(',')[1];
  if (!base64Data) return 0;

  // Base64 size calculation: (length * 3/4) - padding
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * Validate file extension from URL
 */
function validateFileExtension(url: string, allowedExtensions: string[]): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return allowedExtensions.some((ext) => pathname.endsWith(ext.toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * Validate a single file (URL or data URI)
 */
export function validateFile(
  file: string,
  options: FileValidationOptions = {}
): { valid: boolean; error?: string } {
  const {
    maxSizeBytes = DEFAULT_MAX_SIZE,
    allowedMimeTypes = DEFAULT_ALLOWED_IMAGE_TYPES,
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'],
  } = options;

  // Check if it's a data URI
  if (file.startsWith('data:')) {
    // Validate MIME type
    const mimeType = getMimeTypeFromDataUri(file);
    if (!mimeType) {
      return { valid: false, error: 'Invalid data URI format' };
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      return {
        valid: false,
        error: `File type ${mimeType} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      };
    }

    // Validate size
    const size = getDataUriSize(file);
    if (size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size ${(size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    return { valid: true };
  }

  // Check if it's a URL
  if (file.startsWith('http://') || file.startsWith('https://')) {
    // For URLs, we can only validate the file extension
    if (!validateFileExtension(file, allowedExtensions)) {
      return {
        valid: false,
        error: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
      };
    }

    return { valid: true };
  }

  return { valid: false, error: 'File must be a valid URL or data URI' };
}

/**
 * Middleware factory for validating single file in request body
 */
export function validateSingleFile(fieldName: string, options?: FileValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.body[fieldName];

    if (!file) {
      return next(new AppError(`Field '${fieldName}' is required`, 400));
    }

    if (typeof file !== 'string') {
      return next(new AppError(`Field '${fieldName}' must be a string (URL or data URI)`, 400));
    }

    const result = validateFile(file, options);
    if (!result.valid) {
      return next(new AppError(result.error || 'File validation failed', 400));
    }

    next();
  };
}

/**
 * Middleware factory for validating multiple files in request body
 */
export function validateMultipleFiles(
  fieldName: string,
  options?: FileValidationOptions & { maxFilesCount?: number }
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.body[fieldName];

    if (!files) {
      return next();
    }

    if (!Array.isArray(files)) {
      return next(new AppError(`Field '${fieldName}' must be an array`, 400));
    }

    const maxCount = options?.maxFilesCount || 10;
    if (files.length > maxCount) {
      return next(new AppError(`Maximum ${maxCount} files allowed`, 400));
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (typeof file !== 'string') {
        return next(
          new AppError(`File at index ${i} must be a string (URL or data URI)`, 400)
        );
      }

      const result = validateFile(file, options);
      if (!result.valid) {
        return next(
          new AppError(`File at index ${i}: ${result.error || 'validation failed'}`, 400)
        );
      }
    }

    next();
  };
}

/**
 * Preset configurations for common file types
 */
export const FileValidationPresets = {
  // For profile photos, property images
  image: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: DEFAULT_ALLOWED_IMAGE_TYPES,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },

  // For contract documents, payment proofs
  document: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: DEFAULT_ALLOWED_DOCUMENT_TYPES,
    allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  },

  // For ticket photos (smaller limit, multiple files)
  ticketPhoto: {
    maxSizeBytes: 3 * 1024 * 1024, // 3MB per photo
    allowedMimeTypes: DEFAULT_ALLOWED_IMAGE_TYPES,
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFilesCount: 5,
  },
};

/**
 * Ready-to-use middleware instances
 */
export const fileValidators = {
  // Single image validation (profile photos, property images)
  singleImage: (fieldName: string) =>
    validateSingleFile(fieldName, FileValidationPresets.image),

  // Single document validation (contracts, payment proofs)
  singleDocument: (fieldName: string) =>
    validateSingleFile(fieldName, FileValidationPresets.document),

  // Multiple photos validation (ticket photos)
  multiplePhotos: (fieldName: string) =>
    validateMultipleFiles(fieldName, FileValidationPresets.ticketPhoto),
};
