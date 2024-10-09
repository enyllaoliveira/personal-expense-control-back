import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "eu-testando",
  host: "localhost",
  database: "financial-dashboard",
  password: "12345",
  port: 5432,
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
