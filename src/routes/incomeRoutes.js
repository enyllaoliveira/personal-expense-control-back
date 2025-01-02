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

router.get("/", verifyToken, handleGetIncomeById);
router.post("/", verifyToken, handleCreateIncome);
router.put("/:id", verifyToken, handleUpdateIncome);
router.delete("/:id", verifyToken, handleDeleteIncome);
router.get("/", verifyToken);

export default router;
