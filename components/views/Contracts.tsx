import React from 'react';
import { Contract, Property, Tenant, ContractStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ContractsProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
}

// FIX: Added 'gray' to the return type to match the possible return value from the default case.
const getStatusBadgeColor = (status: ContractStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  switch (status) {
    case ContractStatus.Activo: return 'green';
    case ContractStatus.Renovado: return 'blue';
    case ContractStatus.Vencido: return 'yellow';
    case ContractStatus.Terminado: return 'red';
    default: return 'gray';
  }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const Contracts: React.FC<ContractsProps> = ({ contracts, properties, tenants }) => {

  const getRelatedData = (contract: Contract) => {
    const property = properties.find(p => p.id === contract.propertyId);
    const tenant = tenants.find(t => t.id === contract.tenantId);
    return { property, tenant };
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Contratos</h1>
            <Button variant="primary">+ Crear Contrato</Button>
        </div>
        <Card>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquilino</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => {
                       const { property, tenant } = getRelatedData(contract);
                       return (
                        <tr key={contract.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property?.title || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant?.nombre_completo || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(contract.fecha_inicio)} - {formatDate(contract.fecha_fin)}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{new Intl.NumberFormat('es-US', { style: 'currency', currency: contract.moneda, minimumFractionDigits: 0 }).format(contract.monto_mensual)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge text={contract.estado_contrato} color={getStatusBadgeColor(contract.estado_contrato)} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary hover:text-blue-700">Ver Detalles</a>
                            </td>
                        </tr>
                       )
                    })}
                </tbody>
            </table>
           </div>
        </Card>
    </div>
  );
};