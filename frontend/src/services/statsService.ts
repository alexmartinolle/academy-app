import { apiClient } from './api';
import { DashboardStats } from '../types';

class StatsService {
  // Get dashboard KPIs
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/stats/dashboard');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get dashboard stats');
  }

  // Get revenue statistics
  async getRevenueStats(period?: string, dateFrom?: string, dateTo?: string, groupBy?: string): Promise<any[]> {
    const params = {
      ...(period && { period }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
      ...(groupBy && { group_by: groupBy }),
    };

    const response = await apiClient.get<any[]>('/stats/revenue', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get revenue stats');
  }

  // Get student statistics
  async getStudentStats(period?: string, groupBy?: string): Promise<any[]> {
    const params = {
      ...(period && { period }),
      ...(groupBy && { group_by: groupBy }),
    };

    const response = await apiClient.get<any[]>('/stats/students', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get student stats');
  }

  // Get growth trends
  async getGrowthStats(period?: string, dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params = {
      ...(period && { period }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    };

    const response = await apiClient.get<any[]>('/stats/growth', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get growth stats');
  }

  // Get plan distribution statistics
  async getPlanStats(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/stats/plans');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get plan stats');
  }

  // Get modality statistics
  async getModalityStats(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/stats/modalities');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get modality stats');
  }

  // Get cohort retention analysis
  async getRetentionStats(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/stats/retention');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get retention stats');
  }

  // Get payment method statistics
  async getPaymentStats(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/stats/payments');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get payment stats');
  }
}

export default new StatsService();
