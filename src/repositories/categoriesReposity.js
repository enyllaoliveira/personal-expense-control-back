import { query } from "../db/index.js";

export const createCategories = async (
  name,
  type,
  extra_description,
  userId
) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório.");
  }

  const checkQuery = `
      SELECT * FROM categories 
      WHERE name = $1 AND (user_id = $2 OR user_id IS NULL);
    `;
  const checkResult = await query(checkQuery, [name, userId]);

  if (checkResult.rows.length > 0) {
    throw new Error("Categoria já existe para este usuário.");
  }

  const sqlQuery = `
      INSERT INTO categories (name, type, extra_description, user_id, created_at)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
    `;
  const values = [name, type, extra_description, userId];
  const result = await query(sqlQuery, values);

  return result.rows[0];
};

export const getCategories = async (userId) => {
  const queryCategories = `
        SELECT * 
        FROM categories 
        WHERE user_id IS NULL OR user_id = $1
      `;
  const result = await query(queryCategories, [userId]);

  return result.rows;
};

export const updateExpenseWithCategory = async (
  description,
  amount,
  payment_date,
  category_id,
  id
) => {
  if (!description || !amount || !payment_date || !category_id) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  const sqlQuery = `
        UPDATE expenses
        SET description = $1, amount = $2, payment_date = $3, category_id = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING *;
      `;

  const values = [description, amount, payment_date, category_id, id];

  const result = await query(sqlQuery, values);

  if (result.rows.length === 0) {
    throw new Error("Despesa não encontrada.");
  }

  return result.rows[0];
};

export const deleteCategory = async (id) => {
  const sql = `
      DELETE FROM categories WHERE id = $1 RETURNING *;
      `;
  const values = [id];
  const result = await query(sql, values);

  if (result.rows.length === 0) {
    throw new Error("Categoria não encontrada.");
  }
  return result.rows[0];
};
