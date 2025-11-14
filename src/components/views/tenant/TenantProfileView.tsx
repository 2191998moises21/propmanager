import React, { useState } from 'react';
import { Tenant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

interface TenantProfileViewProps {
  tenant: Tenant;
}

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}> = ({ icon, label, value }) => (
  <div>
    <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</label>
    <div className="flex items-center mt-2">
      <span className="w-5 h-5 text-gray-400 mr-3">{icon}</span>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  </div>
);

export const TenantProfileView: React.FC<TenantProfileViewProps> = ({ tenant }) => {
  const { updateTenant } = useApp();
  const { toasts, removeToast, success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTenant, setEditedTenant] = useState(tenant);
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);

  const handleSave = () => {
    try {
      // Validaciones básicas
      if (!editedTenant.nombre_completo || editedTenant.nombre_completo.length < 3) {
        error('El nombre debe tener al menos 3 caracteres');
        return;
      }

      if (!editedTenant.telefono || editedTenant.telefono.length < 10) {
        error('El teléfono debe tener al menos 10 dígitos');
        return;
      }

      if (!editedTenant.email || !editedTenant.email.includes('@')) {
        error('Email inválido');
        return;
      }

      updateTenant(editedTenant);
      setIsEditing(false);
      success('¡Perfil actualizado exitosamente!');
    } catch (err) {
      error('Error al actualizar el perfil');
    }
  };

  const handleCancel = () => {
    setEditedTenant(tenant);
    setIsEditing(false);
  };

  const handlePhotoChange = () => {
    // Simular cambio de foto con diferentes avatares
    const randomSeed = Date.now();
    const newPhotoUrl = `https://i.pravatar.cc/150?u=${randomSeed}`;
    setEditedTenant({ ...editedTenant, fotoUrl: newPhotoUrl });
    setIsChangingPhoto(false);
    success('¡Foto actualizada!');
  };

  const generateRandomPhoto = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    return `https://i.pravatar.cc/150?u=${randomSeed}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600">
              <CheckIcon className="w-4 h-4" />
              Guardar
            </Button>
            <Button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                className="h-28 w-28 rounded-full object-cover ring-4 ring-primary shadow-lg"
                src={isEditing ? editedTenant.fotoUrl : tenant.fotoUrl}
                alt={tenant.nombre_completo}
              />
              {isEditing && (
                <button
                  onClick={() => setIsChangingPhoto(!isChangingPhoto)}
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  aria-label="Cambiar foto"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={editedTenant.nombre_completo}
                      onChange={(e) =>
                        setEditedTenant({ ...editedTenant, nombre_completo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <p className="text-sm text-gray-500">{tenant.email}</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">{tenant.nombre_completo}</h2>
                  <p className="text-md text-gray-500">{tenant.email}</p>
                </>
              )}
            </div>
          </div>

          {isChangingPhoto && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                Selecciona una nueva foto de perfil:
              </p>
              <div className="flex gap-3 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setEditedTenant({ ...editedTenant, fotoUrl: generateRandomPhoto() });
                      setIsChangingPhoto(false);
                    }}
                    className="hover:ring-2 hover:ring-primary rounded-full transition-all"
                  >
                    <img
                      src={`https://i.pravatar.cc/80?img=${i}`}
                      alt={`Opción ${i}`}
                      className="w-16 h-16 rounded-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
        </div>
        <div className="p-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={editedTenant.email}
                  onChange={(e) => setEditedTenant({ ...editedTenant, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editedTenant.telefono}
                  onChange={(e) =>
                    setEditedTenant({ ...editedTenant, telefono: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="Ej: +1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IdentificationIcon className="w-4 h-4 inline mr-2" />
                  Documento de Identidad
                </label>
                <input
                  type="text"
                  value={editedTenant.documento_id}
                  onChange={(e) =>
                    setEditedTenant({ ...editedTenant, documento_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  El documento de identidad no puede ser modificado por seguridad
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={<EnvelopeIcon />} label="Email" value={tenant.email} />
              <InfoRow icon={<PhoneIcon />} label="Teléfono" value={tenant.telefono} />
              <InfoRow
                icon={<IdentificationIcon />}
                label="Documento de Identidad"
                value={tenant.documento_id}
              />
              <InfoRow
                icon={<IdentificationIcon />}
                label="Archivo de Documento"
                value={
                  tenant.documentoUrl ? (
                    <a
                      href={tenant.documentoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver documento
                    </a>
                  ) : (
                    'No disponible'
                  )
                }
              />
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6 bg-blue-50">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Información</h4>
          <p className="text-sm text-blue-700">
            Puedes actualizar tu nombre, teléfono y foto de perfil. Para cambios en tu documento de
            identidad, contacta al administrador del sistema.
          </p>
        </div>
      </Card>
    </div>
  );
};
