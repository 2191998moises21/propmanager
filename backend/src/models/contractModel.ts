import { pool } from '../config/database';
import { Contract, ContractDocument } from '../types';

/**
 * Get all contracts for an owner (via their properties)
 */
export const getContractsByOwnerId = async (ownerId: string): Promise<Contract[]> => {
  const result = await pool.query(
    `SELECT c.* FROM contracts c
     JOIN properties p ON c.property_id = p.id
     WHERE p.owner_id = $1
     ORDER BY c.created_at DESC`,
    [ownerId]
  );

  return result.rows;
};

/**
 * Get contracts for a tenant
 */
export const getContractsByTenantId = async (tenantId: string): Promise<Contract[]> => {
  const result = await pool.query(
    `SELECT * FROM contracts WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );

  return result.rows;
};

/**
 * Get contract by ID
 */
export const getContractById = async (contractId: string): Promise<Contract | null> => {
  const result = await pool.query(`SELECT * FROM contracts WHERE id = $1`, [contractId]);

  return result.rows[0] || null;
};

/**
 * Create new contract
 */
export const createContract = async (
  data: Omit<Contract, 'id' | 'created_at' | 'updated_at'>
): Promise<Contract> => {
  const result = await pool.query(
    `INSERT INTO contracts (
      title, property_id, tenant_id, fecha_inicio, fecha_fin,
      monto_mensual, moneda, dia_pago, estado_contrato
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      data.title,
      data.property_id,
      data.tenant_id,
      data.fecha_inicio,
      data.fecha_fin,
      data.monto_mensual,
      data.moneda,
      data.dia_pago,
      data.estado_contrato,
    ]
  );

  // Update property status to occupied
  await pool.query(`UPDATE properties SET estado_ocupacion = 'ocupada' WHERE id = $1`, [
    data.property_id,
  ]);

  return result.rows[0];
};

/**
 * Update contract
 */
export const updateContract = async (
  contractId: string,
  data: Partial<Contract>
): Promise<Contract | null> => {
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

  values.push(contractId);

  const result = await pool.query(
    `UPDATE contracts SET ${fields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Terminate contract
 */
export const terminateContract = async (contractId: string): Promise<Contract | null> => {
  // Update contract status
  const contractResult = await pool.query(
    `UPDATE contracts SET estado_contrato = 'terminado' WHERE id = $1 RETURNING *`,
    [contractId]
  );

  const contract = contractResult.rows[0];

  if (contract) {
    // Update property to available
    await pool.query(
      `UPDATE properties SET estado_ocupacion = 'disponible', fecha_disponible = CURRENT_DATE WHERE id = $1`,
      [contract.property_id]
    );
  }

  return contract || null;
};

/**
 * Get contract documents
 */
export const getContractDocuments = async (contractId: string): Promise<ContractDocument[]> => {
  const result = await pool.query(
    `SELECT * FROM contract_documents WHERE contract_id = $1 ORDER BY created_at DESC`,
    [contractId]
  );

  return result.rows;
};

/**
 * Add document to contract
 */
export const addContractDocument = async (
  contractId: string,
  document: Omit<ContractDocument, 'id' | 'contract_id' | 'created_at'>
): Promise<ContractDocument> => {
  const result = await pool.query(
    `INSERT INTO contract_documents (contract_id, nombre, url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [contractId, document.nombre, document.url]
  );

  return result.rows[0];
};

/**
 * Delete contract document
 */
export const deleteContractDocument = async (documentId: string): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM contract_documents WHERE id = $1`, [documentId]);

  return (result.rowCount ?? 0) > 0;
};
