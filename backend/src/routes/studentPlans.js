const express = require('express');
const router = express.Router();
const studentPlanController = require('../controllers/studentPlanController');
const { validate, schemas } = require('../utils/validation');

// GET /api/student-plans - List student plans with pagination and filters
router.get('/',
  validate(schemas.studentPlan.list, 'query'),
  studentPlanController.getStudentPlans
);

// GET /api/student-plans/:id - Get student plan by ID
router.get('/:id',
  studentPlanController.getStudentPlanById
);

// POST /api/student-plans - Assign plan to student
router.post('/',
  validate(schemas.studentPlan.create),
  studentPlanController.createStudentPlan
);

// PUT /api/student-plans/:id - Update student plan
router.put('/:id',
  validate(schemas.studentPlan.update),
  studentPlanController.updateStudentPlan
);

// DELETE /api/student-plans/:id - Deactivate student plan
router.delete('/:id',
  studentPlanController.deleteStudentPlan
);

// GET /api/student-plans/student/:studentId - Get student plan history
router.get('/student/:studentId',
  studentPlanController.getStudentPlanHistory
);

// GET /api/student-plans/plan/:planId/students - Get students with specific plan
router.get('/plan/:planId/students',
  studentPlanController.getPlanStudents
);

module.exports = router;
