import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { dashboardController } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", asyncHandler(dashboardController.summary));
dashboardRouter.get("/pipeline", asyncHandler(dashboardController.pipeline));
dashboardRouter.get("/activity", asyncHandler(dashboardController.activity));
