import express from "express";
import {
  getMonthlyProjectDetails,
  getMonthlyProjectDetailById,
  createMonthlyProjectDetail,
  updateMonthlyProjectDetail,
  deleteMonthlyProjectDetail,
} from "../controllers/MonthlyProjectDetailsController.js";

const monthlyProjectrouter = express.Router();

monthlyProjectrouter.get("/", getMonthlyProjectDetails);
monthlyProjectrouter.get("/:id", getMonthlyProjectDetailById);
monthlyProjectrouter.post("/", createMonthlyProjectDetail);
monthlyProjectrouter.put("/:id", updateMonthlyProjectDetail);
monthlyProjectrouter.delete("/:id", deleteMonthlyProjectDetail);

export default monthlyProjectrouter;
