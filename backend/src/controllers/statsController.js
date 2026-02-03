const { query } = require('../config/database');
const { success, badRequest } = require('../utils/response');

class StatsController {
  // GET /api/stats/dashboard - Main dashboard KPIs (OPTIMIZED)
  async getDashboardStats(req, res) {
    try {
      // Use optimized view - single query instead of 10 separate queries
      const dashboardQuery = `SELECT * FROM v_main_kpis`;

      const result = await query(dashboardQuery);

      return success(res, result.rows[0], 'Dashboard stats retrieved successfully');

    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return badRequest(res, 'Error retrieving dashboard stats');
    }
  }

  // GET /api/stats/revenue - Revenue statistics (OPTIMIZED)
  async getRevenueStats(req, res) {
    try {
      const { period = 'monthly', date_from, date_to, group_by } = req.query;

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

      // Use optimized views based on period
      let revenueQuery;
      switch (period) {
        case 'daily':
          revenueQuery = `
            SELECT *
            FROM v_daily_revenue
            ${whereClause}
            ORDER BY payment_date DESC
          `;
          break;
        case 'yearly':
          revenueQuery = `
            SELECT *
            FROM v_yearly_revenue
            ${whereClause.replace(/month/g, 'year')}
            ORDER BY year DESC
          `;
          break;
        default: // monthly
          revenueQuery = `
            SELECT *
            FROM v_monthly_revenue
            ${whereClause}
            ORDER BY month DESC
          `;
      }

      const result = await query(revenueQuery, queryParams);

      return success(res, result.rows, 'Revenue statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting revenue stats:', error);
      return badRequest(res, 'Error retrieving revenue stats');
    }
  }

  // GET /api/stats/students - Student statistics (OPTIMIZED)
  async getStudentStats(req, res) {
    try {
      const { period = 'current', group_by } = req.query;

      // Use optimized view for student statistics
      let statsQuery;
      if (group_by === 'plan') {
        statsQuery = `SELECT * FROM v_students_by_plan`;
      } else {
        statsQuery = `SELECT * FROM v_students_statistics`;
      }

      const result = await query(statsQuery);

      return success(res, result.rows, 'Student statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting student stats:', error);
      return badRequest(res, 'Error retrieving student stats');
    }
  }

  // GET /api/stats/growth - Growth trends (OPTIMIZED)
  async getGrowthStats(req, res) {
    try {
      const { period = 'monthly', date_from, date_to } = req.query;

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

      // Use optimized view - leverages idx_students_enrollment_date
      const growthQuery = `
        SELECT *
        FROM v_growth_trend
        ${whereClause}
        ORDER BY month DESC
      `;

      const result = await query(growthQuery, queryParams);

      return success(res, result.rows, 'Growth statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting growth stats:', error);
      return badRequest(res, 'Error retrieving growth stats');
    }
  }

  // GET /api/stats/plans - Plan distribution statistics (OPTIMIZED)
  async getPlanStats(req, res) {
    try {
      // Use optimized view - leverages idx_plans_active and idx_plans_type
      const plansQuery = `SELECT * FROM v_students_by_plan`;

      const result = await query(plansQuery);

      return success(res, result.rows, 'Plan statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting plan stats:', error);
      return badRequest(res, 'Error retrieving plan stats');
    }
  }

  // GET /api/stats/modalities - Modality statistics (OPTIMIZED)
  async getModalityStats(req, res) {
    try {
      // Use optimized view - leverages idx_modalities_active
      const modalitiesQuery = `SELECT * FROM v_modalities_statistics`;

      const result = await query(modalitiesQuery);

      return success(res, result.rows, 'Modality statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting modality stats:', error);
      return badRequest(res, 'Error retrieving modality stats');
    }
  }

  // GET /api/stats/retention - Cohort retention analysis (OPTIMIZED)
  async getRetentionStats(req, res) {
    try {
      // Use optimized view - leverages multiple indexes for complex cohort analysis
      const retentionQuery = `SELECT * FROM v_cohort_retention ORDER BY cohort_month DESC LIMIT 24`;

      const result = await query(retentionQuery);

      return success(res, result.rows, 'Retention statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting retention stats:', error);
      return badRequest(res, 'Error retrieving retention stats');
    }
  }

  // GET /api/stats/payments - Payment method statistics (OPTIMIZED)
  async getPaymentStats(req, res) {
    try {
      // Use optimized view - leverages payment method indexes
      const paymentStatsQuery = `SELECT * FROM v_payments_by_method`;

      const result = await query(paymentStatsQuery);

      return success(res, result.rows, 'Payment statistics retrieved successfully');

    } catch (error) {
      console.error('Error getting payment stats:', error);
      return badRequest(res, 'Error retrieving payment stats');
    }
  }
}

module.exports = new StatsController();
