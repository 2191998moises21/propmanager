import React, { useMemo } from 'react';
import { Contract, Property, Tenant, ContractStatus, Payment, PaymentStatus } from '../../types';
// FIX: 'View' type is exported from LandlordPortal, not App.
import { View } from '../../portals/LandlordPortal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface IncomeProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
  setView: (view: View) => void;
  onSelectContract: (contractId: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

export const Income: React.FC<IncomeProps> = ({ contracts, properties, tenants, payments, setView, onSelectContract }) => {

  const activeContracts = useMemo(() => {
    return contracts.filter(c => c.estado_contrato === ContractStatus.Activo);
  }, [contracts]);

  const totalMonthlyIncome = useMemo(() => {
    return activeContracts.reduce((sum, contract) => sum + contract.monto_mensual, 0);
  }, [activeContracts]);

  const historicalStats = useMemo(() => {
    const completedPayments = payments.filter(p => p.estado_pago === PaymentStatus.Pagado);
    const totalReceived = completedPayments.reduce((sum, p) => sum + p.monto_pago, 0);
    const totalPaymentsCount = completedPayments.length;
    return { totalReceived, totalPaymentsCount };
  }, [payments]);

  const incomeTrendData = useMemo(() => {
    const months = [];
    const data: { [key: string]: number } = {};
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        // Use `toLocaleDateString` for a more reliable, localized month name
        const monthLabel = date.toLocaleDateString('es-ES', { month: 'short' });
        months.push({ key: monthKey, label: monthLabel });
        data[monthKey] = 0;
    }

    payments.forEach(payment => {
        if (payment.estado_pago === PaymentStatus.Pagado && payment.fecha_pago) {
            const paymentDate = new Date(payment.fecha_pago);
            const paymentMonthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
            if (data[paymentMonthKey] !== undefined) {
                data[paymentMonthKey] += payment.monto_pago;
            }
        }
    });
    
    const chartData = months.map(m => ({
        label: m.label,
        value: data[m.key]
    }));
    
    const maxValue = Math.max(...chartData.map(d => d.value), 1); // Avoid division by zero

    return {
        labels: chartData.map(d => d.label),
        values: chartData.map(d => d.value),
        maxValue
    };
  }, [payments]);


  const getRelatedData = (contract: Contract) => {
    const property = properties.find(p => p.id === contract.propertyId);
    const tenant = tenants.find(t => t.id === contract.tenantId);
    return { property, tenant };
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => setView('dashboard')} icon={<ArrowLeftIcon className="w-5 h-5"/>}>
          Volver al Dashboard
        </Button>
      </div>

      <header>
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Ingresos</h1>
        <p className="mt-1 text-md text-gray-600">
          Un resumen del rendimiento financiero, ingresos potenciales y tendencias históricas.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Stats */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ingreso Potencial</h2>
            <div className="flex divide-x divide-gray-200">
                <div className="px-6 py-4 flex-1 text-center">
                    <p className="text-sm font-medium text-gray-500">Ingreso Mensual Esperado</p>
                    <p className="text-3xl font-semibold text-green-600">{formatCurrency(totalMonthlyIncome)}</p>
                </div>
                <div className="px-6 py-4 flex-1 text-center">
                    <p className="text-sm font-medium text-gray-500">Contratos Activos</p>
                    <p className="text-3xl font-semibold text-blue-600">{activeContracts.length}</p>
                </div>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ingresos Históricos</h2>
            <div className="flex divide-x divide-gray-200">
                <div className="px-6 py-4 flex-1 text-center">
                    <p className="text-sm font-medium text-gray-500">Ingreso Total Recibido</p>
                    <p className="text-3xl font-semibold text-green-600">{formatCurrency(historicalStats.totalReceived)}</p>
                </div>
                <div className="px-6 py-4 flex-1 text-center">
                    <p className="text-sm font-medium text-gray-500">Pagos Completados</p>
                    <p className="text-3xl font-semibold text-blue-600">{historicalStats.totalPaymentsCount}</p>
                </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Chart */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tendencia de Ingresos (Últimos 12 Meses)</h2>
          <div className="h-64 flex items-end justify-around space-x-2 pt-4 border-t border-gray-200">
            {incomeTrendData.values.map((value, index) => (
                <div key={index} className="flex-1 h-full flex flex-col items-center justify-end group">
                    <div 
                        className="w-4/5 bg-blue-200 hover:bg-primary rounded-t-md transition-all duration-300 relative"
                        style={{ height: `${(value / incomeTrendData.maxValue) * 100}%` }}
                    >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap">
                            {formatCurrency(value)}
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 capitalize">{incomeTrendData.labels[index]}</span>
                </div>
            ))}
          </div>
        </Card>
      </div>


      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Desglose por Contrato Activo</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propiedad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquilino</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Mensual</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día de Pago</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeContracts.map(contract => {
                const { property, tenant } = getRelatedData(contract);
                return (
                  <tr key={contract.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectContract(contract.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{property?.title || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant?.nombre_completo || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{formatCurrency(contract.monto_mensual)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Día {contract.dia_pago} de cada mes</td>
                  </tr>
                );
              })}
              {activeContracts.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No hay contratos activos para generar ingresos.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
