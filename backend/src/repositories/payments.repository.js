import db from '../config/database.js';

export const getPaymentsByStudent = async (studentId) => {
  const query = `
    SELECT p.*, pl.name as plan_name, pl.price, pl.type as plan_type
    FROM payments p
    LEFT JOIN plans pl ON p.plan_id = pl.id
    WHERE p.student_id = $1
    ORDER BY p.year DESC, p.month DESC
  `;
  const { rows } = await db.query(query, [studentId]);
  return rows;
};

export const createPayment = async (payment) => {
  const { student_id, plan_id, month, year, payment_date, status = 'paid', source = 'monthly' } = payment;
  const query = `
    INSERT INTO payments (student_id, plan_id, month, year, payment_date, status, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await db.query(query, [student_id, plan_id, month, year, payment_date, status, source]);
  return rows[0];
};

export const updatePayment = async (id, payment) => {
  const { status, payment_date } = payment;
  const query = `
    UPDATE payments 
    SET status = $1, payment_date = $2
    WHERE id = $3
    RETURNING *
  `;
  const { rows } = await db.query(query, [status, payment_date, id]);
  return rows[0];
};

export const deletePayment = async (id) => {
  const query = 'DELETE FROM payments WHERE id = $1 RETURNING *';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const getPaymentsByMonth = async (year, month) => {
  const query = `
    SELECT p.*, s.first_name, s.last_name, pl.name as plan_name, pl.price
    FROM payments p
    JOIN students s ON p.student_id = s.id
    LEFT JOIN plans pl ON p.plan_id = pl.id
    WHERE p.year = $1 AND p.month = $2
    ORDER BY s.last_name, s.first_name
  `;
  const { rows } = await db.query(query, [year, month]);
  return rows;
};

export const getMonthlyRevenue = async (year, month) => {
  const query = `
    SELECT COALESCE(SUM(pl.price), 0) as total_revenue, COUNT(*) as payment_count
    FROM payments p
    LEFT JOIN plans pl ON p.plan_id = pl.id
    WHERE p.year = $1 AND p.month = $2 AND p.status = 'paid'
  `;
  const { rows } = await db.query(query, [year, month]);
  return rows[0];
};

export const getYearlyRevenue = async (year) => {
  const query = `
    SELECT 
      p.month,
      COALESCE(SUM(pl.price), 0) as revenue,
      COUNT(*) as payment_count
    FROM payments p
    LEFT JOIN plans pl ON p.plan_id = pl.id
    WHERE p.year = $1 AND p.status = 'paid'
    GROUP BY p.month
    ORDER BY p.month
  `;
  const { rows } = await db.query(query, [year]);
  return rows;
};