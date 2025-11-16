import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Property,
  Tenant,
  Contractor,
  TicketStatus,
  TicketUrgency,
  Currency,
} from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PhoneIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface TicketsProps {
  tickets: Ticket[];
  properties: Property[];
  tenants: Tenant[];
  contractors: Contractor[];
  updateTicket: (ticket: Ticket) => void;
  onSelectProperty: (propertyId: string) => void;
}

const getStatusBadgeColor = (
  status: TicketStatus
): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  switch (status) {
    case TicketStatus.Abierto:
      return 'yellow';
    case TicketStatus.EnProgreso:
      return 'blue';
    case TicketStatus.Cerrado:
      return 'green';
    default:
      return 'gray';
  }
};

const getUrgencyBadgeColor = (urgency: TicketUrgency): 'red' | 'yellow' | 'blue' => {
  switch (urgency) {
    case TicketUrgency.Alta:
      return 'red';
    case TicketUrgency.Media:
      return 'yellow';
    case TicketUrgency.Baja:
      return 'blue';
    default:
      return 'blue';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: Currency.USD,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const Tickets: React.FC<TicketsProps> = ({
  tickets,
  properties,
  tenants,
  contractors,
  updateTicket,
  onSelectProperty,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const getRelatedData = (ticket: Ticket) => {
    const property = properties.find((p) => p.id === ticket.propertyId);
    const tenant = tenants.find((t) => t.id === ticket.tenantId);
    const contractor = ticket.contratistaId
      ? contractors.find((c) => c.id === ticket.contratistaId)
      : null;
    return { property, tenant, contractor };
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const { property, tenant } = getRelatedData(ticket);
      const matchesSearch =
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.estado === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || ticket.urgencia === urgencyFilter;
      return matchesSearch && matchesStatus && matchesUrgency;
    });
  }, [tickets, searchTerm, statusFilter, urgencyFilter, properties, tenants]);

  const handleUpdateStatus = (newStatus: TicketStatus) => {
    if (selectedTicket) {
      updateTicket({ ...selectedTicket, estado: newStatus });
      setSelectedTicket({ ...selectedTicket, estado: newStatus });
    }
  };

  const DetailItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
  }> = ({ icon, label, value }) => (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-5 h-5 text-gray-500 mt-0.5">{icon}</div>
      <div className="ml-3">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tickets de Mantenimiento</h1>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
          <input
            type="text"
            placeholder="Buscar por título, propiedad o inquilino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-gray-300 rounded-md"
            >
              <option value="all">Todos los estados</option>
              {Object.values(TicketStatus).map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="border-gray-300 rounded-md"
            >
              <option value="all">Toda urgencia</option>
              {Object.values(TicketUrgency).map((urgency) => (
                <option key={urgency} value={urgency} className="capitalize">
                  {urgency}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => {
          const { property } = getRelatedData(ticket);
          return (
            <Card key={ticket.id} className="flex flex-col">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900 pr-2">{ticket.titulo}</h3>
                  <Badge text={ticket.urgencia} color={getUrgencyBadgeColor(ticket.urgencia)} />
                </div>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <BuildingOfficeIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                  {property?.title || 'N/A'}
                </p>
              </div>
              <div className="border-t border-gray-200 p-4 mt-auto">
                <div className="flex justify-between items-center">
                  <Badge text={ticket.estado} color={getStatusBadgeColor(ticket.estado)} />
                  <Button variant="ghost" onClick={() => setSelectedTicket(ticket)}>
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {filteredTickets.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-gray-800">No se encontraron tickets</h3>
          <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
        </div>
      )}

      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={selectedTicket.titulo}
          size="4xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {selectedTicket.fotos.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Fotos del Problema</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedTicket.fotos.map((foto, index) => (
                      <a key={index} href={foto} target="_blank" rel="noopener noreferrer">
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md shadow-sm hover:shadow-lg transition-shadow"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Descripción del Inquilino</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {selectedTicket.descripcion}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                  Detalles del Ticket
                </h4>
                <div className="space-y-3">
                  <DetailItem
                    icon={<InformationCircleIcon />}
                    label="Estado"
                    value={
                      <Badge
                        text={selectedTicket.estado}
                        color={getStatusBadgeColor(selectedTicket.estado)}
                      />
                    }
                  />
                  <DetailItem
                    icon={<BuildingOfficeIcon />}
                    label="Propiedad"
                    value={
                      <button
                        onClick={() => onSelectProperty(selectedTicket.propertyId)}
                        className="text-primary hover:underline text-left"
                      >
                        {getRelatedData(selectedTicket).property?.title || 'N/A'}
                      </button>
                    }
                  />
                  <DetailItem
                    icon={<UserIcon />}
                    label="Inquilino"
                    value={getRelatedData(selectedTicket).tenant?.nombre_completo || 'N/A'}
                  />
                  <DetailItem
                    icon={<CalendarIcon />}
                    label="Fecha Reporte"
                    value={formatDate(selectedTicket.fecha_creacion)}
                  />
                  <DetailItem
                    icon={<CurrencyDollarIcon />}
                    label="Costo Estimado"
                    value={formatCurrency(selectedTicket.costo_estimado)}
                  />
                </div>
              </Card>

              {getRelatedData(selectedTicket).contractor && (
                <Card>
                  <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                    Contratista Asignado
                  </h4>
                  <div className="space-y-3">
                    <DetailItem
                      icon={<UserIcon />}
                      label="Nombre"
                      value={getRelatedData(selectedTicket).contractor?.nombre || 'N/A'}
                    />
                    <DetailItem
                      icon={<WrenchScrewdriverIcon />}
                      label="Especialidad"
                      value={getRelatedData(selectedTicket).contractor?.especialidad || 'N/A'}
                    />
                    <DetailItem
                      icon={<PhoneIcon />}
                      label="Teléfono"
                      value={
                        <a
                          href={`tel:${getRelatedData(selectedTicket).contractor?.telefono}`}
                          className="text-primary hover:underline"
                        >
                          {getRelatedData(selectedTicket).contractor?.telefono}
                        </a>
                      }
                    />
                  </div>
                </Card>
              )}

              {selectedTicket.facturaUrl && (
                <Button
                  variant="secondary"
                  onClick={() => window.open(selectedTicket.facturaUrl, '_blank')}
                  icon={<DocumentTextIcon />}
                >
                  Ver Factura
                </Button>
              )}

              {selectedTicket.estado !== TicketStatus.Cerrado && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Acciones</h4>
                  <div className="flex space-x-2">
                    {selectedTicket.estado === TicketStatus.Abierto && (
                      <Button
                        variant="primary"
                        onClick={() => handleUpdateStatus(TicketStatus.EnProgreso)}
                      >
                        Marcar como "En Progreso"
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => handleUpdateStatus(TicketStatus.Cerrado)}
                    >
                      Marcar como "Cerrado"
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
