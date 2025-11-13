import React, { useState, useEffect } from 'react';
import { Tenant } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface TenantsProps {
  tenants: Tenant[];
  addTenant: (tenant: Omit<Tenant, 'id'>) => void;
  updateTenant: (tenant: Tenant) => void;
}

export const Tenants: React.FC<TenantsProps> = ({ tenants, addTenant, updateTenant }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
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
  }

  const handleSaveTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
        let fotoUrl = editingTenant?.fotoUrl || '';
        if (photoFile) {
            fotoUrl = await readFileAsDataURL(photoFile);
        } else if (!editingTenant && !photoPreview) {
            alert('Por favor, suba una foto de perfil.');
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
        } else {
            addTenant(tenantData);
        }

        setShowAddForm(false);
    } catch (error) {
        console.error("Error processing files:", error);
        alert("Hubo un error al procesar los archivos.");
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
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{editingTenant ? 'Editar' : 'Agregar Nuevo'} Inquilino</h2>
        <form onSubmit={handleSaveTenant} className="space-y-6">
          <div className="flex items-center space-x-6">
              {photoPreview ? (
                  <img className="h-20 w-20 rounded-full object-cover" src={photoPreview} alt="Avatar preview" />
              ) : (
                  <span className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                      <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                  </span>
              )}
              <label htmlFor="photo-upload" className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <span>{editingTenant ? 'Cambiar' : 'Subir'} foto de perfil</span>
                  <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} required={!editingTenant}/>
              </label>
          </div>
          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input type="text" name="nombre_completo" id="nombre_completo" defaultValue={editingTenant?.nombre_completo} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="documento_id" className="block text-sm font-medium text-gray-700">Documento de Identidad (Nro)</label>
            <input type="text" name="documento_id" id="documento_id" defaultValue={editingTenant?.documento_id} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
          </div>
          <div>
              <label htmlFor="document-upload" className="block text-sm font-medium text-gray-700">
                  Subir Documento de Identidad (Archivo)
              </label>
              {editingTenant?.documentoUrl && !documentFile && (
                <div className="text-sm text-gray-500 mt-1">
                    <a href={editingTenant.documentoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver documento actual</a>
                </div>
              )}
              <div className="mt-1 flex items-center">
                  <label className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <span>{editingTenant?.documentoUrl ? 'Reemplazar' : 'Seleccionar'} archivo</span>
                      <input id="document-upload" name="document-upload" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentChange} />
                  </label>
                  {documentFile && <span className="ml-3 text-sm text-gray-500 truncate">{documentFile.name}</span>}
              </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" id="email" defaultValue={editingTenant?.email} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" name="telefono" id="telefono" defaultValue={editingTenant?.telefono} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Inquilinos</h1>
            <Button variant="primary" onClick={handleAddNewClick}>+ Agregar Inquilino</Button>
        </div>
        <Card>
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={tenant.fotoUrl} alt={tenant.nombre_completo} />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{tenant.nombre_completo}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.documento_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                 <div className="text-sm text-gray-900">{tenant.email}</div>
                                <div className="text-sm text-gray-500">{tenant.telefono}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEditClick(tenant)} className="text-primary hover:text-blue-700">Editar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
           </div>
        </Card>
    </div>
  );
};