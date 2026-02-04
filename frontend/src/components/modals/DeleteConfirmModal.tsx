import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{message}</p>
          
          {itemName && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">{itemName}</p>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
