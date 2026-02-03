const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validate, schemas } = require('../utils/validation');

// GET /api/payments - List payments with pagination and filters
router.get('/',
  validate(schemas.payment.list, 'query'),
  paymentController.getPayments
);

// GET /api/payments/:id - Get payment by ID
router.get('/:id',
  paymentController.getPaymentById
);

// POST /api/payments - Record new payment
router.post('/',
  validate(schemas.payment.create),
  paymentController.createPayment
);

// GET /api/payments/student/:studentId - Get student payment history
router.get('/student/:studentId',
  paymentController.getStudentPaymentHistory
);

// GET /api/payments/methods - Get payment methods summary
router.get('/methods/summary',
  paymentController.getPaymentMethodsSummary
);

// GET /api/payments/revenue/daily - Get daily revenue
router.get('/revenue/daily',
  paymentController.getDailyRevenue
);

// GET /api/payments/revenue/monthly - Get monthly revenue
router.get('/revenue/monthly',
  paymentController.getMonthlyRevenue
);

module.exports = router;
