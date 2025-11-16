import React, { useState, useMemo } from 'react';
import { Payment, Contract, Tenant, Property, PaymentStatus, PaymentMethod } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface PaymentsProps {
  payments: Payment[];
  contracts: Contract[];
  tenants: Tenant[];
  properties: Property[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (payment: Payment) => void;
  onSelectContract: (contractId: string) => void;
}

const getStatusBadgeColor = (
  status: PaymentStatus
): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  switch (status) {
    case PaymentStatus.Pagado:
      return 'green';
    case PaymentStatus.Pendiente:
      return 'yellow';
    case PaymentStatus.Atrasado:
      return 'red';
    case PaymentStatus.Parcial:
      return 'blue';
    default:
      return 'gray';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  // Add timezone handling to prevent off-by-one day errors
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatMonth = (dateString: string) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
};

const toInputMonthFormat = (dateString: string) => {
  if (!dateString) return '';
  return dateString.substring(0, 7); // "YYYY-MM"
};

export const Payments: React.FC<PaymentsProps> = ({
  payments,
  contracts,
  tenants,
  properties,
  addPayment,
  updatePayment,
  onSelectContract,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');

  const getRelatedData = (payment: Payment) => {
    const contract = contracts.find((c) => c.id === payment.contractId);
    if (!contract) return { tenant: null, property: null, contract: null };
    const tenant = tenants.find((t) => t.id === contract.tenantId);
    const property = properties.find((p) => p.id === contract.propertyId);
    return { contract, tenant, property };
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const { tenant, property } = getRelatedData(payment);

      const matchesSearch =
        searchTerm === '' ||
        tenant?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property?.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payment.estado_pago === statusFilter;

      const matchesMonth =
        monthFilter === '' || payment.mes_correspondiente.startsWith(monthFilter);

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [payments, contracts, tenants, properties, searchTerm, statusFilter, monthFilter]);

  const handleOpenAddForm = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  const handleOpenEditForm = (payment: Payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const paymentData = {
      contractId: formData.get('contractId') as string,
      mes_correspondiente: `${formData.get('mes_correspondiente')}-01`,
      monto_pago: Number(formData.get('monto_pago')),
      fecha_pago: formData.get('fecha_pago') as string,
      metodo_pago: formData.get('metodo_pago') as PaymentMethod,
      estado_pago: formData.get('estado_pago') as PaymentStatus,
      referencia: formData.get('referencia') as string,
    };

    if (editingPayment) {
      updatePayment({ ...editingPayment, ...paymentData });
    } else {
      addPayment(paymentData);
    }
    handleCloseForm();
  };

  if (showForm) {
    const activeContracts = contracts.filter(
      (c) => c.estado_contrato === 'activo' || c.id === editingPayment?.contractId
    );
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingPayment ? 'Editar' : 'Registrar'} Pago
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contractId" className="block text-sm font-medium text-gray-700">
              Contrato
            </label>
            <select
              name="contractId"
              id="contractId"
              defaultValue={editingPayment?.contractId}
              required
              disabled={!!editingPayment}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm disabled:bg-gray-100"
            >
              <option value="">Seleccione un contrato</option>
              {activeContracts.map((c) => {
                const tenant = tenants.find((t) => t.id === c.tenantId);
                const property = properties.find((p) => p.id === c.propertyId);
                return (
                  <option key={c.id} value={c.id}>
                    {property?.title} - {tenant?.nombre_completo}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label
              htmlFor="mes_correspondiente"
              className="block text-sm font-medium text-gray-700"
            >
              Mes Correspondiente
            </label>
            <input
              type="month"
              name="mes_correspondiente"
              id="mes_correspondiente"
              defaultValue={toInputMonthFormat(editingPayment?.mes_correspondiente || '')}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="monto_pago" className="block text-sm font-medium text-gray-700">
              Monto del Pago (USD)
            </label>
            <input
              type="number"
              name="monto_pago"
              id="monto_pago"
              step="0.01"
              defaultValue={editingPayment?.monto_pago}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="fecha_pago" className="block text-sm font-medium text-gray-700">
              Fecha de Pago
            </label>
            <input
              type="date"
              name="fecha_pago"
              id="fecha_pago"
              defaultValue={editingPayment?.fecha_pago}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700">
              Método de Pago
            </label>
            <select
              name="metodo_pago"
              id="metodo_pago"
              defaultValue={editingPayment?.metodo_pago}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estado_pago" className="block text-sm font-medium text-gray-700">
              Estado del Pago
            </label>
            <select
              name="estado_pago"
              id="estado_pago"
              defaultValue={editingPayment?.estado_pago}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="referencia" className="block text-sm font-medium text-gray-700">
              Nota / Referencia
            </label>
            <input
              type="text"
              name="referencia"
              id="referencia"
              defaultValue={editingPayment?.referencia}
              placeholder="Ej: Nro de confirmación de transferencia"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
            <Button variant="ghost" type="button" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingPayment ? 'Actualizar' : 'Guardar'} Pago
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Registro de Pagos</h1>
        <Button variant="primary" onClick={handleOpenAddForm}>
          + Registrar Pago
        </Button>
      </div>
      <Card>
        <div className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Buscar por inquilino o propiedad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-4">
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="border-gray-300 rounded-md"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-gray-300 rounded-md"
            >
              <option value="all">Todos los estados</option>
              {Object.values(PaymentStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Inquilino / Propiedad
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha de Pago
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const { tenant, property } = getRelatedData(payment);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectContract(payment.contractId)}
                        className="text-left hover:text-primary transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary">
                          {tenant?.nombre_completo || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{property?.title || 'N/A'}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {formatMonth(payment.mes_correspondiente)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {new Intl.NumberFormat('es-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(payment.monto_pago)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.estado_pago === PaymentStatus.Pagado
                        ? formatDate(payment.fecha_pago)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        text={payment.estado_pago}
                        color={getStatusBadgeColor(payment.estado_pago)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditForm(payment)}
                        className="text-primary hover:text-blue-700"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No se encontraron pagos con los filtros actuales.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
