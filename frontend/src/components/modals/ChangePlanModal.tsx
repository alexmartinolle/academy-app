import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import planService from '../../services/planService';
import studentService from '../../services/studentService';
import { Plan } from '../../types';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  studentType: 'adult' | 'kids';
  currentPlanId?: number;
  onSuccess: () => void;
}

const ChangePlanModal: React.FC<ChangePlanModalProps> = ({ 
  isOpen, 
  onClose, 
  studentId, 
  studentType,
  currentPlanId,
  onSuccess 
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAvailablePlans();
      setSelectedPlanId(currentPlanId?.toString() || '');
      setError('');
    }
  }, [isOpen, currentPlanId, studentType]);

  const loadAvailablePlans = async () => {
    try {
      const response = await planService.getPlansByType(studentType);
      setAvailablePlans(response);
    } catch (err) {
      setError('Failed to load available plans');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanId) {
      setError('Please select a plan');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Call backend to change student plan
      const result = await studentService.changeStudentPlan(studentId, parseInt(selectedPlanId));
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Change Student Plan</h3>
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
              <label className="form-label">Select New Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="form-input"
                required
              >
                <option value="">Choose a plan...</option>
                {availablePlans.map((plan) => (
                  <option 
                    key={plan.id_plan} 
                    value={plan.id_plan}
                    disabled={plan.id_plan === currentPlanId}
                  >
                    {plan.name} - {plan.type} - {plan.frequency.replace('_', ' ')} - ${plan.monthly_price}/month
                    {plan.id_plan === currentPlanId && ' (Current)'}
                  </option>
                ))}
              </select>
            </div>

            {availablePlans.length === 0 && (
              <div className="text-gray-500 text-sm">
                No {studentType} plans available. Please create {studentType} plans first.
              </div>
            )}
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
              disabled={isSubmitting || availablePlans.length === 0}
            >
              {isSubmitting ? 'Changing...' : 'Change Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePlanModal;
