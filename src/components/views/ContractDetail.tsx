import React, { useState } from 'react';
import { Contract, Property, Tenant, ContractStatus, ContractDocument } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AddDocumentModal } from '@/components/shared/AddDocumentModal';
import { ArrowLeftIcon, CalendarDaysIcon, CurrencyDollarIcon, BuildingOfficeIcon, UserIcon, DocumentIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface ContractDetailProps {
  contract: Contract;
  property: Property | undefined;
  tenant: Tenant | undefined;
  onBack: () => void;
  addDocument: (contractId: string, document: ContractDocument) => void;
  onSelectProperty: (propertyId: string) => void;
}

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
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode }> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 h-6 text-gray-500">{icon}</div>
    <div className="ml-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export const ContractDetail: React.FC<ContractDetailProps> = ({ contract, property, tenant, onBack, addDocument, onSelectProperty }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddDocument = (document: ContractDocument) => {
    addDocument(contract.id, document);
  };
  
  if (!contract) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={onBack} icon={<ArrowLeftIcon className="w-5 h-5"/>}>
            Volver a Contratos
          </Button>
        </div>

        <header className="pb-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
              <Badge text={contract.estado_contrato} color={getStatusBadgeColor(contract.estado_contrato)} className="text-sm px-4 py-1" />
          </div>
          <p className="mt-2 text-md text-gray-600">
            Detalles del acuerdo de alquiler para {property?.title}.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Términos del Contrato</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <DetailItem icon={<CalendarDaysIcon />} label="Fecha de Inicio" value={formatDate(contract.fecha_inicio)} />
                <DetailItem icon={<CalendarDaysIcon />} label="Fecha de Fin" value={formatDate(contract.fecha_fin)} />
                <DetailItem icon={<CurrencyDollarIcon />} label="Monto Mensual" value={formatCurrency(contract.monto_mensual)} />
                <DetailItem icon={<CalendarDaysIcon />} label="Día de Pago" value={`Día ${contract.dia_pago} de cada mes`} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Documentos del Contrato</h3>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Añadir Documento</Button>
              </div>
              <ul className="divide-y divide-gray-200">
                {(contract.documentos && contract.documentos.length > 0) ? (
                    contract.documentos.map((doc, index) => (
                      <li key={index} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentIcon className="w-6 h-6 text-gray-500" />
                          <span className="ml-3 text-sm font-medium text-gray-800">{doc.nombre}</span>
                        </div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-medium">
                          Ver/Descargar
                        </a>
                      </li>
                    ))
                ) : (
                  <li className="py-8 text-center text-gray-500">
                    <PaperClipIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    No hay documentos adjuntos a este contrato.
                  </li>
                )}
              </ul>
            </Card>
          </div>
          
          {/* Side column */}
          <div className="space-y-6">
            {property && (
              <Card>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-0">Propiedad</h3>
                    <div className="flex items-center">
                      <img src={property.imageUrl} alt={property.title} className="w-16 h-16 object-cover rounded-md" />
                      <div className="ml-4">
                          <p className="font-bold text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-500">{property.ciudad}</p>
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full" onClick={() => onSelectProperty(property.id)}>Ver Propiedad</Button>
                </div>
              </Card>
            )}
            {tenant && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Inquilino</h3>
                 <div className="space-y-4">
                  <div className="flex items-center">
                    <img src={tenant.fotoUrl} alt={tenant.nombre_completo} className="w-16 h-16 object-cover rounded-full" />
                    <div className="ml-4">
                        <p className="font-bold text-gray-900">{tenant.nombre_completo}</p>
                        <p className="text-sm text-gray-500">{tenant.email}</p>
                        <p className="text-sm text-gray-500">{tenant.telefono}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <AddDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddDocument={handleAddDocument} />
    </>
  );
};
