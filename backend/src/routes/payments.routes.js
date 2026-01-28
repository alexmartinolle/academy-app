import express from 'express';
import {
  getStudentPayments,
  addPayment,
  modifyPayment,
  removePayment,
  getMonthlyPayments,
  getRevenueStats,
  getYearlyRevenueStats
} from '../controllers/payments.controller.js';

const router = express.Router();

router.get('/student/:studentId', getStudentPayments);
router.get('/month/:year/:month', getMonthlyPayments);
router.get('/revenue/:year/:month', getRevenueStats);
router.get('/revenue/year/:year', getYearlyRevenueStats);
router.post('/', addPayment);
router.put('/:id', modifyPayment);
router.delete('/:id', removePayment);

export default router;