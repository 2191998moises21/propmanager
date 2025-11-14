
import React from 'react';
import { Property, OccupancyStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const getStatusBadgeColor = (status: OccupancyStatus): 'green' | 'yellow' | 'blue' | 'gray' => {
  switch (status) {
    case OccupancyStatus.Disponible:
      return 'green';
    case OccupancyStatus.Ocupada:
      return 'blue';
    case OccupancyStatus.Mantenimiento:
      return 'yellow';
    default:
      return 'gray';
  }
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  return (
    <div onClick={() => onSelect(property.id)} className="cursor-pointer h-full group">
        <Card className="flex flex-col h-full transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02]">
            <div className="relative">
                <img className="w-full h-48 object-cover rounded-t-lg" src={property.imageUrl} alt={property.title} />
                <div className="absolute top-2 right-2">
                <Badge text={property.estado_ocupacion} color={getStatusBadgeColor(property.estado_ocupacion)} />
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 truncate">{property.title}</h3>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                {property.ciudad}
                </p>

                <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
                <div className="flex items-center">
                    <span className="font-semibold">{property.habitaciones} hab</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-semibold">{property.banos} baños</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-semibold">{property.area_m2} m²</span>
                </div>
                </div>

                <div className="mt-auto pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Alquiler mensual</span>
                    <span className="text-lg font-bold text-primary">
                    {formatCurrency(property.precio_alquiler)}
                    </span>
                </div>
                </div>
            </div>
        </Card>
    </div>
  );
};
