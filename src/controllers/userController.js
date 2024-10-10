import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  createUser,
  getUser,
  getUserById,
  deleteUser,
  updateUser,
  getUserByEmail,
} from "../services/userService.js";

export const createUserController = async (req, res) => {
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

export const getUsersController = async (req, res) => {
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

export const getUserByEmailController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
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
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "Login realizado com sucesso",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao tentar realizar login",
      error: error.message,
    });
  }
};
export const getUserByIdController = async (req, res) => {
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

export const updateUserController = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const updateUser = await updateUser(id, name, email, password);
    return res.status(200).json(updateUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao atualizar usuário por ID:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
};

// maquear o usuário, não o apagar
export const deleteUserController = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await deleteUser(id);
    return res.status(200).json(deleteUser);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao deletar usuário por ID:", error.message);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro desconhecido" });
  }
};
