const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { validate, schemas } = require('../utils/validation');

// GET /api/plans - List plans with pagination and filters
router.get('/',
  validate(schemas.plan.list, 'query'),
  planController.getPlans
);

// GET /api/plans/:id - Get plan by ID
router.get('/:id',
  planController.getPlanById
);

// POST /api/plans - Create new plan
router.post('/',
  validate(schemas.plan.create),
  planController.createPlan
);

// PUT /api/plans/:id - Update plan (creates new record for price changes)
router.put('/:id',
  validate(schemas.plan.update),
  planController.updatePlan
);

// DELETE /api/plans/:id - Deactivate plan
router.delete('/:id',
  planController.deletePlan
);

// GET /api/plans/:id/modalities - Get plan modalities
router.get('/:id/modalities',
  planController.getPlanModalities
);

// POST /api/plans/:id/modalities - Add modalities to plan
router.post('/:id/modalities',
  planController.addPlanModalities
);

// DELETE /api/plans/:id/modalities/:modalityId - Remove modality from plan
router.delete('/:id/modalities/:modalityId',
  planController.removePlanModality
);

module.exports = router;
