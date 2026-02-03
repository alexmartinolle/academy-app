const { query, transaction } = require('../config/database');
const { success, paginated, notFound, badRequest } = require('../utils/response');

class PaymentController {
  // GET /api/payments - List payments with pagination and filters (OPTIMIZED)
  async getPayments(req, res) {
    try {
      const { page, limit, id_student, payment_method, date_from, date_to, min_amount, max_amount, sort_by, sort_order } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = 'WHERE 1=1';
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause - optimized for index usage
      if (id_student) {
        whereClause += ` AND id_student = $${paramIndex++}`; // Uses idx_payments_student
        queryParams.push(id_student);
      }
      if (payment_method) {
        whereClause += ` AND payment_method = $${paramIndex++}`;
        queryParams.push(payment_method);
      }
      if (date_from) {
        whereClause += ` AND payment_date >= $${paramIndex++}`; // Uses idx_payments_date
        queryParams.push(date_from);
      }
      if (date_to) {
        whereClause += ` AND payment_date <= $${paramIndex++}`;
        queryParams.push(date_to);
      }
      if (min_amount) {
        whereClause += ` AND total_amount >= $${paramIndex++}`;
        queryParams.push(min_amount);
      }
      if (max_amount) {
        whereClause += ` AND total_amount <= $${paramIndex++}`;
        queryParams.push(max_amount);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM payments p
        ${whereClause}
      `;
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get payments using optimized view - leverages idx_payments_student_date
      const paymentsQuery = `
        SELECT *
        FROM v_student_payments_history
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      queryParams.push(limit, offset);
      const result = await query(paymentsQuery, queryParams);

      return paginated(res, result.rows, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      });

    } catch (error) {
      console.error('Error getting payments:', error);
      return badRequest(res, 'Error retrieving payments');
    }
  }

  // GET /api/payments/:id - Get payment by ID
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const paymentQuery = `
        SELECT 
          p.*,
          s.first_name,
          s.last_name,
          s.email,
          pl.name as plan_name,
          pl.frequency as plan_frequency,
          -- Coverage days and daily rate
          p.period_end - p.period_start + 1 as coverage_days,
          p.total_amount / NULLIF(p.period_end - p.period_start + 1, 0) as daily_rate
        FROM payments p
        JOIN students s ON p.id_student = s.id_student
        JOIN plans pl ON p.id_plan = pl.id_plan
        WHERE p.id_payment = $1
      `;

      const result = await query(paymentQuery, [id]);

      if (result.rows.length === 0) {
        return notFound(res, 'Payment not found');
      }

