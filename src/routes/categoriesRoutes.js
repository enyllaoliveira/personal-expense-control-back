import express from "express";
import { query } from "../db/index.js";
import { verifyToken } from "./userRoutes.js";

const router = express.Router();

router.post("/categorias", verifyToken, async (req, res) => {
  const { nome, tipo, descricao_extra } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const checkQuery = `
      SELECT * FROM categorias WHERE nome = $1 AND user_id = $2;
    `;
    const checkResult = await query(checkQuery, [nome, userId]);

    if (checkResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Categoria já existe para este usuário." });
    }

    const sqlQuery = `
      INSERT INTO categorias (nome, tipo, descricao_extra, user_id, criado_em)
      VALUES ($1, $2, $3, $4, NOW()) RETURNING *;
    `;
    const values = [nome, tipo, descricao_extra, userId];
    const result = await query(sqlQuery, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao criar categoria:", error.message);
    res.status(500).json({ message: "Erro ao criar categoria." });
  }
});

router.get("/categorias/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("SELECT * FROM categorias where id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar categoria por ID:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.put("/despesas/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data_pagamento, categoria_id } = req.body;

  if (!descricao || !valor || !data_pagamento || !categoria_id) {
    return res.status(400).json({
      message: "Todos os campos são obrigatórios.",
    });
  }

  try {
    const sqlQuery = `
      UPDATE despesas
      SET descricao = $1, valor = $2, data_pagamento = $3, categoria_id = $4, atualizado_em = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const values = [descricao, valor, data_pagamento, categoria_id, id];

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

router.delete("/categorias/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
    DELETEFROM categorias WHERE id = $1 RETURNING *;
    `;
    const values = [id];
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }

    res.status(200).json({
      message: "Categoria excluída com sucesso.",
      categoria: result.rows[0],
    });
    res.status(200).json({
      message: "Categoria excluída com sucesso.",
      categoria: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.get("/categorias", verifyToken, async (req, res) => {
  try {
    const result = await query("SELECT * FROM categorias ORDER BY nome DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar categorias." });
  }
});

export default router;
