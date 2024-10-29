import express from "express";
import dotenv from "dotenv";
import { query } from "../db/index.js";
import { verifyToken } from "../routes/userRoutes.js";

dotenv.config();

const router = express.Router();

router.get("/incomes", verifyToken, async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }
  try {
    const result = await query(
      "SELECT * FROM incomes WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar incomes:", error.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});
router.post("/incomes", verifyToken, async (req, res) => {
  const { amount, description, receipt_date, isRecurrent } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const sqlQuery = `
      INSERT INTO incomes (
        user_id, amount, description, date, created_at, updated_at, is_recurrent
      ) VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING *;
    `;

    const values = [userId, amount, description, receipt_date, isRecurrent];

    const result = await query(sqlQuery, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar receita:", error.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});
router.put("/incomes/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { amount, description, receipt_date, is_recurrent } = req.body;

  if (
    amount === undefined &&
    description === undefined &&
    receipt_date === undefined &&
    is_recurrent === undefined
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

router.delete("/incomes/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      DELETE FROM incomes WHERE id = $1 RETURNING *;
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
