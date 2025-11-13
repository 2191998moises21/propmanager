import React, { useState } from 'react';
import { Contract, Property, Tenant, ContractStatus, ContractDocument } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AddDocumentModal } from '../shared/AddDocumentModal';
import { ArrowLeftIcon, CalendarDaysIcon, CurrencyDollarIcon, BuildingOfficeIcon, UserIcon, DocumentIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface ContractDetailProps {
  contract: Contract;
  property: Property | undefined;
  tenant: Tenant | undefined;
  onBack: () => void;
  addDocument: (contractId: string, document: ContractDocument) => void;
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

export const ContractDetail: React.FC<ContractDetailProps> = ({ contract, property, tenant, onBack, addDocument }) => {
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Propiedad</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <img src={property.imageUrl} alt={property.title} className="w-16 h-16 object-cover rounded-md" />
                    <div className="ml-4">
                        <p className="font-bold text-gray-900">{property.title}</p>
                        <p className="text-sm text-gray-500">{property.ciudad}</p>
                    </div>
                  </div>
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


// Dummy icons
const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3.75h7.5V21h-7.5zM12 21V12h3m-3 0V3.75M12 12h-3m3 0V3.75" /></svg>);
const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>);
const CurrencyDollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>);
const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>);
