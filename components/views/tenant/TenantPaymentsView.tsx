import React, { useState } from 'react';
import { Payment, Contract, PaymentStatus } from '../../../types';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { UploadPaymentModal } from '../../shared/UploadPaymentModal';

interface TenantPaymentsViewProps {
    payments: Payment[];
    contract: Contract;
    uploadPaymentProof: (paymentId: string, proofUrl: string) => void;
}

const getStatusBadgeColor = (status: PaymentStatus): 'green' | 'yellow' | 'red' | 'blue' | 'gray' => {
  switch (status) {
    case PaymentStatus.Pagado: return 'green';
    case PaymentStatus.Pendiente: return 'yellow';
    case PaymentStatus.Atrasado: return 'red';
    case PaymentStatus.Parcial: return 'blue';
    case PaymentStatus.EnRevision: return 'blue';
    default: return 'gray';
  }
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export const TenantPaymentsView: React.FC<TenantPaymentsViewProps> = ({ payments, contract, uploadPaymentProof }) => {
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const sortedPayments = [...payments].sort((a,b) => new Date(b.mes_correspondiente).getTime() - new Date(a.mes_correspondiente).getTime());

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Mis Pagos</h1>
                <p className="mt-1 text-md text-gray-600">
                    Historial de pagos de alquiler. El día de pago es el {contract.dia_pago} de cada mes.
                </p>
            </header>
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes Correspondiente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{formatMonth(payment.mes_correspondiente)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">{new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(payment.monto_pago)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.fecha_pago)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge text={payment.estado_pago} color={getStatusBadgeColor(payment.estado_pago)} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {(payment.estado_pago === PaymentStatus.Pendiente || payment.estado_pago === PaymentStatus.Atrasado) && (
                                            <Button variant="primary" size="sm" onClick={() => setSelectedPayment(payment)}>
                                                Subir Comprobante
                                            </Button>
                                        )}
                                        {payment.comprobanteUrl && (
                                            <a href={payment.comprobanteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                Ver Comprobante
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedPayment && (
                <UploadPaymentModal 
                    isOpen={!!selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    payment={selectedPayment}
                    onUpload={uploadPaymentProof}
                />
            )}
        </div>
    );
};