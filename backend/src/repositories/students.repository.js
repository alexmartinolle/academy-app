import db from '../config/database.js';

export const getStudentsWithStatus = async () => {
  // Simple query - all data is now in the students table
  const query = `
    SELECT 
      id,
      first_name,
      last_name,
      email,
      type,
      enrollment_date,
      student_status,
      plan_name,
      price,
      last_payment_date
    FROM students 
    ORDER BY first_name, last_name
  `;
  const { rows } = await db.query(query);
  return rows;
};

export const getStudentById = async (id) => {
  // Simple query - all data is now in the students table
  const query = `
    SELECT 
      id,
      first_name,
      last_name,
      email,
      type,
      enrollment_date,
      student_status,
      plan_name,
      price,
      last_payment_date
    FROM students 
    WHERE id = $1
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const createStudent = async (student) => {
  const { first_name, last_name, email, type, enrollment_date } = student;
  const query = `
    INSERT INTO students (first_name, last_name, email, type, enrollment_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await db.query(query, [first_name, last_name, email, type, enrollment_date]);
  return rows[0];
};

export const updateStudent = async (id, student) => {
  const { first_name, last_name, email, type } = student;
  const query = `
    UPDATE students 
    SET first_name = $1, last_name = $2, email = $3, type = $4
    WHERE id = $5
    RETURNING *
  `;
  const { rows } = await db.query(query, [first_name, last_name, email, type, id]);
  return rows[0];
};

export const deleteStudent = async (id) => {
  const query = 'DELETE FROM students WHERE id = $1 RETURNING *';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const getStudentsByStatus = async (status) => {
  const query = `
    SELECT *
    FROM student_current_status
    WHERE student_status = $1
  `;
  const { rows } = await db.query(query, [status]);
  return rows;
};

export const getInactiveStudents = async () => {
  // Simple query using the new student_status column
  const query = 'SELECT * FROM students WHERE student_status = $1';
  const { rows } = await db.query(query, ['inactive']);
  return rows;
};

export const getStudentsWithPendingPayments = async (limit = 3) => {
  // Use the simplified function
  const query = 'SELECT * FROM get_top_pending_students($1)';
  const { rows } = await db.query(query, [limit]);
  
  // The function already returns the correct format
  return rows;
};

export const getPendingPaymentsCount = async () => {
  // Use the simplified function
  const query = 'SELECT get_pending_payments_count() as count';
  const { rows } = await db.query(query);
  return parseInt(rows[0].count);
};
