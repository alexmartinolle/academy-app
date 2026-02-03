const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { validate, schemas } = require('../utils/validation');

// GET /api/stats/dashboard - Main dashboard KPIs
router.get('/dashboard',
  validate(schemas.stats.dashboard),
  statsController.getDashboardStats
);

// GET /api/stats/revenue - Revenue statistics
router.get('/revenue',
  validate(schemas.stats.revenue, 'query'),
  statsController.getRevenueStats
);

// GET /api/stats/students - Student statistics
router.get('/students',
  validate(schemas.stats.students, 'query'),
  statsController.getStudentStats
);

// GET /api/stats/growth - Growth trends
router.get('/growth',
  validate(schemas.stats.growth, 'query'),
  statsController.getGrowthStats
);

// GET /api/stats/plans - Plan distribution statistics
router.get('/plans',
  statsController.getPlanStats
);

// GET /api/stats/modalities - Modality statistics
router.get('/modalities',
  statsController.getModalityStats
);

// GET /api/stats/retention - Cohort retention analysis
router.get('/retention',
  statsController.getRetentionStats
);

// GET /api/stats/payments - Payment method statistics
router.get('/payments',
  statsController.getPaymentStats
);

module.exports = router;
