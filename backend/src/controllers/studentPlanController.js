const { query, transaction } = require('../config/database');
const { success, paginated, notFound, conflict, badRequest } = require('../utils/response');

class StudentPlanController {
  // GET /api/student-plans - List student plans with pagination and filters
  async getStudentPlans(req, res) {
    try {
      const { page, limit, id_student, active, sort_by, sort_order } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause
      if (id_student) {
        whereClause += ` AND sp.id_student = $${paramIndex++}`;
        queryParams.push(id_student);
      }
      if (active !== undefined) {
        whereClause += ` AND sp.active = $${paramIndex++}`;
        queryParams.push(active === 'true');
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM student_plan sp
        ${whereClause}
      `;
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get student plans with details
      const studentPlansQuery = `
        SELECT 
          sp.*,
          s.first_name,
          s.last_name,
          s.email,
          s.type as student_type,
          s.status as student_status,
          p.name as plan_name,
          p.type as plan_type,
          p.frequency as plan_frequency,
          p.monthly_price,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities,
          -- Duration calculations
          CASE 
            WHEN sp.end_date IS NOT NULL 
            THEN sp.end_date - sp.start_date
            ELSE CURRENT_DATE - sp.start_date
          END as plan_duration_days,
          -- Payment stats for this plan
          COALESCE(plan_payments.payment_count, 0) as payments_in_plan,
          COALESCE(plan_payments.total_paid_in_plan, 0) as total_paid_in_plan
        FROM student_plan sp
        JOIN students s ON sp.id_student = s.id_student
        JOIN plans p ON sp.id_plan = p.id_plan
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        LEFT JOIN LATERAL (
          SELECT 
            COUNT(*) as payment_count,
            SUM(total_amount) as total_paid_in_plan
          FROM payments pay
          WHERE pay.id_student = sp.id_student
          AND pay.id_plan = sp.id_plan
          AND pay.payment_date BETWEEN sp.start_date AND COALESCE(sp.end_date, CURRENT_DATE)
        ) plan_payments ON true
        ${whereClause}
        GROUP BY sp.id_student_plan, s.id_student, p.id_plan, plan_payments.payment_count, plan_payments.total_paid_in_plan
        ORDER BY ${sort_by} ${sort_order}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(limit, offset);
      const result = await query(studentPlansQuery, queryParams);

      return paginated(res, result.rows, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      });

    } catch (error) {
      console.error('Error getting student plans:', error);
      return badRequest(res, 'Error retrieving student plans');
    }
  }

  // GET /api/student-plans/:id - Get student plan by ID
  async getStudentPlanById(req, res) {
    try {
      const { id } = req.params;

      const studentPlanQuery = `
        SELECT 
          sp.*,
          s.first_name,
          s.last_name,
          s.email,
          s.type as student_type,
          s.status as student_status,
          p.name as plan_name,
          p.type as plan_type,
          p.frequency as plan_frequency,
          p.monthly_price,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities,
          CASE 
            WHEN sp.end_date IS NOT NULL 
            THEN sp.end_date - sp.start_date
            ELSE CURRENT_DATE - sp.start_date
          END as plan_duration_days,
          COALESCE(plan_payments.payment_count, 0) as payments_in_plan,
          COALESCE(plan_payments.total_paid_in_plan, 0) as total_paid_in_plan
        FROM student_plan sp
        JOIN students s ON sp.id_student = s.id_student
        JOIN plans p ON sp.id_plan = p.id_plan
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        LEFT JOIN LATERAL (
          SELECT 
            COUNT(*) as payment_count,
            SUM(total_amount) as total_paid_in_plan
          FROM payments pay
          WHERE pay.id_student = sp.id_student
          AND pay.id_plan = sp.id_plan
          AND pay.payment_date BETWEEN sp.start_date AND COALESCE(sp.end_date, CURRENT_DATE)
        ) plan_payments ON true
        WHERE sp.id_student_plan = $1
        GROUP BY sp.id_student_plan, s.id_student, p.id_plan, plan_payments.payment_count, plan_payments.total_paid_in_plan
      `;

      const result = await query(studentPlanQuery, [id]);

      if (result.rows.length === 0) {
        return notFound(res, 'Student plan not found');
      }

      return success(res, result.rows[0], 'Student plan retrieved successfully');

    } catch (error) {
      console.error('Error getting student plan:', error);
      return badRequest(res, 'Error retrieving student plan');
    }
  }

