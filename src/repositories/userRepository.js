import { query } from "../db/index.js";

export const createUser = async (name, email, password) => {
  try {
    const result = await query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Erro no servidor");
  }
};

export const getUser = async () => {
  try {
    const result = await query("SELECT * FROM users");
    return result.rows;
  } catch (err) {
    console.error("Erro ao buscar usuários", err);

    throw new Error("Erro no servidor");
  }
};

export const login = async (email) => {
  try {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  } catch (err) {
    console.error("Erro ao buscar usuário por email", err);
    throw new Error("Usuário não encontrado");
  }
};

export const getUserById = async (id) => {
  try {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    if (!result.rows[0]) {
      throw new Error("Usuário não encontrado");
    }
    return result.rows[0];
  } catch (err) {
    console.error("Erro ao buscar usuário por ID", err);
    throw new Error("Erro no servidor");
  }
};

export const updateUser = async (id, name, email, password) => {
  try {
    const result = await query(
      "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *",
      [name, email, password, id]
    );
    if (!result.rows[0]) {
      throw new Error("Usuário não encontrado");
    }
    return result.rows[0];
  } catch (err) {}
};

export const deleteUser = async (id) => {
  try {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    if (!result.rowCount) {
      throw new Error("Usuário não encontrado");
    }
  } catch (err) {
    console.error("Erro ao deletar usuário", err);
    throw new Error("Erro no servidor");
  }
};
