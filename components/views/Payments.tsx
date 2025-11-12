import React from 'react';
import { Payment, Contract, Tenant, Property, PaymentStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface PaymentsProps {
  payments: Payment[];
  contracts: Contract[];
  tenants: Tenant[];
  properties: Property[];
}

// FIX: Added 'gray' to the return type to match the possible return value from the default case.
const getStatusBadgeColor = (status: PaymentStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  switch (status) {
    case PaymentStatus.Pagado: return 'green';
    case PaymentStatus.Pendiente: return 'yellow';
    case PaymentStatus.Atrasado: return 'red';
    case PaymentStatus.Parcial: return 'blue';
    default: return 'gray';
  }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export const Payments: React.FC<PaymentsProps> = ({ payments, contracts, tenants, properties }) => {

  const getRelatedData = (payment: Payment) => {
    const contract = contracts.find(c => c.id === payment.contractId);
    if (!contract) return { tenant: null, property: null };
    const tenant = tenants.find(t => t.id === contract.tenantId);
    const property = properties.find(p => p.id === contract.propertyId);
    return { contract, tenant, property };
  };

  return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Registro de Pagos</h1>
            <Button variant="primary">+ Registrar Pago</Button>
        </div>
        <Card>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquilino / Propiedad</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => {
                       const { contract, tenant, property } = getRelatedData(payment);
                       return (
                        <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{tenant?.nombre_completo || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{property?.title || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{formatMonth(payment.mes_correspondiente)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{new Intl.NumberFormat('es-US', { style: 'currency', currency: contract?.moneda || 'USD', minimumFractionDigits: 0 }).format(payment.monto_pago)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {payment.estado_pago === PaymentStatus.Pagado ? formatDate(payment.fecha_pago) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge text={payment.estado_pago} color={getStatusBadgeColor(payment.estado_pago)} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary hover:text-blue-700">Editar</a>
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