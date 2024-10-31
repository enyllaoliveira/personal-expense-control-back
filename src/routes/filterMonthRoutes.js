import express from "express";
import { query } from "../db/index.js";
import { verifyToken } from "./userRoutes.js";

const router = express.Router();

router.get("/graphics/month", verifyToken, async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const userId = req.userId;

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ error: "Mês ou ano inválido" });
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

    res.json({
      incomes: incomes.rows,
      expenses: expenses.rows,
    });
  } catch (error) {
    console.error("Erro ao carregar dados mensais:", error);
    res.status(500).json({ error: "Erro ao carregar dados mensais" });
  }
});

router.get("/graphics/year", verifyToken, async (req, res) => {
  try {
    const year = parseInt(req.query.year);
    const userId = req.userId;

    if (!year) {
      return res.status(400).json({ error: "Ano inválido" });
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

    res.json({
      incomes: incomes.rows,
      expenses: expenses.rows,
    });
  } catch (error) {
    console.error("Erro ao carregar dados anuais:", error);
    res.status(500).json({ error: "Erro ao carregar dados anuais" });
  }
});

export default router;
