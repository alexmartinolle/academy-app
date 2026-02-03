const { query } = require('../config/database');
const { success, paginated, notFound, conflict, badRequest } = require('../utils/response');

class StudentController {
  // GET /api/students - List students with pagination and filters (OPTIMIZED)
  async getStudents(req, res) {
    try {
      const { page, limit, status, type, search, sort_by, sort_order } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause using view columns
      const conditions = [];
      if (status) {
        conditions.push(`status = $${paramIndex++}`);
        queryParams.push(status);
      }
      if (type) {
        conditions.push(`type = $${paramIndex++}`);
        queryParams.push(type);
      }
      if (search) {
        conditions.push(`(first_name ILIKE $${paramIndex++} OR last_name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++})`);
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Get total count using optimized query
      const countQuery = `
        SELECT COUNT(*) as total
        FROM v_students_list
        ${whereClause}
      `;
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get students using optimized view - leverages all indexes
      const studentsQuery = `
        SELECT *
        FROM v_students_list
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(limit, offset);
      const result = await query(studentsQuery, queryParams);

      return paginated(res, result.rows, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      });

    } catch (error) {
      console.error('Error getting students:', error);
      return badRequest(res, 'Error retrieving students');
    }
  }

  // GET /api/students/overdue - Get students with overdue payments (OPTIMIZED)
  async getOverdueStudents(req, res) {
    try {
      // Use optimized view - leverages idx_payments_student_date and idx_students_status
      const overdueQuery = `
        SELECT *
        FROM v_students_overdue
        ORDER BY days_overdue DESC NULLS FIRST
      `;

      const result = await query(overdueQuery);
      return success(res, result.rows, 'Overdue students retrieved successfully');

    } catch (error) {
      console.error('Error getting overdue students:', error);
      return badRequest(res, 'Error retrieving overdue students');
    }
  }

  // GET /api/students/:id - Get student by ID
  async getStudentById(req, res) {
    try {
      const { id } = req.params;

      const studentQuery = `
        SELECT * FROM v_student_detail WHERE id_student = $1
      `;

      const result = await query(studentQuery, [id]);

      if (result.rows.length === 0) {
        return notFound(res, 'Student not found');
      }

      return success(res, result.rows[0], 'Student retrieved successfully');

    } catch (error) {
      console.error('Error getting student:', error);
      return badRequest(res, 'Error retrieving student');
    }
  }

  // POST /api/students - Create new student
  async createStudent(req, res) {
    try {
      const { first_name, last_name, email, type, enrollment_date } = req.body;

      // Check if email already exists
      const existingStudentQuery = `
        SELECT id_student FROM students WHERE email = $1
      `;
      const existingResult = await query(existingStudentQuery, [email]);

      if (existingResult.rows.length > 0) {
        return conflict(res, 'Student with this email already exists');
      }

      const createStudentQuery = `
        INSERT INTO students (first_name, last_name, email, type, enrollment_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await query(createStudentQuery, [
        first_name, last_name, email, type, enrollment_date || new Date().toISOString().split('T')[0]
      ]);

      return success(res, result.rows[0], 'Student created successfully', 201);

    } catch (error) {
      console.error('Error creating student:', error);
      if (error.code === '23505') {
        return conflict(res, 'Student with this email already exists');
      }
      return badRequest(res, 'Error creating student');
    }
  }

  // PUT /api/students/:id - Update student
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if student exists
      const existingStudentQuery = `
        SELECT id_student FROM students WHERE id_student = $1
      `;
      const existingResult = await query(existingStudentQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student not found');
      }

      // Check email uniqueness if updating email
      if (updates.email) {
        const emailCheckQuery = `
          SELECT id_student FROM students WHERE email = $1 AND id_student != $2
        `;
        const emailResult = await query(emailCheckQuery, [updates.email, id]);

        if (emailResult.rows.length > 0) {
          return conflict(res, 'Email already exists');
        }
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          updateFields.push(`${key} = $${paramIndex++}`);
          updateValues.push(updates[key]);
        }
      });

      if (updateFields.length === 0) {
        return badRequest(res, 'No fields to update');
      }

      updateValues.push(id); // Add id for WHERE clause

      const updateQuery = `
        UPDATE students 
        SET ${updateFields.join(', ')}
        WHERE id_student = $${paramIndex}
        RETURNING *
      `;

      const result = await query(updateQuery, updateValues);

      return success(res, result.rows[0], 'Student updated successfully');

    } catch (error) {
      console.error('Error updating student:', error);
      if (error.code === '23505') {
        return conflict(res, 'Email already exists');
      }
      return badRequest(res, 'Error updating student');
    }
  }

  // DELETE /api/students/:id - Deactivate student (soft delete)
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;

      // Check if student exists
      const existingStudentQuery = `
        SELECT id_student, status FROM students WHERE id_student = $1
      `;
      const existingResult = await query(existingStudentQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student not found');
      }

      if (existingResult.rows[0].status === 'inactive') {
        return badRequest(res, 'Student is already inactive');
      }

      // Soft delete by setting status to inactive and cancellation_date
      const deleteQuery = `
        UPDATE students 
        SET status = 'inactive', 
            cancellation_date = CURRENT_DATE
        WHERE id_student = $1
        RETURNING *
      `;

      const result = await query(deleteQuery, [id]);

      return success(res, result.rows[0], 'Student deactivated successfully');

    } catch (error) {
      console.error('Error deactivating student:', error);
      return badRequest(res, 'Error deactivating student');
    }
  }

  // GET /api/students/:id/payments - Get student payment history
  async getStudentPayments(req, res) {
    try {
      const { id } = req.params;

      // Check if student exists
      const existingStudentQuery = `
        SELECT id_student FROM students WHERE id_student = $1
      `;
      const existingResult = await query(existingStudentQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student not found');
      }

      const paymentsQuery = `
        SELECT * FROM v_student_payments_history 
        WHERE id_student = $1
        ORDER BY payment_date DESC
      `;

      const result = await query(paymentsQuery, [id]);

      return success(res, result.rows, 'Student payment history retrieved successfully');

    } catch (error) {
      console.error('Error getting student payments:', error);
      return badRequest(res, 'Error retrieving student payments');
    }
  }

  // GET /api/students/:id/plans - Get student plan history
  async getStudentPlans(req, res) {
    try {
      const { id } = req.params;

      // Check if student exists
      const existingStudentQuery = `
        SELECT id_student FROM students WHERE id_student = $1
      `;
      const existingResult = await query(existingStudentQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student not found');
      }

      const plansQuery = `
        SELECT * FROM v_student_plan_history 
        WHERE id_student = $1
        ORDER BY start_date DESC
      `;

      const result = await query(plansQuery, [id]);

      return success(res, result.rows, 'Student plan history retrieved successfully');

    } catch (error) {
      console.error('Error getting student plans:', error);
      return badRequest(res, 'Error retrieving student plans');
    }
  }
}

module.exports = new StudentController();
