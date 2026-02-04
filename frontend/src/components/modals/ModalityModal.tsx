import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import modalityService from '../../services/modalityService';
import { Modality } from '../../types';

interface ModalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  modality?: Modality | null;
  onSuccess: () => void;
}

const ModalityModal: React.FC<ModalityModalProps> = ({ isOpen, onClose, modality, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (modality) {
      setFormData({
        name: modality.name,
        active: modality.active,
      });
    } else {
      setFormData({
        name: '',
        active: true,
      });
    }
    setError('');
  }, [modality, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (modality) {
        // Update existing modality
        await modalityService.updateModality(modality.id_modality, formData);
      } else {
        // Create new modality
        await modalityService.createModality(formData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save modality');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {modality ? 'Edit Modality' : 'Add New Modality'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="form-label">Modality Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : modality ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalityModal;
