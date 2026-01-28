import db from '../config/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // Total students
    const totalStudentsQuery = await db.query('SELECT COUNT(*) as total FROM students');
    
    // Active students
    const activeStudentsQuery = await db.query("SELECT COUNT(*) as active FROM student_current_status WHERE student_status = 'active'");
    
    // Pending students
    const pendingStudentsQuery = await db.query("SELECT COUNT(*) as pending FROM student_current_status WHERE student_status = 'pending'");
    
    // Inactive students
    const inactiveStudentsQuery = await db.query("SELECT COUNT(*) as inactive FROM student_current_status WHERE student_status = 'inactive'");
    
    // Current month revenue
    const currentMonthRevenueQuery = await db.query(`
      SELECT COALESCE(SUM(pl.price), 0) as current_month_revenue
      FROM payments p
      LEFT JOIN plans pl ON p.plan_id = pl.id
      WHERE p.year = $1 AND p.month = $2 AND p.status = 'paid'
    `, [currentYear, currentMonth]);
    
    // Last month revenue
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const lastMonthRevenueQuery = await db.query(`
      SELECT COALESCE(SUM(pl.price), 0) as last_month_revenue
      FROM payments p
      LEFT JOIN plans pl ON p.plan_id = pl.id
      WHERE p.year = $1 AND p.month = $2 AND p.status = 'paid'
    `, [lastMonthYear, lastMonth]);
    
    // Year to date revenue
    const ytdRevenueQuery = await db.query(`
      SELECT COALESCE(SUM(pl.price), 0) as ytd_revenue
      FROM payments p
      LEFT JOIN plans pl ON p.plan_id = pl.id
      WHERE p.year = $1 AND p.status = 'paid'
    `, [currentYear]);
    
    // New students this month
    const newStudentsQuery = await db.query(`
      SELECT COUNT(*) as new_students
      FROM students
      WHERE EXTRACT(YEAR FROM enrollment_date) = $1 
      AND EXTRACT(MONTH FROM enrollment_date) = $2
    `, [currentYear, currentMonth]);
    
    const stats = {
      totalStudents: parseInt(totalStudentsQuery.rows[0].total),
      activeStudents: parseInt(activeStudentsQuery.rows[0].active),
      pendingStudents: parseInt(pendingStudentsQuery.rows[0].pending),
      inactiveStudents: parseInt(inactiveStudentsQuery.rows[0].inactive),
      currentMonthRevenue: parseFloat(currentMonthRevenueQuery.rows[0].current_month_revenue),
      lastMonthRevenue: parseFloat(lastMonthRevenueQuery.rows[0].last_month_revenue),
      yearToDateRevenue: parseFloat(ytdRevenueQuery.rows[0].ytd_revenue),
      newStudentsThisMonth: parseInt(newStudentsQuery.rows[0].new_students)
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        student_status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM student_current_status
      GROUP BY student_status
    `;
    
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRevenueTrend = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.params;
    
    const query = `
      SELECT 
        p.month,
        TO_CHAR(DATE_MAKE_DATE(year, month, 1), 'Month') as month_name,
        COALESCE(SUM(pl.price), 0) as revenue,
        COUNT(*) as payment_count
      FROM payments p
      LEFT JOIN plans pl ON p.plan_id = pl.id
      WHERE p.year = $1 AND p.status = 'paid'
      GROUP BY p.month
      ORDER BY p.month
    `;
    
    const { rows } = await db.query(query, [year]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlanDistribution = async (req, res) => {
  try {
    const query = `
      SELECT 
        pl.name as plan_name,
        pl.type as plan_type,
        COUNT(p.id) as student_count,
        COALESCE(SUM(pl.price), 0) as total_revenue
      FROM plans pl
      LEFT JOIN payments p ON pl.id = p.plan_id 
        AND p.year = EXTRACT(YEAR FROM CURRENT_DATE)::INT
        AND p.month = EXTRACT(MONTH FROM CURRENT_DATE)::INT
        AND p.status = 'paid'
      GROUP BY pl.id, pl.name, pl.type
      ORDER BY pl.type, pl.name
    `;
    
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
