import { pool } from '../config/database';
import { Payment } from '../types';

/**
 * Get payments for a contract
 */
export const getPaymentsByContractId = async (contractId: string): Promise<Payment[]> => {
  const result = await pool.query(
    `SELECT * FROM payments WHERE contract_id = $1 ORDER BY mes_correspondiente DESC`,
    [contractId]
  );

  return result.rows;
};

/**
 * Get all payments for an owner (via their properties)
 */
export const getPaymentsByOwnerId = async (ownerId: string): Promise<Payment[]> => {
  const result = await pool.query(
    `SELECT p.* FROM payments p
     JOIN contracts c ON p.contract_id = c.id
     JOIN properties pr ON c.property_id = pr.id
     WHERE pr.owner_id = $1
     ORDER BY p.mes_correspondiente DESC`,
    [ownerId]
  );

  return result.rows;
};

/**
 * Get payments for a tenant
 */
export const getPaymentsByTenantId = async (tenantId: string): Promise<Payment[]> => {
  const result = await pool.query(
    `SELECT p.* FROM payments p
     JOIN contracts c ON p.contract_id = c.id
     WHERE c.tenant_id = $1
     ORDER BY p.mes_correspondiente DESC`,
    [tenantId]
  );

  return result.rows;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  const result = await pool.query(`SELECT * FROM payments WHERE id = $1`, [paymentId]);

  return result.rows[0] || null;
};

/**
 * Create payment
 */
export const createPayment = async (
  data: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
): Promise<Payment> => {
  const result = await pool.query(
    `INSERT INTO payments (
      contract_id, mes_correspondiente, monto_pago, fecha_pago,
      metodo_pago, estado_pago, referencia, comprobante_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      data.contract_id,
      data.mes_correspondiente,
      data.monto_pago,
      data.fecha_pago,
      data.metodo_pago,
      data.estado_pago,
      data.referencia,
      data.comprobante_url,
    ]
  );

  return result.rows[0];
};

/**
 * Update payment
 */
export const updatePayment = async (
  paymentId: string,
  data: Partial<Payment>
): Promise<Payment | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCounter = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  });

  if (fields.length === 0) {
    return null;
  }

  values.push(paymentId);

  const result = await pool.query(
    `UPDATE payments SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Upload payment proof
 */
export const uploadPaymentProof = async (
  paymentId: string,
  proofUrl: string
): Promise<Payment | null> => {
  const result = await pool.query(
    `UPDATE payments
     SET comprobante_url = $1,
         estado_pago = 'en revisión',
         fecha_pago = CURRENT_DATE
     WHERE id = $2
     RETURNING *`,
    [proofUrl, paymentId]
  );

  return result.rows[0] || null;
};

/**
 * Get pending payments
 */
export const getPendingPayments = async (ownerId?: string): Promise<Payment[]> => {
  let query = `
    SELECT p.* FROM payments p
    JOIN contracts c ON p.contract_id = c.id
    JOIN properties pr ON c.property_id = pr.id
    WHERE p.estado_pago IN ('pendiente', 'atrasado')
  `;

  const values: unknown[] = [];

  if (ownerId) {
    query += ` AND pr.owner_id = $1`;
    values.push(ownerId);
  }

  query += ` ORDER BY p.mes_correspondiente ASC`;

  const result = await pool.query(query, values);

  return result.rows;
};
