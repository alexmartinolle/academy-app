import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import statsService from '../services/statsService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => statsService.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          Error loading dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  const kpis = [
    {
      name: 'Active Students',
      value: stats?.active_students || 0,
      icon: UserGroupIcon,
      color: 'bg-success-500',
      change: stats?.new_students_this_month || 0,
      changeText: 'new this month',
    },
    {
      name: 'Monthly Revenue',
      value: formatCurrency(stats?.current_month_revenue || 0),
      icon: CurrencyDollarIcon,
      color: 'bg-primary-500',
      change: ((stats?.current_month_revenue || 0) - (stats?.previous_month_revenue || 0)),
      changeText: 'vs last month',
      isCurrency: true,
    },
    {
      name: 'Payment Pending',
      value: stats?.payment_pending || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-warning-500',
      change: 0,
      changeText: 'students',
    },
    {
      name: 'Potential Revenue',
      value: formatCurrency(stats?.monthly_potential_revenue || 0),
      icon: ArrowTrendingUpIcon,
      color: 'bg-secondary-500',
      change: 0,
      changeText: 'monthly',
      isCurrency: true,
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome back! Here's an overview of your academy's performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {kpi.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-black">
                        {kpi.value}
                      </div>
                      {kpi.change !== 0 && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          kpi.change > 0 ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {kpi.change > 0 && '+'}
                          {kpi.isCurrency ? formatCurrency(kpi.change) : formatNumber(kpi.change)}
                          <span className="ml-1 text-gray-500">{kpi.changeText}</span>
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Revenue</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(stats?.today_revenue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg. Payment</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(stats?.avg_payment_this_month || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cancelled This Month</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.cancelled_this_month || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Students This Month</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.new_students_this_month || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Student Status Overview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-success-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.active_students || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-warning-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Payment Pending</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.payment_pending || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-gray-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Inactive</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.inactive_students || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
