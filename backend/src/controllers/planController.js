const { query, transaction } = require('../config/database');
const { success, paginated, notFound, conflict, badRequest } = require('../utils/response');

class PlanController {
  // GET /api/plans - List plans with pagination and filters
  async getPlans(req, res) {
    try {
      const { page, limit, type, frequency, active, search, include_stats } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE p.active = true';
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause
      if (type) {
        whereClause += ` AND p.type = $${paramIndex++}`;
        queryParams.push(type);
      }
      if (frequency) {
        whereClause += ` AND p.frequency = $${paramIndex++}`;
        queryParams.push(frequency);
      }
      if (active !== undefined) {
        whereClause += ` AND p.active = $${paramIndex++}`;
        queryParams.push(active === 'true');
      }
      if (search) {
        whereClause += ` AND p.name ILIKE $${paramIndex++}`;
        queryParams.push(`%${search}%`);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM plans p
        ${whereClause}
      `;
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      let plansQuery;
      
      if (include_stats === 'true') {
        // Get plans with student count and modalities
        plansQuery = `
          SELECT 
            p.*,
            COUNT(sp.id_student) as student_count,
            COUNT(sp.id_student) FILTER (WHERE s.status = 'active') as active_students,
            array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
          FROM plans p
          LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
          LEFT JOIN students s ON sp.id_student = s.id_student
          LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
          LEFT JOIN modalities m ON pm.id_modality = m.id_modality
          ${whereClause}
          GROUP BY p.id_plan
          ORDER BY p.name
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
      } else {
        // Get plans without stats (original behavior)
        plansQuery = `
          SELECT p.*
          FROM plans p
          ${whereClause}
          ORDER BY p.name
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
      }

      queryParams.push(limit, offset);
      const result = await query(plansQuery, queryParams);

      return paginated(res, result.rows, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      });

    } catch (error) {
      console.error('Error getting plans:', error);
      return badRequest(res, 'Error retrieving plans');
    }
  }

  // GET /api/plans/:id - Get plan by ID
  async getPlanById(req, res) {
    try {
      const { id } = req.params;

      const planQuery = `
        SELECT 
          p.*,
          COUNT(sp.id_student) as student_count,
          COUNT(sp.id_student) FILTER (WHERE s.status = 'active') as active_students,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
        FROM plans p
        LEFT JOIN student_plan sp ON p.id_plan = sp.id_plan AND sp.active = true
        LEFT JOIN students s ON sp.id_student = s.id_student
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        WHERE p.id_plan = $1
        GROUP BY p.id_plan
      `;

      const result = await query(planQuery, [id]);

      if (result.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      return success(res, result.rows[0], 'Plan retrieved successfully');

    } catch (error) {
      console.error('Error getting plan:', error);
      return badRequest(res, 'Error retrieving plan');
    }
  }

  // POST /api/plans - Create new plan
  async createPlan(req, res) {
    try {
      const { name, type, frequency, monthly_price, modalities } = req.body;

      const result = await transaction(async (client) => {
        // Check if plan with same name, type, frequency, and price already exists
        const existingPlanQuery = `
          SELECT id_plan FROM plans 
          WHERE name = $1 AND type = $2 AND frequency = $3 AND monthly_price = $4
        `;
        const existingResult = await client.query(existingPlanQuery, [name, type, frequency, monthly_price]);

        if (existingResult.rows.length > 0) {
          throw { code: 'PLAN_EXISTS', message: 'Plan with these specifications already exists' };
        }

        // Create plan
        const createPlanQuery = `
          INSERT INTO plans (name, type, frequency, monthly_price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const planResult = await client.query(createPlanQuery, [name, type, frequency, monthly_price]);
        const newPlan = planResult.rows[0];

        // Add modalities to plan
        if (modalities && modalities.length > 0) {
          const modalityValues = modalities.map((modalityId, index) => 
            `($1, $${index + 2})`
          ).join(', ');

          const addModalitiesQuery = `
            INSERT INTO plan_modality (id_plan, id_modality)
            VALUES ${modalityValues}
          `;
          await client.query(addModalitiesQuery, [newPlan.id_plan, ...modalities]);
        }

        return newPlan;
      });

      // Get the complete plan with modalities
      const completePlanQuery = `
        SELECT 
          p.*,
          array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
        FROM plans p
        LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
        LEFT JOIN modalities m ON pm.id_modality = m.id_modality
        WHERE p.id_plan = $1
        GROUP BY p.id_plan
      `;

      const completeResult = await query(completePlanQuery, [result.id_plan]);

      return success(res, completeResult.rows[0], 'Plan created successfully', 201);

    } catch (error) {
      console.error('Error creating plan:', error);
      if (error.code === 'PLAN_EXISTS') {
        return conflict(res, error.message);
      }
      if (error.code === '23503') {
        return badRequest(res, 'One or more modalities do not exist');
      }
      return badRequest(res, 'Error creating plan');
    }
  }

