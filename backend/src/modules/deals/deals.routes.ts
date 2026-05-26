import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { dealsController } from "./deals.controller";

export const dealsRouter = Router();

dealsRouter.get("/", asyncHandler(dealsController.list));
dealsRouter.get("/aggregate/stages", asyncHandler(dealsController.aggregate));
dealsRouter.post("/", asyncHandler(dealsController.create));
dealsRouter.get("/:id", asyncHandler(dealsController.get));
dealsRouter.patch("/:id", asyncHandler(dealsController.update));
dealsRouter.patch("/:id/stage", asyncHandler(dealsController.moveStage));
dealsRouter.delete("/:id", asyncHandler(dealsController.delete));
