import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

import {
  handleGetMontlyChart,
  handleGetYearlyChart,
} from "../controllers/filterMonthController.js";

const router = express.Router();

router.get("/graphics/month", verifyToken, handleGetMontlyChart);

router.get("/graphics/year", verifyToken, handleGetYearlyChart);

export default router;
