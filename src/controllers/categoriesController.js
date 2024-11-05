import {
  createCategories,
  deleteCategory,
  getCategories,
  updateExpenseWithCategory,
} from "../repositories/categoriesReposity.js";

export const handleCreateCategory = async (req, res) => {
  try {
    const { name, type, extra_description } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    if (!name || !type || !extra_description) {
      return res
        .status(400)
        .json({ message: "Dados da categoria incompletos" });
    }
    try {
      const response = await createCategories(name, type, extra_description);
      return res.status(201).json(response);
    } catch (error) {
      console.error("Erro ao criar categoria:", error.message);
    }
  } catch (error) {
    console.error("Erro ao realizar operações:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const handleGetCategory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const response = await getCategories(userId);
    return res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao resgar categorias:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const handleUpdateExpensesWithCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, payment_date, category_id } = req.body;

    if (!description || !valor || !payment_date || !category_id) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios.",
      });
    }

    const response = updateExpenseWithCategory(
      id,
      amount,
      category_id,
      description,
      amount,
      payment_date,
      category_id
    );
    return res.status(201).json(response);
  } catch (error) {}
  console.error("Erro ao atualizar categoria:", error.message);
  res.status(500).json({ error: error.message });
};

export const handleDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const response = deleteCategory(id);
    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao deletar categoria:", error.message);
    res.status(500).json({ error: error.message });
  }
};
