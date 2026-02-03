const express = require('express');
const router = express.Router();
const modalityController = require('../controllers/modalityController');
const { validate, schemas } = require('../utils/validation');

// GET /api/modalities - List modalities with pagination and filters
router.get('/',
  validate(schemas.modality.list, 'query'),
  modalityController.getModalities
);

// GET /api/modalities/:id - Get modality by ID
router.get('/:id',
  modalityController.getModalityById
);

// POST /api/modalities - Create new modality
router.post('/',
  validate(schemas.modality.create),
  modalityController.createModality
);

// PUT /api/modalities/:id - Update modality
router.put('/:id',
  validate(schemas.modality.update),
  modalityController.updateModality
);

// DELETE /api/modalities/:id - Deactivate modality
router.delete('/:id',
  modalityController.deleteModality
);

// GET /api/modalities/:id/plans - Get plans that include this modality
router.get('/:id/plans',
  modalityController.getModalityPlans
);

// GET /api/modalities/:id/students - Get students enrolled in plans with this modality
router.get('/:id/students',
  modalityController.getModalityStudents
);

module.exports = router;
