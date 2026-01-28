import db from '../config/database.js';

export const getStudentsWithStatus = async () => {
  const query = `
    SELECT *
    FROM student_current_status
  `;
  const { rows } = await db.query(query);
  return rows;
};

export const getStudentById = async (id) => {
  const query = `
    SELECT s.*, scs.student_status
    FROM students s
    LEFT JOIN student_current_status scs ON s.id = scs.id
    WHERE s.id = $1
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
  const query = 'SELECT * FROM inactive_students';
  const { rows } = await db.query(query);
  return rows;
};
