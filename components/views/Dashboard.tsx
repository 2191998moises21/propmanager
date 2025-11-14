
import React, { useMemo } from 'react';
import { Property, Contract, Payment, OccupancyStatus, PaymentStatus } from '../../types';
import { StatCard } from '../shared/StatCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { BuildingIcon } from '../icons/BuildingIcon';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CurrencyDollarIcon } from '../icons/CurrencyDollarIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
// FIX: 'View' type is exported from LandlordPortal, not App.
import { View } from '../../portals/LandlordPortal';
import { Badge } from '../ui/Badge';

interface DashboardProps {
  properties: Property[];
  contracts: Contract[];
  payments: Payment[];
  setView: (view: View) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ properties, contracts, payments, setView }) => {

  const stats = useMemo(() => {
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(p => p.estado_ocupacion === OccupancyStatus.Ocupada).length;
    
    const monthlyIncome = contracts
      .filter(c => c.estado_contrato === 'activo')
      .reduce((sum, c) => sum + c.monto_mensual, 0);

    const pendingPaymentsCount = payments.filter(p => p.estado_pago === PaymentStatus.Pendiente || p.estado_pago === PaymentStatus.Atrasado).length;

    return { totalProperties, occupiedProperties, monthlyIncome, pendingPaymentsCount };
  }, [properties, contracts, payments]);
  
  const recentProperties = useMemo(() => properties.slice(0, 5), [properties]);
  const pendingPayments = useMemo(() => payments.filter(p => p.estado_pago === PaymentStatus.Pendiente || p.estado_pago === PaymentStatus.Atrasado).slice(0, 5), [payments]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Propiedades" value={stats.totalProperties} icon={<BuildingIcon />} color="blue" onClick={() => setView('properties')} />
        <StatCard title="Propiedades Ocupadas" value={stats.occupiedProperties} icon={<CheckCircleIcon />} color="green" onClick={() => setView('properties')} />
        <StatCard title="Ingreso Mensual Potencial" value={formatCurrency(stats.monthlyIncome)} icon={<CurrencyDollarIcon />} color="yellow" onClick={() => setView('income')} />
        <StatCard title="Pagos Pendientes" value={stats.pendingPaymentsCount} icon={<ExclamationTriangleIcon />} color="red" onClick={() => setView('payments')} />
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h2>
          <div className="flex space-x-3">
            <Button variant="primary" onClick={() => setView('properties')}>+ Agregar Propiedad</Button>
            <Button variant="secondary" onClick={() => setView('tenants')}>+ Agregar Inquilino</Button>
          </div>
        </div>
      </Card>
      
      {/* Recent Properties and Pending Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Propiedades Recientes</h3>
          <div className="space-y-4">
            {recentProperties.map(prop => (
              <div key={prop.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <img src={prop.imageUrl} alt={prop.title} className="w-10 h-10 rounded-md object-cover mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{prop.title}</p>
                    <p className="text-sm text-gray-500">{prop.ciudad}</p>
                  </div>
                </div>
                <Badge text={prop.estado_ocupacion} color={prop.estado_ocupacion === 'disponible' ? 'green' : 'blue'} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Pagos Pendientes Este Mes</h3>
           <div className="space-y-4">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                <div>
                   <p className="font-medium text-gray-900">{formatCurrency(payment.monto_pago)}</p>
                   <p className="text-sm text-gray-500">Vence: {new Date(payment.mes_correspondiente).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                </div>
                 <Badge text={payment.estado_pago} color={payment.estado_pago === 'pendiente' ? 'yellow' : 'red'} />
              </div>
            ))}
            {pendingPayments.length === 0 && <p className="text-center text-gray-500 py-4">¡No hay pagos pendientes!</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
