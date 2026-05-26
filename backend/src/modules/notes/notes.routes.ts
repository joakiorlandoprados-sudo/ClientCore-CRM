import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { notesController } from "./notes.controller";

export const notesRouter = Router();

notesRouter.get("/", asyncHandler(notesController.list));
notesRouter.post("/", asyncHandler(notesController.create));
notesRouter.delete("/:id", asyncHandler(notesController.delete));
