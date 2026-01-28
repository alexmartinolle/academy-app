import db from '../config/database.js';

export const getAllPlans = async () => {
  const query = 'SELECT * FROM plans ORDER BY type, name';
  const { rows } = await db.query(query);
  return rows;
};

export const getPlanById = async (id) => {
  const query = 'SELECT * FROM plans WHERE id = $1';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const getPlansByType = async (type) => {
  const query = 'SELECT * FROM plans WHERE type = $1 ORDER BY name';
  const { rows } = await db.query(query, [type]);
  return rows;
};

export const createPlan = async (plan) => {
  const { name, price, type } = plan;
  const query = `
    INSERT INTO plans (name, price, type)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const { rows } = await db.query(query, [name, price, type]);
  return rows[0];
};

export const updatePlan = async (id, plan) => {
  const { name, price, type } = plan;
  const query = `
    UPDATE plans 
    SET name = $1, price = $2, type = $3
    WHERE id = $4
    RETURNING *
  `;
  const { rows } = await db.query(query, [name, price, type, id]);
  return rows[0];
};

export const deletePlan = async (id) => {
  const query = 'DELETE FROM plans WHERE id = $1 RETURNING *';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};