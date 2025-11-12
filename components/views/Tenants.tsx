
import React from 'react';
import { Tenant } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface TenantsProps {
  tenants: Tenant[];
}

export const Tenants: React.FC<TenantsProps> = ({ tenants }) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Inquilinos</h1>
            <Button variant="primary">+ Agregar Inquilino</Button>
        </div>
        <Card>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={tenant.fotoUrl} alt={tenant.nombre_completo} />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{tenant.nombre_completo}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.documento_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{tenant.email}</div>
                                <div className="text-sm text-gray-500">{tenant.telefono}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href="#" className="text-primary hover:text-blue-700">Editar</a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
           </div>
        </Card>
    </div>
  );
};
