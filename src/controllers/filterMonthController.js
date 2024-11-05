import {
  getMonthlyChart,
  getYearlyChart,
} from "../repositories/filterMonthRepository.js";

export const handleGetMontlyChart = async (req, res) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const userId = req.userId;
    const response = await getMonthlyChart(month, year, userId);
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao carregar dados mensais:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const handleGetYearlyChart = async (req, res) => {
  try {
    const year = parseInt(req.query.year);

    const userId = req.userId;

    const response = await getYearlyChart(year, userId);
    res.status(200).json(response);
  } catch (error) {
    console.error("Erro ao carregar dados anuais:", error.message);
    res.status(400).json({ error: error.message });
  }
};
