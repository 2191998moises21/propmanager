import React from 'react';
import { Property, OccupancyStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { HomeIcon, SparklesIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid';

interface MyPropertyViewProps {
  property: Property;
}

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 h-6 text-gray-500">{icon}</div>
    <div className="ml-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export const MyPropertyView: React.FC<MyPropertyViewProps> = ({ property }) => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
        <p className="mt-1 text-md text-gray-600">
          {property.direccion}, {property.ciudad}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden p-0">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-96 object-cover"
            />
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles Clave</h3>
            <div className="space-y-4">
              <DetailItem
                icon={<HomeIcon />}
                label="Tipo de Propiedad"
                value={property.tipo_propiedad}
              />
              <DetailItem icon={<SparklesIcon />} label="Área" value={`${property.area_m2} m²`} />
              <DetailItem
                icon={<BuildingOfficeIcon />}
                label="Habitaciones"
                value={property.habitaciones}
              />
              <DetailItem icon={<BuildingOfficeIcon />} label="Baños" value={property.banos} />
              <DetailItem
                icon={<BuildingOfficeIcon />}
                label="Estacionamientos"
                value={property.estacionamientos}
              />
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Descripción y Amenidades</h2>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{
                __html: property.amenidades || '<p>No hay descripción detallada disponible.</p>',
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
