import express from "express";
import dotenv from "dotenv";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  handleCreateIncome,
  handleDeleteIncome,
  handleGetIncomeById,
  handleUpdateIncome,
} from "../controllers/incomesController.js";

dotenv.config();

const router = express.Router();

router.get("/incomes", verifyToken, handleGetIncomeById);
router.post("/incomes", verifyToken, handleCreateIncome);
router.put("/incomes/:id", verifyToken, handleUpdateIncome);
router.delete("/incomes/:id", verifyToken, handleDeleteIncome);
router.get("/", verifyToken);

export default router;
