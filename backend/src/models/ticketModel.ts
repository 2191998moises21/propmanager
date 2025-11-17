import { pool } from '../config/database';
import { Ticket } from '../types';

/**
 * Get tickets for a property
 */
export const getTicketsByPropertyId = async (propertyId: string): Promise<Ticket[]> => {
  const result = await pool.query(
    `SELECT t.*,
      (SELECT json_agg(photo_url) FROM ticket_photos WHERE ticket_id = t.id) as fotos
     FROM tickets t
     WHERE t.property_id = $1
     ORDER BY t.created_at DESC`,
    [propertyId]
  );

  return result.rows.map(row => ({
    ...row,
    fotos: row.fotos || []
  }));
};

/**
 * Get tickets for an owner (via their properties)
 */
export const getTicketsByOwnerId = async (ownerId: string): Promise<Ticket[]> => {
  const result = await pool.query(
    `SELECT t.*,
      (SELECT json_agg(photo_url) FROM ticket_photos WHERE ticket_id = t.id) as fotos
     FROM tickets t
     JOIN properties p ON t.property_id = p.id
     WHERE p.owner_id = $1
     ORDER BY t.created_at DESC`,
    [ownerId]
  );

  return result.rows.map(row => ({
    ...row,
    fotos: row.fotos || []
  }));
};

/**
 * Get tickets for a tenant
 */
export const getTicketsByTenantId = async (tenantId: string): Promise<Ticket[]> => {
  const result = await pool.query(
    `SELECT t.*,
      (SELECT json_agg(photo_url) FROM ticket_photos WHERE ticket_id = t.id) as fotos
     FROM tickets t
     WHERE t.tenant_id = $1
     ORDER BY t.created_at DESC`,
    [tenantId]
  );

  return result.rows.map(row => ({
    ...row,
    fotos: row.fotos || []
  }));
};

/**
 * Get ticket by ID
 */
export const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
  const result = await pool.query(
    `SELECT t.*,
      (SELECT json_agg(photo_url) FROM ticket_photos WHERE ticket_id = t.id) as fotos
     FROM tickets t
     WHERE t.id = $1`,
    [ticketId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    ...result.rows[0],
    fotos: result.rows[0].fotos || []
  };
};

/**
 * Create ticket
 */
export const createTicket = async (
  data: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'fotos'> & { fotos?: string[] }
): Promise<Ticket> => {
  // Insert ticket
  const result = await pool.query(
    `INSERT INTO tickets (
      property_id, tenant_id, titulo, descripcion, costo_estimado,
      moneda, urgencia, estado, fecha_creacion, contratista_id, factura_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      data.property_id,
      data.tenant_id,
      data.titulo,
      data.descripcion,
      data.costo_estimado,
      data.moneda,
      data.urgencia,
      data.estado,
      data.fecha_creacion,
      data.contratista_id,
      data.factura_url,
    ]
  );

  const ticket = result.rows[0];

  // Insert photos if provided
  if (data.fotos && data.fotos.length > 0) {
    for (const photoUrl of data.fotos) {
      await pool.query(
        `INSERT INTO ticket_photos (ticket_id, photo_url) VALUES ($1, $2)`,
        [ticket.id, photoUrl]
      );
    }
  }

  return {
    ...ticket,
    fotos: data.fotos || []
  };
};

/**
 * Update ticket
 */
export const updateTicket = async (
  ticketId: string,
  data: Partial<Ticket>
): Promise<Ticket | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCounter = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'fotos') {
      fields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  });

  if (fields.length === 0) {
    return null;
  }

  values.push(ticketId);

  const result = await pool.query(
    `UPDATE tickets SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return null;
  }

  // Get photos
  const photosResult = await pool.query(
    `SELECT photo_url FROM ticket_photos WHERE ticket_id = $1`,
    [ticketId]
  );

  return {
    ...result.rows[0],
    fotos: photosResult.rows.map(r => r.photo_url)
  };
};

/**
 * Add photo to ticket
 */
export const addTicketPhoto = async (ticketId: string, photoUrl: string): Promise<void> => {
  await pool.query(
    `INSERT INTO ticket_photos (ticket_id, photo_url) VALUES ($1, $2)`,
    [ticketId, photoUrl]
  );
};

/**
 * Delete ticket
 */
export const deleteTicket = async (ticketId: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM tickets WHERE id = $1`, [ticketId]);

  return (result.rowCount ?? 0) > 0;
};
