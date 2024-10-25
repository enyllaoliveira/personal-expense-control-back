import express from "express";
import dotenv from "dotenv";
import { query } from "../db/index.js";
import { verifyToken } from "../routes/userRoutes.js";

dotenv.config();

const router = express.Router();

router.get("/receitas", verifyToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }
  try {
    const result = await query(
      "SELECT * FROM receitas WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar receitas:", error.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});
router.post("/receitas", verifyToken, async (req, res) => {
  const { amount, description, receipt_date } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const sqlQuery = `
      INSERT INTO receitas (user_id, amount, description, date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *;
    `;

    const values = [userId, amount, description, receipt_date];
    const result = await query(sqlQuery, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar receita:", error.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});
router.put("/receitas/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { amount, description, receipt_date } = req.body;
  if (
    amount === undefined &&
    description === undefined &&
    receipt_date === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Pelo menos um campo deve ser atualizado." });
  }

  try {
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

    values.push(id);

    const sqlQuery = `
      UPDATE receitas
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *;
    `;

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

router.delete("/receitas/:id", verifyToken, async (req, res) => {
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

router.get("/", verifyToken, (req, res) => {
  res.send("Rota de receitas está funcionando!");
});

export default router;
