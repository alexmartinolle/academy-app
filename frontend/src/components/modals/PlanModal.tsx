import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import planService from '../../services/planService';
import { Plan } from '../../types';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan | null;
  onSuccess: () => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'adult' as 'adult' | 'kids',
    frequency: '1_week' as '1_week' | '2_week' | 'unlimited',
    monthly_price: 0,
    active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        type: plan.type,
        frequency: plan.frequency,
        monthly_price: plan.monthly_price,
        active: plan.active,
      });
    } else {
      setFormData({
        name: '',
        type: 'adult',
        frequency: '1_week',
        monthly_price: 0,
        active: true,
      });
    }
    setError('');
  }, [plan, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (plan) {
        // Update existing plan
        await planService.updatePlan(plan.id_plan, formData);
      } else {
        // Create new plan
        await planService.createPlan(formData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save plan');
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
            {plan ? 'Edit Plan' : 'Add New Plan'}
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
              <label className="form-label">Plan Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="adult">Adult</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="form-label">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="1_week">1 Week</option>
                <option value="2_week">2 Weeks</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            <div>
              <label className="form-label">Monthly Price ($)</label>
              <input
                type="number"
                name="monthly_price"
                value={formData.monthly_price}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
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
              {isSubmitting ? 'Saving...' : plan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanModal;
