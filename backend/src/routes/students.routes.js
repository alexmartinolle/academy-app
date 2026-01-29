import express from 'express';
import {
  getAllStudents,
  getStudent,
  addStudent,
  modifyStudent,
  removeStudent,
  getStudentsByStatusFilter,
  getInactiveStudentsList,
  getPendingPaymentsList,
  getPendingPaymentsStats
} from '../controllers/students.controller.js';

const router = express.Router();

router.get('/', getAllStudents);
router.get('/status/:status', getStudentsByStatusFilter);
router.get('/inactive', getInactiveStudentsList);
router.get('/pending-payments', getPendingPaymentsList);
router.get('/pending-payments/stats', getPendingPaymentsStats);
router.get('/:id', getStudent);
router.post('/', addStudent);
router.put('/:id', modifyStudent);
router.delete('/:id', removeStudent);

export default router;