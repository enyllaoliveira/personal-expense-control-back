import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  handleCreateCategory,
  handleGetCategory,
  handleUpdateExpensesWithCategories,
  handleDeleteCategory,
} from "../controllers/categoriesController.js";

const router = express.Router();

router.post("/", verifyToken, handleCreateCategory);

router.put("/expenses/:id", verifyToken, handleUpdateExpensesWithCategories);

router.delete("/:id", verifyToken, handleDeleteCategory);

router.get("/", verifyToken, handleGetCategory);

export default router;
