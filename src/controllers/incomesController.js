import {
  createIncome,
  getIncomesById,
  updateIncome,
  deleteIncome,
} from "../repositories/incomesRepository.js";

export const handleGetIncomeById = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }
    const response = await getIncomesById(userId);
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao carregar receitas:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const handleCreateIncome = async (req, res) => {
  try {
    const { amount, description, receipt_date, isRecurrent } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }
    if (
      amount === undefined ||
      description === undefined ||
      receipt_date === undefined
    ) {
      return res.status(400).json({
        message: "Todos os campos obrigatórios devem ser preenchidos.",
      });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res
        .status(400)
        .json({ message: "O campo 'amount' deve ser um número válido." });
    }

    const response = await createIncome(
      numericAmount,
      description,
      receipt_date,
      isRecurrent,
      userId
    );
    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao criar receitas:", error.message);
    res.status(400).json({ error: error.message });
  }
};
export const handleUpdateIncome = async (req, res) => {
  try {
    const { amount, description, date, is_recurrent } = req.body;
    if (date) {
      const parsedDate = Date.parse(date);
      if (isNaN(parsedDate)) {
        console.error("Erro: 'date' é inválido.");
        return res.status(400).json({
          message:
            "O valor de 'date' deve ser uma data válida no formato YYYY-MM-DD.",
        });
      }
    }

    if (
      amount === undefined &&
      description === undefined &&
      date === undefined &&
      is_recurrent === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Pelo menos um campo deve ser atualizado." });
    }

    const response = await updateIncome(
      amount,
      description,
      date,
      is_recurrent,
      req.params.id
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao atualizar receitas:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const handleDeleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await deleteIncome(id);
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao deletar receitas:", error.message);
    res.status(400).json({ error: error.message });
  }
};
