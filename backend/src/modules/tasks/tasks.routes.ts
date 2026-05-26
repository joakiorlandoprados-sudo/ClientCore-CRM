import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { tasksController } from "./tasks.controller";

export const tasksRouter = Router();

tasksRouter.get("/", asyncHandler(tasksController.list));
tasksRouter.post("/", asyncHandler(tasksController.create));
tasksRouter.get("/:id", asyncHandler(tasksController.get));
tasksRouter.patch("/:id", asyncHandler(tasksController.update));
tasksRouter.patch("/:id/complete", asyncHandler(tasksController.complete));
tasksRouter.delete("/:id", asyncHandler(tasksController.delete));
