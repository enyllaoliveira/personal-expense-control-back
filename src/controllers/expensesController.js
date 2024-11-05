import {
  createExpense,
  deleteExpense,
  getexpense,
  getExpenseById,
  updateExpense,
} from "../repositories/expensesRepository.js";

export const handleCreateExpense = async (req, res) => {
  try {
    const expenses = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }
    const invalidFields = expenses.some(
      (expense) =>
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

    const response = await createExpense(expenses, userId);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar despesa:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const handleGetExpense = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const response = await getexpense(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao pegar as despesas:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const handleGetExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const response = await getExpenseById(id, userId);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao pegar a despesa", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const handleUpdateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      amount,
      payment_date,
      category_id,
      new_category,
      payment_type,
      is_recurrent,
      installment_count,
    } = req.body;

    if (is_recurrent && installment_count) {
      return res.status(400).json({
        message: "A despesa não pode ser recorrente e dividida ao mesmo tempo.",
      });
    }

    if (
      description === undefined &&
      amount === undefined &&
      payment_date === undefined &&
      category_id === undefined &&
      payment_type === undefined &&
      is_recurrent === undefined &&
      installment_count === undefined
    ) {
      return res.status(400).json({ message: "Nenhum campo foi alterado." });
    }

    let categoryId = category_id;

    const response = await updateExpense(
      id,
      description,
      amount,
      payment_date,
      categoryId,
      new_category,
      payment_type,
      is_recurrent,
      installment_count
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const handleDeleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await deleteExpense(id);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao deletar despesa:", error.message);
    res.status(500).json({ error: error.message });
  }
};
