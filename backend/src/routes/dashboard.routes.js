import express from 'express';
import {
  getDashboardStats,
  getStudentDistribution,
  getRevenueTrend,
  getPlanDistribution
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/students/distribution', getStudentDistribution);
router.get('/revenue/trend/:year?', getRevenueTrend);
router.get('/plans/distribution', getPlanDistribution);

export default router;
