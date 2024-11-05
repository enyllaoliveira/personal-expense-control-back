import { query } from "../db/index.js";

export const getIncomesById = async (userId) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório.");
  }

  const result = await query(
    "SELECT * FROM incomes WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  );

  if (result.rows.length === 0) {
    return result.rows[0];
  }

  return result.rows;
};

export const createIncome = async (
  amount,
  description,
  receipt_date,
  isRecurrent,
  userId
) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório.");
  }

  const sqlQuery = `
        INSERT INTO incomes (
          user_id, amount, description, date, created_at, updated_at, is_recurrent
        ) VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING *;
      `;

  const values = [userId, amount, description, receipt_date, isRecurrent];

  const result = await query(sqlQuery, values);

  return result.rows[0];
};

export const updateIncome = async (
  amount,
  description,
  receipt_date,
  is_recurrent,
  id
) => {
  if (
    amount === undefined &&
    description === undefined &&
    receipt_date === undefined &&
    is_recurrent === undefined
  ) {
    throw new Error("Pelo menos um campo deve ser atualizado.");
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (amount !== undefined) {
    fields.push(`amount = $${index++}`);
    values.push(parseFloat(amount));
  }
  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }
  if (receipt_date !== undefined) {
    fields.push(`date = $${index++}`);
    values.push(receipt_date);
  }
  if (is_recurrent !== undefined) {
    fields.push(`is_recurrent = $${index++}`);
    values.push(is_recurrent);
  }

  values.push(id);
  const sqlQuery = `
        UPDATE incomes
        SET ${fields.join(", ")}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING *;
      `;

  const result = await query(sqlQuery, values);

  if (result.rows.length === 0) {
    throw new Error("Receita não encontrada.");
  }

  return result.rows[0];
};

export const deleteIncome = async (id) => {
  const sql = `
        DELETE FROM incomes WHERE id = $1 RETURNING *;
      `;
  const values = [id];
  const result = await query(sql, values);

  if (result.rows.length === 0) {
    throw new Error("Receita não encontrada.");
  }

  return result.rows[0];
};
