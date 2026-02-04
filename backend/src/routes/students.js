const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validate, schemas } = require('../utils/validation');

// GET /api/students - List students with pagination and filters
router.get('/', 
  validate(schemas.student.list, 'query'),
  studentController.getStudents
);

// GET /api/students/overdue - Get students with overdue payments
router.get('/overdue',
  studentController.getOverdueStudents
);

// GET /api/students/:id - Get student by ID
router.get('/:id',
  studentController.getStudentById
);

// POST /api/students - Create new student
router.post('/',
  validate(schemas.student.create),
  studentController.createStudent
);

// PUT /api/students/:id - Update student
router.put('/:id',
  validate(schemas.student.update),
  studentController.updateStudent
);

// DELETE /api/students/:id - Deactivate student (soft delete)
router.delete('/:id',
  studentController.deleteStudent
);

// GET /api/students/:id/payments - Get student payment history
router.get('/:id/payments',
  studentController.getStudentPayments
);

// GET /api/students/:id/plans - Get student plan history
router.get('/:id/plans',
  studentController.getStudentPlans
);

// POST /api/students/:id/change-plan - Change student plan
router.post('/:id/change-plan',
  validate(schemas.student.changePlan),
  studentController.changeStudentPlan
);

module.exports = router;
