import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import studentService from '../../services/studentService';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  onSuccess: () => void;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
  const [formData, setFormData] = useState<CreateStudentRequest>({
    first_name: '',
    last_name: '',
    email: '',
    type: 'adult',
    enrollment_date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        type: student.type,
        enrollment_date: student.enrollment_date.split('T')[0],
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        type: 'adult',
        enrollment_date: new Date().toISOString().split('T')[0],
      });
    }
    setError('');
  }, [student, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (student) {
        // Update existing student
        const updateData: UpdateStudentRequest = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          type: formData.type,
        };
        await studentService.updateStudent(student.id_student, updateData);
      } else {
        // Create new student
        await studentService.createStudent(formData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
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
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
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

            {!student && (
              <div>
                <label className="form-label">Enrollment Date</label>
                <input
                  type="date"
                  name="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            )}

            {student && (
              <div>
                <label className="form-label">Enrollment Date</label>
                <input
                  type="date"
                  name="enrollment_date"
                  value={formData.enrollment_date}
                  onChange={handleChange}
                  className="form-input"
                  disabled
                  title="Enrollment date cannot be modified"
                />
                <p className="text-xs text-gray-500 mt-1">Enrollment date cannot be modified</p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : student ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
