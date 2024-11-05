import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  handleCreateExpense,
  handleDeleteExpense,
  handleGetExpense,
  handleGetExpenseById,
  handleUpdateExpense,
} from "../controllers/expensesController.js";

const router = express.Router();

router.post("/expenses", verifyToken, handleCreateExpense);

router.get("/expenses/:id", verifyToken, handleGetExpenseById);

router.put("/expenses/:id", verifyToken, handleUpdateExpense);

router.delete("/expenses/:id", verifyToken, handleDeleteExpense);

router.get("/expenses", verifyToken, handleGetExpense);

export default router;
