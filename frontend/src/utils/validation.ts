import { isValidEmail, isValidPhone } from './formatters';

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

// Name validation
export const validateName = (name: string, fieldName = 'Name'): string | null => {
  if (!name) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.trim().length > 50) {
    return `${fieldName} cannot exceed 50 characters`;
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
};

// Phone validation
export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  if (!isValidPhone(phone)) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

// Amount validation
export const validateAmount = (amount: string, fieldName = 'Amount'): string | null => {
  if (!amount) {
    return `${fieldName} is required`;
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (numAmount <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  
  if (numAmount > 999999.99) {
    return `${fieldName} cannot exceed $999,999.99`;
  }
  
  return null;
};

// Date validation
export const validateDate = (date: string, fieldName = 'Date'): string | null => {
  if (!date) {
    return `${fieldName} is required`;
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  // Check if date is not in the future for past dates
  const now = new Date();
  if (dateObj > now) {
    return `${fieldName} cannot be in the future`;
  }
  
  // Check if date is not too far in the past
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 100);
  if (dateObj < minDate) {
    return `${fieldName} cannot be more than 100 years ago`;
  }
  
  return null;
};

// Date range validation
export const validateDateRange = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) {
    return 'Both start and end dates are required';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return 'End date must be after start date';
  }
  
  // Check if range is reasonable (not more than 1 year)
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  if (end.getTime() - start.getTime() > maxRange) {
    return 'Date range cannot exceed 1 year';
  }
  
  return null;
};

// Select validation
export const validateSelect = (value: string, fieldName = 'Selection'): string | null => {
  if (!value) {
    return `${fieldName} is required`;
  }
  
  if (value === 'select' || value === '') {
    return `Please select a ${fieldName.toLowerCase()}`;
  }
  
  return null;
};

// Text validation
export const validateText = (text: string, options: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  fieldName?: string;
} = {}): string | null => {
  const {
    required = true,
    minLength = 1,
    maxLength = 1000,
    fieldName = 'Field'
  } = options;
  
  if (!text) {
    return required ? `${fieldName} is required` : null;
  }
  
  if (text.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long`;
  }
  
  if (text.trim().length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  
  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 128) {
    return 'Password cannot exceed 128 characters';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character';
  }
  
  return null;
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
  if (!confirmation) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmation) {
    return 'Passwords do not match';
  }
  
  return null;
};

// Student form validation
export const validateStudentForm = (formData: {
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  enrollment_date?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const firstNameError = validateName(formData.first_name, 'First name');
  if (firstNameError) errors.first_name = firstNameError;
  
  const lastNameError = validateName(formData.last_name, 'Last name');
  if (lastNameError) errors.last_name = lastNameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const typeError = validateSelect(formData.type, 'Student type');
  if (typeError) errors.type = typeError;
  
  if (formData.enrollment_date) {
    const dateError = validateDate(formData.enrollment_date, 'Enrollment date');
    if (dateError) errors.enrollment_date = dateError;
  }
  
  return errors;
};

// Payment form validation
export const validatePaymentForm = (formData: {
  id_student: string;
  id_plan: string;
  payment_date: string;
  period_start: string;
  period_end: string;
  total_amount: string;
  payment_method: string;
  observations?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const studentError = validateSelect(formData.id_student, 'Student');
  if (studentError) errors.id_student = studentError;
  
  const planError = validateSelect(formData.id_plan, 'Plan');
  if (planError) errors.id_plan = planError;
  
  const dateError = validateDate(formData.payment_date, 'Payment date');
  if (dateError) errors.payment_date = dateError;
  
  const periodStartError = validateDate(formData.period_start, 'Period start');
  if (periodStartError) errors.period_start = periodStartError;
  
  const periodEndError = validateDate(formData.period_end, 'Period end');
  if (periodEndError) errors.period_end = periodEndError;
  
  const rangeError = validateDateRange(formData.period_start, formData.period_end);
  if (rangeError) errors.period_range = rangeError;
  
  const amountError = validateAmount(formData.total_amount, 'Payment amount');
  if (amountError) errors.total_amount = amountError;
  
  const methodError = validateSelect(formData.payment_method, 'Payment method');
  if (methodError) errors.payment_method = methodError;
  
  if (formData.observations) {
    const obsError = validateText(formData.observations, {
      required: false,
      maxLength: 500,
      fieldName: 'Observations'
    });
    if (obsError) errors.observations = obsError;
  }
  
  return errors;
};

// Search validation
export const validateSearch = (search: string): string | null => {
  if (search && search.trim().length < 2) {
    return 'Search term must be at least 2 characters long';
  }
  
  if (search && search.trim().length > 100) {
    return 'Search term cannot exceed 100 characters';
  }
  
  return null;
};

// Pagination validation
export const validatePagination = (page: string, limit: string): { page?: number; limit?: number; error?: string } => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return { error: 'Page must be a positive number' };
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return { error: 'Limit must be between 1 and 100' };
  }
  
  return { page: pageNum, limit: limitNum };
};
