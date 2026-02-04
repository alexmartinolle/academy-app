const { query, transaction } = require('../config/database');
const { success, paginated, notFound, conflict, badRequest } = require('../utils/response');

class ModalityController {
  // GET /api/modalities - List modalities with pagination and filters
  async getModalities(req, res) {
    try {
      const { page, limit, active, search, include_stats } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause
      if (active !== undefined) {
        whereClause += ` AND m.active = $${paramIndex++}`;
        queryParams.push(active === 'true');
      }
      if (search) {
        whereClause += ` AND m.name ILIKE $${paramIndex++}`;
        queryParams.push(`%${search}%`);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM modalities m
        ${whereClause}
      `;
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      let modalitiesQuery;
      
      if (include_stats === 'true') {
        // Get modalities with additional stats
        modalitiesQuery = `
          SELECT 
            m.*,
            COUNT(DISTINCT sp.id_student) as student_count,
            COUNT(DISTINCT sp.id_student) FILTER (WHERE s.status = 'active') as active_students,
            COUNT(DISTINCT p.id_plan) as plan_count,
            COALESCE(SUM(pay.total_amount), 0) as total_revenue_all_time
          FROM modalities m
          LEFT JOIN plan_modality pm ON m.id_modality = pm.id_modality
          LEFT JOIN plans p ON pm.id_plan = p.id_plan AND p.active = true
          LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
          LEFT JOIN students s ON sp.id_student = s.id_student
          LEFT JOIN payments pay ON pay.id_plan = p.id_plan
          ${whereClause}
          GROUP BY m.id_modality
          ORDER BY m.name
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
      } else {
        // Get modalities without stats (original behavior)
        modalitiesQuery = `
          SELECT m.*
          FROM modalities m
          ${whereClause}
          ORDER BY m.name
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
      }

      queryParams.push(limit, offset);
      const result = await query(modalitiesQuery, queryParams);

      return paginated(res, result.rows, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      });

    } catch (error) {
      console.error('Error getting modalities:', error);
      return badRequest(res, 'Error retrieving modalities');
    }
  }

  // GET /api/modalities/:id - Get modality by ID
  async getModalityById(req, res) {
    try {
      const { id } = req.params;

      const modalityQuery = `
        SELECT 
          m.*,
          COUNT(DISTINCT sp.id_student) as total_students,
          COUNT(DISTINCT sp.id_student) FILTER (WHERE s.status = 'active') as active_students,
          COUNT(DISTINCT p.id_plan) as plans_offering,
          COALESCE(SUM(pay.total_amount), 0) as total_revenue_all_time
        FROM modalities m
        LEFT JOIN plan_modality pm ON m.id_modality = pm.id_modality
        LEFT JOIN plans p ON pm.id_plan = p.id_plan AND p.active = true
        LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
        LEFT JOIN students s ON sp.id_student = s.id_student
        LEFT JOIN payments pay ON pay.id_plan = p.id_plan
        WHERE m.id_modality = $1
        GROUP BY m.id_modality
      `;

      const result = await query(modalityQuery, [id]);

      if (result.rows.length === 0) {
        return notFound(res, 'Modality not found');
      }

      return success(res, result.rows[0], 'Modality retrieved successfully');

    } catch (error) {
      console.error('Error getting modality:', error);
      return badRequest(res, 'Error retrieving modality');
    }
  }

  // POST /api/modalities - Create new modality
  async createModality(req, res) {
    try {
      const { name } = req.body;

      // Check if modality already exists
      const existingModalityQuery = `
        SELECT id_modality FROM modalities WHERE name = $1
      `;
      const existingResult = await query(existingModalityQuery, [name]);

      if (existingResult.rows.length > 0) {
        return conflict(res, 'Modality with this name already exists');
      }

      const createModalityQuery = `
        INSERT INTO modalities (name)
        VALUES ($1)
        RETURNING *
      `;

      const result = await query(createModalityQuery, [name]);

      return success(res, result.rows[0], 'Modality created successfully', 201);

    } catch (error) {
      console.error('Error creating modality:', error);
      if (error.code === '23505') {
        return conflict(res, 'Modality with this name already exists');
      }
      return badRequest(res, 'Error creating modality');
    }
  }

  // PUT /api/modalities/:id - Update modality
  async updateModality(req, res) {
    try {
      const { id } = req.params;
      const { name, active } = req.body;

      // Check if modality exists
      const existingModalityQuery = `
        SELECT id_modality FROM modalities WHERE id_modality = $1
      `;
      const existingResult = await query(existingModalityQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Modality not found');
      }

      // Check name uniqueness if updating name
      if (name) {
        const nameCheckQuery = `
          SELECT id_modality FROM modalities WHERE name = $1 AND id_modality != $2
        `;
        const nameResult = await query(nameCheckQuery, [name, id]);

        if (nameResult.rows.length > 0) {
          return conflict(res, 'Modality with this name already exists');
        }
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(name);
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
        UPDATE modalities 
        SET ${updateFields.join(', ')}
        WHERE id_modality = $${paramIndex}
        RETURNING *
      `;

      const result = await query(updateQuery, updateValues);

      return success(res, result.rows[0], 'Modality updated successfully');

    } catch (error) {
      console.error('Error updating modality:', error);
      if (error.code === '23505') {
        return conflict(res, 'Modality with this name already exists');
      }
      return badRequest(res, 'Error updating modality');
    }
  }

  // DELETE /api/modalities/:id - Deactivate modality
  async deleteModality(req, res) {
    try {
      const { id } = req.params;

      // Check if modality exists
      const existingModalityQuery = `
        SELECT id_modality, active FROM modalities WHERE id_modality = $1
      `;
      const existingResult = await query(existingModalityQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Modality not found');
      }

      if (existingResult.rows[0].active === false) {
        return badRequest(res, 'Modality is already inactive');
      }

      // Check if modality is used in active plans
      const activePlansQuery = `
        SELECT COUNT(*) as count
        FROM plan_modality pm
        JOIN plans p ON pm.id_modality = pm.id_modality
        WHERE pm.id_modality = $1 AND p.active = true
      `;
      const plansResult = await query(activePlansQuery, [id]);

      if (parseInt(plansResult.rows[0].count) > 0) {
        return badRequest(res, 'Cannot deactivate modality used in active plans');
      }

      // Deactivate modality
      const deactivateQuery = `
        UPDATE modalities 
        SET active = false 
        WHERE id_modality = $1
        RETURNING *
      `;

      const result = await query(deactivateQuery, [id]);

      return success(res, result.rows[0], 'Modality deactivated successfully');

    } catch (error) {
      console.error('Error deactivating modality:', error);
      return badRequest(res, 'Error deactivating modality');
    }
  }

  // GET /api/modalities/:id/plans - Get plans that include this modality
  async getModalityPlans(req, res) {
    try {
      const { id } = req.params;

      // Check if modality exists
      const existingModalityQuery = `
        SELECT id_modality FROM modalities WHERE id_modality = $1
      `;
      const existingResult = await query(existingModalityQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Modality not found');
      }

      const plansQuery = `
        SELECT 
          p.*,
          COUNT(sp.id_student) as student_count,
          COUNT(sp.id_student) FILTER (WHERE s.status = 'active') as active_students
        FROM plans p
        JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
        LEFT JOIN students s ON sp.id_student = s.id_student
        WHERE pm.id_modality = $1 AND p.active = true
        GROUP BY p.id_plan
        ORDER BY p.name
      `;

      const result = await query(plansQuery, [id]);

      return success(res, result.rows, 'Modality plans retrieved successfully');

    } catch (error) {
      console.error('Error getting modality plans:', error);
      return badRequest(res, 'Error retrieving modality plans');
    }
  }

  // GET /api/modalities/:id/students - Get students enrolled in plans with this modality
  async getModalityStudents(req, res) {
    try {
      const { id } = req.params;

      // Check if modality exists
      const existingModalityQuery = `
        SELECT id_modality FROM modalities WHERE id_modality = $1
      `;
      const existingResult = await query(existingModalityQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Modality not found');
      }

      const studentsQuery = `
        SELECT DISTINCT
          s.id_student,
          s.first_name,
          s.last_name,
          s.email,
          s.type,
          s.status,
          s.enrollment_date,
          p.name as plan_name,
          p.frequency as plan_frequency,
          p.monthly_price
        FROM students s
        JOIN student_plan sp ON s.id_student = sp.id_student AND sp.active = true
        JOIN plans p ON sp.id_plan = p.id_plan
        JOIN plan_modality pm ON p.id_plan = pm.id_plan
        WHERE pm.id_modality = $1 AND p.active = true
        ORDER BY s.last_name, s.first_name
      `;

      const result = await query(studentsQuery, [id]);

      return success(res, result.rows, 'Modality students retrieved successfully');

    } catch (error) {
      console.error('Error getting modality students:', error);
      return badRequest(res, 'Error retrieving modality students');
    }
  }
}

module.exports = new ModalityController();
