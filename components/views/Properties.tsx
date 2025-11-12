
import React, { useState, useMemo } from 'react';
import { Property, PropertyType, OccupancyStatus, Currency } from '../../types';
import { PropertyCard } from '../shared/PropertyCard';
import { Button } from '../ui/Button';

interface PropertiesProps {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'imageUrl'>) => void;
}

export const Properties: React.FC<PropertiesProps> = ({ properties, addProperty }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredProperties = useMemo(() => {
    return properties.filter(prop => {
      const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || prop.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || prop.estado_ocupacion === statusFilter;
      const matchesType = typeFilter === 'all' || prop.tipo_propiedad === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchTerm, statusFilter, typeFilter]);

  const handleAddProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProperty = {
      title: formData.get('title') as string,
      direccion: formData.get('direccion') as string,
      ciudad: formData.get('ciudad') as string,
      tipo_propiedad: formData.get('tipo_propiedad') as PropertyType,
      area_m2: Number(formData.get('area_m2')),
      habitaciones: Number(formData.get('habitaciones')),
      banos: Number(formData.get('banos')),
      estacionamientos: Number(formData.get('estacionamientos')),
      precio_alquiler: Number(formData.get('precio_alquiler')),
      moneda: formData.get('moneda') as Currency,
      estado_ocupacion: formData.get('estado_ocupacion') as OccupancyStatus,
    };
    addProperty(newProperty);
    setShowAddForm(false);
  };
  
  if (showAddForm) {
     return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nueva Propiedad</h2>
            <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título / Dirección Corta</label>
                    <input type="text" name="title" id="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección Completa</label>
                    <input type="text" name="direccion" id="direccion" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">Ciudad</label>
                    <input type="text" name="ciudad" id="ciudad" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="tipo_propiedad" className="block text-sm font-medium text-gray-700">Tipo de Propiedad</label>
                    <select name="tipo_propiedad" id="tipo_propiedad" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                        {Object.values(PropertyType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="estado_ocupacion" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select name="estado_ocupacion" id="estado_ocupacion" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                         {Object.values(OccupancyStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="precio_alquiler" className="block text-sm font-medium text-gray-700">Precio de Alquiler</label>
                    <input type="number" name="precio_alquiler" id="precio_alquiler" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">Moneda</label>
                    <select name="moneda" id="moneda" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                         {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="area_m2" className="block text-sm font-medium text-gray-700">Área (m²)</label>
                    <input type="number" name="area_m2" id="area_m2" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="habitaciones" className="block text-sm font-medium text-gray-700">Habitaciones</label>
                    <input type="number" name="habitaciones" id="habitaciones" defaultValue="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="banos" className="block text-sm font-medium text-gray-700">Baños</label>
                    <input type="number" name="banos" id="banos" defaultValue="1" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="estacionamientos" className="block text-sm font-medium text-gray-700">Estacionamientos</label>
                    <input type="number" name="estacionamientos" id="estacionamientos" defaultValue="0" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div className="md:col-span-2 flex justify-end space-x-3">
                    <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>Cancelar</Button>
                    <Button variant="primary" type="submit">Guardar Propiedad</Button>
                 </div>
            </form>
        </div>
     )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
             <input
              type="text"
              placeholder="Buscar por dirección o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-4">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border-gray-300 rounded-md">
              <option value="all">Todos los estados</option>
              {Object.values(OccupancyStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border-gray-300 rounded-md">
              <option value="all">Todos los tipos</option>
               {Object.values(PropertyType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
           <Button variant="primary" onClick={() => setShowAddForm(true)}>+ Agregar Propiedad</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      {filteredProperties.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-gray-800">No se encontraron propiedades</h3>
          <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
        </div>
      )}
    </div>
  );
};
