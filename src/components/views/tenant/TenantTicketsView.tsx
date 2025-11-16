import React, { useState } from 'react';
import { Ticket, Property, Tenant, TicketStatus, TicketUrgency } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CreateTicketModal } from '@/components/shared/CreateTicketModal';
import { Modal } from '@/components/ui/Modal';

interface TenantTicketsViewProps {
  tickets: Ticket[];
  property: Property;
  tenant: Tenant;
  addTicket: (
    ticket: Omit<
      Ticket,
      'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'
    >
  ) => void;
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

export const TenantTicketsView: React.FC<TenantTicketsViewProps> = ({
  tickets,
  property,
  tenant,
  addTicket,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Tickets de Mantenimiento</h1>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          + Crear Nuevo Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="flex flex-col">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 pr-2">{ticket.titulo}</h3>
                <Badge text={ticket.urgencia} color={getUrgencyBadgeColor(ticket.urgencia)} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Reportado: {formatDate(ticket.fecha_creacion)}
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
        ))}
      </div>
      {tickets.length === 0 && (
        <Card className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-800">No has creado ningún ticket</h3>
          <p className="text-gray-500 mt-2">Si tienes un problema, no dudes en crear uno.</p>
        </Card>
      )}

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        property={property}
        tenant={tenant}
        addTicket={addTicket}
      />

      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={selectedTicket.titulo}
          size="2xl"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Estado</h4>
              <Badge
                text={selectedTicket.estado}
                color={getStatusBadgeColor(selectedTicket.estado)}
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Tu Descripción</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {selectedTicket.descripcion}
              </p>
            </div>
            {selectedTicket.fotos.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Fotos Enviadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedTicket.fotos.map((foto, index) => (
                    <a key={index} href={foto} target="_blank" rel="noopener noreferrer">
                      <img
                        src={foto}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md shadow-sm"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
