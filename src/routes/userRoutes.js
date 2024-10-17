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

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).send("Token não encontrado.");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send("Token inválido ou expirado.");
    req.user = decoded;
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

  if (!refreshToken)
    return res.status(403).json({ message: "Refresh token não encontrado" });

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
    res.status(403).json({
      message: "Refresh token inválido ou expirado",
      error: error.message,
    });
  }
});
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout realizado com sucesso" });
});

export default router;
