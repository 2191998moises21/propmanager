import { z } from 'zod';

// Helper to validate image URL or data URI
const imageFileSchema = z
  .string()
  .refine(
    (value) => {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      if (value.startsWith('data:image/')) {
        const match = value.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/);
        return !!match;
      }
      return false;
    },
    { message: 'Image must be a valid URL or data URI (jpeg, png, webp, gif)' }
  )
  .refine(
    (value) => {
      if (value.startsWith('data:')) {
        const base64Data = value.split(',')[1];
        if (base64Data) {
          const padding = (base64Data.match(/=/g) || []).length;
          const sizeBytes = (base64Data.length * 3) / 4 - padding;
          return sizeBytes <= 5 * 1024 * 1024; // 5MB
        }
      }
      return true;
    },
    { message: 'Image size must not exceed 5MB' }
  );

// Helper to validate document URL or data URI (images or PDFs)
const documentFileSchema = z
  .string()
  .refine(
    (value) => {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      if (value.startsWith('data:')) {
        const match = value.match(/^data:(image\/(jpeg|jpg|png)|application\/pdf);base64,/);
        return !!match;
      }
      return false;
    },
    { message: 'Document must be a valid URL or data URI (jpeg, png, pdf)' }
  )
  .refine(
    (value) => {
      if (value.startsWith('data:')) {
        const base64Data = value.split(',')[1];
        if (base64Data) {
          const padding = (base64Data.match(/=/g) || []).length;
          const sizeBytes = (base64Data.length * 3) / 4 - padding;
          return sizeBytes <= 10 * 1024 * 1024; // 10MB
        }
      }
      return true;
    },
    { message: 'Document size must not exceed 10MB' }
  );

export const createTenantSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3, 'Full name must be at least 3 characters').max(255),
    documento_id: z.string().min(5, 'Document ID must be at least 5 characters').max(100),
    email: z.string().email('Invalid email address').max(255),
    telefono: z
      .string()
      .min(7, 'Phone number must be at least 7 characters')
      .max(50, 'Phone number must not exceed 50 characters')
      .refine(
        (value) => /^[\d\s\-+()]+$/.test(value),
        { message: 'Phone number can only contain digits, spaces, dashes, parentheses, and plus sign' }
      ),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100)
      .optional(), // Optional - will be generated if not provided
    fotoUrl: imageFileSchema.optional(), // Profile photo
    documentoUrl: documentFileSchema.optional(), // ID document
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    nombre_completo: z.string().min(3, 'Full name must be at least 3 characters').max(255).optional(),
    telefono: z
      .string()
      .regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format')
      .optional(),
    direccion: z.string().min(5).max(500).optional(),
    foto_url: imageFileSchema.optional(),
    documento_id_url: documentFileSchema.optional(),
    referencias_url: documentFileSchema.optional(),
    comprobante_ingresos_url: documentFileSchema.optional(),
  }),
});
