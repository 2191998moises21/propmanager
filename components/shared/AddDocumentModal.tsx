import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ContractDocument } from '../../types';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (document: ContractDocument) => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAddDocument }) => {
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!documentName.trim() || !file) {
      setError('Por favor, complete el nombre y seleccione un archivo.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      onAddDocument({
        nombre: documentName,
        url: reader.result as string,
      });
      handleClose();
    };
    reader.onerror = () => {
      setError('Error al leer el archivo.');
    };
  };

  const handleClose = () => {
    setDocumentName('');
    setFile(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Añadir Nuevo Documento" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
            Nombre del Documento
          </label>
          <input
            type="text"
            id="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Ej: Contrato Firmado"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Archivo</label>
          <div className="mt-1 flex items-center">
            <label className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span>Seleccionar archivo</span>
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                required
              />
            </label>
            {file && <span className="ml-3 text-sm text-gray-500 truncate">{file.name}</span>}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar Documento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
