import { apiClient } from './api';
import { Modality } from '../types';

class ModalityService {
  // Get modalities with stats
  async getModalitiesWithStats(): Promise<{ success: boolean; data: (Modality & { plan_count: number; student_count: number })[] }> {
    const response = await apiClient.get<(Modality & { plan_count: number; student_count: number })[]>('/modalities?include_stats=true');
    return {
      success: response.success,
      data: response.data || []
    };
  }

  // Get all modalities
  async getModalities(): Promise<{ success: boolean; data: Modality[] }> {
    const response = await apiClient.get<Modality[]>('/modalities');
    return {
      success: response.success,
      data: response.data || []
    };
  }

  // Get modality by ID
  async getModalityById(id: number): Promise<Modality> {
    const response = await apiClient.get<Modality>(`/modalities/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Modality not found');
  }

  // Create new modality
  async createModality(modalityData: {
    name: string;
    active: boolean;
  }): Promise<Modality> {
    const response = await apiClient.post<Modality>('/modalities', modalityData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create modality');
  }

  // Update modality
  async updateModality(id: number, modalityData: {
    name?: string;
    active?: boolean;
  }): Promise<Modality> {
    const response = await apiClient.put<Modality>(`/modalities/${id}`, modalityData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update modality');
  }

  // Delete modality
  async deleteModality(id: number): Promise<void> {
    const response = await apiClient.delete(`/modalities/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete modality');
    }
  }

  // Get active modalities
  async getActiveModalities(): Promise<Modality[]> {
    const response = await apiClient.get<Modality[]>('/modalities?active=true');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }
}

export default new ModalityService();
