import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency, getPlanFrequencyText } from '../utils/formatters';
import { Plan } from '../types';

const PlansList: React.FC = () => {
  const { data: plansData, isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      // Placeholder for plans service
      return { success: true, data: [] };
    },
  });

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
          <button className="btn btn-primary">
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
              <tr>
                <td colSpan={7} className="table-cell text-center text-gray-500">
                  No plans found. Click "Add Plan" to create your first plan.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlansList;
