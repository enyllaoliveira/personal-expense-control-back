import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  login,
  getUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../repositories/userRepository.js";

export const handleCreateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser(name, email, hashedPassword);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

export const handleGetUsers = async (req, res) => {
  try {
    const users = await getUser();
    return res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao buscar usuários:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await login(email);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "15d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 15,
    });

    return res.status(200).json({
      message: "Login realizado com sucesso",
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao tentar realizar login",
      error: error.message,
    });
  }
};
export const handleGetUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao buscar usuário por ID:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
};

export const handleUpdateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const handleUpdateUser = await updateUser(id, name, email, password);
    return res.status(200).json(handleUpdateUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao atualizar usuário por ID:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
};

export const handleDeleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const handleDeleteUser = await deleteUser(id);
    return res.status(200).json(handleDeleteUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao deletar usuário por ID:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
};

export const handleLogout = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });

    return res.status(200).json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao deslogar:", error.message);
    return res.status(500).json({ message: "Erro ao deslogar" });
  }
};

export const handleRefreshToken = (req, res) => {
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
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({ message: "Token renovado com sucesso" });
  } catch (error) {
    console.error("Erro ao renovar token:", error.message);
    res.status(403).json({
      message: "Refresh token inválido ou expirado",
      error: error.message,
    });
  }
};
