import React, { useState, useEffect } from 'react';
import { Tenant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  CameraIcon,
  KeyIcon,
  UserCircleIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { authAPI } from '@/services/api';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';

interface TenantProfileViewProps {
  tenant: Tenant;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    <div className="flex items-center mt-1">
      <span className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0">{icon}</span>
      <p className="text-sm text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

const InputRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
}> = ({ icon, label, name, value, onChange, type = 'text', disabled = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500 w-5 h-5 flex-shrink-0">{icon}</span>
      </div>
      <input
        type={type}
        name={name}
        id={name}
        disabled={disabled}
        className={`block w-full rounded-md border-gray-300 pl-10 focus:border-primary focus:ring-primary sm:text-sm ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        value={value}
        onChange={onChange}
      />
    </div>
    {disabled && (
      <p className="mt-1 text-xs text-gray-500">
        Este campo no puede ser modificado por seguridad
      </p>
    )}
  </div>
);

export const TenantProfileView: React.FC<TenantProfileViewProps> = ({ tenant }) => {
  const { updateTenant } = useApp();
  const { success, error: showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(tenant);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setFormData(tenant);
    setPhotoPreview(null);
  }, [tenant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let foto_url = formData.fotoUrl;
      if (photoFile) {
        foto_url = await readFileAsDataURL(photoFile);
      }

      const updateData = {
        nombre_completo: formData.nombre_completo,
        telefono: formData.telefono,
        foto_url,
      };

      const result = await authAPI.updateProfile(updateData);

      if (result.success && result.data) {
        // Update both local state and global context
        updateTenant(result.data as Tenant);
        setIsEditing(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        success('Perfil actualizado con éxito');
      } else {
        showError(result.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Hubo un error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(tenant);
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        success('Contraseña actualizada con éxito');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordForm(false);
      } else {
        showError(result.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Hubo un error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayPhoto = photoPreview || formData.fotoUrl;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Profile Header Card */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
            <div className="relative">
              <img
                className="h-24 w-24 rounded-full object-cover ring-4 ring-gray-200"
                src={displayPhoto}
                alt={tenant.nombre_completo}
              />
              {isEditing && (
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-lg"
                  title="Cambiar foto"
                >
                  <CameraIcon className="h-4 w-4" />
                  <input
                    id="photo-upload"
                    name="photo-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </label>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {tenant.nombre_completo}
              </h2>
              <p className="text-md text-gray-500">{tenant.email}</p>
              <p className="text-sm text-gray-400 mt-1">Doc: {tenant.documento_id}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
          {!isEditing && (
            <Button
              variant="ghost"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              <span className="hidden sm:inline">Editar</span>
            </Button>
          )}
        </div>
        <div className="p-4 sm:p-6">
          {isEditing ? (
            <div className="space-y-4">
              <InputRow
                icon={<UserCircleIcon />}
                label="Nombre Completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
              />
              <InputRow
                icon={<EnvelopeIcon />}
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
              <InputRow
                icon={<PhoneIcon />}
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
              <InputRow
                icon={<IdentificationIcon />}
                label="Documento de Identidad"
                name="documento_id"
                value={formData.documento_id}
                onChange={handleChange}
                disabled={true}
              />
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={handleCancel} disabled={loading} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow
                icon={<UserCircleIcon />}
                label="Nombre Completo"
                value={tenant.nombre_completo}
              />
              <InfoRow icon={<EnvelopeIcon />} label="Email" value={tenant.email} />
              <InfoRow icon={<PhoneIcon />} label="Teléfono" value={tenant.telefono} />
              <InfoRow
                icon={<IdentificationIcon />}
                label="Documento de Identidad"
                value={tenant.documento_id}
              />
              {tenant.documentoUrl && (
                <InfoRow
                  icon={<IdentificationIcon />}
                  label="Archivo de Documento"
                  value={
                    <a
                      href={tenant.documentoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver documento
                    </a>
                  }
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Security Card */}
      <Card>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Seguridad</h3>
          {!showPasswordForm && (
            <Button
              variant="ghost"
              icon={<KeyIcon className="w-4 h-4" />}
              onClick={() => setShowPasswordForm(true)}
              size="sm"
            >
              <span className="hidden sm:inline">Cambiar Contraseña</span>
            </Button>
          )}
        </div>
        {showPasswordForm ? (
          <form onSubmit={handlePasswordChange} className="p-4 sm:p-6 space-y-4">
            <div>
              <label
                htmlFor="current_password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña Actual
              </label>
              <input
                type="password"
                name="current_password"
                id="current_password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña (mínimo 8 caracteres)
              </label>
              <input
                type="password"
                name="new_password"
                id="new_password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                name="confirm_password"
                id="confirm_password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                disabled={passwordLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={passwordLoading} className="w-full sm:w-auto">
                {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-6 text-center text-gray-500">
            <KeyIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">Haz clic en "Cambiar Contraseña" para actualizar tu contraseña</p>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card>
        <div className="p-4 sm:p-6 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Información</h4>
          <p className="text-sm text-blue-700">
            Puedes actualizar tu nombre, teléfono, foto de perfil y contraseña. Tu documento de
            identidad no puede ser modificado por seguridad. Para cambios en este campo, contacta
            al propietario o administrador del sistema.
          </p>
        </div>
      </Card>
    </div>
  );
};
