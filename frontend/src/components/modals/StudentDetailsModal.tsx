import React from 'react';
import { XMarkIcon, EnvelopeIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatDate, getStatusBadgeClass, getStatusText, getStudentTypeText } from '../../utils/formatters';
import { Student } from '../../types';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Student Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
                {student.first_name.charAt(0)}{student.last_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {student.first_name} {student.last_name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                    {getStatusText(student.status)}
                  </span>
                  <span className="badge badge-gray">
                    {getStudentTypeText(student.type)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{student.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Enrolled: {formatDate(student.enrollment_date)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Student ID: #{student.id_student}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Last Updated: {formatDate(student.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h5 className="text-md font-medium text-gray-900">Additional Information</h5>
            
            {student.current_plan_name && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h6 className="text-sm font-medium text-gray-700 mb-2">Current Plan</h6>
                <p className="text-sm text-gray-600">{student.current_plan_name}</p>
              </div>
            )}

            {student.last_payment_date && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h6 className="text-sm font-medium text-gray-700 mb-2">Last Payment</h6>
                <p className="text-sm text-gray-600">{formatDate(student.last_payment_date)}</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h6 className="text-sm font-medium text-gray-700 mb-2">System Information</h6>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  Created: {formatDate(student.created_at)}
                </p>
                <p className="text-sm text-gray-600">
                  Updated: {formatDate(student.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
