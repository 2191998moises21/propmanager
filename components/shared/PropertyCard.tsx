
import React from 'react';
import { Property, OccupancyStatus } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
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


// Dummy icons
const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>);
const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3.75h7.5V21h-7.5zM12 21V12h3m-3 0V3.75M12 12h-3m3 0V3.75" /></svg>);
const CurrencyDollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);