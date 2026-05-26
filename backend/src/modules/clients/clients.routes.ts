import { Role } from "@prisma/client";
import { Router } from "express";
import { authorize } from "../../middlewares/authorize";
import { asyncHandler } from "../../utils/async-handler";
import { clientsController } from "./clients.controller";

export const clientsRouter = Router();

clientsRouter.get("/", asyncHandler(clientsController.list));
clientsRouter.post("/", asyncHandler(clientsController.create));
clientsRouter.get("/:id", asyncHandler(clientsController.get));
clientsRouter.patch("/:id", asyncHandler(clientsController.update));
clientsRouter.delete("/:id", authorize(Role.ADMIN, Role.MANAGER), asyncHandler(clientsController.delete));
clientsRouter.get("/:id/contacts", asyncHandler(clientsController.contacts));
clientsRouter.get("/:id/deals", asyncHandler(clientsController.deals));
clientsRouter.get("/:id/notes", asyncHandler(clientsController.notes));
