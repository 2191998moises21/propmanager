import React, { useState, useEffect } from 'react';
import { Property, Contract, Tenant, OccupancyStatus, PropertyType, Currency } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeftIcon, MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon, HomeIcon, UserCircleIcon, Cog6ToothIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { AssignTenantModal } from '@/components/shared/AssignTenantModal';

const getStatusBadgeColor = (status: OccupancyStatus): 'green' | 'yellow' | 'blue' | 'gray' => {
  switch (status) {
    case OccupancyStatus.Disponible: return 'green';
    case OccupancyStatus.Ocupada: return 'blue';
    case OccupancyStatus.Mantenimiento: return 'yellow';
    default: return 'gray';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 w-6 h-6 text-gray-500">{icon}</div>
    <div className="ml-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);


interface PropertyDetailProps {
  property: Property;
  contract: Contract | null;
  tenant: Tenant | null;
  onBack: () => void;
  tenants: Tenant[];
  addContract: (contract: Omit<Contract, 'id'>) => void;
  terminateContract: (contractId: string) => void;
  updatePropertyStatus: (propertyId: string, newStatus: OccupancyStatus) => void;
  onSelectContract: (id: string) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (propertyId: string) => void;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, contract, tenant, onBack, tenants, addContract, terminateContract, updatePropertyStatus, onSelectContract, updateProperty, deleteProperty }) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Property>(property);

  useEffect(() => {
    setFormData(property);
  }, [property, isEditing]);

  const handleTerminate = () => {
    if (contract && window.confirm(`¿Está seguro que desea terminar el contrato para ${tenant?.nombre_completo} en esta propiedad? La propiedad pasará a estar disponible.`)) {
      terminateContract(contract.id);
    }
  };
  
  const handleDelete = () => {
    if (property.estado_ocupacion === OccupancyStatus.Ocupada) {
      alert("No puede eliminar una propiedad que está actualmente ocupada.");
      return;
    }
    if (window.confirm(`¿Está seguro que desea eliminar la propiedad "${property.title}"? Esta acción no se puede deshacer.`)) {
      deleteProperty(property.id);
    }
  };
  
  const handleSave = () => {
    updateProperty(formData);
    setIsEditing(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({
        ...prev,
        [name]: isNumber && value !== '' ? Number(value) : value,
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
          setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const StatusChanger: React.FC = () => {
    if (property.estado_ocupacion === OccupancyStatus.Ocupada) {
      return <Badge text={property.estado_ocupacion} color={getStatusBadgeColor(property.estado_ocupacion)} className="text-sm px-4 py-1" />;
    }
    return (
      <div className="relative inline-block">
        <select
          value={property.estado_ocupacion}
          onChange={(e) => updatePropertyStatus(property.id, e.target.value as OccupancyStatus)}
          className="appearance-none text-sm px-4 py-1 rounded-full font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
          style={{
            backgroundColor: {
              [OccupancyStatus.Disponible]: '#D1FAE5',
              [OccupancyStatus.Mantenimiento]: '#FEF3C7'
            }[property.estado_ocupacion],
            color: {
              [OccupancyStatus.Disponible]: '#065F46',
              [OccupancyStatus.Mantenimiento]: '#92400E'
            }[property.estado_ocupacion]
          }}
        >
          <option value={OccupancyStatus.Disponible}>Disponible</option>
          <option value={OccupancyStatus.Mantenimiento}>Mantenimiento</option>
        </select>
      </div>
    );
  };
  
  const EditForm = () => (
    <div className="space-y-6">
       <div>
          <Button variant="ghost" onClick={onBack} icon={<ArrowLeftIcon className="w-5 h-5"/>}>
            Volver a Propiedades
          </Button>
        </div>
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Editando Propiedad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título / Dirección Corta</label>
                  <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Foto</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-md" />
                    <label htmlFor="file-upload" className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <span>Cambiar Foto</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
              </div>
              <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección Completa</label>
                  <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                  <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <input type="text" name="ciudad" id="ciudad" value={formData.ciudad} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                  <label htmlFor="tipo_propiedad" className="block text-sm font-medium text-gray-700">Tipo de Propiedad</label>
                  <select name="tipo_propiedad" id="tipo_propiedad" value={formData.tipo_propiedad} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                      {Object.values(PropertyType).map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="precio_alquiler" className="block text-sm font-medium text-gray-700">Precio de Alquiler ({formData.moneda})</label>
                  <input type="number" name="precio_alquiler" id="precio_alquiler" value={formData.precio_alquiler} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                  <label htmlFor="area_m2" className="block text-sm font-medium text-gray-700">Área (m²)</label>
                  <input type="number" name="area_m2" id="area_m2" value={formData.area_m2} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                  <label htmlFor="habitaciones" className="block text-sm font-medium text-gray-700">Habitaciones</label>
                  <input type="number" name="habitaciones" id="habitaciones" value={formData.habitaciones} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                  <label htmlFor="banos" className="block text-sm font-medium text-gray-700">Baños</label>
                  <input type="number" name="banos" id="banos" value={formData.banos} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div>
                  <label htmlFor="estacionamientos" className="block text-sm font-medium text-gray-700">Estacionamientos</label>
                  <input type="number" name="estacionamientos" id="estacionamientos" value={formData.estacionamientos} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="ghost" type="button" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button variant="primary" type="button" onClick={handleSave}>Guardar Cambios</Button>
              </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <>
      {isEditing ? <EditForm /> :
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={onBack} icon={<ArrowLeftIcon className="w-5 h-5"/>}>
            Volver a Propiedades
          </Button>
        </div>

        <header className="pb-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <p className="mt-2 text-md text-gray-600 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2 text-gray-400" />
                    {property.direccion}, {property.ciudad}
                </p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button variant="ghost" onClick={() => setIsEditing(true)} icon={<PencilIcon className="w-4 h-4"/>}>Editar</Button>
                  <Button variant="danger" onClick={handleDelete} disabled={property.estado_ocupacion === OccupancyStatus.Ocupada} icon={<TrashIcon className="w-4 h-4"/>}>Eliminar</Button>
                  <StatusChanger />
              </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column for image and description */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden p-0">
              <img src={property.imageUrl} alt={property.title} className="w-full h-auto object-cover" />
            </Card>
            
            <Card>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Descripción y Amenidades</h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: property.amenidades || '<p>No hay descripción detallada disponible.</p>' }} />
            </Card>
          </div>
          
          {/* Right column for details */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles Clave</h3>
              <div className="space-y-4">
                  <DetailItem icon={<HomeIcon />} label="Tipo de Propiedad" value={property.tipo_propiedad} />
                  <DetailItem icon={<SparklesIcon />} label="Área" value={`${property.area_m2} m²`} />
                  <DetailItem icon={<BuildingOfficeIcon />} label="Habitaciones" value={property.habitaciones} />
                  <DetailItem icon={<BuildingOfficeIcon className="transform -scale-x-100" />} label="Baños" value={property.banos} />
                  <DetailItem icon={<BuildingOfficeIcon />} label="Estacionamientos" value={property.estacionamientos} />
                  {property.estado_ocupacion === OccupancyStatus.Disponible && property.fecha_disponible && 
                      <DetailItem icon={<CalendarDaysIcon />} label="Disponible desde" value={new Date(property.fecha_disponible).toLocaleDateString('es-ES')} />
                  }
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Financiera</h3>
              <div className="space-y-4">
                  <DetailItem icon={<CurrencyDollarIcon />} label="Precio de Alquiler" value={formatCurrency(property.precio_alquiler)} />
                  <DetailItem icon={<CurrencyDollarIcon />} label="Depósito Requerido" value={property.deposito_requerido ? formatCurrency(property.deposito_requerido) : 'N/A'} />
              </div>
            </Card>
            
            {property.estado_ocupacion === OccupancyStatus.Ocupada && tenant && contract ? (
              <Card>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Inquilino Actual</h3>
                  <div className="flex items-center space-x-4 mb-4">
                      <img src={tenant.fotoUrl} alt={tenant.nombre_completo} className="w-16 h-16 rounded-full object-cover"/>
                      <div>
                          <p className="font-bold text-gray-900">{tenant.nombre_completo}</p>
                          <p className="text-sm text-gray-500">Contrato hasta {new Date(contract.fecha_fin).toLocaleDateString('es-ES')}</p>
                          <button onClick={() => onSelectContract(contract.id)} className="text-sm text-primary hover:underline mt-1 inline-block">Ver Contrato</button>
                      </div>
                  </div>
                  <Button variant="ghost" onClick={handleTerminate} className="w-full text-red-600 hover:bg-red-50">
                      Terminar Contrato
                  </Button>
              </Card>
            ) : property.estado_ocupacion === OccupancyStatus.Disponible ? (
              <Card className="text-center">
                  <UserCircleIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mt-2">Propiedad Disponible</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Asigne un inquilino para crear un nuevo contrato de alquiler.</p>
                  <Button variant="primary" onClick={() => setIsAssignModalOpen(true)}>Asignar Inquilino</Button>
              </Card>
            ) : (
                 <Card className="text-center">
                  <Cog6ToothIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mt-2">En Mantenimiento</h3>
                  <p className="text-sm text-gray-500 mt-1">Esta propiedad no está disponible para alquiler actualmente.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
      }
      <AssignTenantModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        property={property}
        tenants={tenants}
        addContract={addContract}
      />
    </>
  );
};
