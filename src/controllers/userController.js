import express from "express";
import bcrypt from "bcrypt";

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

    res.status(200).json({
      message: "Login realizado com sucesso",
      user,
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
