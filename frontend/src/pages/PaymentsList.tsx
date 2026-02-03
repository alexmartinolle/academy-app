import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import paymentService from '../services/paymentService';
import { formatDate, formatCurrency, getPaymentMethodText } from '../utils/formatters';
import { Payment, PaymentFilters } from '../types';

const PaymentsList: React.FC = () => {
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
    sort_by: 'payment_date',
    sort_order: 'desc',
  });

  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentService.getPayments(filters),
  });

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilter = (key: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
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
          Error loading payments. Please try again later.
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
            <h1 className="page-title">Payments</h1>
            <p className="page-description">
              Manage and track all payment records.
            </p>
          </div>
          <button className="btn btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Search payments..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Payment Method Filter */}
            <select
              className="form-input"
              value={filters.payment_method || ''}
              onChange={(e) => handleFilter('payment_method', e.target.value || undefined)}
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
              <option value="card">Credit Card</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              className="form-input"
              value={filters.date_from || ''}
              onChange={(e) => handleFilter('date_from', e.target.value || undefined)}
              placeholder="From date"
            />

            {/* Date To */}
            <input
              type="date"
              className="form-input"
              value={filters.date_to || ''}
              onChange={(e) => handleFilter('date_to', e.target.value || undefined)}
              placeholder="To date"
            />

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
              <option value="payment_date-desc">Newest First</option>
              <option value="payment_date-asc">Oldest First</option>
              <option value="total_amount-desc">Highest Amount</option>
              <option value="total_amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Student</th>
                <th className="table-header-cell">Plan</th>
                <th className="table-header-cell">Amount</th>
                <th className="table-header-cell">Method</th>
                <th className="table-header-cell">Payment Date</th>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {paymentsData?.data?.map((payment: Payment) => (
                <tr key={payment.id_payment} className="table-row">
                  <td className="table-cell">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.first_name} {payment.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{payment.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {payment.plan_name}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.total_amount)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      {payment.payment_method === 'cash' && <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />}
                      {payment.payment_method === 'transfer' && <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />}
                      {payment.payment_method === 'card' && <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />}
                      <span className="text-sm text-gray-900">
                        {getPaymentMethodText(payment.payment_method)}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      <div>{formatDate(payment.period_start)}</div>
                      <div className="text-xs text-gray-500">to {formatDate(payment.period_end)}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paymentsData?.pagination && (
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
                onClick={() => handlePageChange(Math.min(paymentsData.pagination.totalPages, filters.page! + 1))}
                disabled={filters.page === paymentsData.pagination.totalPages}
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
                    {Math.min(filters.page! * filters.limit!, paymentsData.pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{paymentsData.pagination.total}</span> results
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
                    onClick={() => handlePageChange(Math.min(paymentsData.pagination.totalPages, filters.page! + 1))}
                    disabled={filters.page === paymentsData.pagination.totalPages}
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
    </div>
  );
};

export default PaymentsList;
