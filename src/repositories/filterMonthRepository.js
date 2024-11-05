import { query } from "../db/index.js";

export const getMonthlyChart = async (month, year, userId) => {
  if (!month || !year || month < 1 || month > 12) {
    throw new Error("Mês ou ano inválido");
  }

  const incomes = await query(
    `
          SELECT * FROM incomes 
          WHERE EXTRACT(MONTH FROM date) = $1 
          AND EXTRACT(YEAR FROM date) = $2
          AND user_id = $3
        `,
    [month, year, userId]
  );

  const expenses = await query(
    `
          SELECT * FROM expenses 
          WHERE EXTRACT(MONTH FROM payment_date) = $1 
          AND EXTRACT(YEAR FROM payment_date) = $2
          AND user_id = $3
        `,
    [month, year, userId]
  );

  return { incomes: incomes.rows, expenses: expenses.rows };
};

export const getYearlyChart = async (year, userId) => {
  if (!year) {
    throw new Error("Ano inválido");
  }

  const incomes = await query(
    `
          SELECT * FROM incomes 
          WHERE EXTRACT(YEAR FROM date) = $1
          AND user_id = $2
        `,
    [year, userId]
  );

  const expenses = await query(
    `
          SELECT * FROM expenses 
          WHERE EXTRACT(YEAR FROM payment_date) = $1
          AND user_id = $2
        `,
    [year, userId]
  );
  return { incomes: incomes.rows, expenses: expenses.rows };
};
