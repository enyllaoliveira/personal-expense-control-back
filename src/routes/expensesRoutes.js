import express from "express";
import { query } from "../db/index.js";
import { verifyToken } from "./userRoutes.js";

const router = express.Router();

router.post("/expenses", verifyToken, async (req, res) => {
  const expenses = req.body;
  const userId = req.userId;

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  const invalidFields = expenses.some(
    (expense) =>
      !expense.user_id ||
      !expense.category_id ||
      !expense.payment_date ||
      !expense.description ||
      !expense.payment_type ||
      !expense.amount
  );

  if (invalidFields) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }

  try {
    const recurringExpenses = expenses.flatMap((expense) => {
      const expensesCreated = [];
      const initialDate = new Date(expense.payment_date);

      if (expense.is_recurrent) {
        for (let i = 0; i < 12; i++) {
          const recurringDate = new Date(initialDate);
          recurringDate.setMonth(recurringDate.getMonth() + i);

          expensesCreated.push({
            description: `${expense.description} - Mês ${i + 1}`,
            amount: expense.amount,
            payment_date: recurringDate.toISOString().split("T")[0],
            category_id: parseInt(expense.category_id, 10),
            user_id: userId,
            payment_type: expense.payment_type || "comum",
            installment_count: 1,
            current_installment: i + 1,
            is_recurrent: true,
          });
        }
      } else {
        expensesCreated.push({
          ...expense,
          is_recurrent: false,
        });
      }

      return expensesCreated;
    });

    const sqlQuery = `
      INSERT INTO expenses (
        description, amount, payment_date, category_id, 
        user_id, payment_type, installment_count, current_installment, is_recurrent
      ) VALUES ${recurringExpenses
        .map(
          (_, i) =>
            `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, 
               $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${
              i * 9 + 9
            })`
        )
        .join(", ")}
      RETURNING *;
    `;

    const values = recurringExpenses.flatMap((expense) => [
      expense.description,
      parseFloat(expense.amount),
      expense.payment_date,
      expense.category_id,
      userId,
      expense.payment_type,
      expense.installment_count || 1,
      expense.current_installment || 1,
      expense.is_recurrent,
    ]);

    console.log("valores enviados para a query:", values);

    const result = await query(sqlQuery, values);

    res.status(201).json(result.rows);
  } catch (error) {
    console.error("Erro ao criar despesas:", error.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});
router.get("/expenses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const queryText = `
      SELECT * FROM expenses WHERE id = $1 AND user_id = $2;
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

router.put("/expenses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    description,
    amount,
    payment_date,
    category_id,
    new_category,
    payment_type,
  } = req.body;

  if (
    description === undefined &&
    amount === undefined &&
    payment_date === undefined &&
    category_id === undefined &&
    payment_type === undefined
  ) {
    return res.status(400).json({ message: "Nenhum campo foi alterado." });
  }

  try {
    let categoryId = category_id;

    if (new_category) {
      console.log("Verificando se a categoria já existe:", new_category);
      const existCategory = `
        SELECT id FROM categories WHERE name = $1;
      `;
      const existCategoryResult = await query(existCategory, [new_category]);

      if (existCategoryResult.rows.length > 0) {
        categoryId = existCategoryResult.rows[0].id;
        console.log("Categoria já existente com ID:", categoryId);
      } else {
        console.log("Criando nova categoria:", new_category);
        const categorieQuerys = `
          INSERT INTO categories (name, type, description_extra, created_at) 
          VALUES ($1, 'expense', false, NOW()) RETURNING id;
        `;
        const categoryResult = await query(categorieQuerys, [new_category]);

        if (categoryResult.rows.length > 0) {
          categoryId = categoryResult.rows[0].id;
          console.log("Nova categoria criada com ID:", categoryId);
        } else {
          return res.status(500).json({ message: "Erro ao criar categoria." });
        }
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }

    if (amount !== undefined) {
      fields.push(`amount = $${index++}`);
      values.push(parseFloat(amount));
    }

    if (payment_date !== undefined) {
      const parsedDate = new Date(payment_date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Data de pagamento inválida." });
      }
      fields.push(`payment_date = $${index++}`);
      values.push(parsedDate);
    }

    if (categoryId !== undefined) {
      fields.push(`category_id = $${index++}`);
      values.push(categoryId);
    }

    if (payment_type !== undefined) {
      fields.push(`payment_type = $${index++}`);
      values.push(payment_type);
    }

    values.push(id);

    const sqlQuery = `
      UPDATE expenses
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING *;
    `;

    const result = await query(sqlQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Despesa não encontrada." });
    }

    res.status(200).json({
      message: "Despesa atualizada com sucesso.",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error.message);
    res
      .status(500)
      .json({ message: "Erro no servidor.", error: error.message });
  }
});
router.delete("/expenses/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      DELETE FROM expenses WHERE id = $1 RETURNING *;
      `;
    const values = [id];
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Despesa não encontrada." });
    }

    res.status(200).json({
      message: "Despesa excluída com sucesso.",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao excluir despesa", error.message);
    res.status(500).json({
      message: "Erro no servidor",
      error: error.message,
    });
  }
});
router.get("/expenses", verifyToken, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "ID do usuário é obrigatório." });
  }

  try {
    const result = await query("SELECT * FROM expenses WHERE user_id = $1", [
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
