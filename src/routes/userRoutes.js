import express from "express";
import jwt from "jsonwebtoken";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
  getUserByEmailController,
} from "../controllers/userController.js";

const router = express.Router();

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ message: "Token não encontrado." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token inválido." });

    req.userId = decoded.id;
    console.log("User ID no middleware:", req.userId);
    next();
  });
};

router.post("/register", createUserController);
router.post("/login", getUserByEmailController);
router.get("/users", verifyToken, getUsersController);
router.get("/users/:id", verifyToken, getUserByIdController);
router.put("/users/:id", verifyToken, updateUserController);
router.delete("/users/:id", verifyToken, deleteUserController);
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token não encontrado" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60,
    });

    res.status(200).json({ message: "Token renovado com sucesso" });
  } catch (error) {
    console.error("Erro ao renovar token:", error.message);
    res.status(403).json({
      message: "Refresh token inválido ou expirado",
      error: error.message,
    });
  }
});
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });

    return res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao deslogar:", error.message);
    return res.status(500).json({ message: "Erro ao deslogar" });
  }
});

export default router;
