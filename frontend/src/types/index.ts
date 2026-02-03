// Base Types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Student Types
export interface Student extends BaseEntity {
  id_student: number;
  first_name: string;
  last_name: string;
  email: string;
  type: 'adult' | 'kids';
  status: 'active' | 'inactive' | 'payment_pending';
  enrollment_date: string;
  cancellation_date?: string;
}

// Plan Types
export interface Plan extends BaseEntity {
  id_plan: number;
  name: string;
  type: 'adult' | 'kids';
  frequency: '1_week' | '2_week' | 'unlimited';
  monthly_price: number;
  active: boolean;
  modalities?: string[];
}

// Payment Types
export interface Payment extends BaseEntity {
  id_payment: number;
  id_student: number;
  id_plan: number;
  payment_date: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  payment_method: 'cash' | 'transfer' | 'card';
  observations?: string;
}

// Modality Types
export interface Modality extends BaseEntity {
  id_modality: number;
  name: string;
  active: boolean;
}

// Student Plan Types
export interface StudentPlan extends BaseEntity {
  id_student_plan: number;
  id_student: number;
  id_plan: number;
  start_date: string;
  end_date?: string;
  active: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Types
export interface DashboardStats {
  active_students: number;
  payment_pending: number;
  inactive_students: number;
  current_month_revenue: number;
  previous_month_revenue: number;
  today_revenue: number;
  new_students_this_month: number;
  cancelled_this_month: number;
  monthly_potential_revenue: number;
  avg_payment_this_month: number;
}

// Form Types
export interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  email: string;
  type: 'adult' | 'kids';
  enrollment_date?: string;
}

export interface UpdateStudentRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  type?: 'adult' | 'kids';
  status?: 'active' | 'inactive' | 'payment_pending';
  cancellation_date?: string;
}

export interface CreatePaymentRequest {
  id_student: number;
  id_plan: number;
  payment_date: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  payment_method: 'cash' | 'transfer' | 'card';
  observations?: string;
}

// Filter Types
export interface StudentFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'payment_pending';
  type?: 'adult' | 'kids';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  id_student?: number;
  payment_method?: 'cash' | 'transfer' | 'card';
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: string;
  current?: boolean;
}

// UI State Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIState {
  loading: LoadingState;
  error?: string;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
  };
}
