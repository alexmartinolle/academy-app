import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency, getPlanFrequencyText } from '../utils/formatters';
import { Plan } from '../types';
import planService from '../services/planService';
import PlanModal from '../components/modals/PlanModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

const PlansList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const queryClient = useQueryClient();

  const { data: plansData, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getPlansWithStats(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: planService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsDeleteModalOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      console.error('Failed to delete plan:', error);
    },
  });

  // Modal handlers
  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPlan) {
      deleteMutation.mutate(selectedPlan.id_plan);
    }
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['plans'] });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Plans</h1>
            <p className="page-description">
              Manage subscription plans and pricing.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleCreatePlan}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Plan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Plan Name</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Frequency</th>
                <th className="table-header-cell">Price</th>
                <th className="table-header-cell">Students</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {plansData?.data?.map((plan: Plan) => (
                <tr key={plan.id_plan} className="table-row">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {plan.name}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900 capitalize">
                      {plan.type}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {getPlanFrequencyText(plan.frequency)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(plan.monthly_price)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {(plan as any).student_count || 0}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit Plan"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Plan"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-gray-500">
                    No plans found. Click "Add Plan" to create your first plan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <PlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        plan={selectedPlan}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Plan"
        message="Are you sure you want to delete this plan? This action cannot be undone."
        itemName={selectedPlan ? selectedPlan.name : ''}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default PlansList;
