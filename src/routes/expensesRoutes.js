import express from "express";
import { query } from "../db/index.js";
import { verifyToken } from "./userRoutes.js";

const router = express.Router();

router.post("/despesas", verifyToken, async (req, res) => {
  const despesas = req.body;
  const userId = req.userId;

  if (!Array.isArray(despesas) || despesas.length === 0) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  const camposInvalidos = despesas.some(
    (despesa) =>
      !despesa.usuario_id ||
      !despesa.categoria_id ||
      !despesa.data_pagamento ||
      !despesa.descricao ||
      !despesa.tipo_pagamento ||
      !despesa.valor
  );

  if (camposInvalidos) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const categoriaIds = despesas.map((d) => parseInt(d.categoria_id, 10));
    const categoriasResult = await query(
      `SELECT id FROM categorias WHERE id = ANY($1::int[])`,
      [categoriaIds]
    );

    const categoriasValidas = categoriasResult.rows.map((row) => row.id);
    const categoriasInvalidas = categoriaIds.some(
      (id) => !categoriasValidas.includes(id)
    );

    if (categoriasInvalidas) {
      return res.status(400).json({ message: "Categoria não encontrada." });
    }

    const sqlQuery = `
      INSERT INTO despesas (
        user_id, descricao, valor, data_pagamento, categoria_id, tipo_pagamento, criado_em, atualizado_em
      ) VALUES ${despesas
        .map(
          (_, i) =>
            `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${
              i * 7 + 5
            }, $${i * 7 + 6}, NOW(), NOW())`
        )
        .join(", ")}
      RETURNING *;
    `;

    const values = despesas.flatMap((despesa) => [
      userId,
      despesa.descricao,
      parseFloat(despesa.valor),
      despesa.data_pagamento,
      parseInt(despesa.categoria_id, 10),
      despesa.tipo_pagamento || "comum",
    ]);

    const result = await query(sqlQuery, values);

    res.status(201).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor." });
  }
});
router.get("/despesas/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const queryText = `
      SELECT * FROM despesas WHERE id = $1 AND usuario_id = $2;
    `;
    const result = await query(queryText, [id, userId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Despesa não encontrada ou não autorizada." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar despesa por ID:", error.message);
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

router.put("/despesas/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    descricao,
    valor,
    data_pagamento,
    categoria_id,
    nova_categoria,
    tipo_pagamento,
  } = req.body;

  if (
    descricao === undefined &&
    valor === undefined &&
    data_pagamento === undefined &&
    categoria_id === undefined &&
    tipo_pagamento === undefined
  ) {
    return res.status(400).json({ message: "Nenhum campo foi alterado." });
  }

  try {
    let categoriaId = categoria_id;

    if (nova_categoria) {
      console.log("Verificando se a categoria já existe:", nova_categoria);
      const categoriaExistenteQuery = `
        SELECT id FROM categorias WHERE nome = $1;
      `;
      const categoriaExistenteResult = await query(categoriaExistenteQuery, [
        nova_categoria,
      ]);

      if (categoriaExistenteResult.rows.length > 0) {
        categoriaId = categoriaExistenteResult.rows[0].id;
        console.log("Categoria já existente com ID:", categoriaId);
      } else {
        console.log("Criando nova categoria:", nova_categoria);
        const categoriaQuery = `
          INSERT INTO categorias (nome, tipo, descricao_extra, criado_em) 
          VALUES ($1, 'despesa', false, NOW()) RETURNING id;
        `;
        const categoriaResult = await query(categoriaQuery, [nova_categoria]);

        if (categoriaResult.rows.length > 0) {
          categoriaId = categoriaResult.rows[0].id;
          console.log("Nova categoria criada com ID:", categoriaId);
        } else {
          return res.status(500).json({ message: "Erro ao criar categoria." });
        }
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (descricao !== undefined) {
      fields.push(`descricao = $${index++}`);
      values.push(descricao);
    }

    if (valor !== undefined) {
      fields.push(`valor = $${index++}`);
      values.push(parseFloat(valor));
    }

    if (data_pagamento !== undefined) {
      const parsedDate = new Date(data_pagamento);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Data de pagamento inválida." });
      }
      fields.push(`data_pagamento = $${index++}`);
      values.push(parsedDate);
    }

    if (categoriaId !== undefined) {
      fields.push(`categoria_id = $${index++}`);
      values.push(categoriaId);
    }

    if (tipo_pagamento !== undefined) {
      fields.push(`tipo_pagamento = $${index++}`);
      values.push(tipo_pagamento);
    }

    values.push(id);

    const sqlQuery = `
      UPDATE despesas
      SET ${fields.join(", ")}, atualizado_em = NOW()
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Despesa não encontrada." });
    }

    res.status(200).json({
      message: "Despesa atualizada com sucesso.",
      despesa: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error.message);
    res
      .status(500)
      .json({ message: "Erro no servidor.", error: error.message });
  }
});
router.delete("/despesas/:id", verifyToken, async (req, res) => {
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
router.get("/despesas", verifyToken, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const result = await query("SELECT * FROM despesas WHERE user_id = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Nenhuma despesa encontrada." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar despesas:", error.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

export default router;
