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

app.use(
  cors({
    origin: "https://financial-control-beryl.vercel.app",
    credentials: true,
  })
);

app.use("/api/expenses", expensesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/filter-month", filterMonthRoutes);

app.get("/", (req, res) => {
  res.send("Backend rodando...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
