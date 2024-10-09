import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
  getUserByEmailController,
} from "../controllers/userController.js";

const router = Router();

router.post("/register", createUserController);
router.post("/login", getUserByEmailController);
router.get("/users", getUsersController);
router.get("/users/:id", getUserByIdController);
router.put("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

export default router;
