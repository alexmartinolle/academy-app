import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDate, formatRelativeTime, formatCurrency, getStudentTypeText, getStatusBadgeClass, getStatusText } from '../utils/formatters';
import { Student, StudentFilters } from '../types';
import studentService from '../services/studentService';
import StudentModal from '../components/modals/StudentModal';
import StudentDetailsModal from '../components/modals/StudentDetailsModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';

const StudentsList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10,
    sort_by: 'last_name',
    sort_order: 'asc',
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const queryClient = useQueryClient();

  const { data: studentsData, isLoading, error } = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getStudents(filters),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    },
    onError: (error: any) => {
      console.error('Failed to delete student:', error);
    },
  });

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilter = (key: keyof StudentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Modal handlers
  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setIsCreateModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id_student}`);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStudent) {
      deleteMutation.mutate(selectedStudent.id_student);
    }
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['students'] });
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

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          Error loading students. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-description">
              Manage your academy's students and their information.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleCreateStudent}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search students..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="form-input"
              value={filters.status || ''}
              onChange={(e) => handleFilter('status', e.target.value || undefined)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="payment_pending">Payment Pending</option>
            </select>

            {/* Type Filter */}
            <select
              className="form-input"
              value={filters.type || ''}
              onChange={(e) => handleFilter('type', e.target.value || undefined)}
            >
              <option value="">All Types</option>
              <option value="adult">Adult</option>
              <option value="kids">Kids</option>
            </select>

            {/* Sort */}
            <select
              className="form-input"
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(e) => {
                const [sort_by, sort_order] = e.target.value.split('-');
                handleFilter('sort_by', sort_by);
                handleFilter('sort_order', sort_order);
              }}
            >
              <option value="last_name-asc">Name (A-Z)</option>
              <option value="last_name-desc">Name (Z-A)</option>
              <option value="enrollment_date-desc">Newest First</option>
              <option value="enrollment_date-asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Student</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Enrollment Date</th>
                <th className="table-header-cell">Current Plan</th>
                <th className="table-header-cell">Last Payment</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {studentsData?.data?.map((student: Student) => (
                <tr key={student.id_student} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {getStudentTypeText(student.type)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                      {getStatusText(student.status)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {formatDate(student.enrollment_date)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {student.current_plan_name || 'No Plan'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {student.last_payment_date 
                        ? formatDate(student.last_payment_date)
                        : 'No payments'
                      }
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit Student"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Student"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {studentsData?.pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(studentsData.pagination?.totalPages || 1, filters.page! + 1))}
                disabled={filters.page === studentsData.pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(filters.page! - 1) * filters.limit! + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(filters.page! * filters.limit!, studentsData.pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{studentsData.pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, filters.page! - 1))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {filters.page}
                  </div>
                  <button
                    onClick={() => handlePageChange(Math.min(studentsData.pagination?.totalPages || 1, filters.page! + 1))}
                    disabled={filters.page === studentsData.pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <StudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
        onSuccess={handleModalSuccess}
      />

      <StudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        student={selectedStudent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        itemName={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default StudentsList;
