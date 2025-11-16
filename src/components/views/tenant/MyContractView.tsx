import React from 'react';
import { Contract, Property } from '@/types';
import { Card } from '@/components/ui/Card';
import { DocumentIcon, CalendarDaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { TenantView } from '@/portals/TenantPortal';

interface MyContractViewProps {
  contract: Contract;
  property: Property;
  setView: (view: TenantView) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 h-6 text-gray-500">{icon}</div>
    <div className="ml-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export const MyContractView: React.FC<MyContractViewProps> = ({ contract, property, setView }) => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Mi Contrato de Alquiler</h1>
        <p className="mt-1 text-md text-gray-600">
          Detalles del acuerdo para la propiedad:{' '}
          <span className="font-semibold">{property.title}</span>.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Términos del Contrato</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <DetailItem
                icon={<CalendarDaysIcon />}
                label="Fecha de Inicio"
                value={formatDate(contract.fecha_inicio)}
              />
              <DetailItem
                icon={<CalendarDaysIcon />}
                label="Fecha de Fin"
                value={formatDate(contract.fecha_fin)}
              />
              <DetailItem
                icon={<CurrencyDollarIcon />}
                label="Monto Mensual"
                value={formatCurrency(contract.monto_mensual)}
              />
              <DetailItem
                icon={<CalendarDaysIcon />}
                label="Día de Pago"
                value={`Día ${contract.dia_pago} de cada mes`}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Mis Documentos</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {contract.documentos && contract.documentos.length > 0 ? (
                contract.documentos.map((doc, index) => (
                  <li key={index} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentIcon className="w-6 h-6 text-gray-500" />
                      <span className="ml-3 text-sm font-medium text-gray-800">{doc.nombre}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Ver/Descargar
                    </a>
                  </li>
                ))
              ) : (
                <li className="py-8 text-center text-gray-500">No hay documentos adjuntos.</li>
              )}
            </ul>
          </Card>
        </div>
        <div>
          <button
            onClick={() => setView('property')}
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-lg"
          >
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Propiedad</h3>
              <img
                src={property.imageUrl}
                alt={property.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <p className="font-bold text-gray-900">{property.title}</p>
              <p className="text-sm text-gray-500">{property.direccion}</p>
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
};
