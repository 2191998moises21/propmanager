import React, { useState, useEffect } from 'react';
import { Property, Contract, Tenant, OccupancyStatus, PropertyType, Currency } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowLeftIcon, MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon, HomeIcon, UserCircleIcon, Cog6ToothIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { AssignTenantModal } from '../shared/AssignTenantModal';

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


// Dummy icons
const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>);
const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>);
const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3.75h7.5V21h-7.5zM12 21V12h3m-3 0V3.75M12 12h-3m3 0V3.75" /></svg>);
const CurrencyDollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M9.315 7.584C10.866 6.33 12.83 5.25 15 5.25c1.75 0 3.322.613 4.545 1.639a.75.75 0 01-.91 1.186A11.25 11.25 0 0015 7.5c-1.598 0-3.04.488-4.285 1.336a.75.75 0 01-.91-1.186zM10.082 12.028a.75.75 0 01.91 1.186 11.22 11.22 0 01-4.285 1.336.75.75 0 01.217-1.48c1.23-.17 2.422-.57 3.558-1.139.37-.184.74-.383 1.109-.599a.75.75 0 01.178-1.138 13.98 13.98 0 00-4.545-1.639.75.75 0 01-.91-1.186c2.166-.99 4.673-1.48 7.185-1.48 2.512 0 5.02.49 7.185 1.48a.75.75 0 11-.91 1.186c-1.824-.83-3.9-1.264-6.075-1.264s-4.251.434-6.075 1.264a.75.75 0 01-.91-1.186 15.46 15.46 0 014.545-1.639.75.75 0 01.91 1.186c.002.002.002.002 0 0z" clipRule="evenodd" /><path d="M3 10.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10.5zM6.75 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM3.75 15a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM6.75 18a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM12.75 15a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5zM15 15.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM12.75 18a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" /></svg>);
const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zm-3.75 5.25v3a4.5 4.5 0 004.5 4.5h1.5a4.5 4.5 0 004.5-4.5v-3a3.75 3.75 0 00-3.75-3.75h-3A3.75 3.75 0 008.25 6.75z" clipRule="evenodd" /></svg>);
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const Cog6ToothIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0h1.5m15 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0h1.5m15 0h-1.5" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>);