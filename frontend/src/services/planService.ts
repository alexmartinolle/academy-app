import { apiClient } from './api';
import { Plan } from '../types';

class PlanService {
  // Get plans with student counts
  async getPlansWithStats(): Promise<{ success: boolean; data: (Plan & { student_count: number })[] }> {
    const response = await apiClient.get<(Plan & { student_count: number })[]>('/plans?include_stats=true');
    return {
      success: response.success,
      data: response.data || []
    };
  }

  // Get all plans
  async getPlans(): Promise<{ success: boolean; data: Plan[] }> {
    const response = await apiClient.get<Plan[]>('/plans');
    return {
      success: response.success,
      data: response.data || []
    };
  }

  // Get plan by ID
  async getPlanById(id: number): Promise<Plan> {
    const response = await apiClient.get<Plan>(`/plans/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Plan not found');
  }

  // Create new plan
  async createPlan(planData: {
    name: string;
    type: 'adult' | 'kids';
    frequency: '1_week' | '2_week' | 'unlimited';
    monthly_price: number;
    active: boolean;
  }): Promise<Plan> {
    const response = await apiClient.post<Plan>('/plans', planData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create plan');
  }

  // Update plan
  async updatePlan(id: number, planData: {
    name?: string;
    type?: 'adult' | 'kids';
    frequency?: '1_week' | '2_week' | 'unlimited';
    monthly_price?: number;
    active?: boolean;
  }): Promise<Plan> {
    const response = await apiClient.put<Plan>(`/plans/${id}`, planData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update plan');
  }

  // Delete plan
  async deletePlan(id: number): Promise<void> {
    const response = await apiClient.delete(`/plans/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete plan');
    }
  }

  // Get plans by type
  async getPlansByType(type: 'adult' | 'kids'): Promise<Plan[]> {
    const response = await apiClient.get<Plan[]>(`/plans?type=${type}`);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Get active plans
  async getActivePlans(): Promise<Plan[]> {
    const response = await apiClient.get<Plan[]>('/plans?active=true');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }
}

export default new PlanService();
