import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modality } from '../types';
import modalityService from '../services/modalityService';
import ModalityModal from '../components/modals/ModalityModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

const ModalitiesList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedModality, setSelectedModality] = useState<Modality | null>(null);

  const queryClient = useQueryClient();

  const { data: modalitiesData, isLoading, error } = useQuery({
    queryKey: ['modalities'],
    queryFn: () => modalityService.getModalitiesWithStats(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: modalityService.deleteModality,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalities'] });
      setIsDeleteModalOpen(false);
      setSelectedModality(null);
    },
    onError: (error: any) => {
      console.error('Failed to delete modality:', error);
    },
  });

  // Modal handlers
  const handleCreateModality = () => {
    setSelectedModality(null);
    setIsCreateModalOpen(true);
  };

  const handleEditModality = (modality: Modality) => {
    setSelectedModality(modality);
    setIsEditModalOpen(true);
  };

  const handleDeleteModality = (modality: Modality) => {
    setSelectedModality(modality);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedModality) {
      deleteMutation.mutate(selectedModality.id_modality);
    }
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['modalities'] });
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
            <h1 className="page-title">Modalities</h1>
            <p className="page-description">
              Manage training modalities and disciplines.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleCreateModality}>
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
              {modalitiesData?.data?.map((modality: Modality) => (
                <tr key={modality.id_modality} className="table-row">
                  <td className="table-cell">
                    <div className="text-sm font-medium text-gray-900">
                      {modality.name}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${modality.active ? 'badge-success' : 'badge-gray'}`}>
                      {modality.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {(modality as any).plan_count || 0}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {(modality as any).student_count || 0}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditModality(modality)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit Modality"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteModality(modality)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Modality"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-gray-500">
                    No modalities found. Click "Add Modality" to create your first modality.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ModalityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <ModalityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        modality={selectedModality}
        onSuccess={handleModalSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Modality"
        message="Are you sure you want to delete this modality? This action cannot be undone."
        itemName={selectedModality ? selectedModality.name : ''}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ModalitiesList;
