const Joi = require('joi');

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s\-\(\)]+$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/
};

// Student validation schemas
const studentSchemas = {
  create: Joi.object({
    first_name: Joi.string().pattern(patterns.name).min(2).max(50).required(),
    last_name: Joi.string().pattern(patterns.name).min(2).max(50).required(),
    email: Joi.string().email().required(),
    type: Joi.string().valid('adult', 'kids').required(),
    enrollment_date: Joi.date().iso().max('now').optional(),
    cancellation_date: Joi.date().iso().min(Joi.ref('enrollment_date')).optional()
  }),
  
  update: Joi.object({
    first_name: Joi.string().pattern(patterns.name).min(2).max(50).optional(),
    last_name: Joi.string().pattern(patterns.name).min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    type: Joi.string().valid('adult', 'kids').optional(),
    status: Joi.string().valid('active', 'inactive', 'payment_pending').optional(),
    cancellation_date: Joi.date().iso().optional()
  }),
  
  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('active', 'inactive', 'payment_pending').optional(),
    type: Joi.string().valid('adult', 'kids').optional(),
    search: Joi.string().max(100).optional(),
    sort_by: Joi.string().valid('first_name', 'last_name', 'email', 'enrollment_date', 'status').default('last_name'),
    sort_order: Joi.string().valid('asc', 'desc').default('asc')
  }),

  changePlan: Joi.object({
    new_plan_id: Joi.number().integer().positive().required()
  })
};

// Plan validation schemas
const planSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    type: Joi.string().valid('adult', 'kids').required(),
    frequency: Joi.string().valid('1_week', '2_week', 'unlimited').required(),
    monthly_price: Joi.number().positive().precision(2).required(),
    modalities: Joi.array().items(Joi.number().integer().positive()).min(1).required()
  }),
  
  update: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    type: Joi.string().valid('adult', 'kids').optional(),
    frequency: Joi.string().valid('1_week', '2_week', 'unlimited').optional(),
    monthly_price: Joi.number().positive().precision(2).optional(),
    active: Joi.boolean().optional(),
    modalities: Joi.array().items(Joi.number().integer().positive()).optional()
  }),
  
  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    type: Joi.string().valid('adult', 'kids').optional(),
    frequency: Joi.string().valid('1_week', '2_week', 'unlimited').optional(),
    active: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    include_stats: Joi.string().valid('true', 'false').optional()
  })
};

// Payment validation schemas
const paymentSchemas = {
  create: Joi.object({
    id_student: Joi.number().integer().positive().required(),
    id_plan: Joi.number().integer().positive().required(),
    payment_date: Joi.date().iso().max('now').required(),
    period_start: Joi.date().iso().required(),
    period_end: Joi.date().iso().min(Joi.ref('period_start')).required(),
    total_amount: Joi.number().positive().precision(2).required(),
    payment_method: Joi.string().valid('cash', 'transfer', 'card').required(),
    observations: Joi.string().max(500).optional()
  }),
  
  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    id_student: Joi.number().integer().positive().optional(),
    payment_method: Joi.string().valid('cash', 'transfer', 'card').optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().min(Joi.ref('date_from')).optional(),
    min_amount: Joi.number().positive().optional(),
    max_amount: Joi.number().positive().min(Joi.ref('min_amount')).optional(),
    sort_by: Joi.string().valid('payment_date', 'total_amount', 'payment_method').default('payment_date'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Modality validation schemas
const modalitySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required()
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    active: Joi.boolean().optional()
  }),
  
  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    active: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    include_stats: Joi.string().valid('true', 'false').optional()
  })
};

// Student Plan validation schemas
const studentPlanSchemas = {
  create: Joi.object({
    id_student: Joi.number().integer().positive().required(),
    id_plan: Joi.number().integer().positive().required(),
    start_date: Joi.date().iso().max('now').required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).optional()
  }),
  
  update: Joi.object({
    end_date: Joi.date().iso().optional(),
    active: Joi.boolean().optional()
  }),
  
  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    id_student: Joi.number().integer().positive().optional(),
    active: Joi.boolean().optional(),
    sort_by: Joi.string().valid('start_date', 'end_date', 'active').default('start_date'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Statistics validation schemas
const statsSchemas = {
  dashboard: Joi.object({}), // No parameters needed
  
  revenue: Joi.object({
    period: Joi.string().valid('daily', 'monthly', 'yearly').default('monthly'),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().min(Joi.ref('date_from')).optional(),
    group_by: Joi.string().valid('type', 'method').optional()
  }),
  
  students: Joi.object({
    period: Joi.string().valid('current', '30days', '90days', '1year').default('current'),
    group_by: Joi.string().valid('type', 'status', 'plan').optional()
  }),
  
  growth: Joi.object({
    period: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly'),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().min(Joi.ref('date_from')).optional()
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return res.status(400).json({
        error: 'Validation Error',
        details
      });
    }
    
    // Replace request data with validated and cleaned data
    if (source === 'query') {
      req.query = value;
    } else if (source === 'params') {
      req.params = value;
    } else {
      req.body = value;
    }
    
    next();
  };
};

module.exports = {
  validate,
  schemas: {
    student: studentSchemas,
    plan: planSchemas,
    payment: paymentSchemas,
    modality: modalitySchemas,
    studentPlan: studentPlanSchemas,
    stats: statsSchemas
  },
  patterns
};
