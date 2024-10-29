import express from "express";
import { query } from "../db/index.js";
import { verifyToken } from "./userRoutes.js";

const router = express.Router();

router.post("/categories", verifyToken, async (req, res) => {
  const { name, type, extra_description } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const checkQuery = `
    SELECT * FROM categories 
    WHERE name = $1 AND (user_id = $2 OR user_id IS NULL);
  `;
    const checkResult = await query(checkQuery, [name, userId]);

    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Categoria já existe para este usuário." });
    }

    const sqlQuery = `
    INSERT INTO categories (name, type, extra_description, user_id, created_at)
    VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
  `;
    const values = [name, type, extra_description, userId];
    const result = await query(sqlQuery, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar categoria:", error.message);
    res.status(500).json({ message: "Erro ao criar categoria." });
  }
});

router.put("/expenses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { description, amount, payment_date, category_id } = req.body;

  if (!description || !valor || !payment_date || !category_id) {
    return res.status(400).json({
      message: "Todos os campos são obrigatórios.",
    });
  }

  try {
    const sqlQuery = `
      UPDATE expenses
      SET description = $1, amount = $2, payment_date = $3, category_id = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const values = [description, amount, payment_date, category_id, id];

    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Despesa não encontrada." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error.message);
    res
      .status(500)
      .json({ message: "Erro no servidor.", error: error.message });
  }
});

router.delete("/categories/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
    DELETEFROM categories WHERE id = $1 RETURNING *;
    `;
    const values = [id];
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    res.status(200).json({
      message: "Categoria excluída com sucesso.",
      category: result.rows[0],
    });
    res.status(200).json({
      message: "Categoria excluída com sucesso.",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.get("/categories", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const queryCategories = `
      SELECT * 
      FROM categories 
      WHERE user_id IS NULL OR user_id = $1
    `;
    const result = await query(queryCategories, [userId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

export default router;
