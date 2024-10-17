import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "../env.js";
const { Pool } = pkg;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD + "",
  port: DB_PORT,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("Conexão ao banco de dados bem-sucedida!");
  release();
});

export const query = (text, params) => {
  return pool.query(text, params);
};
