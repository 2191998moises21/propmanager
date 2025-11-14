import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Payment } from '@/types';

interface UploadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment;
  onUpload: (paymentId: string, proofUrl: string) => void;
}

export const UploadPaymentModal: React.FC<UploadPaymentModalProps> = ({ isOpen, onClose, payment, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const month = new Date(payment.mes_correspondiente).toLocaleDateString('es-ES', { month: 'long', year: 'numeric'});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !preview) {
      setError('Por favor, seleccione un archivo.');
      return;
    }
    onUpload(payment.id, preview);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Subir Comprobante de Pago - ${month}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <p className="text-sm text-gray-700 mb-2">Por favor, suba el comprobante de pago para el mes de <span className="font-bold capitalize">{month}</span> por un monto de <span className="font-bold">{new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(payment.monto_pago)}</span>.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Archivo del Comprobante</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {preview ? (
                <img src={preview} alt="Comprobante preview" className="mx-auto h-32 w-auto rounded-md" />
              ) : (
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="payment-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary px-1">
                      <span>Subir un archivo</span>
                      <input id="payment-upload" name="payment-upload" type="file" className="sr-only" accept="image/*,.pdf" onChange={handleFileChange} required />
                  </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 10MB</p>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Subir Comprobante
          </Button>
        </div>
      </form>
    </Modal>
  );
};