      return success(res, result.rows[0], 'Payment retrieved successfully');

    } catch (error) {
      console.error('Error getting payment:', error);
      return badRequest(res, 'Error retrieving payment');
    }
  }

  // POST /api/payments - Record new payment
  async createPayment(req, res) {
    try {
      const { id_student, id_plan, payment_date, period_start, period_end, total_amount, payment_method, observations } = req.body;

      const result = await transaction(async (client) => {
        // Check if student exists and has active plan
        const studentPlanQuery = `
          SELECT sp.*, p.monthly_price
          FROM student_plan sp
          JOIN plans p ON sp.id_plan = p.id_plan
          WHERE sp.id_student = $1 AND sp.active = true
        `;
        const studentPlanResult = await client.query(studentPlanQuery, [id_student]);

        if (studentPlanResult.rows.length === 0) {
          throw { code: 'NO_ACTIVE_PLAN', message: 'Student has no active plan' };
        }

        const studentPlan = studentPlanResult.rows[0];

        // Verify the plan matches
        if (studentPlan.id_plan != id_plan) {
          throw { code: 'PLAN_MISMATCH', message: 'Payment plan does not match student active plan' };
        }

        // Create payment
        const createPaymentQuery = `
          INSERT INTO payments (
            id_student, id_plan, payment_date, period_start, period_end, 
            total_amount, payment_method, observations
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        const paymentResult = await client.query(createPaymentQuery, [
          id_student, id_plan, payment_date, period_start, period_end, 
          total_amount, payment_method, observations
        ]);

        return paymentResult.rows[0];
      });

      // Get complete payment info
      const completePaymentQuery = `
        SELECT 
          p.*,
          s.first_name,
          s.last_name,
          s.email,
          pl.name as plan_name,
          pl.frequency as plan_frequency,
          p.period_end - p.period_start + 1 as coverage_days,
          p.total_amount / NULLIF(p.period_end - p.period_start + 1, 0) as daily_rate
        FROM payments p
        JOIN students s ON p.id_student = s.id_student
        JOIN plans pl ON p.id_plan = pl.id_plan
        WHERE p.id_payment = $1
      `;

      const completeResult = await query(completePaymentQuery, [result.id_payment]);

      return success(res, completeResult.rows[0], 'Payment recorded successfully', 201);

    } catch (error) {
      console.error('Error creating payment:', error);
      if (error.code === 'NO_ACTIVE_PLAN') {
        return badRequest(res, error.message);
      }
      if (error.code === 'PLAN_MISMATCH') {
        return badRequest(res, error.message);
      }
      if (error.code === '23503') {
        return badRequest(res, 'Student or plan does not exist');
      }
      return badRequest(res, 'Error recording payment');
    }
  }

  // GET /api/payments/student/:studentId - Get student payment history
  async getStudentPaymentHistory(req, res) {
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

      const paymentsQuery = `
        SELECT 
          p.*,
          pl.name as plan_name,
          pl.frequency as plan_frequency,
          p.period_end - p.period_start + 1 as coverage_days,
          p.total_amount / NULLIF(p.period_end - p.period_start + 1, 0) as daily_rate
        FROM payments p
        JOIN plans pl ON p.id_plan = pl.id_plan
        WHERE p.id_student = $1
        ORDER BY p.payment_date DESC
      `;

      const result = await query(paymentsQuery, [studentId]);

      return success(res, result.rows, 'Student payment history retrieved successfully');

    } catch (error) {
      console.error('Error getting student payment history:', error);
      return badRequest(res, 'Error retrieving student payment history');
    }
  }

  // GET /api/payments/methods/summary - Get payment methods summary
  async getPaymentMethodsSummary(req, res) {
    try {
      const summaryQuery = `
        SELECT 
          payment_method,
          COUNT(*) as total_transactions,
          SUM(total_amount) as total_amount,
          AVG(total_amount) as avg_amount,
          MIN(total_amount) as min_amount,
          MAX(total_amount) as max_amount,
          MIN(payment_date) as first_payment,
          MAX(payment_date) as last_payment
        FROM payments
        GROUP BY payment_method
        ORDER BY total_amount DESC
      `;

      const result = await query(summaryQuery);

      return success(res, result.rows, 'Payment methods summary retrieved successfully');

    } catch (error) {
      console.error('Error getting payment methods summary:', error);
      return badRequest(res, 'Error retrieving payment methods summary');
    }
  }

  // GET /api/payments/revenue/daily - Get daily revenue (OPTIMIZED)
  async getDailyRevenue(req, res) {
    try {
      const { date_from, date_to } = req.query;

      let whereClause = '';
      let queryParams = [];
      let paramIndex = 1;

      if (date_from) {
        whereClause += ` WHERE payment_date >= $${paramIndex++}`;
        queryParams.push(date_from);
      }
      if (date_to) {
        whereClause += whereClause ? ` AND payment_date <= $${paramIndex++}` : ` WHERE payment_date <= $${paramIndex++}`;
        queryParams.push(date_to);
      }

      // Use optimized view - leverages idx_payments_date and idx_payments_period
      const revenueQuery = `
        SELECT *
        FROM v_daily_revenue
        ${whereClause}
        ORDER BY payment_date DESC
      `;

      const result = await query(revenueQuery, queryParams);

      return success(res, result.rows, 'Daily revenue retrieved successfully');

    } catch (error) {
      console.error('Error getting daily revenue:', error);
      return badRequest(res, 'Error retrieving daily revenue');
    }
  }

  // GET /api/payments/revenue/monthly - Get monthly revenue (OPTIMIZED)
  async getMonthlyRevenue(req, res) {
    try {
      const { date_from, date_to } = req.query;

      let whereClause = '';
      let queryParams = [];
      let paramIndex = 1;

      if (date_from) {
        whereClause += ` WHERE month >= $${paramIndex++}`;
        queryParams.push(date_from);
      }
      if (date_to) {
        whereClause += whereClause ? ` AND month <= $${paramIndex++}` : ` WHERE month <= $${paramIndex++}`;
        queryParams.push(date_to);
      }

      // Use optimized view - leverages idx_payments_date for monthly aggregation
      const revenueQuery = `
        SELECT *
        FROM v_monthly_revenue
        ${whereClause}
        ORDER BY month DESC
      `;

      const result = await query(revenueQuery, queryParams);

      return success(res, result.rows, 'Monthly revenue retrieved successfully');

    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return badRequest(res, 'Error retrieving monthly revenue');
    }
  }
}

module.exports = new PaymentController();
