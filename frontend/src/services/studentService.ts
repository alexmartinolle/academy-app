import api from './api';
import { Student, StudentFilters, PaginatedResponse, CreateStudentRequest, UpdateStudentRequest } from '../types';

class StudentService {
  // Get all students with pagination and filters
  async getStudents(filters?: StudentFilters): Promise<PaginatedResponse<Student>> {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      sort_by: filters?.sort_by || 'last_name',
      sort_order: filters?.sort_order || 'asc',
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.search && { search: filters.search }),
    };

    return api.getPaginated<Student>('/students', params);
  }

  // Get student by ID
  async getStudentById(id: number): Promise<Student> {
    const response = await api.get<Student>(`/students/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Student not found');
  }

  // Create new student
  async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    const response = await api.post<Student>('/students', studentData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create student');
  }

  // Update student
  async updateStudent(id: number, studentData: UpdateStudentRequest): Promise<Student> {
    const response = await api.put<Student>(`/students/${id}`, studentData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to update student');
  }

  // Deactivate student (soft delete)
  async deleteStudent(id: number): Promise<void> {
    const response = await api.delete(`/students/${id}`);
    if (!response.success) {
      throw new Error('Failed to delete student');
    }
  }

  // Get overdue students
  async getOverdueStudents(): Promise<Student[]> {
    const response = await api.get<Student[]>('/students/overdue');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get overdue students');
  }

  // Get student payment history
  async getStudentPaymentHistory(studentId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/students/${studentId}/payments`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get student payment history');
  }

  // Get student plan history
  async getStudentPlanHistory(studentId: number): Promise<any[]> {
    const response = await api.get<any[]>(`/students/${studentId}/plans`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to get student plan history');
  }
}

export default new StudentService();
