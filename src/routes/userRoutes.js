import express from "express";
import {
  handleCreateUser,
  handleDeleteUser,
  handleGetUserById,
  handleGetUsers,
  handleUpdateUser,
  handleLogin,
  handleLogout,
  handleRefreshToken,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", handleCreateUser);
router.post("/login", handleLogin);
router.get("/users", verifyToken, handleGetUsers);
router.get("/users/:id", verifyToken, handleGetUserById);
router.put("/users/:id", verifyToken, handleUpdateUser);
router.delete("/users/:id", verifyToken, handleDeleteUser);
router.post("/logout", handleLogout);
router.post("/refresh-token", handleRefreshToken);

export default router;
