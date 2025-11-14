
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Ticket, Property, Tenant } from '@/types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  tenant: Tenant;
  addTicket: (ticket: Omit<Ticket, 'id' | 'costo_estimado' | 'moneda' | 'urgencia' | 'estado' | 'fecha_creacion'>) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, property, tenant, addTicket }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPhotos: string[] = [];
      let filesProcessed = 0;

      if (files.length + photos.length > 5) {
        setError("Puede subir un máximo de 5 fotos.");
        return;
      }
      
      setError('');

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          newPhotos.push(reader.result as string);
          filesProcessed++;
          if (filesProcessed === files.length) {
            setPhotos(prev => [...prev, ...newPhotos]);
          }
        };
        // FIX: Explicitly cast file to Blob to resolve a type inference issue where 'file' was being treated as 'unknown'.
        reader.readAsDataURL(file as Blob);
      });
    }
  };
  
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Por favor, complete el título y la descripción.');
      return;
    }
    addTicket({
      propertyId: property.id,
      tenantId: tenant.id,
      titulo: title,
      descripcion: description,
      fotos: photos,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setPhotos([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nuevo Ticket de Mantenimiento" size="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Problema</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Ej: Fuga de agua en el baño"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Por favor, describa el problema con el mayor detalle posible."
            required
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subir Fotos (Opcional, máx 5)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-1">
                      <span>Seleccionar archivos</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
                  </label>
              </div>
            </div>
          </div>
          {photos.length > 0 && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img src={photo} alt={`preview ${index}`} className="w-full h-20 object-cover rounded"/>
                  <button type="button" onClick={() => removePhoto(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" type="button" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" type="submit">Enviar Ticket</Button>
        </div>
      </form>
    </Modal>
  );
};
