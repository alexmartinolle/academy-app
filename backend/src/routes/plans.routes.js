import express from 'express';
import {
  getPlans,
  getPlan,
  addPlan,
  modifyPlan,
  removePlan
} from '../controllers/plans.controller.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/:id', getPlan);
router.post('/', addPlan);
router.put('/:id', modifyPlan);
router.delete('/:id', removePlan);

export default router;