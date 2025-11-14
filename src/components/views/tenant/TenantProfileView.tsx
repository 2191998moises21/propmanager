import React from 'react';
import { Tenant } from '../../../types';
import { Card } from '../../ui/Card';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, IdentificationIcon } from '@heroicons/react/24/outline';

interface TenantProfileViewProps {
    tenant: Tenant;
}

const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string | React.ReactNode }> = ({ icon, label, value }) => (
    <div>
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center mt-1">
            <span className="w-5 h-5 text-gray-400 mr-3">{icon}</span>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    </div>
);

export const TenantProfileView: React.FC<TenantProfileViewProps> = ({ tenant }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>

            <Card>
                <div className="p-4">
                    <div className="flex items-center space-x-5">
                        <img className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200" src={tenant.fotoUrl} alt={tenant.nombre_completo} />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{tenant.nombre_completo}</h2>
                            <p className="text-md text-gray-500">{tenant.email}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Información de Contacto y Documentos</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoRow icon={<EnvelopeIcon />} label="Email" value={tenant.email} />
                        <InfoRow icon={<PhoneIcon />} label="Teléfono" value={tenant.telefono} />
                        <InfoRow icon={<IdentificationIcon />} label="Documento de Identidad" value={tenant.documento_id} />
                        <InfoRow 
                            icon={<IdentificationIcon />} 
                            label="Archivo de Documento" 
                            value={tenant.documentoUrl ? <a href={tenant.documentoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver documento</a> : 'No disponible'} 
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};