import express from "express";
import incomeRoutes from "./routes/incomeRoutes.js";
import expensesRoutes from "./routes/expensesRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import filtherMonthRoutes from "./routes/filterMonthRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
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

app.use("/api", expensesRoutes);

app.use("/api", categoriesRoutes);

app.use("/api", incomeRoutes);

app.use("/api", userRoutes);

app.use("/api", filtherMonthRoutes);

app.get("/", (req, res) => {
  res.send("Backend rodando...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
