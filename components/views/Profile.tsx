import React, { useState, useEffect } from 'react';
import { Owner } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PencilIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface ProfileProps {
    owner: Owner;
    onUpdate: (owner: Owner) => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div>
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center mt-1">
            <span className="w-5 h-5 text-gray-400 mr-3">{icon}</span>
            <p className="text-sm text-gray-800">{value}</p>
        </div>
    </div>
);

const InputRow: React.FC<{ icon: React.ReactNode, label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }> = ({ icon, label, name, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 w-5 h-5">{icon}</span>
            </div>
            <input
                type={type}
                name={name}
                id={name}
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary focus:ring-primary sm:text-sm"
                value={value}
                onChange={onChange}
            />
        </div>
    </div>
);


export const Profile: React.FC<ProfileProps> = ({ owner, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(owner);

    useEffect(() => {
        setFormData(owner);
    }, [owner]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
        alert('Perfil actualizado con éxito.');
    };

    const handleCancel = () => {
        setFormData(owner);
        setIsEditing(false);
    };
    
    const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Funcionalidad para cambiar contraseña no implementada en esta demo.');
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>

            <Card>
                <div className="p-4">
                    <div className="flex items-center space-x-5">
                        <img className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200" src={owner.fotoUrl} alt={owner.nombre_completo} />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{owner.nombre_completo}</h2>
                            <p className="text-md text-gray-500">{owner.email}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
                    {!isEditing && (
                        <Button variant="ghost" icon={<PencilIcon className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
                            Editar
                        </Button>
                    )}
                </div>
                <div className="p-6">
                    {isEditing ? (
                        <div className="space-y-4">
                            <InputRow icon={<PencilIcon />} label="Nombre Completo" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} />
                            <InputRow icon={<EnvelopeIcon />} label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                            <InputRow icon={<PhoneIcon />} label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
                            <InputRow icon={<MapPinIcon />} label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSave}>Guardar Cambios</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoRow icon={<PencilIcon />} label="Nombre Completo" value={owner.nombre_completo} />
                            <InfoRow icon={<EnvelopeIcon />} label="Email" value={owner.email} />
                            <InfoRow icon={<PhoneIcon />} label="Teléfono" value={owner.telefono} />
                            <InfoRow icon={<MapPinIcon />} label="Dirección" value={owner.direccion} />
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Seguridad</h3>
                </div>
                <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                     <div>
                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                        <input type="password" name="current_password" id="current_password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                        <input type="password" name="new_password" id="new_password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                        <input type="password" name="confirm_password" id="confirm_password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button variant="primary" type="submit">Cambiar Contraseña</Button>
                    </div>
                </form>
            </Card>

        </div>
    );
};

// Dummy Icons
const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>);
const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>);
const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>);