  // PUT /api/plans/:id - Update plan (creates new record for price changes)
  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const { name, type, frequency, monthly_price, active, modalities } = req.body;

      // Check if plan exists
      const existingPlanQuery = `
        SELECT * FROM plans WHERE id_plan = $1
      `;
      const existingResult = await query(existingPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      const currentPlan = existingResult.rows[0];

      // If price is changing, create new plan record (immutable pattern)
      if (monthly_price !== undefined && monthly_price !== currentPlan.monthly_price) {
        const result = await transaction(async (client) => {
          // Deactivate old plan
          const deactivateQuery = `
            UPDATE plans 
            SET active = false 
            WHERE id_plan = $1
          `;
          await client.query(deactivateQuery, [id]);

          // Create new plan with new price
          const createNewPlanQuery = `
            INSERT INTO plans (name, type, frequency, monthly_price, active)
            VALUES ($1, $2, $3, $4, true)
            RETURNING *
          `;
          const newPlanResult = await client.query(createNewPlanQuery, [
            name || currentPlan.name,
            type || currentPlan.type,
            frequency || currentPlan.frequency,
            monthly_price
          ]);
          const newPlan = newPlanResult.rows[0];

          // Copy modalities to new plan
          if (modalities && modalities.length > 0) {
            const modalityValues = modalities.map((modalityId, index) => 
              `($1, $${index + 2})`
            ).join(', ');

            const addModalitiesQuery = `
              INSERT INTO plan_modality (id_plan, id_modality)
              VALUES ${modalityValues}
            `;
            await client.query(addModalitiesQuery, [newPlan.id_plan, ...modalities]);
          } else {
            // Copy existing modalities if none provided
            const copyModalitiesQuery = `
              INSERT INTO plan_modality (id_plan, id_modality)
              SELECT $1, id_modality FROM plan_modality WHERE id_plan = $2
            `;
            await client.query(copyModalitiesQuery, [newPlan.id_plan, id]);
          }

          return newPlan;
        });

        // Get complete new plan
        const completePlanQuery = `
          SELECT 
            p.*,
            array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
          FROM plans p
          LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
          LEFT JOIN modalities m ON pm.id_modality = m.id_modality
          WHERE p.id_plan = $1
          GROUP BY p.id_plan
        `;

        const completeResult = await query(completePlanQuery, [result.id_plan]);

        return success(res, completeResult.rows[0], 'Plan updated with new price (new record created)');

      } else {
        // Update non-price fields
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (name !== undefined) {
          updateFields.push(`name = $${paramIndex++}`);
          updateValues.push(name);
        }
        if (type !== undefined) {
          updateFields.push(`type = $${paramIndex++}`);
          updateValues.push(type);
        }
        if (frequency !== undefined) {
          updateFields.push(`frequency = $${paramIndex++}`);
          updateValues.push(frequency);
        }
        if (active !== undefined) {
          updateFields.push(`active = $${paramIndex++}`);
          updateValues.push(active);
        }

        if (updateFields.length === 0 && !modalities) {
          return badRequest(res, 'No fields to update');
        }

        let result;
        if (updateFields.length > 0) {
          updateValues.push(id);
          const updateQuery = `
            UPDATE plans 
            SET ${updateFields.join(', ')}
            WHERE id_plan = $${paramIndex}
            RETURNING *
          `;
          const updateResult = await query(updateQuery, updateValues);
          result = updateResult.rows[0];
        } else {
          result = currentPlan;
        }

        // Update modalities if provided
        if (modalities !== undefined) {
          await transaction(async (client) => {
            // Remove existing modalities
            const removeModalitiesQuery = `
              DELETE FROM plan_modality WHERE id_plan = $1
            `;
            await client.query(removeModalitiesQuery, [id]);

            // Add new modalities
            if (modalities.length > 0) {
              const modalityValues = modalities.map((modalityId, index) => 
                `($1, $${index + 2})`
              ).join(', ');

              const addModalitiesQuery = `
                INSERT INTO plan_modality (id_plan, id_modality)
                VALUES ${modalityValues}
              `;
              await client.query(addModalitiesQuery, [id, ...modalities]);
            }
          });
        }

        // Get complete plan
        const completePlanQuery = `
          SELECT 
            p.*,
            array_agg(m.name ORDER BY m.name) FILTER (WHERE m.name IS NOT NULL) as modalities
          FROM plans p
          LEFT JOIN plan_modality pm ON p.id_plan = pm.id_plan
          LEFT JOIN modalities m ON pm.id_modality = m.id_modality
          WHERE p.id_plan = $1
          GROUP BY p.id_plan
        `;

        const completeResult = await query(completePlanQuery, [result.id_plan]);

        return success(res, completeResult.rows[0], 'Plan updated successfully');
      }

    } catch (error) {
      console.error('Error updating plan:', error);
      if (error.code === '23503') {
        return badRequest(res, 'One or more modalities do not exist');
      }
      return badRequest(res, 'Error updating plan');
    }
  }

  // DELETE /api/plans/:id - Deactivate plan
  async deletePlan(req, res) {
    try {
      const { id } = req.params;

      // Check if plan exists
      const existingPlanQuery = `
        SELECT id_plan, active FROM plans WHERE id_plan = $1
      `;
      const existingResult = await query(existingPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      if (existingResult.rows[0].active === false) {
        return badRequest(res, 'Plan is already inactive');
      }

      // Check if plan has active students
      const activeStudentsQuery = `
        SELECT COUNT(*) as count
        FROM student_plan sp
        JOIN students s ON sp.id_student = s.id_student
        WHERE sp.id_plan = $1 AND sp.active = true AND s.status = 'active'
      `;
      const studentsResult = await query(activeStudentsQuery, [id]);

      if (parseInt(studentsResult.rows[0].count) > 0) {
        return badRequest(res, 'Cannot deactivate plan with active students');
      }

      // Deactivate plan
      const deactivateQuery = `
        UPDATE plans 
        SET active = false 
        WHERE id_plan = $1
        RETURNING *
      `;

      const result = await query(deactivateQuery, [id]);

      return success(res, result.rows[0], 'Plan deactivated successfully');

    } catch (error) {
      console.error('Error deactivating plan:', error);
      return badRequest(res, 'Error deactivating plan');
    }
  }

  // GET /api/plans/:id/modalities - Get plan modalities
  async getPlanModalities(req, res) {
    try {
      const { id } = req.params;

      // Check if plan exists
      const existingPlanQuery = `
        SELECT id_plan FROM plans WHERE id_plan = $1
      `;
      const existingResult = await query(existingPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      const modalitiesQuery = `
        SELECT m.*
        FROM modalities m
        JOIN plan_modality pm ON m.id_modality = pm.id_modality
        WHERE pm.id_plan = $1 AND m.active = true
        ORDER BY m.name
      `;

      const result = await query(modalitiesQuery, [id]);

      return success(res, result.rows, 'Plan modalities retrieved successfully');

    } catch (error) {
      console.error('Error getting plan modalities:', error);
      return badRequest(res, 'Error retrieving plan modalities');
    }
  }

  // POST /api/plans/:id/modalities - Add modalities to plan
  async addPlanModalities(req, res) {
    try {
      const { id } = req.params;
      const { modalities } = req.body;

      if (!modalities || modalities.length === 0) {
        return badRequest(res, 'Modalities array is required');
      }

      // Check if plan exists
      const existingPlanQuery = `
        SELECT id_plan FROM plans WHERE id_plan = $1
      `;
      const existingResult = await query(existingPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      const result = await transaction(async (client) => {
        const modalityValues = modalities.map((modalityId, index) => 
          `($1, $${index + 2})`
        ).join(', ');

        const addModalitiesQuery = `
          INSERT INTO plan_modality (id_plan, id_modality)
          VALUES ${modalityValues}
          ON CONFLICT (id_plan, id_modality) DO NOTHING
          RETURNING id_modality
        `;
        return await client.query(addModalitiesQuery, [id, ...modalities]);
      });

      return success(res, result.rows, 'Modalities added to plan successfully', 201);

    } catch (error) {
      console.error('Error adding modalities to plan:', error);
      if (error.code === '23503') {
        return badRequest(res, 'One or more modalities do not exist');
      }
      return badRequest(res, 'Error adding modalities to plan');
    }
  }

  // DELETE /api/plans/:id/modalities/:modalityId - Remove modality from plan
  async removePlanModality(req, res) {
    try {
      const { id, modalityId } = req.params;

      // Check if plan exists
      const existingPlanQuery = `
        SELECT id_plan FROM plans WHERE id_plan = $1
      `;
      const existingResult = await query(existingPlanQuery, [id]);

      if (existingResult.rows.length === 0) {
        return notFound(res, 'Plan not found');
      }

      const removeQuery = `
        DELETE FROM plan_modality 
        WHERE id_plan = $1 AND id_modality = $2
        RETURNING *
      `;

      const result = await query(removeQuery, [id, modalityId]);

      if (result.rows.length === 0) {
        return notFound(res, 'Modality not found in plan');
      }

      return success(res, null, 'Modality removed from plan successfully');

    } catch (error) {
      console.error('Error removing modality from plan:', error);
      return badRequest(res, 'Error removing modality from plan');
    }
  }
}

module.exports = new PlanController();
