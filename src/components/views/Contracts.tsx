import React, { useState, useMemo } from 'react';
import { Contract, Property, Tenant, ContractStatus, OccupancyStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ContractsProps {
  contracts: Contract[];
  properties: Property[];
  tenants: Tenant[];
  addContract: (contract: Omit<Contract, 'id'>) => void;
  onSelectContract: (id: string) => void;
}

const getStatusBadgeColor = (
  status: ContractStatus
): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  switch (status) {
    case ContractStatus.Activo:
      return 'green';
    case ContractStatus.Renovado:
      return 'blue';
    case ContractStatus.Vencido:
      return 'yellow';
    case ContractStatus.Terminado:
      return 'red';
    default:
      return 'gray';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const Contracts: React.FC<ContractsProps> = ({
  contracts,
  properties,
  tenants,
  addContract,
  onSelectContract,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const availableProperties = useMemo(() => {
    return properties.filter((p) => p.estado_ocupacion === OccupancyStatus.Disponible);
  }, [properties]);

  const handleAddContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const propertyId = formData.get('propertyId') as string;
    const selectedProperty = properties.find((p) => p.id === propertyId);

    if (!selectedProperty) return;

    const newContract = {
      title: `Contrato ${selectedProperty.title}`,
      propertyId: propertyId,
      tenantId: formData.get('tenantId') as string,
      fecha_inicio: formData.get('fecha_inicio') as string,
      fecha_fin: formData.get('fecha_fin') as string,
      monto_mensual: Number(formData.get('monto_mensual')),
      moneda: selectedProperty.moneda,
      dia_pago: Number(formData.get('dia_pago')),
      estado_contrato: ContractStatus.Activo,
    };
    addContract(newContract);
    setShowAddForm(false);
  };

  const getRelatedData = (contract: Contract) => {
    const property = properties.find((p) => p.id === contract.propertyId);
    const tenant = tenants.find((t) => t.id === contract.tenantId);
    return { property, tenant };
  };

  if (showAddForm) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Contrato</h2>
        <form onSubmit={handleAddContract} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700">
              Propiedad
            </label>
            <select
              name="propertyId"
              id="propertyId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Seleccione una propiedad disponible</option>
              {availableProperties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.title}
                </option>
              ))}
            </select>
            {availableProperties.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No hay propiedades disponibles.</p>
            )}
          </div>
          <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">
              Inquilino
            </label>
            <select
              name="tenantId"
              id="tenantId"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Seleccione un inquilino</option>
              {tenants.map((ten) => (
                <option key={ten.id} value={ten.id}>
                  {ten.nombre_completo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700">
              Fecha de Inicio
            </label>
            <input
              type="date"
              name="fecha_inicio"
              id="fecha_inicio"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700">
              Fecha de Fin
            </label>
            <input
              type="date"
              name="fecha_fin"
              id="fecha_fin"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="monto_mensual" className="block text-sm font-medium text-gray-700">
              Monto Mensual
            </label>
            <input
              type="number"
              name="monto_mensual"
              id="monto_mensual"
              placeholder="Monto en USD"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="dia_pago" className="block text-sm font-medium text-gray-700">
              Día de Pago (1-31)
            </label>
            <input
              type="number"
              name="dia_pago"
              id="dia_pago"
              min="1"
              max="31"
              defaultValue="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={availableProperties.length === 0}>
              Guardar Contrato
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          + Crear Contrato
        </Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Propiedad
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Inquilino
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Periodo
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
                  Estado
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contracts.map((contract) => {
                const { property, tenant } = getRelatedData(contract);
                return (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {property?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant?.nombre_completo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(contract.fecha_inicio)} - {formatDate(contract.fecha_fin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {new Intl.NumberFormat('es-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(contract.monto_mensual)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        text={contract.estado_contrato}
                        color={getStatusBadgeColor(contract.estado_contrato)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onSelectContract(contract.id)}
                        className="text-primary hover:text-blue-700"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
