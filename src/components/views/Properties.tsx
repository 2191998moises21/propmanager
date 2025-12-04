import React, { useState, useMemo } from 'react';
import { Property, PropertyType, OccupancyStatus, Currency } from '@/types';
import { PropertyCard } from '@/components/shared/PropertyCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

interface PropertiesProps {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id'>) => void;
  onSelectProperty: (id: string) => void;
}

export const Properties: React.FC<PropertiesProps> = ({
  properties,
  addProperty,
  onSelectProperty,
}) => {
  const { warning } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const matchesSearch =
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.ciudad.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || prop.estado_ocupacion === statusFilter;
      const matchesType = typeFilter === 'all' || prop.tipo_propiedad === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchTerm, statusFilter, typeFilter]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProperty = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imagePreview) {
      warning('Por favor, suba una imagen para la propiedad');
      return;
    }
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
      moneda: Currency.USD,
      estado_ocupacion: formData.get('estado_ocupacion') as OccupancyStatus,
      imageUrl: imagePreview,
    };
    addProperty(newProperty);
    setShowAddForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  if (showAddForm) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nueva Propiedad</h2>
        <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Título / Dirección Corta
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Foto de la Propiedad</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Property preview"
                    className="mx-auto h-24 w-auto rounded-md"
                  />
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-1"
                  >
                    <span>Subir un archivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
              Dirección Completa
            </label>
            <input
              type="text"
              name="direccion"
              id="direccion"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">
              Ciudad
            </label>
            <input
              type="text"
              name="ciudad"
              id="ciudad"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="tipo_propiedad" className="block text-sm font-medium text-gray-700">
              Tipo de Propiedad
            </label>
            <select
              name="tipo_propiedad"
              id="tipo_propiedad"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              {Object.values(PropertyType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="estado_ocupacion" className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              name="estado_ocupacion"
              id="estado_ocupacion"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              {Object.values(OccupancyStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="precio_alquiler" className="block text-sm font-medium text-gray-700">
              Precio de Alquiler (USD)
            </label>
            <input
              type="number"
              name="precio_alquiler"
              id="precio_alquiler"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="area_m2" className="block text-sm font-medium text-gray-700">
              Área (m²)
            </label>
            <input
              type="number"
              name="area_m2"
              id="area_m2"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="habitaciones" className="block text-sm font-medium text-gray-700">
              Habitaciones
            </label>
            <input
              type="number"
              name="habitaciones"
              id="habitaciones"
              defaultValue="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="banos" className="block text-sm font-medium text-gray-700">
              Baños
            </label>
            <input
              type="number"
              name="banos"
              id="banos"
              defaultValue="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="estacionamientos" className="block text-sm font-medium text-gray-700">
              Estacionamientos
            </label>
            <input
              type="number"
              name="estacionamientos"
              id="estacionamientos"
              defaultValue="0"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3">
            <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Propiedad
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por dirección o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos los estados</option>
              {Object.values(OccupancyStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos los tipos</option>
              {Object.values(PropertyType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
              + Agregar Propiedad
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} onSelect={onSelectProperty} />
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
