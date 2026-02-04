import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, UserIcon, CreditCardIcon, CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PencilIcon } from '@heroicons/react/24/outline';
import { formatDate, formatRelativeTime, formatCurrency } from '../utils/formatters';
import { Student, StudentPlan, Payment } from '../types';
import studentService from '../services/studentService';
import paymentService from '../services/paymentService';
import StudentModal from '../components/modals/StudentModal';
import ChangePlanModal from '../components/modals/ChangePlanModal';

interface StudentDetailsProps {}

const StudentDetails: React.FC<StudentDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const studentId = parseInt(id || '0');

  // Modal states
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);

  // Get student details
  const { data: studentData, isLoading: studentLoading, error: studentError } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId),
    enabled: !!studentId,
  });

  // Get student plans with more aggressive refetching
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useQuery({
    queryKey: ['student-plans', studentId],
    queryFn: () => studentService.getStudentPlans(studentId),
    enabled: !!studentId,
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true,
  });

  // Get student payments
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['student-payments', studentId],
    queryFn: () => paymentService.getPayments({ id_student: studentId, page: 1, limit: 10 }),
    enabled: !!studentId,
  });

  const student = studentData?.data;
  const plans = plansData?.data || [];
  const payments = paymentsData?.data || [];
  const currentPlan = plans.find(plan => plan.active);

  const isLoading = studentLoading || plansLoading || paymentsLoading;

  // Modal handlers
  const handleEditStudent = () => {
    setIsEditStudentModalOpen(true);
  };

  const handleChangePlan = () => {
    setIsChangePlanModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Force refetch all student-related data
    queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    queryClient.invalidateQueries({ queryKey: ['student-plans', studentId] });
    queryClient.invalidateQueries({ queryKey: ['student-payments', studentId] });
    
    // Also refetch plans to ensure we have latest data
    queryClient.invalidateQueries({ queryKey: ['plans'] });
    
    // Force immediate refetch
    refetchPlans();
    
    console.log('Data refetched after modal success');
  };

  // Early returns after hooks
  if (!id || isNaN(studentId)) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-6">The student ID provided is invalid.</p>
          <button
            onClick={() => navigate('/students')}
            className="btn btn-primary"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (studentError || !student) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load student information.</p>
          <button
            onClick={() => navigate('/students')}
            className="btn btn-primary"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'overdue':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/students')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="page-title">Student Details</h1>
              <p className="page-description">
                Complete information for {student.first_name} {student.last_name}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleEditStudent}
              className="btn btn-outline"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Student
            </button>
            <button
              onClick={handleChangePlan}
              className="btn btn-primary"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Change Plan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900">{student.first_name} {student.last_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{student.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900 capitalize">{student.type}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                <p className="text-sm text-gray-900">
                  {formatDate(student.enrollment_date)}
                  {student.enrollment_date && (
                    <span className="text-gray-500 ml-2">
                      ({formatRelativeTime(student.enrollment_date)})
                    </span>
                  )}
                </p>
              </div>
              
              {student.cancellation_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cancellation Date</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(student.cancellation_date)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Plan and Payment Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-8 w-8 text-gray-400 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Current Plan</h2>
            </div>
            
            {currentPlan ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Plan Name</label>
                    <p className="text-sm text-gray-900">{currentPlan.plan_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <p className="text-sm text-gray-900 capitalize">{currentPlan.plan_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Frequency</label>
                    <p className="text-sm text-gray-900 capitalize">{currentPlan.plan_frequency?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Price</label>
                    <p className="text-sm text-gray-900">{formatCurrency(currentPlan.monthly_price)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Modalities</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentPlan.modalities?.map((modality: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {modality}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-sm text-gray-900">{formatDate(currentPlan.start_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-sm text-gray-900">
                      {currentPlan.end_date ? formatDate(currentPlan.end_date) : 'Ongoing'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No active plan found</p>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-8 w-8 text-gray-400 mr-3" />
              <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
            </div>
            
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment: Payment) => (
                      <tr key={payment.id_payment}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.period_start)} - {formatDate(payment.period_end)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {payment.payment_method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No payment history found</p>
            )}
          </div>

          {/* Payment Status Summary */}
          {student.last_payment_date && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="h-8 w-8 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Payment Status</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Payment</label>
                  <p className="text-sm text-gray-900">{formatDate(student.last_payment_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Period End</label>
                  <p className="text-sm text-gray-900">{formatDate(student.last_payment_period_end)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Required</label>
                  <p className="text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.payment_required 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {student.payment_required ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Days Since Last Payment</label>
                  <p className="text-sm text-gray-900">{student.days_since_last_payment} days</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Paid Ever</label>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(parseFloat(student.total_paid_ever || '0'))}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Payments</label>
                    <p className="text-sm font-medium text-gray-900">{student.total_payments_count || '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isEditStudentModalOpen}
        onClose={() => setIsEditStudentModalOpen(false)}
        student={student}
        onSuccess={handleModalSuccess}
      />

      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        studentId={studentId}
        studentType={student.type}
        currentPlanId={currentPlan?.id_plan}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default StudentDetails;
