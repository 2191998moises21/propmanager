import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Property, Tenant, Contract, ContractStatus } from '@/types';

interface AssignTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  tenants: Tenant[];
  addContract: (contract: Omit<Contract, 'id'>) => void;
}

export const AssignTenantModal: React.FC<AssignTenantModalProps> = ({ isOpen, onClose, property, tenants, addContract }) => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newContract: Omit<Contract, 'id'> = {
      title: `Contrato ${property.title}`,
      propertyId: property.id,
      tenantId: formData.get('tenantId') as string,
      fecha_inicio: formData.get('fecha_inicio') as string,
      fecha_fin: formData.get('fecha_fin') as string,
      monto_mensual: Number(formData.get('monto_mensual')),
      moneda: property.moneda,
      dia_pago: Number(formData.get('dia_pago')),
      estado_contrato: ContractStatus.Activo,
    };
    addContract(newContract);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Asignar Inquilino a ${property.title}`} size="2xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Inquilino</label>
          <select name="tenantId" id="tenantId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
            <option value="">Seleccione un inquilino</option>
            {tenants.map(ten => <option key={ten.id} value={ten.id}>{ten.nombre_completo}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="monto_mensual" className="block text-sm font-medium text-gray-700">Monto Mensual ({property.moneda})</label>
          <input 
            type="number" 
            name="monto_mensual" 
            id="monto_mensual" 
            defaultValue={property.precio_alquiler}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" 
          />
        </div>
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
          <input type="date" name="fecha_inicio" id="fecha_inicio" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
          <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
          <input type="date" name="fecha_fin" id="fecha_fin" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
          <label htmlFor="dia_pago" className="block text-sm font-medium text-gray-700">Día de Pago (1-31)</label>
          <input type="number" name="dia_pago" id="dia_pago" min="1" max="31" defaultValue="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Crear Contrato y Asignar</Button>
        </div>
      </form>
    </Modal>
  );
};
