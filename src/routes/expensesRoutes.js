import express from "express";
import { query } from "../db/index.js";

const router = express.Router();

router.post("/despesas", async (req, res) => {
  const { valor, descricao, data_pagamento, categoria_id, nova_categoria } =
    req.body;

  try {
    let categoriaId = categoria_id;

    if (nova_categoria) {
      const novaCategoria = await query(
        "INSERT INTO categorias (nome, tipo, descricao_extra) VALUES ($1, 'despesa', false) RETURNING id",
        [nova_categoria]
      );
      categoriaId = novaCategoria.rows[0].id;
    }

    const novaDespesa = await query(
      "INSERT INTO despesas (valor, descricao, data_pagamento, categoria_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [valor, descricao, data_pagamento, categoriaId]
    );

    res.status(201).json(novaDespesa.rows[0]);
  } catch (err) {
    console.error("Erro ao criar despesa:", err.message);
    res.status(500).json({ error: "Erro ao criar despesa." });
  }
});

router.get("/despesas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("SELECT * FROM despesas WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Despesa não encontrada." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar despesa por ID:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.put("/despesas/:id", async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data_pagamento, categoria_id } = req.body;

  if (!descricao || !valor || !data_pagamento || !categoria_id) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
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
    console.error("Erro ao atualizar despesa:", error);
    res
      .status(500)
      .json({ message: "Erro no servidor.", error: error.message });
  }
});
router.delete("/despesas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      DELETE FROM despesas WHERE id = $1 RETURNING *;
      `;
    const values = [id];
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Despesa não encontrada." });
    }

    res.status(200).json({
      message: "Despesa excluída com sucesso.",
      despesa: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao excluir despesa", error.message);
    res.status(500).json({
      message: "Erro no servidor",
      error: error.message,
    });
  }
});

router.get("/despesas", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM despesas ORDER BY data_pagamento DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar despesas." });
  }
});

export default router;
