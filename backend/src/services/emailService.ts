import { logger } from '../config/logger';

/**
 * Email Service
 *
 * PRODUCTION NOTE: Para producción, integrar con:
 * - SendGrid: https://sendgrid.com/
 * - AWS SES: https://aws.amazon.com/ses/
 * - Mailgun: https://www.mailgun.com/
 * - Nodemailer con SMTP
 *
 * Configurar en .env:
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=587
 * SMTP_USER=noreply@propmanager.com
 * SMTP_PASSWORD=your-password
 * EMAIL_FROM=noreply@propmanager.com
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email (mock implementation for now)
 * TODO: Implement actual email sending with SendGrid/SES/SMTP
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // En producción, aquí iría la integración real con el servicio de email
    logger.info('Email sent (mock):', {
      to: options.to,
      subject: options.subject,
    });

    // Para desarrollo, loggear el contenido del email
    if (process.env.NODE_ENV !== 'production') {
      console.log('='.repeat(80));
      console.log('📧 EMAIL MOCK - Content:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('-'.repeat(80));
      console.log(options.text || 'No text version');
      console.log('='.repeat(80));
    }

    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> => {
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Recuperación de Contraseña</h1>
        </div>
        <div class="content">
          <p>Hola ${name},</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>PropManager</strong>.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 3px; font-size: 12px;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0;">
              <li>Este enlace expirará en <strong>1 hora</strong>.</li>
              <li>Si no solicitaste este cambio, ignora este email.</li>
              <li>Tu contraseña actual seguirá funcionando hasta que crees una nueva.</li>
            </ul>
          </div>
          <p>Saludos,<br>El equipo de PropManager</p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático, por favor no respondas a este email.</p>
          <p>&copy; ${new Date().getFullYear()} PropManager. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Recuperación de Contraseña - PropManager

Hola ${name},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Visita el siguiente enlace para crear una nueva contraseña:
${resetUrl}

IMPORTANTE:
- Este enlace expirará en 1 hora.
- Si no solicitaste este cambio, ignora este email.
- Tu contraseña actual seguirá funcionando hasta que crees una nueva.

Saludos,
El equipo de PropManager

---
Este es un mensaje automático, por favor no respondas a este email.
`;

  return sendEmail({
    to: email,
    subject: 'Recuperación de Contraseña - PropManager',
    html,
    text,
  });
};

/**
 * Send welcome email (for new users)
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a PropManager!</h1>
        </div>
        <div class="content">
          <p>Hola ${name},</p>
          <p>Tu cuenta como <strong>${role}</strong> ha sido creada exitosamente.</p>
          <p>Ya puedes iniciar sesión y comenzar a usar la plataforma.</p>
          <p>Saludos,<br>El equipo de PropManager</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Bienvenido a PropManager

Hola ${name},

Tu cuenta como ${role} ha sido creada exitosamente.

Ya puedes iniciar sesión y comenzar a usar la plataforma.

Saludos,
El equipo de PropManager
`;

  return sendEmail({
    to: email,
    subject: 'Bienvenido a PropManager',
    html,
    text,
  });
};
