import express from "express";
import dotenv from "dotenv";
import { query } from "../db/index.js";

dotenv.config();

const router = express.Router();

router.get("/receitas", async (req, res) => {
  const { userId } = req.query;

  try {
    const result = await query("SELECT * FROM receitas WHERE user_id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Receita não encontrada" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar receita", error.message);
    res.status(500).json({
      message: "Erro no servidor",
      error: error.message,
    });
  }
});

router.post("/receitas", async (req, res) => {
  const { userId, amount, description, receipt_date } = req.body;
  if (!userId || !amount || !description || !receipt_date) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const sqlQuery = `
      INSERT INTO receitas (user_id, amount, description, date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *;
    `;
    const values = [userId, amount, description, receipt_date];
    const result = await query(sqlQuery, values);

    res.status(201).json({
      message: "Receita adicionada com sucesso!",
      receita: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao adicionar receita:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.put("/receitas/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, description, receipt_date } = req.body;

  if (!amount || !description || !receipt_date) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const sqlQuery = `
      UPDATE receitas
      SET amount = $1, description = $2, date = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const values = [amount, description, receipt_date, id];
    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Receita não encontrada" });
    }

    res.status(200).json({
      message: "Receita atualizada com sucesso",
      receita: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar receita:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.delete("/receitas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      DELETE FROM receitas WHERE id = $1 RETURNING *;
    `;
    const values = [id];
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Receita não encontrada" });
    }

    res.status(200).json({ message: "Receita excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir receita", error.message);
    res.status(500).json({
      message: "Erro no servidor",
      error: error.message,
    });
  }
});

router.get("/", (req, res) => {
  res.send("Rota de receitas está funcionando!");
});

export default router;
