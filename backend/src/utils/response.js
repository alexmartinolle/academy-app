/**
 * Standardized response utility functions
 */

// Success response
const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Error response
const error = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  });
};

// Paginated response
const paginated = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

// Created response
const created = (res, data, message = 'Resource created successfully') => {
  return success(res, data, message, 201);
};

// Updated response
const updated = (res, data, message = 'Resource updated successfully') => {
  return success(res, data, message, 200);
};

// Deleted response
const deleted = (res, message = 'Resource deleted successfully') => {
  return success(res, null, message, 200);
};

// Not found response
const notFound = (res, message = 'Resource not found') => {
  return error(res, message, 404);
};

// Bad request response
const badRequest = (res, message = 'Bad request', details = null) => {
  return error(res, message, 400, details);
};

// Unauthorized response
const unauthorized = (res, message = 'Unauthorized') => {
  return error(res, message, 401);
};

// Forbidden response
const forbidden = (res, message = 'Forbidden') => {
  return error(res, message, 403);
};

// Conflict response
const conflict = (res, message = 'Resource already exists', details = null) => {
  return error(res, message, 409, details);
};

// Validation error response
const validationError = (res, details) => {
  return error(res, 'Validation failed', 400, details);
};

module.exports = {
  success,
  error,
  paginated,
  created,
  updated,
  deleted,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  validationError
};