  // POST /api/student-plans - Assign plan to student
  async createStudentPlan(req, res) {
    try {
      const { id_student, id_plan, start_date, end_date } = req.body;

      const result = await transaction(async (client) => {
        // Check if student exists
        const studentQuery = `
          SELECT id_student, status FROM students WHERE id_student = $1
        `;
        const studentResult = await client.query(studentQuery, [id_student]);

        if (studentResult.rows.length === 0) {
          throw { code: 'STUDENT_NOT_FOUND', message: 'Student not found' };
        }

        // Check if plan exists and is active
        const planQuery = `
          SELECT id_plan, active FROM plans WHERE id_plan = $1
        `;
        const planResult = await client.query(planQuery, [id_plan]);

        if (planResult.rows.length === 0) {
          throw { code: 'PLAN_NOT_FOUND', message: 'Plan not found' };
        }

        if (!planResult.rows[0].active) {
          throw { code: 'PLAN_INACTIVE', message: 'Plan is not active' };
        }

        // Check if student already has an active plan
        const activePlanQuery = `
          SELECT id_student_plan FROM student_plan 
          WHERE id_student = $1 AND active = true
        `;
        const activePlanResult = await client.query(activePlanQuery, [id_student]);

        if (activePlanResult.rows.length > 0) {
          throw { code: 'ACTIVE_PLAN_EXISTS', message: 'Student already has an active plan' };
        }

        // Create student plan
        const createStudentPlanQuery = `
          INSERT INTO student_plan (id_student, id_plan, start_date, end_date)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const studentPlanResult = await client.query(createStudentPlanQuery, [
          id_student, id_plan, start_date, end_date
        ]);

        return studentPlanResult.rows[0];
      });

      // Get complete student plan info
      const completeStudentPlanQuery = `
        SELECT 
          sp.*,
          s.first_name,
          s.last_name,
          s.email,
          s.type as student_type,
          s.status as student_status,
          p.name as plan_name,
          p.type as plan_type,
          p.frequency as plan_frequency,
          p.monthly_price,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
        FROM student_plan sp
        JOIN students s ON sp.id_student = s.id_student
        JOIN plans p ON sp.id_plan = p.id_plan
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        WHERE sp.id_student_plan = $1
        GROUP BY sp.id_student_plan, s.id_student, p.id_plan
      `;

      const completeResult = await query(completeStudentPlanQuery, [result.id_student_plan]);

      return success(res, completeResult.rows[0], 'Student plan created successfully', 201);

    } catch (error) {
      console.error('Error creating student plan:', error);
      if (error.code === 'STUDENT_NOT_FOUND') {
        return notFound(res, error.message);
      }
      if (error.code === 'PLAN_NOT_FOUND') {
        return notFound(res, error.message);
      }
      if (error.code === 'PLAN_INACTIVE') {
        return badRequest(res, error.message);
      }
      if (error.code === 'ACTIVE_PLAN_EXISTS') {
        return conflict(res, error.message);
      }
      if (error.code === '23505') {
        return conflict(res, 'Student plan already exists');
      }
      return badRequest(res, 'Error creating student plan');
    }
  }

  // PUT /api/student-plans/:id - Update student plan
  async updateStudentPlan(req, res) {
    try {
      const { id } = req.params;
      const { end_date, active } = req.body;

      // Check if student plan exists
      const existingStudentPlanQuery = `
        SELECT * FROM student_plan WHERE id_student_plan = $1
      `;
      const existingResult = await query(existingStudentPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student plan not found');
      }

      const currentPlan = existingResult.rows[0];

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (end_date !== undefined) {
        updateFields.push(`end_date = $${paramIndex++}`);
        updateValues.push(end_date);
      }
      if (active !== undefined) {
        updateFields.push(`active = $${paramIndex++}`);
        updateValues.push(active);
      }

      if (updateFields.length === 0) {
        return badRequest(res, 'No fields to update');
      }

      updateValues.push(id); // Add id for WHERE clause

      const updateQuery = `
        UPDATE student_plan 
        SET ${updateFields.join(', ')}
        WHERE id_student_plan = $${paramIndex}
        RETURNING *
      `;

      const result = await query(updateQuery, updateValues);

      // Get complete updated student plan info
      const completeStudentPlanQuery = `
        SELECT 
          sp.*,
          s.first_name,
          s.last_name,
          s.email,
          s.type as student_type,
          s.status as student_status,
          p.name as plan_name,
          p.type as plan_type,
          p.frequency as plan_frequency,
          p.monthly_price,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities,
          CASE 
            WHEN sp.end_date IS NOT NULL 
            THEN sp.end_date - sp.start_date
            ELSE CURRENT_DATE - sp.start_date
          END as plan_duration_days
        FROM student_plan sp
        JOIN students s ON sp.id_student = s.id_student
        JOIN plans p ON sp.id_plan = p.id_plan
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        WHERE sp.id_student_plan = $1
        GROUP BY sp.id_student_plan, s.id_student, p.id_plan
      `;

      const completeResult = await query(completeStudentPlanQuery, [result.rows[0].id_student_plan]);

      return success(res, completeResult.rows[0], 'Student plan updated successfully');

    } catch (error) {
      console.error('Error updating student plan:', error);
      return badRequest(res, 'Error updating student plan');
    }
  }

  // DELETE /api/student-plans/:id - Deactivate student plan
  async deleteStudentPlan(req, res) {
    try {
      const { id } = req.params;

      // Check if student plan exists
      const existingStudentPlanQuery = `
        SELECT id_student_plan, active FROM student_plan WHERE id_student_plan = $1
      `;
      const existingResult = await query(existingStudentPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student plan not found');
      }

      if (existingResult.rows[0].active === false) {
        return badRequest(res, 'Student plan is already inactive');
      }

      // Deactivate student plan by setting active to false and end_date to today
      const deactivateQuery = `
        UPDATE student_plan 
        SET active = false, 
            end_date = COALESCE(end_date, CURRENT_DATE)
        WHERE id_student_plan = $1
        RETURNING *
      `;

      const result = await query(deactivateQuery, [id]);

      return success(res, result.rows[0], 'Student plan deactivated successfully');

    } catch (error) {
      console.error('Error deactivating student plan:', error);
      return badRequest(res, 'Error deactivating student plan');
    }
  }

  // GET /api/student-plans/student/:studentId - Get student plan history
  async getStudentPlanHistory(req, res) {
    try {
      const { studentId } = req.params;

      // Check if student exists
      const existingStudentQuery = `
        SELECT id_student FROM students WHERE id_student = $1
      `;
      const existingResult = await query(existingStudentQuery, [studentId]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Student not found');
      }

      const planHistoryQuery = `
        SELECT 
          sp.*,
          p.name as plan_name,
          p.type as plan_type,
          p.frequency as plan_frequency,
          p.monthly_price,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities,
          CASE 
            WHEN sp.end_date IS NOT NULL 
            THEN sp.end_date - sp.start_date
            ELSE CURRENT_DATE - sp.start_date
          END as plan_duration_days,
          COALESCE(plan_payments.payment_count, 0) as payments_in_plan,
          COALESCE(plan_payments.total_paid_in_plan, 0) as total_paid_in_plan
        FROM student_plan sp
        JOIN plans p ON sp.id_plan = p.id_plan
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        LEFT JOIN LATERAL (
          SELECT 
            COUNT(*) as payment_count,
            SUM(total_amount) as total_paid_in_plan
          FROM payments pay
          WHERE pay.id_student = sp.id_student
          AND pay.id_plan = sp.id_plan
          AND pay.payment_date BETWEEN sp.start_date AND COALESCE(sp.end_date, CURRENT_DATE)
        ) plan_payments ON true
        WHERE sp.id_student = $1
        GROUP BY sp.id_student_plan, p.id_plan, plan_payments.payment_count, plan_payments.total_paid_in_plan
        ORDER BY sp.start_date DESC
      `;

      const result = await query(planHistoryQuery, [studentId]);

      return success(res, result.rows, 'Student plan history retrieved successfully');

    } catch (error) {
      console.error('Error getting student plan history:', error);
      return badRequest(res, 'Error retrieving student plan history');
    }
  }

  // GET /api/student-plans/plan/:planId/students - Get students with specific plan
  async getPlanStudents(req, res) {
    try {
      const { planId } = req.params;

      // Check if plan exists
      const existingPlanQuery = `
        SELECT id_plan FROM plans WHERE id_plan = $1
      `;
      const existingResult = await query(existingPlanQuery, [planId]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      const studentsQuery = `
        SELECT 
          s.id_student,
          s.first_name,
          s.last_name,
          s.email,
          s.type,
          s.status,
          s.enrollment_date,
          sp.id_student_plan,
          sp.start_date,
          sp.end_date,
          sp.active,
          -- Payment info for this plan
          COALESCE(plan_payments.payment_count, 0) as payments_in_plan,
          COALESCE(plan_payments.total_paid_in_plan, 0) as total_paid_in_plan,
          -- Last payment date
          last_payment.last_payment_date
        FROM students s
        JOIN student_plan sp ON s.id_student = sp.id_student
        LEFT JOIN LATERAL (
          SELECT 
            COUNT(*) as payment_count,
            SUM(total_amount) as total_paid_in_plan,
            MAX(payment_date) as last_payment_date
          FROM payments pay
          WHERE pay.id_student = s.id_student
          AND pay.id_plan = $1
        ) plan_payments ON true
        LEFT JOIN LATERAL (
          SELECT MAX(payment_date) as last_payment_date
          FROM payments pay
          WHERE pay.id_student = s.id_student
        ) last_payment ON true
        WHERE sp.id_plan = $1
        ORDER BY sp.active DESC, s.last_name, s.first_name
      `;

      const result = await query(studentsQuery, [planId]);

      return success(res, result.rows, 'Plan students retrieved successfully');

    } catch (error) {
      console.error('Error getting plan students:', error);
      return badRequest(res, 'Error retrieving plan students');
    }
  }
}

module.exports = new StudentPlanController();
