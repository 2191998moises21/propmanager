import React, { useMemo } from 'react';
import { Tenant, Ticket, Payment, PaymentStatus, TicketStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TenantView } from '@/portals/TenantPortal';
import {
  CurrencyDollarIcon,
  TicketIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface TenantDashboardProps {
  tenant: Tenant;
  tickets: Ticket[];
  payments: Payment[];
  setView: (view: TenantView) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatMonth = (dateString: string) => {
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
};

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  tenant,
  tickets,
  payments,
  setView,
}) => {
  const nextPayment = useMemo(() => {
    return payments
      .filter(
        (p) => p.estado_pago === PaymentStatus.Pendiente || p.estado_pago === PaymentStatus.Atrasado
      )
      .sort(
        (a, b) =>
          new Date(a.mes_correspondiente).getTime() - new Date(b.mes_correspondiente).getTime()
      )[0];
  }, [payments]);

  const openTicketsCount = useMemo(() => {
    return tickets.filter(
      (t) => t.estado === TicketStatus.Abierto || t.estado === TicketStatus.EnProgreso
    ).length;
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {tenant.nombre_completo.split(' ')[0]}
        </h1>
        <p className="mt-1 text-md text-gray-600">Aquí tienes un resumen de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-red-100">
                <CurrencyDollarIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Próximo Pago</p>
                {nextPayment ? (
                  <>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(nextPayment.monto_pago)}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      Para {formatMonth(nextPayment.mes_correspondiente)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-semibold text-green-600">¡Estás al día!</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="primary" onClick={() => setView('payments')} className="w-full">
              Ir a Pagos
            </Button>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-yellow-100">
                <TicketIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tickets Abiertos</p>
                <p className="text-2xl font-semibold text-gray-900">{openTicketsCount}</p>
                <p className="text-sm text-gray-500">
                  {openTicketsCount > 0 ? 'Requieren atención' : 'No hay tickets abiertos'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => setView('tickets')} className="w-full">
              Ver Mis Tickets
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-accent mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                ¿Tienes un problema en tu propiedad?
              </h3>
              <p className="text-gray-600">
                No dudes en reportarlo. Crea un ticket de mantenimiento y nos encargaremos.
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setView('tickets')}>
            Crear Nuevo Ticket
          </Button>
        </div>
      </Card>
    </div>
  );
};
