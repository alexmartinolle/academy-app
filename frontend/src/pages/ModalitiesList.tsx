import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const ModalitiesList: React.FC = () => {
  const { data: modalitiesData, isLoading, error } = useQuery({
    queryKey: ['modalities'],
    queryFn: async () => {
      // Placeholder for modalities service
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
            <h1 className="page-title">Modalities</h1>
            <p className="page-description">
              Manage training modalities and disciplines.
            </p>
          </div>
          <button className="btn btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Modality
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Modality Name</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Plans</th>
                <th className="table-header-cell">Students</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              <tr>
                <td colSpan={5} className="table-cell text-center text-gray-500">
                  No modalities found. Click "Add Modality" to create your first modality.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModalitiesList;
