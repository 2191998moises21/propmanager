import React, { useState, useEffect } from 'react';
import { Tenant } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/contexts/ToastContext';

interface TenantsProps {
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, 'id'>) => Promise<{ tenant: Tenant; temporaryPassword: string } | null>;
  updateTenant: (tenant: Tenant) => void;
}

export const Tenants: React.FC<TenantsProps> = ({ tenants, addTenant, updateTenant }) => {
  const { success, error: showError, warning } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [createdTenantData, setCreatedTenantData] = useState<{ tenant: Tenant; temporaryPassword: string } | null>(null);

  useEffect(() => {
    if (!showAddForm) {
      setEditingTenant(null);
    }
  }, [showAddForm]);

  useEffect(() => {
    if (editingTenant) {
      setPhotoPreview(editingTenant.fotoUrl);
    } else {
      setPhotoPreview(null);
      setPhotoFile(null);
      setDocumentFile(null);
    }
  }, [editingTenant]);

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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
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

  const handleSaveTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      let fotoUrl = editingTenant?.fotoUrl || '';
      if (photoFile) {
        fotoUrl = await readFileAsDataURL(photoFile);
      } else if (!editingTenant && !photoPreview) {
        warning('Por favor, suba una foto de perfil');
        return;
      }

      let documentoUrl: string | undefined = editingTenant?.documentoUrl;
      if (documentFile) {
        documentoUrl = await readFileAsDataURL(documentFile);
      }

      const tenantData = {
        nombre_completo: formData.get('nombre_completo') as string,
        documento_id: formData.get('documento_id') as string,
        email: formData.get('email') as string,
        telefono: formData.get('telefono') as string,
        fotoUrl,
        documentoUrl,
      };

      if (editingTenant) {
        updateTenant({ ...editingTenant, ...tenantData });
        success('Inquilino actualizado exitosamente');
        setShowAddForm(false);
      } else {
        const result = await addTenant(tenantData);
        if (result) {
          setCreatedTenantData(result);
          // NO cerrar el formulario aquí - se cierra cuando el usuario cierre el modal
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      showError('Hubo un error al procesar los archivos');
    }
  };

  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowAddForm(true);
  };

  const handleAddNewClick = () => {
    setEditingTenant(null);
    setShowAddForm(true);
  };

  if (showAddForm) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {editingTenant ? 'Editar' : 'Agregar Nuevo'} Inquilino
        </h2>
        <form onSubmit={handleSaveTenant} className="space-y-6">
          <div className="flex items-center space-x-6">
            {photoPreview ? (
              <img
                className="h-20 w-20 rounded-full object-cover"
                src={photoPreview}
                alt="Avatar preview"
              />
            ) : (
              <span className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                <svg
                  className="h-full w-full text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            )}
            <label
              htmlFor="photo-upload"
              className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>{editingTenant ? 'Cambiar' : 'Subir'} foto de perfil</span>
              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handlePhotoChange}
                required={!editingTenant}
              />
            </label>
          </div>
          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre_completo"
              id="nombre_completo"
              defaultValue={editingTenant?.nombre_completo}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="documento_id" className="block text-sm font-medium text-gray-700">
              Documento de Identidad (Nro)
            </label>
            <input
              type="text"
              name="documento_id"
              id="documento_id"
              defaultValue={editingTenant?.documento_id}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="document-upload" className="block text-sm font-medium text-gray-700">
              Subir Documento de Identidad (Archivo)
            </label>
            {editingTenant?.documentoUrl && !documentFile && (
              <div className="text-sm text-gray-500 mt-1">
                <a
                  href={editingTenant.documentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Ver documento actual
                </a>
              </div>
            )}
            <div className="mt-1 flex items-center">
              <label className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <span>{editingTenant?.documentoUrl ? 'Reemplazar' : 'Seleccionar'} archivo</span>
                <input
                  id="document-upload"
                  name="document-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentChange}
                />
              </label>
              {documentFile && (
                <span className="ml-3 text-sm text-gray-500 truncate">{documentFile.name}</span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              defaultValue={editingTenant?.email}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              id="telefono"
              defaultValue={editingTenant?.telefono}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      {/* Modal for showing created tenant details */}
      {createdTenantData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-green-600">
                  ✓ Inquilino Creado Exitosamente
                </h2>
                <button
                  onClick={() => {
                    setCreatedTenantData(null);
                    setShowAddForm(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Profile Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-6">
                  <img
                    src={createdTenantData.tenant.fotoUrl}
                    alt={createdTenantData.tenant.nombre_completo}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {createdTenantData.tenant.nombre_completo}
                    </h3>
                    <p className="text-gray-600">{createdTenantData.tenant.email}</p>
                    <p className="text-gray-600">{createdTenantData.tenant.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Documento de Identidad</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {createdTenantData.tenant.documento_id}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {new Date(createdTenantData.tenant.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Temporary Password - Highlighted */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-yellow-900 mb-2">
                      Contraseña Temporal
                    </h4>
                    <div className="bg-white rounded p-3 mb-3 border border-yellow-200">
                      <code className="text-2xl font-mono font-bold text-gray-800 select-all">
                        {createdTenantData.temporaryPassword}
                      </code>
                    </div>
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Importante:</strong> Comparta esta contraseña con el inquilino.
                      El inquilino podrá cambiarla después de iniciar sesión por primera vez.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              {createdTenantData.tenant.documentoUrl && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Documento de Identidad</h4>
                  <div className="border rounded-lg overflow-hidden">
                    {createdTenantData.tenant.documentoUrl.startsWith('data:image') ? (
                      <img
                        src={createdTenantData.tenant.documentoUrl}
                        alt="Documento de Identidad"
                        className="w-full h-auto"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 text-center">
                        <p className="text-gray-600">Documento PDF adjunto</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(createdTenantData.temporaryPassword);
                    success('Contraseña copiada al portapapeles');
                  }}
                >
                  📋 Copiar Contraseña
                </Button>
                <Button variant="primary" onClick={() => {
                  setCreatedTenantData(null);
                  setShowAddForm(false);
                }}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Inquilinos</h1>
          <Button variant="primary" onClick={handleAddNewClick} className="w-full sm:w-auto">
            + Agregar Inquilino
          </Button>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1">
                  <img
                    className="h-14 w-14 rounded-full object-cover flex-shrink-0"
                    src={tenant.fotoUrl}
                    alt={tenant.nombre_completo}
                  />
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {tenant.nombre_completo}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Doc: {tenant.documento_id}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{tenant.email}</p>
                    <p className="text-sm text-gray-600">{tenant.telefono}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditClick(tenant)}
                  className="text-primary hover:text-blue-700 font-medium text-sm ml-2 flex-shrink-0"
                >
                  Editar
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop Table View */}
        <Card className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Documento
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contacto
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Editar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={tenant.fotoUrl}
                            alt={tenant.nombre_completo}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tenant.nombre_completo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tenant.documento_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tenant.email}</div>
                      <div className="text-sm text-gray-500">{tenant.telefono}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(tenant)}
                        className="text-primary hover:text-blue-700"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
};
