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
  date,
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

  const values = [userId, amount, description, date, isRecurrent];

  const result = await query(sqlQuery, values);
  const createdIncome = result.rows[0];

  if (isRecurrent) {
    const recordsToInsert = [];
    for (let i = 1; i <= 12; i++) {
      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + i);

      recordsToInsert.push([
        userId,
        amount,
        description,
        nextDate,
        new Date(),
        new Date(),
        isRecurrent,
      ]);
    }

    const recurringQuery = `
      INSERT INTO incomes (
        user_id, amount, description, date, created_at, updated_at, is_recurrent
      ) VALUES ${recordsToInsert
        .map(
          (_, index) =>
            `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${
              index * 7 + 4
            }, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`
        )
        .join(", ")} RETURNING *;
    `;

    const flatValues = recordsToInsert.flat();

    await query(recurringQuery, flatValues);
  }

  return createdIncome;
};

export const updateIncome = async (
  amount,
  description,
  date,
  is_recurrent,
  id
) => {
  if (
    amount === undefined &&
    description === undefined &&
    date === undefined &&
    is_recurrent === undefined
  ) {
    throw new Error("Pelo menos um campo deve ser atualizado.");
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (amount !== undefined) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      throw new Error("O valor de 'amount' deve ser um número válido.");
    }
    fields.push(`amount = $${index++}`);
    values.push(parsedAmount);
  }
  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }

  console.log("Valor inicial recebido para 'date':", date);
  if (date !== undefined) {
    const parsedDate = Date.parse(date);
    console.log("Timestamp gerado para 'date':", parsedDate);
    if (isNaN(parsedDate)) {
      console.error("Erro: 'date' é inválido.");
      throw new Error(
        "O valor de 'date' deve ser uma data válida no formato YYYY-MM-DD."
      );
    }
    const formattedDate = new Date(parsedDate).toISOString().split("T")[0];
    console.log("Data formatada para o banco:", formattedDate);
    fields.push(`date = $${index++}`);
    values.push(formattedDate);
  }
  if (is_recurrent !== undefined) {
    if (typeof is_recurrent !== "boolean") {
      throw new Error(
        "O valor de 'is_recurrent' deve ser um booleano (true ou false)."
      );
    }
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
