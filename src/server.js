import express from "express";
import incomeRoutes from "./routes/incomeRoutes.js";
import expensesRoutes from "./routes/expensesRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import filterMonthRoutes from "./routes/filterMonthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("Origem da requisição:", req.headers.origin);
  console.log("Cookies recebidos:", req.cookies);
  console.log("Rota acessada:", req.originalUrl);
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://financial-control-beryl.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/api/expenses", expensesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/users", userRoutes);
app.use("/api", filterMonthRoutes);

app.get("/", (req, res) => {
  res.send("Backend rodando...");
});

app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.message);
  res
    .status(500)
    .json({ message: "Erro interno no servidor", error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
