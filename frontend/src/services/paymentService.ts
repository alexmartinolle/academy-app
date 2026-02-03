import api from './api';
import { Payment, PaymentFilters, PaginatedResponse, CreatePaymentRequest } from '../types';

class PaymentService {
  // Get all payments with pagination and filters
  async getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      sort_by: filters?.sort_by || 'payment_date',
      sort_order: filters?.sort_order || 'desc',
      ...(filters?.id_student && { id_student: filters.id_student }),
      ...(filters?.payment_method && { payment_method: filters.payment_method }),
      ...(filters?.date_from && { date_from: filters.date_from }),
      ...(filters?.date_to && { date_to: filters.date_to }),
      ...(filters?.min_amount && { min_amount: filters.min_amount }),
      ...(filters?.max_amount && { max_amount: filters.max_amount }),
    };

    return api.getPaginated<Payment>('/payments', params);
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Payment not found');
  }

  // Create new payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    const response = await api.post<Payment>('/payments', paymentData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create payment');
  }

  // Get student payment history
  async getStudentPaymentHistory(studentId: number): Promise<Payment[]> {
    const response = await api.get<Payment[]>(`/payments/student/${studentId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get student payment history');
  }

  // Get payment methods summary
  async getPaymentMethodsSummary(): Promise<any[]> {
    const response = await api.get<any[]>('/payments/methods/summary');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get payment methods summary');
  }

  // Get daily revenue
  async getDailyRevenue(dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params = {
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    };

    const response = await api.get<any[]>('/payments/revenue/daily', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get daily revenue');
  }

  // Get monthly revenue
  async getMonthlyRevenue(dateFrom?: string, dateTo?: string): Promise<any[]> {
    const params = {
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    };

    const response = await api.get<any[]>('/payments/revenue/monthly', params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get monthly revenue');
  }
}

export default new PaymentService();
