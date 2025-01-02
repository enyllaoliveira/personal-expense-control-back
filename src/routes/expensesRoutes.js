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

router.post("/", verifyToken, handleCreateExpense);

router.get("/:id", verifyToken, handleGetExpenseById);

router.put("/:id", verifyToken, handleUpdateExpense);

router.delete("/:id", verifyToken, handleDeleteExpense);

router.get("/", verifyToken, handleGetExpense);

export default router;
